// Email service using Resend
import { Resend } from "resend";

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface GrantAlert {
  title: string;
  funder: string;
  amount: string | null;
  deadline: Date | null;
  url: string | null;
  type: string;
  category: string | null;
}

interface SendAlertParams {
  to: string;
  userName?: string;
  grants: GrantAlert[];
  frequency?: "daily" | "weekly" | "instant";
}

export async function sendGrantAlertEmail({
  to,
  userName,
  grants,
  frequency = "daily",
}: SendAlertParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  if (grants.length === 0) {
    console.log("No new grants to alert about");
    return null;
  }

  const greeting = userName ? `Hi ${userName}` : "Hi there";
  const frequencyText = frequency === "daily" ? "today" : frequency === "weekly" ? "this week" : "just now";

  // Build grant list HTML
  const grantListHtml = grants
    .slice(0, 20) // Limit to 20 grants per email
    .map(
      (grant) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
            ${grant.title}
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
            ${grant.funder} • ${grant.type.charAt(0).toUpperCase() + grant.type.slice(1)}
          </div>
          <div style="display: flex; gap: 16px; font-size: 14px;">
            <span style="color: #059669; font-weight: 500;">
              ${grant.amount || "Amount varies"}
            </span>
            ${
              grant.deadline
                ? `<span style="color: #dc2626;">Deadline: ${new Date(grant.deadline).toLocaleDateString()}</span>`
                : ""
            }
          </div>
          ${
            grant.url
              ? `<a href="${grant.url}" style="display: inline-block; margin-top: 8px; color: #2563eb; text-decoration: none; font-size: 14px;">View Grant →</a>`
              : ""
          }
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Grant Finder Pro</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Your Daily Grant Opportunities</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">
            ${greeting}! 👋
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
            We found <strong style="color: #2563eb;">${grants.length} new grant${grants.length > 1 ? "s" : ""}</strong> matching your profile ${frequencyText}.
          </p>

          <!-- Grant List -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
            ${grantListHtml}
          </table>

          ${
            grants.length > 20
              ? `<p style="color: #6b7280; font-size: 14px; margin: 16px 0 0 0; text-align: center;">
                  And ${grants.length - 20} more grants...
                </p>`
              : ""
          }

          <!-- CTA -->
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://grant-finder-pro.vercel.app"}/dashboard/grants"
               style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              View All Grants
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            You're receiving this because you enabled grant alerts.
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://grant-finder-pro.vercel.app"}/dashboard/settings" style="color: #6b7280;">
              Manage preferences
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) {
      console.log("Resend client not available, skipping email");
      return null;
    }

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: `🎯 ${grants.length} New Grant${grants.length > 1 ? "s" : ""} Found For You`,
      html,
    });

    console.log(`Email sent to ${to}:`, result);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://grantfinderpro.com";

// Send a welcome email when user enables alerts
export async function sendWelcomeEmail(to: string, userName?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Grant Alerts! 🎉</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">
            ${userName ? `Hi ${userName}!` : "Hi there!"}
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            You've successfully enabled grant alerts. Here's what to expect:
          </p>
          <ul style="color: #6b7280; font-size: 14px;">
            <li><strong>Daily updates</strong> with new grants matching your profile</li>
            <li><strong>AI, Healthcare, Climate & more</strong> - we search 20+ categories</li>
            <li><strong>Federal, State & Corporate</strong> grants from 1000+ sources</li>
          </ul>
          <p style="color: #6b7280; font-size: 14px;">
            Complete your organization profile for better grant matches!
          </p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://grant-finder-pro.vercel.app"}/dashboard/organization"
               style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Complete Profile
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) {
      console.log("Resend client not available, skipping email");
      return null;
    }

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: "Welcome to Grant Finder Pro Alerts! 🎯",
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

// Trial started email
export async function sendTrialStartedEmail(to: string, userName?: string, trialDays: number = 14) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Your Pro Trial is Active!</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${userName || "there"},
          </p>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Great news! Your <strong style="color: #10b981;">${trialDays}-day Pro trial</strong> is now active. You have full access to all Pro features.
          </p>
          <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <h3 style="color: #e2e8f0; margin: 0 0 16px; font-size: 16px;">What you can do with Pro:</h3>
            <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong style="color: #10b981;">Unlimited</strong> grant matches</li>
              <li><strong style="color: #10b981;">AI-powered</strong> Auto-Apply drafts</li>
              <li><strong style="color: #10b981;">Daily</strong> email alerts for new grants</li>
              <li><strong style="color: #10b981;">Advanced</strong> AI matching algorithm</li>
              <li>Priority support</li>
            </ul>
          </div>
          <a href="${APP_URL}/dashboard/grants" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Find Grants Now
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Your trial ends in ${trialDays} days. <a href="${APP_URL}/pricing" style="color: #10b981;">Upgrade anytime</a> to keep Pro features.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) return null;

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: `Your ${trialDays}-day Pro trial has started!`,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send trial started email:", error);
    throw error;
  }
}

