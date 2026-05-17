"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { formatCurrency, formatDate, StatCard, EmptyState, Skeleton } from "@/app/components/ui";
import { useAuth } from "@/app/components/AuthProvider";

type Stats = {
  totalInvoices: number;
  totalRevenue: number;
  totalReceivable: number;
  overdueAmount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  recentPayments: {
    id: string;
    invoiceId: string;
    amount: number;
    currency: string;
    method: string;
    paidAt: string;
  }[];
};

export default function DashboardPage() {
  const { business } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(); return d; })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title={`Hi${business ? `, ${business.name}` : ""} 👋`} subtitle="Here's your business overview" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const s = stats!;

  return (
    <div>
      <PageHeader title={`Hi${business ? `, ${business.name}` : ""} 👋`} subtitle="Here's your business overview">
        <Link href="/invoices/new" className="btn-primary">+ New Invoice</Link>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Invoices" value={String(s.totalInvoices)} sub={`${s.draftCount} draft · ${s.sentCount} sent · ${s.paidCount} paid`} icon="📄" />
        <StatCard label="Revenue Collected" value={formatCurrency(s.totalRevenue)} trend="up" icon="💰" />
        <StatCard label="Outstanding" value={formatCurrency(s.totalReceivable)} icon="📋" />
        <StatCard label="Overdue" value={formatCurrency(s.overdueAmount)} sub={`${s.overdueCount} invoice(s)`} trend={s.overdueAmount > 0 ? "down" : undefined} icon="⚠️" />
      </div>

      {s.totalInvoices === 0 ? (
        <EmptyState
          icon="🚀"
          title="You're all set!"
          description="Start by creating your first invoice or adding a customer."
          action={<Link href="/invoices/new" className="btn-primary">Create First Invoice →</Link>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link href="/invoices/new" className="card-hover flex items-center gap-4 py-6 px-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl">📄</div>
              <div>
                <p className="font-semibold text-white text-sm">New Invoice</p>
                <p className="text-xs text-slate-500 mt-0.5">Create and send instantly</p>
              </div>
            </Link>
            <Link href="/customers/new" className="card-hover flex items-center gap-4 py-6 px-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-2xl">👤</div>
              <div>
                <p className="font-semibold text-white text-sm">Add Customer</p>
                <p className="text-xs text-slate-500 mt-0.5">Save billing details</p>
              </div>
            </Link>
            <Link href="/payments/new" className="card-hover flex items-center gap-4 py-6 px-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">💳</div>
              <div>
                <p className="font-semibold text-white text-sm">Record Payment</p>
                <p className="text-xs text-slate-500 mt-0.5">Mark invoices as paid</p>
              </div>
            </Link>
          </div>

          {s.recentPayments.length > 0 && (
            <div className="card animate-fade-in">
              <h2 className="section-title">Recent Payments</h2>
              <div className="space-y-1">
                {s.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-sm">💳</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{formatCurrency(p.amount, p.currency)}</p>
                        <p className="text-xs text-slate-500">via {p.method} · {formatDate(p.paidAt)}</p>
                      </div>
                    </div>
                    <Link href={`/invoices/${p.invoiceId}`} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
