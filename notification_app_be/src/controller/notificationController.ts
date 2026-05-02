import { Request, Response } from "express";
import { fetchNotifications } from "../repository/notificationRepository";
import { getTopNNotifications } from "../service/priorityService";
import { Log } from "../utils/logger";

/**
 * GET /api/notifications
 * Returns all notifications from the evaluation service.
 * Query params: limit, page, notification_type
 */
export async function getAllNotifications(req: Request, res: Response): Promise<void> {
  await Log("backend", "info", "controller", "getAllNotifications controller invoked");

  try {
    const { limit, page, notification_type } = req.query;

    const notifications = await fetchNotifications({
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      notification_type: notification_type as string | undefined,
    });

    await Log(
      "backend",
      "info",
      "controller",
      `Returning ${notifications.length} notifications to client`
    );

    res.status(200).json({ notifications });
  } catch (err: unknown) {
    await Log(
      "backend",
      "error",
      "controller",
      `getAllNotifications failed: ${String(err)}`
    );
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

/**
 * GET /api/notifications/priority?n=10
 * Returns the top N priority notifications sorted by type weight and recency.
 */
export async function getPriorityNotifications(req: Request, res: Response): Promise<void> {
  const n = req.query.n ? Number(req.query.n) : 10;

  await Log(
    "backend",
    "info",
    "controller",
    `getPriorityNotifications invoked | requesting top ${n} notifications`
  );

  if (isNaN(n) || n <= 0) {
    await Log("backend", "warn", "controller", `Invalid n param received: ${req.query.n}`);
    res.status(400).json({ error: "Query param 'n' must be a positive integer" });
    return;
  }

  try {
    const allNotifications = await fetchNotifications();

    await Log(
      "backend",
      "debug",
      "controller",
      `Fetched ${allNotifications.length} total notifications; computing top ${n} by priority`
    );

    const topN = getTopNNotifications(allNotifications, n);

    await Log(
      "backend",
      "info",
      "controller",
      `Priority computation complete. Returning top ${topN.length} notifications`
    );

    res.status(200).json({ count: topN.length, notifications: topN });
  } catch (err: unknown) {
    await Log(
      "backend",
      "error",
      "controller",
      `getPriorityNotifications failed: ${String(err)}`
    );
    res.status(500).json({ error: "Failed to compute priority notifications" });
  }
}
