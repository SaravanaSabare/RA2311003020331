import axios from "axios";
import { getAuthToken } from "./auth";

const LOG_URL = "http://20.207.122.201/evaluation-service/logs";

// Valid values as per the evaluation spec
type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
type SharedPackage = "auth" | "config" | "middleware" | "utils";
type Package = BackendPackage | FrontendPackage | SharedPackage;

interface LogResponse {
  logID: string;
  message: string;
}

/** Truncate message to 48 characters max as required by the API */
function truncate(msg: string): string {
  return msg.length > 48 ? msg.substring(0, 48) : msg;
}

/**
 * Log - Reusable logging function that sends structured log entries
 * to the Affordmed evaluation service.
 *
 * @param stack   - Application layer: "backend" | "frontend"
 * @param level   - Severity level: "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - Package/module originating the log
 * @param message - Descriptive log message (truncated to 48 chars)
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<LogResponse | null> {
  try {
    const token = await getAuthToken();

    const response = await axios.post<LogResponse>(
      LOG_URL,
      { stack, level, package: pkg, message: truncate(message) },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err;
      process.stderr.write(
        `[LogMiddleware] Failed to send log | status=${axiosErr.response?.status} body=${JSON.stringify(axiosErr.response?.data)}\n`
      );
    } else {
      process.stderr.write(`[LogMiddleware] Unexpected error: ${String(err)}\n`);
    }
    return null;
  }
}

export type { Stack, Level, Package };
