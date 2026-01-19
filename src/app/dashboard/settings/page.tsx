"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Bell,
  Mail,
  Shield,
  User,
  Save,
  Loader2,
  CreditCard,
  Zap,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { subscription, loading: subLoading } = useSubscription();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const success = searchParams.get("success");

  const [settings, setSettings] = useState({
    emailNotifications: true,
    deadlineReminders: true,
    reminderDays: 7,
    weeklyDigest: true,
    newGrantAlerts: true,
    trialReminders: true,
  });

  // Load notification preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch("/api/user/notifications");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            emailNotifications: data.emailNotifications ?? true,
            deadlineReminders: data.deadlineReminders ?? true,
            reminderDays: 7,
            weeklyDigest: data.weeklyDigest ?? true,
            newGrantAlerts: data.emailNotifications ?? true,
            trialReminders: data.trialReminders ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoadingPrefs(false);
      }
    }
    loadPreferences();
  }, []);

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setManagingBilling(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          deadlineReminders: settings.deadlineReminders,
          weeklyDigest: settings.weeklyDigest,
          trialReminders: settings.trialReminders,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-emerald-400" />
          Settings
        </h1>
        <p className="text-slate-400 mt-2">
          Manage your notification preferences and account settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-400" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={session?.user?.name || ""}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Contact support to change your name
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-yellow-400" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-slate-400">
                  Receive updates about your applications via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-medium">Deadline Reminders</p>
                <p className="text-sm text-slate-400">
                  Get reminded before grant deadlines
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.deadlineReminders}
                onChange={(e) =>
                  setSettings({ ...settings, deadlineReminders: e.target.checked })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>

            {settings.deadlineReminders && (
              <div className="ml-4 pl-4 border-l border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Remind me this many days before deadline
                </label>
                <select
                  value={settings.reminderDays}
                  onChange={(e) =>
                    setSettings({ ...settings, reminderDays: parseInt(e.target.value) })
                  }
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            )}

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-medium">New Grant Alerts</p>
                <p className="text-sm text-slate-400">
                  Get notified when new matching grants are available
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.newGrantAlerts}
                onChange={(e) =>
                  setSettings({ ...settings, newGrantAlerts: e.target.checked })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-medium">Weekly Digest</p>
                <p className="text-sm text-slate-400">
                  Receive a weekly summary of grant opportunities
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyDigest}
                onChange={(e) =>
                  setSettings({ ...settings, weeklyDigest: e.target.checked })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-medium">Trial Reminders</p>
                <p className="text-sm text-slate-400">
                  Get notified before your free trial ends
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.trialReminders}
                onChange={(e) =>
                  setSettings({ ...settings, trialReminders: e.target.checked })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            Security
          </h2>
          <div className="space-y-4">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
              Change Password
            </button>
            <p className="text-sm text-slate-400">
              We recommend changing your password regularly to keep your account secure.
            </p>
          </div>
        </div>

        {/* Subscription & Billing Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            Subscription & Billing
          </h2>

          {success && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <p className="text-emerald-400">
                Your subscription has been updated successfully!
              </p>
            </div>
          )}

          {subLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {subscription.plan === "free" ? (
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-slate-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-slate-900" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">{subscription.planName} Plan</p>
                    <p className="text-sm text-slate-400">
                      {subscription.plan === "free"
                        ? "Limited features"
                        : subscription.billingPeriodEnd
                        ? `Renews ${new Date(subscription.billingPeriodEnd).toLocaleDateString()}`
                        : "Active subscription"}
                    </p>
                  </div>
                </div>
                {subscription.plan !== "free" && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Grant Matches</p>
                  <p className="text-xl font-semibold text-white">
                    {subscription.usage.matchesUsed}
                    <span className="text-slate-400 text-sm font-normal">
                      {" "}
                      /{" "}
                      {subscription.usage.matchesRemaining === "unlimited"
                        ? "Unlimited"
                        : subscription.limits.matchesPerMonth}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Resets in {subscription.daysUntilReset} days
                  </p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Auto-Apply Drafts</p>
                  <p className="text-xl font-semibold text-white">
                    {subscription.usage.autoApplyUsed}
                    <span className="text-slate-400 text-sm font-normal">
                      {" "}
                      /{" "}
                      {subscription.usage.autoApplyRemaining === "unlimited"
                        ? "Unlimited"
                        : subscription.limits.autoApplyPerMonth}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {subscription.limits.autoApplyPerMonth === 0
                      ? "Upgrade to unlock"
                      : `Resets in ${subscription.daysUntilReset} days`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {subscription.plan === "free" ? (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Upgrade Plan
                  </Link>
                ) : (
                  <button
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white rounded-lg transition flex items-center gap-2"
                  >
                    {managingBilling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Manage Billing
                  </button>
                )}
                <Link
                  href="/pricing"
                  className="px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  View Plans
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Unable to load subscription information.</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Settings
              </>
            )}
          </button>
          {saved && (
            <span className="text-emerald-400 font-medium">
              Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
