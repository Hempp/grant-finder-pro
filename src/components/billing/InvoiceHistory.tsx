"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Receipt, AlertCircle } from "lucide-react";

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  created: number;
  description: string;
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency?.toUpperCase() || "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/invoices")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setInvoices(data.invoices || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load invoices:", err);
        setError("Couldn't load your invoice history. Try refreshing.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = async (invoiceId: string, invoiceNumber: string | null) => {
    setDownloadingId(invoiceId);
    try {
      const res = await fetch(`/api/billing/invoices/${invoiceId}/download`);
      if (!res.ok) {
        if (res.status === 409) {
          setError("That invoice isn't finalized yet. Try again in a minute.");
        } else {
          setError("Couldn't download that invoice. Try again or contact support.");
        }
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grantpilot-invoice-${invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download error:", err);
      setError("Download failed. Try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (invoices === null && !error) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-3">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading invoices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 text-sm text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-3 flex items-center gap-2">
        <Receipt className="h-4 w-4" aria-hidden="true" />
        No invoices yet. They&apos;ll appear here after your first subscription charge or success-fee invoice.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 font-medium">Amount</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium sr-only">Download</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t border-slate-800">
              <td className="py-3 text-slate-300 whitespace-nowrap">{formatDate(inv.created)}</td>
              <td className="py-3 text-slate-300">{inv.description}</td>
              <td className="py-3 text-white font-medium whitespace-nowrap">
                {formatAmount(inv.amountPaid || inv.amountDue, inv.currency)}
              </td>
              <td className="py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    inv.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : inv.status === "open"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {inv.status === "paid" ? "Paid" : inv.status === "open" ? "Unpaid" : inv.status}
                </span>
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={() => handleDownload(inv.id, inv.number)}
                  disabled={downloadingId === inv.id}
                  aria-label={`Download invoice ${inv.number || inv.id}`}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium disabled:opacity-50"
                >
                  {downloadingId === inv.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
