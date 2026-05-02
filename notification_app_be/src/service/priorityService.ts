import { Notification, PrioritizedNotification } from "../domain/notification";

// Weight assigned to each notification type (placement > result > event)
const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Computes a composite priority score for a notification.
 * Score = typeWeight * 1e12 + epochMillis
 * This ensures type dominates, and among equal types, newer beats older.
 */
export function computePriorityScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] ?? 0;
  const epochMs = new Date(notification.Timestamp).getTime();
  return typeWeight * 1e12 + epochMs;
}

/**
 * MinHeap implementation for efficiently maintaining top-N notifications.
 * Invariant: heap[0] is always the lowest-priority item (easiest to evict).
 */
export class PriorityInbox {
  private heap: PrioritizedNotification[] = [];
  private readonly maxSize: number;

  constructor(n: number) {
    this.maxSize = n;
  }

  private parentIdx(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private leftIdx(i: number): number {
    return 2 * i + 1;
  }
  private rightIdx(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = this.parentIdx(i);
      if (this.heap[parent].priorityScore > this.heap[i].priorityScore) {
        this.swap(parent, i);
        i = parent;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = this.leftIdx(i);
      const right = this.rightIdx(i);
      if (left < n && this.heap[left].priorityScore < this.heap[smallest].priorityScore)
        smallest = left;
      if (right < n && this.heap[right].priorityScore < this.heap[smallest].priorityScore)
        smallest = right;
      if (smallest !== i) {
        this.swap(smallest, i);
        i = smallest;
      } else break;
    }
  }

  /**
   * Inserts a notification into the inbox, maintaining top-N invariant.
   * Time complexity: O(log N)
   */
  insert(notification: Notification): void {
    const scored: PrioritizedNotification = {
      ...notification,
      priorityScore: computePriorityScore(notification),
    };

    if (this.heap.length < this.maxSize) {
      this.heap.push(scored);
      this.siftUp(this.heap.length - 1);
    } else if (scored.priorityScore > this.heap[0].priorityScore) {
      // New item has higher priority than the weakest item in top-N: replace it
      this.heap[0] = scored;
      this.siftDown(0);
    }
    // Otherwise, new item doesn't make the top-N cut; ignore it
  }

  /**
   * Returns top-N notifications sorted by priority (highest first).
   */
  getTopN(): PrioritizedNotification[] {
    return [...this.heap].sort((a, b) => b.priorityScore - a.priorityScore);
  }

  get size(): number {
    return this.heap.length;
  }
}

/**
 * Given a list of notifications and n, returns top-n by priority.
 * Builds a min-heap in O(M log N) time where M = total notifications.
 */
export function getTopNNotifications(
  notifications: Notification[],
  n: number
): PrioritizedNotification[] {
  const inbox = new PriorityInbox(n);
  for (const notification of notifications) {
    inbox.insert(notification);
  }
  return inbox.getTopN();
}
