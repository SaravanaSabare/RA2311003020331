/**
 * Stage 1 - Priority Inbox
 * ========================
 * Fetches notifications from the evaluation service, computes a priority
 * score for each (Placement > Result > Event, then by recency), and
 * returns the top N using an efficient min-heap / priority queue.
 *
 * Run:  ts-node stage1_priority_inbox.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import axios from "axios";
import { Log } from "./src/utils/logger";
import { getTopNNotifications } from "./src/service/priorityService";
import { Notification } from "./src/domain/notification";

const NOTIFICATIONS_URL = "http://20.207.122.201/evaluation-service/notifications";
const TOP_N = 10;

// ── Type weights (placement > result > event) ──────────────────────────────
const TYPE_WEIGHT: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };

async function main(): Promise<void> {
  await Log("backend", "info", "service", "Stage 1: Priority Inbox script started");

  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    await Log(
      "backend",
      "fatal",
      "config",
      "ACCESS_TOKEN is not set in .env. Cannot proceed with fetching notifications."
    );
    process.exit(1);
  }

  // ── Fetch all notifications ──────────────────────────────────────────────
  await Log("backend", "info", "repository", "Fetching notifications from evaluation service API");

  let notifications: Notification[] = [];
  try {
    const response = await axios.get<{ notifications: Notification[] }>(NOTIFICATIONS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    notifications = response.data.notifications;
    await Log(
      "backend",
      "info",
      "repository",
      `Fetched ${notifications.length} total notifications successfully`
    );
  } catch (err: unknown) {
    await Log(
      "backend",
      "fatal",
      "repository",
      `Failed to fetch notifications from API: ${String(err)}`
    );
    process.exit(1);
  }

  // ── Compute top-N using min-heap ─────────────────────────────────────────
  await Log(
    "backend",
    "info",
    "service",
    `Computing top ${TOP_N} priority notifications using min-heap (O(M log N) time)`
  );

  const topNotifications = getTopNNotifications(notifications, TOP_N);

  // ── Display results ──────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log(`  🔔 PRIORITY INBOX — Top ${TOP_N} Notifications`);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(
    `  Priority Rule: Placement (×3) > Result (×2) > Event (×1), then recency\n`
  );

  topNotifications.forEach((n, idx) => {
    const typeWeight = TYPE_WEIGHT[n.Type] ?? 0;
    console.log(`  #${String(idx + 1).padStart(2, "0")}  [${n.Type.padEnd(9)}]  ${n.Message}`);
    console.log(
      `        ID: ${n.ID}  |  Time: ${n.Timestamp}  |  Weight: ${typeWeight}  |  Score: ${n.priorityScore.toExponential(4)}`
    );
    console.log();
  });

  console.log("═══════════════════════════════════════════════════════════════");

  await Log(
    "backend",
    "info",
    "service",
    `Priority Inbox computation complete. Displayed top ${topNotifications.length} notifications.`
  );

  // ── Explain efficiency ───────────────────────────────────────────────────
  console.log("\n  📐 Approach for maintaining top-10 as new notifications arrive:");
  console.log("     • Use a Min-Heap of fixed size N (here N=10).");
  console.log("     • For each incoming notification:");
  console.log("         – If heap size < N → push & sift-up  (O(log N))");
  console.log("         – Else if score > heap.min → replace root & sift-down  (O(log N))");
  console.log("         – Else discard (O(1))");
  console.log("     • Result: Top-N always maintained in O(M log N) time, O(N) space.\n");
}

main();
