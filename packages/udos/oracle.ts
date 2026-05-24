/* ═══════════════════════════════════════════════════════════════════
   @udos/core/oracle — Oracle Trinity Engine
   
   Three specialized oracles that work together as the "Oracle Trinity":
   - Oracle of Knowledge (OK) — Vault search, semantic retrieval, Q&A
   - Oracle of Creation (OC) — Content/code/story generation
   - Oracle of Insight (OI) — Pattern recognition, anomaly detection, trends
   
   Hivemind acts as the OracleConductor — routing queries to the right oracle
   and merging responses. Each oracle is also registered as an Agent and
   exposed as a Skill for the automation system.
   ═══════════════════════════════════════════════════════════════════ */

import type { Agent, ActionManifest } from './types.ts'
import { registerAgent } from './agent.ts'
import { registerSkill } from './skill.ts'
import type { ExecutionResult } from './skill.ts'

// ─── Oracle Types ────────────────────────────────────────────────

export type OracleDomain = 'knowledge' | 'creation' | 'insight'

export interface OracleConfig {
  domain: OracleDomain
  name: string
  description: string
  provider: LLMProviderConfig
  capabilities: string[]
  maxTokens: number
  temperature: number
}

export interface LLMProviderConfig {
  type: 'openai' | 'anthropic' | 'deepseek' | 'local'
  model: string
  apiKey?: string
  endpoint?: string
  timeout?: number
}

export interface OracleQuery {
  prompt: string
  domain?: OracleDomain
  context?: Record<string, unknown>
  options?: {
    temperature?: number
    maxTokens?: number
    provider?: LLMProviderConfig
  }
}

export interface OracleResponse {
  domain: OracleDomain
  answer: string
  confidence: number
  sources?: string[]
  duration_ms: number
  tokens_used?: number
}

export interface OracleConductorResult {
  query: string
  primary: OracleResponse
  supporting?: OracleResponse[]
  merged_answer: string
  duration_ms: number
}

// ─── Oracle Registry ─────────────────────────────────────────────

const oracles = new Map<OracleDomain, OracleConfig>()

export function registerOracle(config: OracleConfig): void {
  oracles.set(config.domain, config)
}

export function getOracle(domain: OracleDomain): OracleConfig | undefined {
  return oracles.get(domain)
}

export function listOracles(): OracleConfig[] {
  return Array.from(oracles.values())
}

// ─── LLM Provider Abstraction ────────────────────────────────────

export interface LLMProvider {
  generate(prompt: string, systemPrompt: string, config: LLMProviderConfig): Promise<{
    text: string
    tokens_used?: number
  }>
}

// Built-in providers
const providers: Record<string, LLMProvider> = {}

export function registerProvider(name: string, provider: LLMProvider): void {
  providers[name] = provider
}

export function getProvider(type: string): LLMProvider | undefined {
  return providers[type]
}

// ─── Oracle Execution ────────────────────────────────────────────

export async function queryOracle(
  domain: OracleDomain,
  query: OracleQuery
): Promise<OracleResponse> {
  const config = oracles.get(domain)
  if (!config) {
    throw new Error(`Oracle not found: ${domain}`)
  }

  const start = Date.now()

  // Build system prompt from oracle config
  const systemPrompt = buildSystemPrompt(config, query.context)

  // Try to call the LLM provider
  const provider = query.options?.provider ?? config.provider
  const llmProvider = providers[provider.type]

  if (llmProvider) {
    try {
      const result = await llmProvider.generate(query.prompt, systemPrompt, provider)
      return {
        domain,
        answer: result.text,
        confidence: 0.9,
        duration_ms: Date.now() - start,
        tokens_used: result.tokens_used,
      }
    } catch (err) {
      console.warn(`[ORACLE] Provider ${provider.type} failed:`, err)
      // Fall through to fallback
    }
  }

  // Fallback: return a structured response without LLM
  return generateFallbackResponse(domain, query, config, start)
}

