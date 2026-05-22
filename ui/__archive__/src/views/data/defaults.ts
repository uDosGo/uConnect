import type {
  ActivityFeedItem,
  ContactItem,
  TaskItem,
  VaultFileRow,
  WorkflowLogEntry,
} from "../types";

export const MOCK_VAULT_ROWS: VaultFileRow[] = [
  {
    id: "daily-ops",
    title: "Daily Ops Summary",
    status: "Updated 2 hours ago",
    updatedLabel: "Updated 2 hours ago",
    boardColumn: "inbox",
    timestamp: "2026-04-15T10:30:00Z",
  },
  {
    id: "health-checklist",
    title: "Source Health Checklist",
    status: "Updated yesterday",
    updatedLabel: "Updated yesterday",
    boardColumn: "doing",
    timestamp: "2026-04-14T08:15:00Z",
  },
  {
    id: "rule-audit",
    title: "Rule Audit - Morning",
    status: "Updated 3 days ago",
    updatedLabel: "Updated 3 days ago",
    boardColumn: "done",
    timestamp: "2026-04-12T09:00:00Z",
  },
  {
    id: "conflicts",
    title: "Conflict Resolution Notes",
    status: "Updated last week",
    updatedLabel: "Updated last week",
    boardColumn: "done",
    timestamp: "2026-04-08T14:20:00Z",
  },
];

export const MOCK_TASKS: TaskItem[] = [
  {
    id: "1",
    title: "Review sync health dashboard",
    completed: false,
    priority: "high",
    dueDate: "2026-04-16",
    source: "reminders",
  },
  {
    id: "2",
    title: "Write rule for auto-tagging",
    completed: false,
    priority: "medium",
    dueDate: "2026-04-17",
    source: "vault",
  },
  {
    id: "3",
    title: "Test Calendar → spool pipeline",
    completed: true,
    priority: "low",
    dueDate: "2026-04-14",
    source: "reminders",
  },
];

export const MOCK_CONTACTS: ContactItem[] = [
  {
    id: "1",
    name: "Alice Chen",
    email: "alice@example.com",
    phone: "+1 555-0101",
    company: "Design Studio",
    avatar: "AC",
  },
  {
    id: "2",
    name: "Bob Miller",
    email: "bob@example.com",
    phone: "+1 555-0102",
    company: "Tech Corp",
    avatar: "BM",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    phone: "+1 555-0103",
    company: "Freelance",
    avatar: "CD",
  },
];

export const MOCK_WORKFLOW_LOGS: WorkflowLogEntry[] = [
  {
    ruleName: "High priority inbox",
    outcome: "matched",
    timestamp: "2026-04-15T10:30:00Z",
    steps: [
      "WHEN task.created",
      "IF 1: priority = high → satisfied (mock)",
      'THEN 1: add_tag("urgent") → vault stub file updated',
    ],
  },
  {
    ruleName: "Auto-tag urgent",
    outcome: "matched",
    timestamp: "2026-04-15T09:15:00Z",
    steps: [
      "WHEN task.created",
      "IF 1: priority = high → satisfied",
      'THEN 1: add_tag("urgent") → tag added',
    ],
  },
  {
    ruleName: "Sample rule",
    outcome: "skippedDisabled",
    timestamp: "2026-04-15T08:00:00Z",
    steps: ["WHEN task.created", "→ disabled; THEN not run"],
  },
];

export const MOCK_ACTIVITY: ActivityFeedItem[] = [
  {
    type: "rule",
    icon: "rule",
    timestamp: "2 minutes ago",
    title: "Rule · High priority inbox",
    outcome: "matched",
    detail: "WHEN task.created → IF satisfied → THEN add_tag",
  },
  {
    type: "sync",
    icon: "sync",
    timestamp: "5 minutes ago",
    title: "Sync · Reminders",
    outcome: "Success",
    detail: "12 reminders synced",
  },
  {
    type: "sync",
    icon: "sync",
    timestamp: "15 minutes ago",
    title: "Sync · Calendar",
    outcome: "Partial",
    detail: "3 events skipped (permission)",
  },
  {
    type: "rule",
    icon: "rule",
    timestamp: "1 hour ago",
    title: "Rule · Auto-tag urgent",
    outcome: "matched",
    detail: "THEN add_tag → vault updated",
  },
];
