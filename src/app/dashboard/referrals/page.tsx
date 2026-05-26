"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Copy,
  Check,
  Users,
  Share2,
  Mail,
  Twitter,
  Linkedin,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  ReferralHeroIllustration,
  EmptyReferralsIllustration,
  RewardBadgeIllustration,
  ShareIllustration,
} from "@/components/illustrations/ReferralIllustration";

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  creditsAvailable: number;
}

interface ReferralRewards {
  referrerReward: number;
  refereeReward: number;
}

interface ReferralItem {
  id: string;
  status: string;
  reward: number;
  refereeEmail: string;
  refereeName: string;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: ReferralStats;
  rewards: ReferralRewards;
  referrals: ReferralItem[];
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string) => {
    if (!data?.referralLink) return;
    const text = `I've been using GrantPilot to discover funding opportunities. Sign up with my link and we both get bonus grant matches!`;
    const url = encodeURIComponent(data.referralLink);
    const encodedText = encodeURIComponent(text);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${encodeURIComponent("Check out GrantPilot!")}&body=${encodedText}%0A%0A${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8">
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-body)" }}>
          Failed to load referral data.
        </p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--rule)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card-soft)",
  };

  const sharedShareButton: React.CSSProperties = {
    background: "var(--surface)",
    color: "var(--ink-2)",
    border: "1px solid var(--rule)",
    fontSize: "var(--text-body-sm)",
    borderRadius: "var(--radius-control)",
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <header>
        <h1
          className="font-semibold tracking-tight flex items-center gap-3"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          <Gift className="h-7 w-7" style={{ color: "var(--accent)" }} aria-hidden="true" />
          Referral program
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.55 }}
        >
          Invite friends and earn bonus grant matches for both of you.
        </p>
      </header>

      {/* Reward Banner */}
      <article
        className="p-6 relative overflow-hidden"
        style={{
          background: "var(--accent-soft)",
          border: "1.5px solid var(--accent)",
          borderRadius: "var(--radius-card)",
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-25 hidden lg:block pointer-events-none">
          <ReferralHeroIllustration className="w-80 h-60" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <RewardBadgeIllustration className="w-14 h-14 flex-shrink-0" />
            <div>
              <h2
                className="font-semibold"
                style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
              >
                Give {data.rewards.refereeReward}, get {data.rewards.referrerReward}
              </h2>
              <p
                className="mt-1"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                Your friend gets {data.rewards.refereeReward} bonus matches; you get {data.rewards.referrerReward}.
              </p>
            </div>
          </div>
          <div
            className="text-left sm:text-right px-4 py-3"
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <p style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
              Your available credits
            </p>
            <p
              className="font-mono tabular-nums font-semibold"
              style={{ fontSize: "var(--text-display)", color: "var(--accent)", lineHeight: 1.1 }}
            >
              {data.stats.creditsAvailable}
            </p>
          </div>
        </div>
      </article>

      {/* Share Section */}
      <article className="p-6 relative overflow-hidden" style={cardStyle}>
        <div className="absolute right-4 top-4 opacity-20 hidden md:block pointer-events-none">
          <ShareIllustration className="w-28 h-24" />
        </div>
        <h3
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
        >
          <Share2 className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden="true" />
          Share your referral link
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-5 relative z-10">
          <input
            type="text"
            value={data.referralLink}
            readOnly
            className="flex-1 px-3 py-2.5 font-mono truncate"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
              fontSize: "var(--text-body-sm)",
              borderRadius: "var(--radius-control)",
            }}
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2.5 transition flex items-center justify-center gap-2 font-medium !text-white"
            style={{
              background: "var(--accent)",
              fontSize: "var(--text-body-sm)",
              borderRadius: "var(--radius-control)",
            }}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => shareVia("email")}
            className="px-3 py-1.5 transition flex items-center gap-1.5 hover:bg-[var(--bg-soft)]"
            style={sharedShareButton}
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </button>
          <button
            onClick={() => shareVia("twitter")}
            className="px-3 py-1.5 transition flex items-center gap-1.5 hover:bg-[var(--bg-soft)]"
            style={sharedShareButton}
          >
            <Twitter className="h-3.5 w-3.5" /> Twitter
          </button>
          <button
            onClick={() => shareVia("linkedin")}
            className="px-3 py-1.5 transition flex items-center gap-1.5 hover:bg-[var(--bg-soft)]"
            style={sharedShareButton}
          >
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </button>
        </div>

        <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--rule)" }}>
          <p style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
            Your referral code
          </p>
          <p
            className="font-mono tabular-nums font-semibold tracking-wider mt-1"
            style={{ fontSize: "var(--text-title)", color: "var(--accent)" }}
          >
            {data.referralCode}
          </p>
        </div>
      </article>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total referrals", value: data.stats.totalReferrals, color: "var(--ink)" },
          { label: "Completed", value: data.stats.completedReferrals, color: "var(--success)" },
          { label: "Pending", value: data.stats.pendingReferrals, color: "var(--warn)" },
          { label: "Matches earned", value: data.stats.totalEarned, color: "var(--accent)" },
        ].map((s) => (
          <article key={s.label} className="p-4" style={cardStyle}>
            <p
              style={{
                fontSize: "var(--text-meta)",
                color: "var(--ink-2)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </p>
            <p
              className="mt-2 font-mono tabular-nums font-semibold"
              style={{ fontSize: "var(--text-title)", color: s.color }}
            >
              {s.value}
            </p>
          </article>
        ))}
      </div>

      {/* Referrals List */}
      <article className="p-6" style={cardStyle}>
        <h3
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
        >
          <Users className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden="true" />
          Your referrals
        </h3>

        {data.referrals.length === 0 ? (
          <div className="text-center py-10">
            <EmptyReferralsIllustration className="w-40 h-32 mx-auto mb-4 opacity-80" />
            <p
              className="mb-2"
              style={{ fontSize: "var(--text-body)", color: "var(--ink-2)" }}
            >
              No referrals yet
            </p>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)", opacity: 0.7 }}>
              Share your link to start earning bonus matches.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3"
                style={{
                  background: "var(--bg-soft)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      fontSize: "var(--text-body-sm)",
                      fontWeight: 600,
                    }}
                  >
                    {referral.refereeName[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-medium truncate"
                      style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                    >
                      {referral.refereeName}
                    </p>
                    <p
                      className="truncate"
                      style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                    >
                      {referral.refereeEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-13 sm:ml-0">
                  <span
                    className="px-2.5 py-1 rounded-full font-medium"
                    style={{
                      fontSize: "var(--text-micro)",
                      background:
                        referral.status === "rewarded"
                          ? "var(--success-soft)"
                          : referral.status === "completed"
                          ? "var(--accent-soft)"
                          : "var(--warn-soft)",
                      color:
                        referral.status === "rewarded"
                          ? "var(--success)"
                          : referral.status === "completed"
                          ? "var(--accent)"
                          : "var(--warn)",
                    }}
                  >
                    {referral.status === "rewarded"
                      ? `+${referral.reward} matches`
                      : referral.status === "completed"
                      ? "Completed"
                      : "Pending"}
                  </span>
                  <ChevronRight
                    className="h-4 w-4"
                    style={{ color: "var(--ink-2)" }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* How it Works */}
      <article className="p-6" style={cardStyle}>
        <h3
          className="font-semibold mb-4"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
        >
          How it works
        </h3>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { n: 1, title: "Share your link", body: "Send your unique referral link to friends and colleagues." },
            { n: 2, title: "They sign up", body: "When they create an account using your link." },
            {
              n: 3,
              title: "You both earn",
              body: `You get ${data.rewards.referrerReward} bonus matches, they get ${data.rewards.refereeReward}.`,
            },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  fontSize: "var(--text-body-sm)",
                  fontWeight: 700,
                }}
              >
                {s.n}
              </div>
              <div>
                <p
                  className="font-medium"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                >
                  {s.title}
                </p>
                <p
                  className="mt-1"
                  style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", lineHeight: 1.55 }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
