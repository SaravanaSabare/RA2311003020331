import { useState, useEffect, useCallback } from "react";
import { Notification } from "../types/notification";
import { fetchAllNotifications, fetchPriorityNotifications } from "../api/notificationsApi";
import { Log } from "../utils/logger";

export function useNotifications(notificationType?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Log("frontend", "debug", "hook", `useNotifications: loading notifications | type=${notificationType ?? "all"}`);
    try {
      const data = await fetchAllNotifications(
        notificationType ? { notification_type: notificationType } : undefined
      );
      setNotifications(data);
      await Log("frontend", "info", "hook", `useNotifications: loaded ${data.length} notifications`);
    } catch {
      setError("Failed to load notifications");
      await Log("frontend", "error", "hook", "useNotifications: failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [notificationType]);

  useEffect(() => { load(); }, [load]);

  return { notifications, loading, error, refetch: load };
}

export function usePriorityNotifications(n: number = 10) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Log("frontend", "debug", "hook", `usePriorityNotifications: loading top ${n} priority notifications`);
    try {
      const data = await fetchPriorityNotifications(n);
      setNotifications(data);
      await Log("frontend", "info", "hook", `usePriorityNotifications: loaded ${data.length} priority notifications`);
    } catch {
      setError("Failed to load priority notifications");
      await Log("frontend", "error", "hook", "usePriorityNotifications: failed to load priority notifications");
    } finally {
      setLoading(false);
    }
  }, [n]);

  useEffect(() => { load(); }, [load]);

  return { notifications, loading, error, refetch: load };
}
