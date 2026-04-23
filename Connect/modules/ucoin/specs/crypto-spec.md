# uCoin — Optional crypto bridge

**Status:** Locked for **Phase 2** — **off** until implementation + intake completion.  
**Principle:** **User holds keys. uDos never custodies crypto.**

## Preconditions (all required)

1. Complete intake course **[How does crypto work?](../courses/01-how-crypto-works/README.md)** (all modules + quizzes).
2. **Risk acknowledgment** recorded (timestamp + vault or app attestation).
3. **Explicit opt-in** toggle (“Crypto mode”) in client settings.

## Network

**Primary bridge target (spec):** **Stellar** — fast, low-fee, suitable for testnet education and mainnet opt-in.  
**uDos role:** client-side signing, public RPC endpoints, **no** uDos-operated exchange or custody.

## Bridge semantics

- **Direction:** **One-way export** — **barter uCoin balance → Stellar representation** per user policy (e.g. mint/map to a **user-issued** or **third-party** asset model). Exact asset model is **implementation + legal** review.
- **No inbound bridge required** for v1 spec — users may acquire assets independently on Stellar; reconciliation is **user responsibility**.
- **Custody:** **Never** on uDos servers — keys in **OS vault** / **hardware** / user-chosen Stellar wallet.

## Non-goals

- Operating a **centralised exchange**.
- **Yield products**, **lending**, or **derivatives** (see `trading-spec` for product-stage trading desk — still non-custodial).
- **Multi-chain** bridges in v1 — defer to Phase 4+ roadmap.

## Compliance note

Copy is **education-first**. Jurisdictional treatment of tokens varies — **users responsible** for tax and law; surface **disclaimers** in the intake course (Module 4).
