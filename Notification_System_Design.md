# Notification_System_Design

## Stage 1

### Problem Statement

Users lose track of important notifications due to high volume. A **Priority Inbox** is needed that always surfaces the top *n* most important unread notifications first.

### Priority Scoring Model

Priority is determined by two orthogonal dimensions:

| Dimension | Logic |
|---|---|
| **Type Weight** | `Placement = 3`, `Result = 2`, `Event = 1` |
| **Recency** | Unix epoch milliseconds of the notification timestamp |

Combined score formula:

```
priorityScore = typeWeight × 10¹² + epochMilliseconds
```

This ensures **type weight always dominates**: even the newest `Event` notification will lose to the oldest `Placement` notification. Within the same type, the more recent notification wins.

### Data Structure: Min-Heap (Priority Queue)

To efficiently maintain the top-N notifications as new ones arrive, a **min-heap of fixed size N** is used.

#### Why a Min-Heap?

- A min-heap of size N keeps the *weakest* of the top-N at the root.
- When a new notification arrives, compare its score with `heap[0]` (the minimum in the top-N):
  - If the new score is **greater** → pop the root, insert the new one → `O(log N)`
  - Otherwise → discard → `O(1)`

#### Complexity

| Operation | Time | Space |
|---|---|---|
| Build top-N from M notifications | `O(M log N)` | `O(N)` |
| Insert single new notification | `O(log N)` | `O(1)` extra |
| Read top-N (sorted) | `O(N log N)` | `O(N)` |

This is far more efficient than sorting all M notifications on every update (`O(M log M)`), especially as M grows large.

### API

- **Source**: `GET http://20.207.122.201/evaluation-service/notifications`
- **Auth**: Bearer token (auto-refreshed via auth middleware)
- No database storage; notifications are fetched live.

### Exposed Backend Route

```
GET /api/notifications/priority?n=10
```

Returns top-N notifications sorted by priority score descending.

### File: `notification_app_be/stage1_priority_inbox.ts`

Standalone script that:
1. Fetches all notifications from the evaluation API
2. Runs the min-heap algorithm to find top 10
3. Prints the ranked list to stdout with scores

---

## Stage 2

### Frontend Architecture

A **Next.js** (TypeScript) application using **Material UI** for styling.

#### Pages

| Route | Description |
|---|---|
| `/` | All Notifications page with type filter tabs |
| `/priority` | Priority Inbox page with configurable top-N selector |

#### Key Features

- **Filter by type**: Tabs for All / Placement / Result / Event
- **New vs Viewed**: Unread notifications are highlighted with a "NEW" chip and bold text. Viewed state persists in `localStorage` so it survives page refresh.
- **Priority Inbox**: `/priority` page lets users set `n` (top-N) dynamically and shows ranked cards with priority scores.
- **Responsive**: Material UI Grid / Container ensures desktop and mobile compatibility.
- **Logging**: Every user action and API call is logged via the shared `Log()` middleware through a Next.js API proxy route (`/api/log`).

#### Component Tree

```
_app.tsx (ThemeProvider)
├── pages/index.tsx        → All Notifications
│   ├── AppBar (nav + unread badge)
│   ├── Tabs (type filter)
│   └── NotificationCard[] (reusable card)
└── pages/priority.tsx     → Priority Inbox
    ├── AppBar (nav)
    ├── N-selector (TextField + Apply button)
    └── NotificationCard[] (with rank badge + score chip)
```

#### Viewed State Strategy

```
localStorage["campus_viewed_notifications"] = JSON array of viewed IDs
```

- On mount: load viewed IDs into a `Set<string>`
- On "mark as read" click: add ID to Set + persist to localStorage
- Complexity: `O(1)` lookup, `O(K)` space where K = number of viewed notifications
