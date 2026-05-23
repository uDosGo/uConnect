/* ═══════════════════════════════════════════════════════════════════
   opsui Store — Server Operations Surface State
   Uses the unified useSurfaceStore from @usx/react for shared state,
   with opsui-specific extensions for service monitoring, snack machine,
   and container orchestration.
   ═══════════════════════════════════════════════════════════════════ */

import { create } from 'zustand'

// ─── Local Types (standalone, no @usx/react dependency) ─────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type FontStyle = 'mono' | 'sans' | 'serif'
export type Palette = 'ops' | 'terminal' | 'wireframe' | 'paper'

export interface Snackbar {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: string
}

export interface ServiceStatus {
  name: string
  status: 'up' | 'degraded' | 'down'
  port: number
  uptime: number
  type: 'system' | 'user'
  description: string
}

export interface LogEntry {
  timestamp: string
  service: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export interface Workflow {
  name: string
  status: 'running' | 'idle' | 'failed' | 'completed'
  lastRun: string
  schedule: string
}

// ─── SnackMachine Types ──────────────────────────────────────────
export type SpiceType = 'snack' | 'skill' | 'spice' | 'trigger' | 'block' | 'container'

export interface SpiceManifest {
  uuid: string
  name: string
  description: string
  version: string
  author: string
  spice_type: SpiceType
  triggers: string[]
  scripts: Record<string, string>
  system: boolean
  platforms: string[]
  dependencies: string[]
}

export interface SpiceInstallation {
  manifest: SpiceManifest
  enabled: boolean
  installed_at: string
}

export interface ContainerInfo {
  id: string
  name: string
  image: string
  status: 'running' | 'stopped' | 'error'
  port: number | null
  started_at: string | null
}

export interface SnackExecution {
  id: string
  snack_id: string
  status: 'running' | 'completed' | 'failed'
  started_at: string
  completed_at: string | null
  output: string
  error: string | null
  duration_ms: number
}

export interface OpsUIState {
  // Surface state
  sidebarCollapsed: boolean
  chatOpen: boolean
  snackbarMenuOpen: boolean
  isDark: boolean
  chatMessages: ChatMessage[]
  snackbar: Snackbar | null
  fontSize: number
  fontStyle: FontStyle
  currentPalette: Palette

  // Ops-specific state
  services: ServiceStatus[]
  logs: LogEntry[]
  workflows: Workflow[]
  selectedService: string | null
  logFilter: string

  // SnackMachine state
  spices: SpiceInstallation[]
  containers: ContainerInfo[]
  executions: SnackExecution[]
  selectedSpice: string | null
  spiceFilter: string
  spiceTypeFilter: SpiceType | 'all'
  containerFilter: string

  // Actions
  toggleSidebar: () => void
  toggleChat: () => void
  toggleSnackbarMenu: () => void
  toggleTheme: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  cycleFontStyle: () => void
  setPalette: (palette: Palette) => void
  cyclePalette: () => void
  addChatMessage: (role: 'user' | 'assistant', content: string) => void
  showSnackbar: (message: string, type?: 'info' | 'success' | 'error', action?: string) => void
  dismissSnackbar: () => void

  // Ops-specific actions
  setSelectedService: (name: string | null) => void
  setLogFilter: (filter: string) => void
  refreshServices: () => void
  refreshLogs: () => void
  refreshWorkflows: () => void
  restartService: (name: string) => void

