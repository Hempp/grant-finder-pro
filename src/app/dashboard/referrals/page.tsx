"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Copy,
  Check,
  Users,
  Sparkles,
  Share2,
  Mail,
  Twitter,
  Linkedin,
  Loader2,
  ChevronRight,
} from "lucide-react";

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
    const text = `I've been using Grant Finder Pro to discover funding opportunities. Sign up with my link and we both get bonus grant matches!`;
    const url = encodeURIComponent(data.referralLink);
    const encodedText = encodeURIComponent(text);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${encodeURIComponent("Check out Grant Finder Pro!")}&body=${encodedText}%0A%0A${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Failed to load referral data.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Gift className="h-8 w-8 text-emerald-400" />
          Referral Program
        </h1>
        <p className="text-slate-400 mt-2">
          Invite friends and earn bonus grant matches for both of you
        </p>
      </div>

      {/* Reward Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Give {data.rewards.refereeReward}, Get {data.rewards.referrerReward}</h2>
              <p className="text-slate-300">
                Your friend gets {data.rewards.refereeReward} bonus matches, you get {data.rewards.referrerReward}!
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Your available credits</p>
            <p className="text-3xl font-bold text-emerald-400">{data.stats.creditsAvailable}</p>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-purple-400" />
          Share Your Referral Link
        </h3>

        {/* Referral Link */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={data.referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition flex items-center gap-2 font-medium"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => shareVia("email")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={() => shareVia("twitter")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </button>
          <button
            onClick={() => shareVia("linkedin")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </button>
        </div>

        {/* Referral Code */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Your referral code</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tracking-wider">
            {data.referralCode}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Total Referrals</p>
          <p className="text-2xl font-bold text-white">{data.stats.totalReferrals}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{data.stats.completedReferrals}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{data.stats.pendingReferrals}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Matches Earned</p>
          <p className="text-2xl font-bold text-cyan-400">{data.stats.totalEarned}</p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-400" />
          Your Referrals
        </h3>

        {data.referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No referrals yet</p>
            <p className="text-sm text-slate-500">
              Share your link to start earning bonus matches!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {referral.refereeName[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{referral.refereeName}</p>
                    <p className="text-sm text-slate-400">{referral.refereeEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      referral.status === "rewarded"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : referral.status === "completed"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {referral.status === "rewarded"
                      ? `+${referral.reward} matches`
                      : referral.status === "completed"
                      ? "Completed"
                      : "Pending"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold">1</span>
            </div>
            <div>
              <p className="text-white font-medium">Share your link</p>
              <p className="text-sm text-slate-400">
                Send your unique referral link to friends and colleagues
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-medium">They sign up</p>
              <p className="text-sm text-slate-400">
                When they create an account using your link
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-medium">You both earn</p>
              <p className="text-sm text-slate-400">
                You get {data.rewards.referrerReward} bonus matches, they get {data.rewards.refereeReward}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
