import { useState, useEffect, useCallback } from "react";
import { Log } from "../utils/logger";

// Stores viewed notification IDs in localStorage
const VIEWED_KEY = "campus_viewed_notifications";

export function useViewedNotifications() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEWED_KEY);
      if (stored) {
        setViewedIds(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const markAsViewed = useCallback(async (id: string) => {
    setViewedIds((prev: Set<string>) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(VIEWED_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // silent
      }
      return next;
    });
    await Log("frontend", "debug", "state", `Notification marked as viewed: ${id}`);
  }, []);

  const isViewed = useCallback(
    (id: string) => viewedIds.has(id),
    [viewedIds]
  );

  return { viewedIds, markAsViewed, isViewed };
}