// Trial ending reminder email
export async function sendTrialEndingEmail(to: string, userName?: string, daysRemaining: number = 3) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const urgent = daysRemaining <= 1;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden;">
        <div style="background: ${urgent ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)'}; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">
            ${urgent ? 'Last Chance!' : 'Your Trial is Ending Soon'}
          </h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${userName || "there"},
          </p>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Your Pro trial ${urgent ? 'ends tomorrow' : `ends in <strong style="color: #f59e0b;">${daysRemaining} days</strong>`}.
            Don't lose access to these powerful features:
          </p>
          <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Unlimited grant matches</li>
              <li>AI-powered Auto-Apply</li>
              <li>Daily grant alerts</li>
              <li>Advanced AI matching</li>
            </ul>
          </div>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            Upgrade now to keep your Pro features and continue winning grants.
          </p>
          <a href="${APP_URL}/pricing" style="display: inline-block; background: ${urgent ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'}; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Upgrade to Pro - $49/mo
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Questions about pricing? Reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) return null;

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: urgent ? `Your Pro trial ends tomorrow!` : `Your Pro trial ends in ${daysRemaining} days`,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send trial ending email:", error);
    throw error;
  }
}

// Deadline reminder email
interface DeadlineGrant {
  id: string;
  title: string;
  funder: string;
  deadline: string;
  amount: number;
}

export async function sendDeadlineReminderEmail(
  to: string,
  userName: string | undefined,
  grants: DeadlineGrant[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  if (grants.length === 0) return null;

  const grantListHtml = grants.map(grant => `
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
      <h3 style="color: #e2e8f0; margin: 0 0 8px; font-size: 16px;">${grant.title}</h3>
      <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">${grant.funder}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #10b981; font-weight: 600;">$${grant.amount.toLocaleString()}</span>
        <span style="color: #f59e0b; font-size: 14px;">Due: ${new Date(grant.deadline).toLocaleDateString()}</span>
      </div>
      <a href="${APP_URL}/dashboard/grants/${grant.id}/apply" style="display: inline-block; margin-top: 12px; color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500;">
        Continue Application →
      </a>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Deadline Reminder</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${userName || "there"},
          </p>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Don't miss ${grants.length === 1 ? 'this deadline' : 'these deadlines'}! Here are your upcoming grant applications:
          </p>
          ${grantListHtml}
          <a href="${APP_URL}/dashboard/applications" style="display: inline-block; margin-top: 16px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View All Applications
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            <a href="${APP_URL}/dashboard/settings" style="color: #64748b;">Manage notification preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) return null;

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: grants.length === 1
        ? `Deadline reminder: ${grants[0].title}`
        : `${grants.length} grant deadlines coming up!`,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send deadline reminder email:", error);
    throw error;
  }
}

// Weekly digest email
interface DigestGrant {
  id: string;
  title: string;
  funder: string;
  amount: number;
  matchScore: number;
}

interface DigestStats {
  applicationsInProgress: number;
  upcomingDeadlines: number;
}

export async function sendWeeklyDigestEmail(
  to: string,
  userName: string | undefined,
  newGrants: DigestGrant[],
  stats: DigestStats
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const grantListHtml = newGrants.slice(0, 5).map(grant => `
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h3 style="color: #e2e8f0; margin: 0 0 4px; font-size: 15px;">${grant.title}</h3>
          <p style="color: #64748b; margin: 0; font-size: 13px;">${grant.funder}</p>
          <p style="color: #10b981; margin: 8px 0 0; font-weight: 600;">$${grant.amount.toLocaleString()}</p>
        </div>
        <div style="text-align: center; margin-left: 16px;">
          <div style="background-color: #10b981; color: white; padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 18px;">
            ${grant.matchScore}%
          </div>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 11px;">Match</p>
        </div>
      </div>
      <a href="${APP_URL}/dashboard/grants/${grant.id}" style="display: inline-block; margin-top: 12px; color: #10b981; text-decoration: none; font-size: 13px; font-weight: 500;">
        View Grant →
      </a>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Your Weekly Grant Digest</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
            ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style="padding: 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Hi ${userName || "there"}, here's your weekly summary:
          </p>

          <!-- Stats -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr>
              <td style="background-color: #0f172a; border-radius: 8px; padding: 20px; text-align: center; width: 33%;">
                <p style="color: #10b981; font-size: 32px; font-weight: 700; margin: 0;">${newGrants.length}</p>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">New Matches</p>
              </td>
              <td style="width: 16px;"></td>
              <td style="background-color: #0f172a; border-radius: 8px; padding: 20px; text-align: center; width: 33%;">
                <p style="color: #f59e0b; font-size: 32px; font-weight: 700; margin: 0;">${stats.upcomingDeadlines}</p>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Deadlines Soon</p>
              </td>
              <td style="width: 16px;"></td>
              <td style="background-color: #0f172a; border-radius: 8px; padding: 20px; text-align: center; width: 33%;">
                <p style="color: #8b5cf6; font-size: 32px; font-weight: 700; margin: 0;">${stats.applicationsInProgress}</p>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">In Progress</p>
              </td>
            </tr>
          </table>

          ${newGrants.length > 0 ? `
          <h2 style="color: #e2e8f0; font-size: 18px; margin: 0 0 16px;">Top Matching Grants</h2>
          ${grantListHtml}
          ${newGrants.length > 5 ? `<p style="color: #64748b; font-size: 14px; text-align: center;">...and ${newGrants.length - 5} more grants</p>` : ''}
          ` : `
          <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; text-align: center;">
            <p style="color: #94a3b8; margin: 0;">No new grants this week. We'll keep searching!</p>
          </div>
          `}

          <a href="${APP_URL}/dashboard/grants" style="display: block; margin-top: 24px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center;">
            Find More Grants
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            <a href="${APP_URL}/dashboard/settings" style="color: #64748b;">Manage notification preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) return null;

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: newGrants.length > 0
        ? `${newGrants.length} new grants match your profile!`
        : `Your weekly grant digest`,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send weekly digest email:", error);
    throw error;
  }
}
