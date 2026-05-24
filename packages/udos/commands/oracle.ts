/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/oracle — Oracle Command Handlers
   
   CLI commands for the Oracle Trinity:
   - `udo oracle ask <query>` — Ask the oracles a question
   - `udo oracle list` — List available oracles
   - `udo oracle status` — Show oracle status
   
   These are thin wrappers around the oracle engine that integrate
   with the existing agent/skill/task/automation systems.
   ═══════════════════════════════════════════════════════════════════ */

import { conductQuery, listOracles, getOracle, queryOracle } from '../oracle.ts'
import type { OracleQuery, OracleDomain } from '../oracle.ts'

// ─── Oracle Ask ──────────────────────────────────────────────────

export interface OracleAskOptions {
  prompt: string
  domain?: string
  verbose?: boolean
}

export async function handleOracleAsk(opts: OracleAskOptions): Promise<void> {
  const { prompt, domain, verbose } = opts

  if (!prompt) {
    console.error('Usage: udo oracle ask <query> [--domain knowledge|creation|insight]')
    return
  }

  const query: OracleQuery = {
    prompt,
    domain: domain as OracleDomain | undefined,
  }

  console.log(`\n  🔮 Consulting the oracles...\n`)

  const result = await conductQuery(query)

  console.log(result.merged_answer)
  console.log(`\n  ────────────────────────────────────────────`)
  console.log(`  Primary: ${result.primary.domain} (${result.primary.duration_ms}ms, confidence: ${result.primary.confidence})`)

  if (result.supporting && result.supporting.length > 0) {
    for (const s of result.supporting) {
      console.log(`  Supporting: ${s.domain} (${s.duration_ms}ms, confidence: ${s.confidence})`)
    }
  }

  if (verbose) {
    console.log(`\n  Total: ${result.duration_ms}ms`)
    if (result.primary.sources) {
      console.log(`  Sources: ${result.primary.sources.join(', ')}`)
    }
  }
}

// ─── Oracle List ─────────────────────────────────────────────────

export function handleOracleList(): void {
  const oracles = listOracles()

  if (oracles.length === 0) {
    console.log('  No oracles registered. Run init to register built-in oracles.')
    return
  }

  console.log('\n  🔮 Oracle Trinity\n')
  for (const oracle of oracles) {
    console.log(`  ${oracle.name}`)
    console.log(`    Domain:      ${oracle.domain}`)
    console.log(`    Provider:    ${oracle.provider.type} (${oracle.provider.model})`)
    console.log(`    Temperature: ${oracle.temperature}`)
    console.log(`    Max Tokens:  ${oracle.maxTokens}`)
    console.log(`    Capabilities:`)
    for (const cap of oracle.capabilities) {
      console.log(`      - ${cap}`)
    }
    console.log('')
  }
}

// ─── Oracle Status ───────────────────────────────────────────────

export function handleOracleStatus(): void {
  const oracles = listOracles()

  console.log('\n  🔮 Oracle Trinity Status\n')

  for (const oracle of oracles) {
    const status = oracle.provider.type === 'local' ? '⚠ fallback' : '✓ ready'
    console.log(`  ${oracle.name.padEnd(25)} ${status}`)
  }

  console.log('')
  console.log('  To enable full LLM-powered oracles:')
  console.log('    Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or DEEPSEEK_API_KEY')
  console.log('    Then register a provider: udo oracle provider add <type>')
  console.log('')
}