  // SnackMachine actions
  setSelectedSpice: (uuid: string | null) => void
  setSpiceFilter: (filter: string) => void
  setSpiceTypeFilter: (type: SpiceType | 'all') => void
  setContainerFilter: (filter: string) => void
  refreshSpices: () => void
  refreshContainers: () => void
  refreshExecutions: () => void
  toggleSpice: (uuid: string) => void
  installSpice: (uuid: string) => void
  removeSpice: (uuid: string) => void
  runSnack: (snackId: string) => void
  spawnContainer: (name: string, image: string) => void
  stopContainer: (containerId: string) => void
  viewContainerLogs: (containerId: string) => void
}

// ─── Default Data ────────────────────────────────────────────────

const defaultServices: ServiceStatus[] = [
  { name: 'snackbar', status: 'up', port: 8484, uptime: 99.9, type: 'system', description: 'Container orchestrator & workflow runner (uServer module)' },
  { name: 'secret-server', status: 'up', port: 30001, uptime: 99.8, type: 'user', description: 'AES-256-GCM encrypted secret vault' },
  { name: 'email-feed', status: 'down', port: 0, uptime: 0, type: 'user', description: 'Email to feed processor (needs IMAP credentials)' },
  { name: 'vault-mcp', status: 'degraded', port: 0, uptime: 95.2, type: 'user', description: 'MCP server for Vault access' },
  { name: 'hivemind', status: 'up', port: 8485, uptime: 99.7, type: 'system', description: 'AI orchestration & agent routing' },
  { name: 'feed-spool', status: 'up', port: 8486, uptime: 99.5, type: 'system', description: 'Feed spooler & transport' },
]

const defaultLogs: LogEntry[] = [
  { timestamp: '2026-05-23 16:15:22', service: 'snackbar', level: 'info', message: 'Workflow "daily-docs-sync" completed successfully' },
  { timestamp: '2026-05-23 16:14:00', service: 'hivemind', level: 'info', message: 'Agent "code-reviewer" dispatched to PR #42' },
  { timestamp: '2026-05-23 16:12:45', service: 'secret-server', level: 'info', message: 'Secret retrieved: vault/imap_config' },
  { timestamp: '2026-05-23 16:10:30', service: 'email-feed', level: 'error', message: 'IMAP connection failed: invalid credentials' },
  { timestamp: '2026-05-23 16:08:00', service: 'snackbar', level: 'warn', message: 'Container "feed-watcher" restarting (OOM)' },
  { timestamp: '2026-05-23 16:05:00', service: 'vault-mcp', level: 'info', message: 'MCP client connected: uCode2 Gateway' },
  { timestamp: '2026-05-23 16:00:00', service: 'feed-spool', level: 'info', message: 'Spool rotation completed: 42 entries archived' },
  { timestamp: '2026-05-23 15:55:00', service: 'hivemind', level: 'info', message: 'Health check: all agents responsive' },
  { timestamp: '2026-05-23 15:50:00', service: 'snackbar', level: 'info', message: 'Snack "auto-label@devstudio" executed' },
  { timestamp: '2026-05-23 15:45:00', service: 'secret-server', level: 'warn', message: 'Token rotation recommended (30 days since last)' },
]

const defaultWorkflows: Workflow[] = [
  { name: 'daily-docs-sync', status: 'completed', lastRun: '2026-05-23 04:00', schedule: '0 4 * * *' },
  { name: 'health-check', status: 'running', lastRun: '2026-05-23 16:00', schedule: '0 * * * *' },
  { name: 'auto-label-issues', status: 'idle', lastRun: '2026-05-23 15:30', schedule: '*/30 * * * *' },
  { name: 'backup-vault', status: 'completed', lastRun: '2026-05-23 02:00', schedule: '0 2 * * *' },
  { name: 'feed-poll', status: 'failed', lastRun: '2026-05-23 16:10', schedule: '*/15 * * * *' },
]

const defaultSpices: SpiceInstallation[] = [
  {
    manifest: { uuid: 'auto-label@devstudio', name: 'Auto-label GitHub Issues', description: 'Adds AI-powered labels to new GitHub issues using DeepSeek', version: '1.2.0', author: 'DevStudio', spice_type: 'snack', triggers: ['github:issue.created'], scripts: { main: 'main.ts' }, system: false, platforms: ['linux', 'macos', 'windows'], dependencies: [] },
    enabled: true, installed_at: '2026-05-01T10:00:00Z',
  },
  {
    manifest: { uuid: 'code-review@devstudio', name: 'Code Review Skill', description: 'Adds AI-powered code review capabilities to any snack', version: '1.0.0', author: 'DevStudio', spice_type: 'skill', triggers: [], scripts: { main: 'reviewer.ts' }, system: false, platforms: ['linux', 'macos', 'windows'], dependencies: [] },
    enabled: true, installed_at: '2026-05-01T10:05:00Z',
  },
  {
    manifest: { uuid: 'daily-reminder@community', name: 'Daily Reminder', description: 'Sends a summary of tasks every morning', version: '0.9.0', author: 'Community', spice_type: 'snack', triggers: ['schedule:daily'], scripts: { main: 'main.ts' }, system: false, platforms: ['linux', 'macos'], dependencies: [] },
    enabled: false, installed_at: '2026-05-02T08:00:00Z',
  },
  {
    manifest: { uuid: 'pr-reviewer@devstudio', name: 'PR Reviewer', description: 'Automatically reviews pull requests on creation', version: '1.1.0', author: 'DevStudio', spice_type: 'skill', triggers: ['github:pr.created'], scripts: { main: 'review.ts' }, system: false, platforms: ['linux', 'macos'], dependencies: ['code-review@devstudio'] },
    enabled: true, installed_at: '2026-05-03T14:00:00Z',
  },
  {
    manifest: { uuid: 'webhook-github@devstudio', name: 'GitHub Webhook Handler', description: 'Processes incoming GitHub webhook events', version: '1.0.0', author: 'DevStudio', spice_type: 'trigger', triggers: ['webhook:github'], scripts: { main: 'handler.ts' }, system: false, platforms: ['linux', 'macos', 'windows'], dependencies: [] },
    enabled: true, installed_at: '2026-05-04T09:00:00Z',
  },
  {
    manifest: { uuid: 'vault-backup@udos', name: 'Vault Backup Spice', description: 'System spice for automated vault backups', version: '1.0.0', author: 'uDos', spice_type: 'spice', triggers: ['schedule:daily'], scripts: { main: 'backup.sh' }, system: true, platforms: ['linux', 'macos'], dependencies: [] },
    enabled: true, installed_at: '2026-04-01T00:00:00Z',
  },
  {
    manifest: { uuid: 'cache-cleaner@udos', name: 'Cache Cleaner Spice', description: 'System spice for cleaning temporary caches', version: '1.0.0', author: 'uDos', spice_type: 'spice', triggers: ['metric:disk_usage'], scripts: { main: 'clean.sh' }, system: true, platforms: ['linux', 'macos'], dependencies: [] },
    enabled: true, installed_at: '2026-04-01T00:00:00Z',
  },
]

const defaultContainers: ContainerInfo[] = [
  { id: 'abc123def', name: 'github-mcp', image: 'ghcr.io/github/github-mcp-server:latest', status: 'running', port: 8080, started_at: '2026-05-23T08:00:00Z' },
  { id: 'def456ghi', name: 'deepseek-mcp', image: 'ghcr.io/universui/mcp-deepseek:latest', status: 'running', port: 8081, started_at: '2026-05-23T08:05:00Z' },
  { id: 'ghi789jkl', name: 'feed-watcher', image: 'ghcr.io/universui/feed-watcher:latest', status: 'stopped', port: null, started_at: null },
]

const defaultExecutions: SnackExecution[] = [
  { id: 'exec-001', snack_id: 'auto-label@devstudio', status: 'completed', started_at: '2026-05-23T16:10:00Z', completed_at: '2026-05-23T16:10:05Z', output: 'Labeled issue #42 as "ai/bug"', error: null, duration_ms: 5234 },
  { id: 'exec-002', snack_id: 'daily-reminder@community', status: 'failed', started_at: '2026-05-23T08:00:00Z', completed_at: '2026-05-23T08:00:02Z', output: '', error: 'Snack is disabled', duration_ms: 2123 },
  { id: 'exec-003', snack_id: 'pr-reviewer@devstudio', status: 'running', started_at: '2026-05-23T16:30:00Z', completed_at: null, output: 'Reviewing PR #43...', error: null, duration_ms: 0 },
]

export const useOpsUIStore = create<OpsUIState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  chatOpen: false,
  snackbarMenuOpen: false,
  isDark: true,
  chatMessages: [],
  snackbar: null,
  fontSize: 13,
  fontStyle: 'mono',
  currentPalette: 'ops',

