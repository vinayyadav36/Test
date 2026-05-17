"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/invoices", label: "Invoices", icon: "📄" },
  { href: "/customers", label: "Customers", icon: "👤" },
  { href: "/payments", label: "Payments", icon: "💳" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, business, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-slate-300 shadow-lg"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-40 w-60 h-screen flex flex-col bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold">IC</span>
            </div>
            <div>
              <span className="text-base font-bold text-white">Cockpit</span>
              {business && (
                <p className="text-[10px] text-slate-500 leading-tight">{business.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className={`text-lg ${active ? "" : "opacity-60"}`}>{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-slate-700/50 flex items-center justify-center text-xs text-slate-400 font-semibold">
              {user?.email?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.email}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
