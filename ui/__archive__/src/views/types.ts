/** Shared shapes for unified views (vault-backed; mock-friendly for A1). */

export interface VaultFileRow {
  id: string;
  title: string;
  status: string;
  updatedLabel: string;
  boardColumn?: "inbox" | "doing" | "done";
  timestamp?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  source: "reminders" | "vault" | "calendar";
}

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
}

export interface WorkflowLogEntry {
  ruleName: string;
  outcome: string;
  timestamp: string;
  steps: string[];
}

export type SyncPillState = "synced" | "syncing" | "warning" | "error" | "idle";

export interface ActivityFeedItem {
  type: "rule" | "sync";
  icon: string;
  timestamp: string;
  title: string;
  outcome: string;
  detail: string;
}