  // Ops-specific initial state
  services: defaultServices,
  logs: defaultLogs,
  workflows: defaultWorkflows,
  selectedService: null,
  logFilter: '',

  // SnackMachine initial state
  spices: defaultSpices,
  containers: defaultContainers,
  executions: defaultExecutions,
  selectedSpice: null,
  spiceFilter: '',
  spiceTypeFilter: 'all',
  containerFilter: '',

  // Actions
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleChat: () => set(s => ({ chatOpen: !s.chatOpen })),
  toggleSnackbarMenu: () => set(s => ({ snackbarMenuOpen: !s.snackbarMenuOpen })),
  toggleTheme: () => set(s => ({ isDark: !s.isDark })),

  increaseFontSize: () => {
    const { fontSize } = get()
    if (fontSize < 24) set({ fontSize: fontSize + 1 })
  },

  decreaseFontSize: () => {
    const { fontSize } = get()
    if (fontSize > 10) set({ fontSize: fontSize - 1 })
  },

  cycleFontStyle: () => {
    const order: FontStyle[] = ['mono', 'sans', 'serif']
    const idx = order.indexOf(get().fontStyle)
    set({ fontStyle: order[(idx + 1) % order.length] })
  },

  setPalette: (palette: Palette) => set({ currentPalette: palette }),

  cyclePalette: () => {
    const order: Palette[] = ['ops', 'terminal', 'wireframe', 'paper']
    const idx = order.indexOf(get().currentPalette)
    set({ currentPalette: order[(idx + 1) % order.length] })
  },

  addChatMessage: (role, content) => {
    set(s => ({ chatMessages: [...s.chatMessages, { role, content }] }))
  },

  showSnackbar: (message, type = 'info', action) => {
    set({ snackbar: { message, type, action } })
    setTimeout(() => {
      set({ snackbar: null })
    }, 4000)
  },

  dismissSnackbar: () => set({ snackbar: null }),

  // Ops-specific actions
  setSelectedService: (name) => set({ selectedService: name }),
  setLogFilter: (filter) => set({ logFilter: filter }),

