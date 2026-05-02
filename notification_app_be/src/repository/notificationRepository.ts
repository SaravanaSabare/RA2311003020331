import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";
import { Notification } from "../domain/notification";
import { Log } from "../utils/logger";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const NOTIFICATIONS_URL = "http://20.207.122.201/evaluation-service/notifications";

interface NotificationsApiResponse {
  notifications: Notification[];
}

/**
 * Fetches all notifications from the evaluation service API.
 * Supports optional query parameters: limit, page, notification_type.
 */
export async function fetchNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<Notification[]> {
  await Log(
    "backend",
    "info",
    "repository",
    `Fetching notifications from evaluation service with params: ${JSON.stringify(params ?? {})}`
  );

  const token = process.env.ACCESS_TOKEN;

  if (!token) {
    await Log(
      "backend",
      "error",
      "repository",
      "ACCESS_TOKEN missing from environment variables; cannot fetch notifications"
    );
    throw new Error("ACCESS_TOKEN not configured");
  }

  try {
    const response = await axios.get<NotificationsApiResponse>(NOTIFICATIONS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const notifications = response.data.notifications;

    await Log(
      "backend",
      "info",
      "repository",
      `Successfully fetched ${notifications.length} notifications from evaluation service`
    );

    return notifications;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err;
      await Log(
        "backend",
        "error",
        "repository",
        `Failed to fetch notifications | status=${axiosErr.response?.status} | message=${axiosErr.message}`
      );
    } else {
      await Log(
        "backend",
        "fatal",
        "repository",
        `Unexpected error while fetching notifications: ${String(err)}`
      );
    }
    throw err;
  }
}
