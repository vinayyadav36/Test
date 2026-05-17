"use client";
import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { formatCurrency, formatDate, EmptyState } from "@/app/components/ui";
import { useCollection } from "@/lib/useData";
import type { Payment, Invoice } from "@/lib/types";

const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  card: "Card",
  other: "Other",
};

const METHOD_ICONS: Record<string, string> = {
  upi: "📱",
  bank_transfer: "🏦",
  cash: "💵",
  card: "💳",
  other: "🔄",
};

export default function PaymentsPage() {
  const { data: payments, loading } = useCollection<Payment>("payments");
  const { data: invoices } = useCollection<Invoice>("invoices");

  const invoiceMap = useMemo(
    () => Object.fromEntries(invoices.map((i) => [i.id, i.number])),
    [invoices]
  );

  const sorted = useMemo(
    () => [...payments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()),
    [payments]
  );

  const totalReceived = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track all incoming payments">
        <Link href="/payments/new" className="btn-primary">+ Record Payment</Link>
      </PageHeader>

      {payments.length > 0 && (
        <div className="card-gradient inline-block mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl">💰</div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</p>
              <p className="stat-value text-emerald-400">{formatCurrency(totalReceived)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{payments.length} payment{payments.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No payments yet"
          description="Record your first payment to start tracking."
          action={<Link href="/payments/new" className="btn-primary">Record Payment →</Link>}
        />
      ) : (
        <div className="card p-0 overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 text-slate-500">
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Invoice</th>
                <th className="text-right px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Method</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Reference</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5" data-label="Invoice">
                    {invoiceMap[p.invoiceId] ? (
                      <Link href={`/invoices/${p.invoiceId}`} className="font-mono text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        {invoiceMap[p.invoiceId]}
                      </Link>
                    ) : (
                      <span className="text-slate-500 text-xs">{p.invoiceId}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-emerald-400" data-label="Amount">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell" data-label="Method">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span>{METHOD_ICONS[p.method] ?? "🔄"}</span>
                      <span>{METHOD_LABELS[p.method] ?? p.method}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell" data-label="Reference">
                    {p.reference ?? "\u2014"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell" data-label="Date">
                    {formatDate(p.paidAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
