import axios from "axios";
import { Notification } from "../types/notification";
import { Log } from "../utils/logger";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export async function fetchAllNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<Notification[]> {
  await Log("frontend", "info", "api", `Fetching all notifications | params=${JSON.stringify(params ?? {})}`);
  try {
    const res = await axios.get<{ notifications: Notification[] }>(
      `${API_BASE}/notifications`,
      { params }
    );
    await Log("frontend", "info", "api", `Received ${res.data.notifications.length} notifications`);
    return res.data.notifications;
  } catch (err) {
    await Log("frontend", "error", "api", `Failed to fetch notifications: ${String(err)}`);
    throw err;
  }
}

export async function fetchPriorityNotifications(n: number = 10): Promise<Notification[]> {
  await Log("frontend", "info", "api", `Fetching top ${n} priority notifications`);
  try {
    const res = await axios.get<{ notifications: Notification[] }>(
      `${API_BASE}/notifications/priority`,
      { params: { n } }
    );
    await Log("frontend", "info", "api", `Received ${res.data.notifications.length} priority notifications`);
    return res.data.notifications;
  } catch (err) {
    await Log("frontend", "error", "api", `Failed to fetch priority notifications: ${String(err)}`);
    throw err;
  }
}
