# uCoin — Barter core (v1.0.0.0)

**Status:** Locked for **Phase 1** implementation.  
**Mode:** **Default for all users** — no wallet, no keys, no on-chain assets.

## Definition

**uCoin (barter mode)** is a **numeric contribution tracker** between **trusted contacts**: help given, help received, and agreed **IOU-style** transfers. It is **not** legal tender, **not** a security, and **not** an investment product.

## Units (illustrative — community-tunable)

| Event | Example credit |
| --- | ---: |
| One **device scan** (Sonic) | **10** uCoin |
| One hour **mesh / relay** help | **50** uCoin |
| One **lesson** delivered | **100** uCoin |
| One **blueprint** published | **25** uCoin |
| One **quality bug report** | **50** uCoin |

Implementations may expose **config** per vault or per community policy; numbers above are **pedagogical defaults**.

## Ledger

- **Storage:** **SQLite** (or equivalent embedded store) **local-first**.
- **Sync:** **P2P** to **trusted contacts** — spec intent references **mesh-capable** transports (e.g. MeshCore-class); exact wire format is implementation-defined.
- **No blockchain** in barter mode — **no public immutable record** from uDos.
- **Deletion:** User may **clear local history** subject to product rules; **peers may retain** their own copy of agreed transfers (like cash — no platform chargeback).

## Earn

- **SonicScrewdriver** (and family tools) emit **verifiable events** that map to barter credits per policy (e.g. completed scan).
- **Anti-abuse:** rate limits, device attestation where available — **implementation detail**.

## Send / receive

- **uRing** (or compatible NFC): **tap-to-confirm** transfer between parties who have **paired** in person or via QR-handshake.
- **QR:** optional payload encoding transfer intent; must not leak private keys (barter mode has **no keys**).

## Trust model

- Transfers default to **known contacts** only.
- **First link** between two parties should prefer **in-person** or **out-of-band verified** pairing (spec intent).
- **Disputes** are **between users** — uDos does not adjudicate.

## Explicit non-goals (barter phase)

- Fiat on/off ramp.
- Exchange listing.
- Custodial wallet.
- Smart contracts on uDos infrastructure.

## Version

Aligned with **`modules/ucoin/VERSION`** — **1.0.0.0** barter-only.