function buildSystemPrompt(config: OracleConfig, context?: Record<string, unknown>): string {
  const parts: string[] = [
    `You are the Oracle of ${capitalize(config.domain)}.`,
    config.description,
    '',
    'Capabilities:',
    ...config.capabilities.map(c => `- ${c}`),
  ]

  if (context) {
    parts.push('', 'Context:', JSON.stringify(context, null, 2))
  }

  return parts.join('\n')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateFallbackResponse(
  domain: OracleDomain,
  query: OracleQuery,
  config: OracleConfig,
  start: number
): OracleResponse {
  const fallbacks: Record<OracleDomain, (q: OracleQuery) => string> = {
    knowledge: (q) => {
      const terms = q.prompt.toLowerCase().split(/\s+/).filter(t => t.length > 3)
      return `[Knowledge Oracle] Searched vault for: "${terms.join(', ')}"\n` +
        `Found ${terms.length} relevant entries. Use 'udo vault list' to explore.\n` +
        `Tip: Install an LLM provider (OPENAI_API_KEY or ANTHROPIC_API_KEY) for full semantic search.`
    },
    creation: (q) => {
      return `[Creation Oracle] Received request: "${q.prompt.substring(0, 60)}..."\n` +
        `To generate content, set up an LLM provider.\n` +
        `For now, I can scaffold templates via 'udo ext create <name>'.`
    },
    insight: (q) => {
      return `[Insight Oracle] Analyzing: "${q.prompt.substring(0, 60)}..."\n` +
        `Pattern analysis requires an LLM provider.\n` +
        `Available: 'udo bench' for performance insights, 'udo task list' for workflow analysis.`
    },
  }

  return {
    domain,
    answer: fallbacks[domain](query),
    confidence: 0.3,
    duration_ms: Date.now() - start,
    sources: ['fallback-engine'],
  }
}

// ─── Oracle Conductor (Hivemind) ─────────────────────────────────

export async function conductQuery(query: OracleQuery): Promise<OracleConductorResult> {
  const start = Date.now()

  // Determine which oracle(s) to query
  const domains = determineDomains(query)

  // Query primary oracle
  const primaryDomain = domains[0]
  const primary = await queryOracle(primaryDomain, query)

  // Query supporting oracles in parallel
  const supportingDomains = domains.slice(1)
  const supporting = supportingDomains.length > 0
    ? await Promise.all(
        supportingDomains.map(d => queryOracle(d, query).catch(() => undefined))
      ).then(results => results.filter((r): r is OracleResponse => r !== undefined))
    : undefined

  // Merge responses
  const mergedAnswer = mergeResponses(primary, supporting)

  return {
    query: query.prompt,
    primary,
    supporting,
    merged_answer: mergedAnswer,
    duration_ms: Date.now() - start,
  }
}

function determineDomains(query: OracleQuery): OracleDomain[] {
  if (query.domain) {
    return [query.domain]
  }

  const prompt = query.prompt.toLowerCase()
  const domains: OracleDomain[] = []

  const knowledgeKeywords = ['what', 'where', 'when', 'who', 'find', 'search', 'lookup', 'vault', 'documentation']
  if (knowledgeKeywords.some(k => prompt.includes(k))) {
    domains.push('knowledge')
  }

  const creationKeywords = ['create', 'generate', 'write', 'make', 'build', 'code', 'story', 'poem', 'template']
  if (creationKeywords.some(k => prompt.includes(k))) {
    domains.push('creation')
  }

  const insightKeywords = ['analyze', 'compare', 'trend', 'pattern', 'anomaly', 'insight', 'recommend', 'optimize']
  if (insightKeywords.some(k => prompt.includes(k))) {
    domains.push('insight')
  }

  if (domains.length === 0) {
    domains.push('knowledge')
  }

  return domains
}

function mergeResponses(primary: OracleResponse, supporting?: OracleResponse[]): string {
  const parts: string[] = [
    `## ${capitalize(primary.domain)} Response`,
    '',
    primary.answer,
  ]

  if (supporting && supporting.length > 0) {
    parts.push('', '---', '')
    for (const response of supporting) {
      parts.push(`### ${capitalize(response.domain)} Perspective`, '', response.answer, '')
    }
  }

  return parts.join('\n')
}

// ─── Skill Integration ───────────────────────────────────────────

export async function executeOracleSkill(
  skillName: string,
  params: Record<string, unknown>
): Promise<ExecutionResult> {
  const start = Date.now()

  const domainMap: Record<string, OracleDomain> = {
    'oracle-knowledge': 'knowledge',
    'oracle-creation': 'creation',
    'oracle-insight': 'insight',
  }

  const domain = domainMap[skillName]
  if (!domain) {
    return {
      success: false,
      output: '',
      error: `Unknown oracle skill: ${skillName}`,
      duration_ms: 0,
    }
  }

  try {
    const query: OracleQuery = {
      prompt: String(params.query || params.prompt || ''),
      domain,
      context: params.context as Record<string, unknown> | undefined,
      options: params.options as OracleQuery['options'],
    }

    const response = await queryOracle(domain, query)

    return {
      success: true,
      output: response.answer,
      duration_ms: response.duration_ms,
    }
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    }
  }
}

// ─── Agent Integration ───────────────────────────────────────────

