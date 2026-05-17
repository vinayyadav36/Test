"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { formatDate, EmptyState } from "@/app/components/ui";
import { useCollection } from "@/lib/useData";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { data: customers, loading } = useCollection<Customer>("customers");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
      ),
    [customers, search]
  );

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage your customer directory">
        <Link href="/customers/new" className="btn-primary">+ Add Customer</Link>
      </PageHeader>

      <div className="mb-6">
        <div className="relative max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input pl-10"
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👤"
          title={search ? "No matches found" : "No customers yet"}
          description={search ? "Try a different search term." : "Add your first customer to start invoicing."}
          action={!search ? <Link href="/customers/new" className="btn-primary">Add Customer →</Link> : undefined}
        />
      ) : (
        <div className="card p-0 overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 text-slate-500">
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Added</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-white" data-label="Name">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell" data-label="Email">{c.email ?? "\u2014"}</td>
                  <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell" data-label="Phone">{c.phone ?? "\u2014"}</td>
                  <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell" data-label="Added">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/invoices/new?customerId=${c.id}`} className="btn-ghost btn-xs text-indigo-400 hover:text-indigo-300">
                      Invoice →
                    </Link>
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
