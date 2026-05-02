import { Router } from "express";
import { getAllNotifications, getPriorityNotifications } from "../controller/notificationController";

export const notificationRouter = Router();

// GET /api/notifications - all notifications (with optional filters)
notificationRouter.get("/", getAllNotifications);

// GET /api/notifications/priority?n=10 - top N priority notifications
notificationRouter.get("/priority", getPriorityNotifications);
