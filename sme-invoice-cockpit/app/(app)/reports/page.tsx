"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { formatCurrency } from "@/app/components/ui";

type Summary = {
  month: string;
  invoiceCount: number;
  invoiceValue: number;
  monthlyRevenue: number;
  avgDaysToPay: number;
  topByRevenue: { name: string; revenue: number; unpaid: number }[];
  topByUnpaid: { name: string; revenue: number; unpaid: number }[];
};

export default function ReportsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetch(`/api/reports?mode=summary&month=${month}`, { credentials: "include" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(); return d; })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div>
      <PageHeader title="Reports" subtitle={`Monthly overview for ${month}`}>
        <a className="btn-secondary btn-sm" href={`/api/reports?mode=export&type=invoices`}>Invoices CSV</a>
        <a className="btn-secondary btn-sm" href={`/api/reports?mode=export&type=payments`}>Payments CSV</a>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Invoices ({month})</p>
              <p className="text-2xl font-bold text-white">{data.invoiceCount}</p>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Invoice Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.invoiceValue)}</p>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Revenue</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(data.monthlyRevenue)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card">
              <p className="section-title">Top Customers by Outstanding</p>
              <div className="space-y-3 mt-3">
                {data.topByUnpaid.map((c) => (
                  <div key={c.name} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                    <span className="text-sm text-slate-200 font-medium">{c.name}</span>
                    <span className="text-sm font-semibold text-rose-400">{formatCurrency(c.unpaid)}</span>
                  </div>
                ))}
                {data.topByUnpaid.length === 0 && <p className="text-sm text-slate-500">No outstanding invoices.</p>}
              </div>
            </div>
            <div className="card">
              <p className="section-title">Top Customers by Revenue</p>
              <div className="space-y-3 mt-3">
                {data.topByRevenue.map((c) => (
                  <div key={c.name} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                    <span className="text-sm text-slate-200 font-medium">{c.name}</span>
                    <span className="text-sm font-semibold text-emerald-400">{formatCurrency(c.revenue)}</span>
                  </div>
                ))}
                {data.topByRevenue.length === 0 && <p className="text-sm text-slate-500">No revenue data yet.</p>}
              </div>
            </div>
          </div>

          {data.avgDaysToPay > 0 && (
            <div className="card-glass inline-block">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg. Days to Pay</p>
              <p className="text-2xl font-bold text-white">{data.avgDaysToPay.toFixed(1)} <span className="text-sm font-normal text-slate-500">days</span></p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
