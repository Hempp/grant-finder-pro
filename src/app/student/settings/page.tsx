"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  Shield,
  Settings,
  DollarSign,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardContent, Badge, Button } from "@/components/ui";
import { useSubscription } from "@/hooks/useSubscription";

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentMethod {
  hasPaymentMethod: boolean;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
}

interface FeeRecord {
  id: string;
  scholarship: {
    title: string;
  };
  awardAmount: number | null;
  successFeePercent: number;
  successFeeAmount: number | null;
  successFeePaidAt: string | null;
  successFeeStatus: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function planLabel(plan: string): { label: string; variant: "success" | "info" | "warning" | "default" } {
  switch (plan) {
    case "pro":
      return { label: "Pro", variant: "success" };
    case "growth":
      return { label: "Growth", variant: "info" };
    case "organization":
      return { label: "Organization", variant: "warning" };
    default:
      return { label: "Free", variant: "default" };
  }
}

function feeStatusBadge(status: string): { label: string; variant: "success" | "warning" | "danger" | "info" | "default" } {
  switch (status) {
    case "paid":
      return { label: "Paid", variant: "success" };
    case "invoiced":
      return { label: "Invoiced", variant: "warning" };
    case "pending":
      return { label: "Pending", variant: "info" };
    case "waived":
      return { label: "Waived", variant: "default" };
    default:
      return { label: capitalize(status), variant: "default" };
  }
}

// ── Section 1: Account ─────────────────────────────────────────────────────

function AccountSection({ plan }: { plan: string }) {
  const { data: session } = useSession();
  const { label, variant } = planLabel(plan);

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2.5 rounded-xl">
            <Settings className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Account</h2>
            <p className="text-sm text-slate-400">Your account details</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
              Display Name
            </label>
            <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300 text-sm">
              {session?.user?.name || "—"}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300 text-sm">
              {session?.user?.email || "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div>
            <p className="text-sm font-medium text-white mb-1">Current Plan</p>
            <Badge variant={variant}>{label}</Badge>
          </div>
          {plan !== "pro" && plan !== "organization" && (
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Section 2: Payment Method ──────────────────────────────────────────────

function PaymentSection() {
  const [pm, setPm] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  async function fetchPaymentMethod() {
    setLoading(true);
    try {
      const res = await fetch("/api/student/payment-method");
      if (res.ok) {
        const data = await res.json();
        setPm(data);
      }
    } catch (err) {
      console.error("Failed to load payment method:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCard() {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/student/payment-method", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create setup intent");
      const { clientSecret } = await res.json();
      // clientSecret obtained — in a full integration this would open Stripe Elements.
      // For now, store intent ID and inform the user.
      if (clientSecret) {
        setMessage({
          type: "success",
          text: "Setup ready. Contact support or use the Stripe portal to complete card entry.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to start card setup. Please try again." });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveCard() {
    if (!confirm("Remove your card on file? You won't be charged success fees automatically.")) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/student/payment-method", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove card");
      setMessage({ type: "success", text: "Payment method removed." });
      setPm({ hasPaymentMethod: false });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to remove card. Please try again." });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/15 p-2.5 rounded-xl">
            <CreditCard className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Payment Method</h2>
            <p className="text-sm text-slate-400">Used for success fees when you win scholarships</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading payment details…</span>
          </div>
        ) : pm?.hasPaymentMethod ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-16 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {pm.brand ? capitalize(pm.brand) : "Card"} ending in {pm.last4}
                </p>
                {pm.expMonth && pm.expYear && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveCard}
              isLoading={actionLoading}
              loadingText="Removing…"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-slate-300 text-sm font-medium">No card on file</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Add a card to enable automatic success fee collection
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCard}
              isLoading={actionLoading}
              loadingText="Setting up…"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Payment Method
            </Button>
          </div>
        )}

        {message && (
          <div
            className={`mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Section 3: Fee History ─────────────────────────────────────────────────

function FeeHistorySection() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await fetch("/api/student/applications");
        if (!res.ok) return;
        const data: FeeRecord[] = await res.json();
        // Filter to applications where a fee was charged or is on an installment plan
        const charged = data.filter(
          (a) => a.successFeeStatus === "paid" || a.successFeeStatus === "invoiced" || a.successFeeStatus === "pending"
        );
        setFees(charged);
      } catch (err) {
        console.error("Failed to load fee history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 p-2.5 rounded-xl">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Fee History</h2>
            <p className="text-sm text-slate-400">Success fees charged when you win scholarships</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading fee history…</span>
          </div>
        ) : fees.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-slate-800/50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No fees yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Fees are only charged when you win a scholarship.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-1">
                    Scholarship
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-1">
                    Award
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-1 hidden sm:table-cell">
                    Fee %
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-1">
                    Fee Amount
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-1 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-1">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {fees.map((fee) => {
                  const { label, variant } = feeStatusBadge(fee.successFeeStatus);
                  return (
                    <tr key={fee.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-1 text-white font-medium max-w-[160px] truncate">
                        {fee.scholarship?.title || "—"}
                      </td>
                      <td className="py-3 px-1 text-right text-slate-300 whitespace-nowrap">
                        {fee.awardAmount ? formatCurrency(fee.awardAmount) : "—"}
                      </td>
                      <td className="py-3 px-1 text-right text-slate-400 hidden sm:table-cell">
                        {fee.successFeePercent}%
                      </td>
                      <td className="py-3 px-1 text-right text-emerald-400 font-medium whitespace-nowrap">
                        {fee.successFeeAmount ? formatCurrency(fee.successFeeAmount) : "—"}
                      </td>
                      <td className="py-3 px-1 text-right text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {fee.successFeePaidAt
                          ? new Date(fee.successFeePaidAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 px-1 text-right">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function StudentSettingsPage() {
  const { subscription } = useSubscription();
  const plan = subscription?.plan ?? "free";

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 animate-fade-in max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-7 w-7 text-slate-400" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account, billing, and fee history.</p>
      </div>

      <AccountSection plan={plan} />
      <PaymentSection />
      <FeeHistorySection />
    </div>
  );
}
