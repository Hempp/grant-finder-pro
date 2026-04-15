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
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  if (grants.length === 0) {
    console.info("No new grants to alert about");
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
                ? `<span style="color: #dc2626;">Deadline: ${new Date(grant.deadline).toLocaleDateString("en-US")}</span>`
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
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">GrantPilot</h1>
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
      console.warn("Resend client not available, skipping email");
      return null;
    }

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: `🎯 ${grants.length} New Grant${grants.length > 1 ? "s" : ""} Found For You`,
      html,
    });

    console.info(`Email sent to ${to}:`, result);
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
    console.warn("RESEND_API_KEY not configured, skipping email");
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
      console.warn("Resend client not available, skipping email");
      return null;
    }

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grant Finder <grants@resend.dev>",
      to,
      subject: "Welcome to GrantPilot Alerts! 🎯",
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
    console.warn("RESEND_API_KEY not configured, skipping email");
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
    console.warn("RESEND_API_KEY not configured, skipping email");
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
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  if (grants.length === 0) return null;

  const grantListHtml = grants.map(grant => `
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
      <h3 style="color: #e2e8f0; margin: 0 0 8px; font-size: 16px;">${grant.title}</h3>
      <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">${grant.funder}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #10b981; font-weight: 600;">$${grant.amount.toLocaleString("en-US")}</span>
        <span style="color: #f59e0b; font-size: 14px;">Due: ${new Date(grant.deadline).toLocaleDateString("en-US")}</span>
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
    console.warn("RESEND_API_KEY not configured, skipping email");
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

// Outcome prompt email - asks user to report grant application results
export async function sendOutcomePromptEmail(
  to: string,
  userName: string | undefined,
  grants: { id: string; title: string; funder: string; deadline: string; applicationId: string }[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  if (grants.length === 0) return null;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grant-finder-pro.vercel.app";

  const grantListHtml = grants.map(grant => `
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 12px;">
      <h3 style="color: #e2e8f0; margin: 0 0 4px; font-size: 15px;">${grant.title}</h3>
      <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">${grant.funder}</p>
      <p style="color: #94a3b8; margin: 0 0 12px; font-size: 13px;">Deadline was ${new Date(grant.deadline).toLocaleDateString("en-US")}</p>
      <a href="${APP_URL}/dashboard/applications/${grant.applicationId}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; font-size: 13px;">
        Report Outcome
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
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Have You Heard Back?</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${userName || "there"},
          </p>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            The deadline has passed for ${grants.length === 1 ? 'this grant application' : 'these grant applications'}. Have you received a response? Your feedback helps us improve recommendations for everyone.
          </p>
          ${grantListHtml}
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
        ? `Did you hear back about "${grants[0].title}"?`
        : `Update on ${grants.length} grant applications?`,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send outcome prompt email:", error);
    throw error;
  }
}

// Payment failure notification email
export async function sendPaymentFailedEmail(to: string, userName?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grantfinder.pro";
  const greeting = userName ? `Hi ${userName}` : "Hi there";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 40px; text-align: center;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Payment Failed</h1>
        </div>
        <div style="padding: 32px 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            ${greeting},
          </p>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            We were unable to process your payment for GrantPilot. Your subscription may be interrupted if this isn't resolved soon.
          </p>

          <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #fbbf24; margin: 0 0 12px; font-size: 16px;">What to do:</h3>
            <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Verify your payment method is up to date</li>
              <li>Check that your card hasn't expired</li>
              <li>Ensure sufficient funds are available</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>

          <a href="${APP_URL}/dashboard/settings?tab=billing" style="display: block; margin-top: 24px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center;">
            Update Payment Method
          </a>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
            If you need assistance, please contact our support team at support@grantfinder.pro
          </p>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            GrantPilot - Funding your vision
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
      subject: "Action Required: Payment Failed for GrantPilot",
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send payment failed email:", error);
    throw error;
  }
}

// Subscription canceled notification email
export async function sendSubscriptionCanceledEmail(to: string, userName?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grantfinder.pro";
  const greeting = userName ? `Hi ${userName}` : "Hi there";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 32px 40px; text-align: center;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Subscription Canceled</h1>
        </div>
        <div style="padding: 32px 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            ${greeting},
          </p>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Your GrantPilot subscription has been canceled. We're sorry to see you go!
          </p>

          <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #e2e8f0; margin: 0 0 12px; font-size: 16px;">What happens now:</h3>
            <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Your account has been downgraded to the free plan</li>
              <li>You'll have limited access to grant matching (5/month)</li>
              <li>AI auto-apply features are no longer available</li>
              <li>Your saved grants and applications remain accessible</li>
            </ul>
          </div>

          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Changed your mind? You can resubscribe anytime and pick up where you left off.
          </p>

          <a href="${APP_URL}/pricing" style="display: block; margin-top: 24px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center;">
            Resubscribe to Pro
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            We'd love to hear your feedback - reply to this email anytime.
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
      subject: "Your GrantPilot subscription has been canceled",
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send subscription canceled email:", error);
    throw error;
  }
}

