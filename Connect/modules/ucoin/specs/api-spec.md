# uCoin — API & integration spec (v1)

**Status:** Draft-stable — refine when `src/` lands.

## Surfaces

| Consumer | Capability (intent) |
| --- | --- |
| **uMacDown** | Balance, history, uRing send, trading desk (opt-in), alerts |
| **uChatDown** | Slash or command surface: `/ucoin balance`, `/ucoin send`, help |
| **uDosGo / Host** | Optional REST or CLI `udos ucoin *` — mirror family CLI patterns |
| **uFeedThru** | Transaction events as **feed items** / spool rows per family feed spec |
| **SonicScrewdriver** | **Earn** hooks → barter credits |

## Data shapes (illustrative)

- **Ledger entry:** `{ id, ts, counterparty_id, amount_ucoin, memo, kind: send|receive|earn, chain: barter|stellar? }`
- **Contact trust:** `{ contact_id, verified_at, verification_method }`

## Authentication

- **Barter:** local vault identity + device pairing.
- **Crypto:** user wallet keys **never** sent to uDos servers.

## Versioning

API version follows **`modules/ucoin/VERSION`** with additive semver for wire formats.
