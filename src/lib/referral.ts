// Referral program configuration and helpers

import { nanoid } from "nanoid";

// Reward configuration
export const REFERRAL_CONFIG = {
  // Bonus grant matches awarded
  referrerReward: 10, // Referrer gets 10 bonus matches
  refereeReward: 5,   // New user gets 5 bonus matches

  // Requirements for reward
  requirePaidSubscription: false, // Whether referee needs to upgrade to trigger reward

  // Limits
  maxReferralsPerMonth: 50,
};

// Generate a unique referral code
export function generateReferralCode(): string {
  // 8 character alphanumeric code
  return nanoid(8).toUpperCase();
}

// Build referral link
export function getReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://grantfinderpro.com";
  return `${baseUrl}/signup?ref=${code}`;
}

// Validate referral code format
export function isValidReferralCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code);
}
