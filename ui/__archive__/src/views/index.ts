/**
 * Unified views — single implementation for uDos Connect, Inkdown, and web shell.
 * Import Vue SFCs from subpaths, e.g. `import VaultTableRouteView from '@udos/views/vault/VaultTableRouteView.vue'`
 * (configure alias `@udos/views` → `.../ui/src/views` in the host bundler).
 */

export * from "./types";
export * from "./styles/skin-presets";
export * from "./themes/udos-themes";
export * from "./themes/usxd-publish";

export { default as VaultTableRouteView } from "./vault/VaultTableRouteView.vue";
export { default as VaultListRouteView } from "./vault/VaultListRouteView.vue";
export { default as VaultBoardRouteView } from "./vault/VaultBoardRouteView.vue";
export { default as VaultTimelineRouteView } from "./vault/VaultTimelineRouteView.vue";
export { default as VaultPickerSheet } from "./vault/VaultPickerSheet.vue";

export { default as TasksListView } from "./tasks/TasksListView.vue";
export { default as TaskDetailView } from "./tasks/TaskDetailView.vue";
export { default as TaskCreateSheet } from "./tasks/TaskCreateSheet.vue";
export { default as TaskKanbanView } from "./tasks/TaskKanbanView.vue";
export { default as TaskCard } from "./tasks/components/TaskCard.vue";
export { default as TaskFilterBar } from "./tasks/components/TaskFilterBar.vue";

export { default as ContactsListView } from "./contacts/ContactsListView.vue";
export { default as ContactCardView } from "./contacts/ContactCardView.vue";
export { default as ContactEditView } from "./contacts/ContactEditView.vue";
export { default as ContactPickerSheet } from "./contacts/ContactPickerSheet.vue";

export { default as WorkflowEditorView } from "./workflows/WorkflowEditorView.vue";
export { default as WorkflowStepView } from "./workflows/WorkflowStepView.vue";
export { default as WorkflowLogView } from "./workflows/WorkflowLogView.vue";

export { default as DashboardControlTower } from "./dashboard/DashboardControlTower.vue";
export { default as ActivityUnifiedFeedCard } from "./dashboard/ActivityUnifiedFeedCard.vue";
export { default as SyncStatusPill } from "./dashboard/SyncStatusPill.vue";

export { default as ChatView } from "./chat/ChatView.vue";
export { default as ProseSurfaceView } from "./surfaces/ProseSurfaceView.vue";
export { default as ProseSurfaceRouteView } from "./surfaces/ProseSurfaceRouteView.vue";
export { default as TowerBrowserView } from "./surfaces/TowerBrowserView.vue";

export { default as SettingsView } from "./settings/SettingsView.vue";
export { default as VaultPathPicker } from "./settings/VaultPathPicker.vue";
