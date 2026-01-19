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
