export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

export interface PrioritizedNotification extends Notification {
  priorityScore: number;
}
