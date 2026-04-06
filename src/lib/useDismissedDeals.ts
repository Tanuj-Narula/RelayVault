'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rv_deleted_deals';

/**
 * Permanently deleted deal IDs stored in localStorage.
 * There is NO restore — once deleted, it's gone from the app.
 */
export function useDeletedDeals() {
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDeleted(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const save = (next: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {}
  };

  /** Permanently delete a single deal */
  const deleteDeal = (bidId: string) => {
    setDeleted((prev) => {
      const next = new Set(prev);
      next.add(bidId);
      save(next);
      return next;
    });
  };

  /** Permanently delete multiple deals at once */
  const deleteMany = (bidIds: string[]) => {
    setDeleted((prev) => {
      const next = new Set(prev);
      bidIds.forEach((id) => next.add(id));
      save(next);
      return next;
    });
  };

  return { deleted, deleteDeal, deleteMany };
}