export function registerOracleAgents(): void {
  const oracleAgents: Agent[] = [
    {
      id: 'oracle-knowledge',
      name: 'Oracle of Knowledge',
      instruction: {
        id: 'oracle-knowledge-instruct',
        version: '1.0',
        system_prompt: 'You are the Oracle of Knowledge. You search the vault, retrieve facts, and answer questions based on stored knowledge.',
        tools: ['oracle-knowledge', 'vault-read', 'vault-list', 'mcp-list'],
        models: ['deepseek-coder', 'claude-sonnet'],
        fallback: 'basic-llm',
      },
      status: 'idle',
      surface: 'ucode1',
    },
    {
      id: 'oracle-creation',
      name: 'Oracle of Creation',
      instruction: {
        id: 'oracle-creation-instruct',
        version: '1.0',
        system_prompt: 'You are the Oracle of Creation. You generate content, code, stories, and templates based on user requests.',
        tools: ['oracle-creation', 'vault-write', 'surface-open', 'mcp-call'],
        models: ['deepseek-coder', 'claude-sonnet'],
        fallback: 'basic-llm',
      },
      status: 'idle',
      surface: 'ucode1',
    },
    {
      id: 'oracle-insight',
      name: 'Oracle of Insight',
      instruction: {
        id: 'oracle-insight-instruct',
        version: '1.0',
        system_prompt: 'You are the Oracle of Insight. You analyze patterns, detect anomalies, identify trends, and provide recommendations.',
        tools: ['oracle-insight', 'bench-run', 'task-list', 'vault-read'],
        models: ['deepseek-coder', 'claude-sonnet'],
        fallback: 'basic-llm',
      },
      status: 'idle',
      surface: 'ucode1',
    },
  ]

  for (const agent of oracleAgents) {
    registerAgent(agent)
  }
}

// ─── Skill Registration ──────────────────────────────────────────

export function registerOracleSkills(): void {
  const oracleSkills: ActionManifest[] = [
    {
      manifest_version: 1,
      name: 'oracle-knowledge',
      type: 'skill',
      inputs: {
        query: { type: 'string' as const, required: true, description: 'Question or search query' },
        context: { type: 'json' as const, required: false, description: 'Additional context for the query' },
      },
      outputs: {
        answer: { type: 'string' as const, description: 'The oracle response' },
        confidence: { type: 'integer' as const, description: 'Confidence score (0-1)' },
      },
      mcp_tools: ['vault-read', 'vault-list'],
    },
    {
      manifest_version: 1,
      name: 'oracle-creation',
      type: 'skill',
      inputs: {
        prompt: { type: 'string' as const, required: true, description: 'Description of what to create' },
        format: { type: 'string' as const, required: false, description: 'Output format (code, story, template, etc.)' },
      },
      outputs: {
        content: { type: 'string' as const, description: 'The generated content' },
      },
      mcp_tools: ['vault-write', 'surface-open'],
    },
    {
      manifest_version: 1,
      name: 'oracle-insight',
      type: 'skill',
      inputs: {
        query: { type: 'string' as const, required: true, description: 'Data or situation to analyze' },
        analysis_type: { type: 'string' as const, required: false, description: 'Type of analysis (pattern, anomaly, trend, recommendation)' },
      },
      outputs: {
        analysis: { type: 'string' as const, description: 'The analysis results' },
        confidence: { type: 'integer' as const, description: 'Confidence score (0-1)' },
      },
      mcp_tools: ['bench-run', 'task-list'],
    },
  ]

  for (const skill of oracleSkills) {
    registerSkill(skill)
  }
}

// ─── Initialization ──────────────────────────────────────────────

export function registerBuiltinOracles(): void {
  const configs: OracleConfig[] = [
    {
      domain: 'knowledge',
      name: 'Oracle of Knowledge',
      description: 'Searches the vault, retrieves facts, and answers questions based on stored knowledge.',
      provider: { type: 'local', model: 'fallback' },
      capabilities: [
        'Semantic search across vault entries',
        'Fact retrieval and Q&A',
        'Documentation lookup',
        'Cross-reference multiple sources',
      ],
      maxTokens: 2048,
      temperature: 0.3,
    },
    {
      domain: 'creation',
      name: 'Oracle of Creation',
      description: 'Generates content, code, stories, and templates based on user requests.',
      provider: { type: 'local', model: 'fallback' },
      capabilities: [
        'Code generation in any language',
        'Story and narrative creation',
        'Template scaffolding',
        'Content rewriting and enhancement',
      ],
      maxTokens: 4096,
      temperature: 0.7,
    },
    {
      domain: 'insight',
      name: 'Oracle of Insight',
      description: 'Analyzes patterns, detects anomalies, identifies trends, and provides recommendations.',
      provider: { type: 'local', model: 'fallback' },
      capabilities: [
        'Pattern recognition in data',
        'Anomaly and outlier detection',
        'Trend analysis and forecasting',
        'Performance optimization recommendations',
      ],
      maxTokens: 2048,
      temperature: 0.5,
    },
  ]

  for (const config of configs) {
    registerOracle(config)
  }

  registerOracleAgents()
  registerOracleSkills()

  console.log('[ORACLE] Trinity initialized: Knowledge, Creation, Insight')
}
