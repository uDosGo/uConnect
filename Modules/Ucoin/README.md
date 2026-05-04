# uCoin module

**Version:** **1.0.0.0** (spec-first; implementation phases below)  
**Repository:** `uDosConnect/modules/ucoin/` (in-tree; optional future Git submodule when a dedicated remote is published)

## Principle

**uCoin** is a **community contribution tracker** — barter and social accounting **by default**. **Cryptocurrency features are optional**, gated behind education and explicit risk acceptance. **uDos does not custody funds** and does not operate an exchange.

## Specs

| Document | Scope |
| --- | --- |
| [`specs/barter-spec.md`](specs/barter-spec.md) | **v1.0.0.0** — local ledger, P2P sync, Sonic earn, uRing send/receive, **no crypto** |
| [`specs/crypto-spec.md`](specs/crypto-spec.md) | Optional **Stellar** bridge, intake course, keys in user control |
| [`specs/trading-spec.md`](specs/trading-spec.md) | **uTrading-Desk** — unlock rules, orders, automations, analyst, alerts |
| [`specs/api-spec.md`](specs/api-spec.md) | Integration surfaces for uDos apps (uMacDown, uChatDown, feeds, CLI) |

## Courses

| Path | Role |
| --- | --- |
| [`../../courses/ucoin-crypto-intake/`](../../courses/ucoin-crypto-intake/README.md) | **Intake** — “How Does Crypto Work?” — required before enabling **crypto mode** |
| [`specs/barter-spec.md`](specs/barter-spec.md) | Barter units and trust (default path; spec-first) |

## Source layout (planned)

| Path | Role |
| --- | --- |
| `src/barter/` | Local ledger, P2P sync |
| `src/crypto/` | Stellar bridge (optional) |
| `src/trading/` | uTrading-Desk |
| `src/analyst/` | AI-assisted analysis (policy-bound) |
| `tests/` | Module tests |

## Family alignment

- **Economy vocabulary:** [SPATIAL_STORAGE_ECOSYSTEM_v1](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/SPATIAL_STORAGE_ECOSYSTEM_v1.md) (uCell / uCoin naming in the family). This module defines **product behaviour** and **boundaries** for the **uDosConnect** implementation track.
- **Tool ethics:** [UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1.md).

## Implementation phases (summary)

1. **Phase 1 — Barter only (v1.0.0.x):** SQLite ledger, P2P sync, Sonic earn, uRing — **no** crypto, **no** trading UI.
2. **Phase 2 — Crypto bridge (v1.1.x):** Intake course + opt-in + Stellar one-way bridge.
3. **Phase 3 — uTrading-Desk (v1.2.x):** Orders, automations, analyst, watchers (after first lock/exchange per `trading-spec`).
4. **Phase 4 — Advanced (v2.x):** Deferred; see `trading-spec` / `crypto-spec` non-goals.

## Status

**Spec complete, implementation backlog** — track work in **`uDosDev/TASKS.md`** and product repos when coding starts.