// Application submission confirmation email
interface ApplicationConfirmationParams {
  userName?: string;
  grantTitle: string;
  funder: string;
  confirmationNumber: string;
  submittedAt: Date;
  completionScore: number | null;
  confidenceScore: number | null;
  grantAmount: string | null;
  deadline: Date | null;
  applicationId: string;
}

export async function sendApplicationConfirmationEmail(
  to: string,
  params: ApplicationConfirmationParams
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grantfinder.pro";
  const greeting = params.userName ? `Hi ${params.userName}` : "Hi there";
  const submittedDate = params.submittedAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const deadlineStr = params.deadline
    ? new Date(params.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Not specified";
  const scoreHtml = params.completionScore
    ? `<div style="background: #064e3b; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
        <p style="color: #6ee7b7; font-size: 14px; margin: 0 0 4px;">Predicted Score</p>
        <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${params.completionScore}/100</p>
        ${params.confidenceScore ? `<p style="color: #6ee7b7; font-size: 12px; margin: 4px 0 0;">AI Confidence: ${params.confidenceScore}%</p>` : ""}
      </div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 32px 40px; text-align: center;">
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px;">Application Submitted</p>
          <h1 style="color: white; font-size: 24px; margin: 0;">Confirmation: ${params.confirmationNumber}</h1>
        </div>
        <div style="padding: 32px 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            ${greeting}, your grant application has been submitted successfully.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="color: #94a3b8; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #334155;">Grant</td>
              <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; border-bottom: 1px solid #334155; font-weight: 600;">${params.grantTitle}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #334155;">Funder</td>
              <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; border-bottom: 1px solid #334155;">${params.funder}</td>
            </tr>
            ${params.grantAmount ? `
            <tr>
              <td style="color: #94a3b8; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #334155;">Amount</td>
              <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; border-bottom: 1px solid #334155;">${params.grantAmount}</td>
            </tr>` : ""}
            <tr>
              <td style="color: #94a3b8; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #334155;">Deadline</td>
              <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; border-bottom: 1px solid #334155;">${deadlineStr}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #334155;">Submitted</td>
              <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; border-bottom: 1px solid #334155;">${submittedDate}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Confirmation</td>
              <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">${params.confirmationNumber}</td>
            </tr>
          </table>

          ${scoreHtml}

          <h3 style="color: #e2e8f0; font-size: 16px; margin: 24px 0 12px;">What Happens Next</h3>
          <div style="background: #0f172a; border-radius: 8px; padding: 20px;">
            <div style="display: flex; margin-bottom: 16px;">
              <div style="min-width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; font-size: 12px; font-weight: bold; text-align: center; line-height: 24px; margin-right: 12px;">✓</div>
              <div>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0; font-weight: 600;">Application Submitted</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Your application has been received and recorded.</p>
              </div>
            </div>
            <div style="display: flex; margin-bottom: 16px;">
              <div style="min-width: 24px; height: 24px; background: #334155; border-radius: 50%; color: #94a3b8; font-size: 12px; font-weight: bold; text-align: center; line-height: 24px; margin-right: 12px;">2</div>
              <div>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0; font-weight: 600;">Under Review</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">The funder reviews your application against their scoring criteria.</p>
              </div>
            </div>
            <div style="display: flex;">
              <div style="min-width: 24px; height: 24px; background: #334155; border-radius: 50%; color: #94a3b8; font-size: 12px; font-weight: bold; text-align: center; line-height: 24px; margin-right: 12px;">3</div>
              <div>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0; font-weight: 600;">Decision</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">We'll prompt you to report the outcome so we can improve future applications.</p>
              </div>
            </div>
          </div>

          <a href="${APP_URL}/dashboard/applications/${params.applicationId}" style="display: block; text-align: center; background: linear-gradient(135deg, #10b981, #14b8a6); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px;">
            View Application Status
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Save this email for your records. Confirmation: ${params.confirmationNumber}
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
      from: process.env.RESEND_FROM_EMAIL || "GrantPilot <grants@resend.dev>",
      to,
      subject: `✓ Application Submitted — ${params.grantTitle} (${params.confirmationNumber})`,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send application confirmation email:", error);
    throw error;
  }
}

// ─── Student Outcome Nudge ────────────────────────────────────────────────────

export async function sendStudentOutcomeNudgeEmail(
  to: string,
  params: {
    userName?: string;
    scholarshipTitle: string;
    deadline: Date;
    applicationId: string;
    nudgeNumber: number; // 1, 2, or 3
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const { userName, scholarshipTitle, deadline, applicationId, nudgeNumber } = params;
  const reportUrl = `${APP_URL}/student/applications/${applicationId}`;
  const deadlineFormatted = new Date(deadline).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Tone varies by nudge number
  const nudgeConfig = {
    1: {
      subject: `Have you heard back from ${scholarshipTitle}?`,
      headerText: "Just Checking In",
      headerGradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
      intro: "Just checking in — the deadline for this scholarship has passed and we'd love to know how it went!",
      body: "Did you receive a decision? Letting us know takes just a moment and helps you keep your account in good standing.",
      ctaText: "Report Outcome",
      tone: "friendly",
    },
    2: {
      subject: `Quick update needed: ${scholarshipTitle}`,
      headerText: "Your Response Helps Other Students",
      headerGradient: "linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)",
      intro: "When you report your scholarship outcome, you help other students understand their chances — and keep your GrantPilot account fully active.",
      body: "It only takes 10 seconds. Did you receive an award, a rejection, or are you still waiting?",
      ctaText: "Report My Outcome",
      tone: "direct",
    },
    3: {
      subject: `Action required: Report your outcome for ${scholarshipTitle}`,
      headerText: "Report Your Outcome to Continue",
      headerGradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      intro: "Your account is currently gated from submitting new scholarship applications until you report the outcome of this past-deadline application.",
      body: "Please take a moment to report whether you received an award, a rejection, or if you're still waiting. This keeps our data accurate and your account active.",
      ctaText: "Report Now — Unlock My Account",
      tone: "firm",
    },
  };

  const config = nudgeConfig[nudgeNumber as 1 | 2 | 3] ?? nudgeConfig[1];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">

        <!-- Header -->
        <div style="background: ${config.headerGradient}; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
            ${config.headerText}
          </h1>
          <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 14px;">GrantPilot</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${userName || "there"},
          </p>

          <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
            ${config.intro}
          </p>

          <!-- Scholarship Card -->
          <div style="background-color: #0f172a; border-radius: 10px; padding: 24px; margin: 24px 0; border: 1px solid #334155;">
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Scholarship</p>
            <h2 style="color: #e2e8f0; font-size: 18px; margin: 0 0 8px; font-weight: 600;">${scholarshipTitle}</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">
              Deadline was <span style="color: #f59e0b;">${deadlineFormatted}</span>
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 32px;">
            ${config.body}
          </p>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${reportUrl}"
               style="display: inline-block; background: ${config.headerGradient}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.2px;">
              ${config.ctaText}
            </a>
          </div>

          <p style="color: #475569; font-size: 13px; text-align: center; margin: 24px 0 0;">
            Or visit: <a href="${reportUrl}" style="color: #10b981; text-decoration: none;">${reportUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #334155; padding: 20px 40px; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0; line-height: 1.6;">
            You're receiving this because you have a submitted application past its deadline.<br>
            <a href="${APP_URL}/student/settings" style="color: #64748b; text-decoration: underline;">Manage notification preferences</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Resend client not available, skipping email");
      return null;
    }

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GrantPilot <grants@resend.dev>",
      to,
      subject: config.subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send student outcome nudge email:", error);
    throw error;
  }
}

// ─── Overdue Outcome Query Helper ─────────────────────────────────────────────

import { prisma } from "@/lib/db";

export async function getOverdueStudentOutcomes(): Promise<
  Array<{
    userId: string;
    email: string;
    name: string | null;
    applicationId: string;
    scholarshipTitle: string;
    deadline: Date;
    daysPastDeadline: number;
  }>
> {
  const now = new Date();

  const applications = await prisma.studentApplication.findMany({
    where: {
      status: "submitted",
      outcomeReportedAt: null,
      scholarship: {
        deadline: { lt: now },
      },
    },
    include: {
      scholarship: { select: { title: true, deadline: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return applications
    .filter((a) => a.scholarship.deadline !== null)
    .map((a) => {
      const deadline = a.scholarship.deadline as Date;
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysPastDeadline = Math.floor((now.getTime() - deadline.getTime()) / msPerDay);

      return {
        userId: a.userId,
        email: a.user.email ?? "",
        name: a.user.name ?? null,
        applicationId: a.id,
        scholarshipTitle: a.scholarship.title,
        deadline,
        daysPastDeadline,
      };
    });
}

export async function sendOrganizationInvitationEmail({
  to,
  inviterName,
  organizationName,
  role,
  acceptUrl,
  expiresAt,
}: {
  to: string;
  inviterName: string | null;
  organizationName: string;
  role: string;
  acceptUrl: string;
  expiresAt: Date;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping invitation email");
    return null;
  }

  const inviter = inviterName ? inviterName : "A teammate";
  const expiresOn = expiresAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">You've been invited to ${escapeInvitationHtml(organizationName)}</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin-top: 0;">
            ${escapeInvitationHtml(inviter)} invited you to join <strong>${escapeInvitationHtml(organizationName)}</strong>
            on GrantPilot as a <strong>${escapeInvitationHtml(role)}</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            GrantPilot helps teams find and apply for grants. Accepting this invitation gives you
            collaborator access to this organization's grant pipeline, applications, and content
            library.
          </p>
          <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
            <a href="${acceptUrl}"
               style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Accept invitation
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">
            This invitation expires on <strong>${expiresOn}</strong>. If you didn't expect this
            email you can safely ignore it &mdash; no account will be created until you accept.
          </p>
          <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">
            If the button doesn't work, paste this link into your browser:<br>
            <span style="color: #10b981;">${acceptUrl}</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    if (!client) return null;
    return await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GrantPilot <grants@resend.dev>",
      to,
      subject: `You've been invited to ${organizationName} on GrantPilot`,
      html,
    });
  } catch (err) {
    console.error("Failed to send invitation email:", err);
    return null;
  }
}

function escapeInvitationHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