  refreshServices: () => {
    // In production, this would call uServer REST API at :8484/v1/status
    set(s => ({
      services: s.services.map(svc => ({
        ...svc,
        status: svc.name === 'email-feed' ? 'down' as const : svc.status,
      })),
    }))
    get().showSnackbar('Services refreshed', 'success')
  },

  refreshLogs: () => {
    const newEntry: LogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      service: 'opsui',
      level: 'info',
      message: 'Logs refreshed by operator',
    }
    set(s => ({ logs: [newEntry, ...s.logs].slice(0, 100) }))
    get().showSnackbar('Logs refreshed', 'success')
  },

  refreshWorkflows: () => {
    set(s => ({
      workflows: s.workflows.map(wf => ({
        ...wf,
        status: wf.name === 'health-check' ? 'running' as const : wf.status,
      })),
    }))
    get().showSnackbar('Workflows refreshed', 'success')
  },

  restartService: (name) => {
    set(s => ({
      services: s.services.map(svc =>
        svc.name === name ? { ...svc, status: 'up' as const, uptime: 100 } : svc
      ),
    }))
    get().showSnackbar(`Service "${name}" restarted`, 'success')
  },

  // ─── SnackMachine Actions ──────────────────────────────────────

  setSelectedSpice: (uuid) => set({ selectedSpice: uuid }),
  setSpiceFilter: (filter) => set({ spiceFilter: filter }),
  setSpiceTypeFilter: (type) => set({ spiceTypeFilter: type }),
  setContainerFilter: (filter) => set({ containerFilter: filter }),

  refreshSpices: () => {
    // In production, this would call uServer REST API at :8484/v1/spices
    get().showSnackbar('Spice catalog refreshed', 'success')
  },

  refreshContainers: () => {
    // In production, this would call uServer REST API at :8484/v1/containers
    get().showSnackbar('Containers refreshed', 'success')
  },

  refreshExecutions: () => {
    // In production, this would call uServer REST API at :8484/v1/executions
    get().showSnackbar('Execution history refreshed', 'success')
  },

  toggleSpice: (uuid) => {
    set(s => ({
      spices: s.spices.map(sp =>
        sp.manifest.uuid === uuid ? { ...sp, enabled: !sp.enabled } : sp
      ),
    }))
    const spice = get().spices.find(sp => sp.manifest.uuid === uuid)
    get().showSnackbar(
      `${spice?.manifest.name || uuid} ${spice?.enabled ? 'enabled' : 'disabled'}`,
      'success'
    )
  },

  installSpice: (uuid) => {
    // In production, this would POST to uServer :8484/v1/spices/install
    get().showSnackbar(`Installing spice "${uuid}"...`, 'info')
    setTimeout(() => {
      get().showSnackbar(`Spice "${uuid}" installed`, 'success')
    }, 2000)
  },

  removeSpice: (uuid) => {
    set(s => ({
      spices: s.spices.filter(sp => sp.manifest.uuid !== uuid),
    }))
    get().showSnackbar(`Spice "${uuid}" removed`, 'success')
  },

  runSnack: (snackId) => {
    const newExec: SnackExecution = {
      id: `exec-${Date.now()}`,
      snack_id: snackId,
      status: 'running',
      started_at: new Date().toISOString(),
      completed_at: null,
      output: '',
      error: null,
      duration_ms: 0,
    }
    set(s => ({ executions: [newExec, ...s.executions].slice(0, 50) }))
    get().showSnackbar(`Running snack "${snackId}"...`, 'info')

    // Simulate completion
    setTimeout(() => {
      set(s => ({
        executions: s.executions.map(ex =>
          ex.id === newExec.id
            ? { ...ex, status: 'completed', completed_at: new Date().toISOString(), output: `Snack "${snackId}" executed successfully`, duration_ms: Math.floor(Math.random() * 5000) + 500 }
            : ex
        ),
      }))
      get().showSnackbar(`Snack "${snackId}" completed`, 'success')
    }, 2000)
  },

  spawnContainer: (name, image) => {
    const newContainer: ContainerInfo = {
      id: `ctr-${Date.now().toString(36)}`,
      name,
      image,
      status: 'running',
      port: Math.floor(Math.random() * 60000) + 1024,
      started_at: new Date().toISOString(),
    }
    set(s => ({ containers: [...s.containers, newContainer] }))
    get().showSnackbar(`Container "${name}" spawned`, 'success')
  },

  stopContainer: (containerId) => {
    set(s => ({
      containers: s.containers.map(ctr =>
        ctr.id === containerId ? { ...ctr, status: 'stopped' as const, started_at: null } : ctr
      ),
    }))
    get().showSnackbar(`Container "${containerId}" stopped`, 'success')
  },

  viewContainerLogs: (containerId) => {
    get().showSnackbar(`Fetching logs for container "${containerId}"...`, 'info')
  },
}))
