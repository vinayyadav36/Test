"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as clientDb from "@/lib/clientDb";
import { triggerRefresh } from "@/lib/useData";
import type { CollectionName } from "@/lib/jsonDb";

type AuthUser = {
  id: string;
  email: string;
  businessId: string;
  role: string;
  whatsappNumber?: string;
};

type Business = {
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  country: string;
  timezone: string;
};

type AuthCtx = {
  user: AuthUser | null;
  business: Business | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  business: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
});

const collections = ["customers", "items", "invoices", "payments", "webhooks"] as const;

async function syncServerToClient() {
  for (const col of collections) {
    try {
      const res = await fetch(`/api/${col}`, { credentials: "include" });
      if (!res.ok) continue;
      const data = await res.json();
      const key = col === "invoices" ? "invoices" : col;
      const items = data[key] ?? [];
      if (Array.isArray(items) && items.length > 0) {
        await clientDb.saveAll(col as CollectionName, items);
      }
    } catch {}
  }
  for (const col of collections) triggerRefresh(col);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setBusiness(data.business);
        syncServerToClient();
      } else {
        setUser(null);
        setBusiness(null);
      }
    } catch {
      setUser(null);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setBusiness(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, business, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
