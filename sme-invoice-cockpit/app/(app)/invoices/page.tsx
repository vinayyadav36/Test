"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/app/components/PageHeader";
import { StatusBadge, formatCurrency, formatDate, EmptyState } from "@/app/components/ui";
import { useCollection } from "@/lib/useData";
import type { Invoice, Customer } from "@/lib/types";

const STATUSES = [
  { key: "all", label: "All", icon: "📋" },
  { key: "draft", label: "Draft", icon: "📝" },
  { key: "sent", label: "Sent", icon: "📤" },
  { key: "paid", label: "Paid", icon: "✅" },
  { key: "overdue", label: "Overdue", icon: "⚠️" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const { data: invoices, loading } = useCollection<Invoice>("invoices");
  const { data: customers } = useCollection<Customer>("customers");
  const [filter, setFilter] = useState("all");

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  const sorted = useMemo(() => {
    const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [invoices, filter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Manage and track all your invoices">
        <Link href="/invoices/new" className="btn-primary">+ New Invoice</Link>
      </PageHeader>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              filter === s.key
                ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/20 shadow-sm"
                : "bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent"
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 self-center bg-slate-800/40 px-3 py-1.5 rounded-lg">
          {sorted.length} invoice{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No invoices yet"
          description={filter !== "all" ? `No invoices with status "${filter}".` : "Create your first invoice to get started."}
          action={filter === "all" ? <Link href="/invoices/new" className="btn-primary">Create Invoice →</Link> : undefined}
        />
      ) : (
        <div className="card p-0 overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 text-slate-500">
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Number</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Issue Date</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Due Date</th>
                <th className="text-right px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="text-center px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-3.5" data-label="Number">
                    <Link href={`/invoices/${inv.id}`} className="font-mono text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-200 font-medium" data-label="Customer">
                    {customerMap[inv.customerId] ?? "\u2014"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell" data-label="Issue">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell" data-label="Due">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-white" data-label="Amount">
                    {formatCurrency(inv.total, inv.currency)}
                  </td>
                  <td className="px-5 py-3.5 text-center" data-label="Status">
                    <div className="inline-flex"><StatusBadge status={inv.status} /></div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/invoices/${inv.id}`} className="btn-ghost btn-xs">View</Link>
                      <button onClick={() => handleDelete(inv.id)} className="btn-ghost btn-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Delete</button>
                    </div>
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
