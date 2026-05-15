"use client";
import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { formatCurrency, formatDate } from "@/app/components/ui";
import { useCollection } from "@/lib/useData";
import type { Payment, Invoice } from "@/lib/types";

const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  card: "Card",
  other: "Other",
};

export default function PaymentsPage() {
  const { data: payments, loading } = useCollection<Payment>("payments");
  const { data: invoices } = useCollection<Invoice>("invoices");

  const invoiceMap = useMemo(
    () => Object.fromEntries(invoices.map((i) => [i.id, i.number])),
    [invoices]
  );

  const sorted = useMemo(
    () =>
      [...payments].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      ),
    [payments]
  );

  const totalReceived = useMemo(
    () => payments.reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  return (
    <div>
      <PageHeader title="Payments">
        <Link href="/payments/new" className="btn-primary">+ Record Payment</Link>
      </PageHeader>

      {payments.length > 0 && (
        <div className="card mb-6 inline-block">
          <p className="text-xs text-slate-400 mb-1">Total Received</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(totalReceived)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {payments.length} payment{payments.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm mb-4">No payments recorded yet.</p>
          <Link href="/payments/new" className="btn-primary">Record Payment</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm table-responsive">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Invoice</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Method</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Reference</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3" data-label="Invoice">
                    {invoiceMap[p.invoiceId] ? (
                      <Link
                        href={`/invoices/${p.invoiceId}`}
                        className="text-indigo-400 hover:underline font-mono text-xs"
                      >
                        {invoiceMap[p.invoiceId]}
                      </Link>
                    ) : (
                      <span className="text-slate-500 text-xs">{p.invoiceId}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-400" data-label="Amount">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell" data-label="Method">
                    {METHOD_LABELS[p.method] ?? p.method}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell" data-label="Reference">
                    {p.reference ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell" data-label="Date">
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
