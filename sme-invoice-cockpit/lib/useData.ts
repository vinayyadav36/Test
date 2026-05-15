"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as clientDb from "./clientDb";
import type { CollectionName } from "./jsonDb";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const refreshVersions = new Map<string, number>();

function notify(col: string) {
  const v = (refreshVersions.get(col) ?? 0) + 1;
  refreshVersions.set(col, v);
  listeners.get(col)?.forEach((fn) => fn());
}

export function subscribe(col: string, fn: Listener) {
  if (!listeners.has(col)) listeners.set(col, new Set());
  listeners.get(col)!.add(fn);
  return () => listeners.get(col)?.delete(fn);
}

export function triggerRefresh(col: string) {
  notify(col);
}

async function fetchAndCache(collection: CollectionName) {
  try {
    const res = await fetch(`/api/${collection}`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const key = collection === "invoices" ? "invoices" : collection;
    const items = data[key] ?? [];
    if (Array.isArray(items)) {
      await clientDb.saveAll(collection as any, items);
    }
  } catch {}
}

export function useCollection<T>(collection: CollectionName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const version = useRef(0);

  const loadFromDb = useCallback(async () => {
    try {
      const result = await clientDb.getAll<T>(collection);
      if (mounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch {
      if (mounted.current) setLoading(false);
    }
  }, [collection]);

  const fullSync = useCallback(async () => {
    await fetchAndCache(collection);
    if (mounted.current) {
      const result = await clientDb.getAll<T>(collection);
      setData(result);
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    mounted.current = true;
    loadFromDb();
    fullSync();
    const unsub = subscribe(collection, () => {
      const currentVer = refreshVersions.get(collection) ?? 0;
      if (currentVer > version.current) {
        version.current = currentVer;
        fullSync();
      }
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, [collection, loadFromDb, fullSync]);

  const refresh = useCallback(() => {
    notify(collection);
  }, [collection]);

  return { data, loading, refresh };
}
