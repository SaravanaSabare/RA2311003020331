/**
 * Frontend Logging Middleware
 * Calls the backend /api/log proxy which then calls the evaluation service.
 * This avoids CORS issues and keeps the token server-side.
 */

export type FrontendStack = "frontend";
export type FrontendLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export async function Log(
  stack: FrontendStack,
  level: FrontendLevel,
  pkg: FrontendPackage,
  message: string
): Promise<void> {
  const truncated = message.length > 48 ? message.substring(0, 48) : message;
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stack, level, package: pkg, message: truncated }),
    });
  } catch {
    // Silent fail — never let logging break the UI
  }
}
