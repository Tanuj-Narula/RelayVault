'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rv_dismissed_deals';

export function useDismissedDeals() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDismissed(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const save = (next: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {}
  };

  const dismiss = (bidId: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(bidId);
      save(next);
      return next;
    });
  };

  const dismissMany = (bidIds: string[]) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      bidIds.forEach((id) => next.add(id));
      save(next);
      return next;
    });
  };

  const restore = (bidId: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.delete(bidId);
      save(next);
      return next;
    });
  };

  const clearAll = () => {
    setDismissed(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return { dismissed, dismiss, dismissMany, restore, clearAll };
}
