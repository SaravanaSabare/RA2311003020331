import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { notificationRouter } from "./routes/notificationRoute";
import { Log } from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  Log("backend", "info", "middleware", `Incoming request: ${req.method} ${req.path}`);
  next();
});

app.use("/api/notifications", notificationRouter);

app.listen(PORT, async () => {
  await Log("backend", "info", "config", `Notification backend server started on port ${PORT}`);
});
