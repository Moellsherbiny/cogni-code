"use client";

import { useEffect, useState, useCallback } from "react";

export interface HistoryEntry {
  id: string;
  title: string;       // First ~60 chars of summary
  createdAt: string;   // ISO string
  locale: string;
}

const STORAGE_KEY = "summarize_history";
const MAX_ENTRIES = 50;

function readStorage(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeStorage(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    setEntries(readStorage());
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      // Avoid duplicate ids
      const filtered = prev.filter((e) => e.id !== entry.id);
      const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    writeStorage([]);
    setEntries([]);
  }, []);

  return { entries, addEntry, removeEntry, clearAll };
}