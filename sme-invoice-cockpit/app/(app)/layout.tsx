"use client";
import dynamic from "next/dynamic";
import { RequireAuth } from "@/app/components/RequireAuth";

const Sidebar = dynamic(() => import("@/app/components/Sidebar").then((m) => ({ default: m.Sidebar })), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-14 lg:pt-6">{children}</main>
      </div>
    </RequireAuth>
  );
}
