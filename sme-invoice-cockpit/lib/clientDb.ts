"use client";

import type { CollectionName } from "./jsonDb";

const DB_NAME = "invoice-cockpit";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const store of ["users", "businesses", "customers", "items", "invoices", "payments", "sessions", "webhooks"]) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAll<T>(collection: CollectionName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, "readonly");
    const store = tx.objectStore(collection);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAll<T>(collection: CollectionName, data: T[]): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, "readwrite");
    const store = tx.objectStore(collection);
    store.clear();
    for (const item of data) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function upsertById<T extends { id: string }>(collection: CollectionName, entity: T): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, "readwrite");
    const store = tx.objectStore(collection);
    store.put(entity);
    tx.oncomplete = () => resolve(entity);
    tx.onerror = () => reject(tx.error);
  });
}

export async function findById<T extends { id: string }>(collection: CollectionName, id: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, "readonly");
    const store = tx.objectStore(collection);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteById(collection: CollectionName, id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, "readwrite");
    const store = tx.objectStore(collection);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCollection(collection: CollectionName): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, "readwrite");
    const store = tx.objectStore(collection);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
