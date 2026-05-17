"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as clientDb from "./clientDb";
import type { CollectionName } from "./jsonDb";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export function subscribe(col: string, fn: Listener) {
  if (!listeners.has(col)) listeners.set(col, new Set());
  listeners.get(col)!.add(fn);
  return () => listeners.get(col)?.delete(fn);
}

export function triggerRefresh(col: string) {
  listeners.get(col)?.forEach((fn) => fn());
}

export function useCollection<T>(collection: CollectionName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async () => {
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

  useEffect(() => {
    mounted.current = true;
    load();
    const unsub = subscribe(collection, load);
    return () => {
      mounted.current = false;
      unsub();
    };
  }, [collection, load]);

  const refresh = useCallback(() => {
    triggerRefresh(collection);
  }, [collection]);

  return { data, loading, refresh };
}
