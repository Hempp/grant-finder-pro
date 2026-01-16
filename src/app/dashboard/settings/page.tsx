"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Bell,
  Mail,
  Shield,
  User,
  Save,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    deadlineReminders: true,
    reminderDays: 7,
    weeklyDigest: false,
    newGrantAlerts: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving - in production, this would save to the database
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
