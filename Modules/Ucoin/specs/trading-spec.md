# uTrading-Desk (spec)

**Status:** Locked for **Phase 3** — **locked behind** first successful **exchange / lock** event (implementation defines “first lock” precisely).  
**Custody:** **Non-custodial** — connects to user wallets / Stellar accounts; uDos does not hold funds.

## Unlock rule (normative intent)

**uTrading-Desk** UI and automation **do not activate** until the user has completed at least one **qualifying** on-network action (e.g. first **limit order filled**, first **DEX swap** signed by user wallet, or first **bridge lock** — choose one **milestone** in implementation and document it).

## Features (staged)

### Orders

- **Market** and **limit** orders (against supported venues / Stellar SDEX patterns).
- **Order book** view where the venue exposes it (read-only from client where possible).

### Automations

- **DCA** (dollar-cost average schedule).
- **Stop-loss** / **take-profit** (conditional triggers).
- **Grid** trading (bounded ranges).

### Intelligence

- **AI financial analyst** — **advisory** copy only; **not** investment advice; **disclaimers** required; rate limits and **no auto-trade without user confirm** for high-risk actions.

### Watchers

- **Price / event alerts** (push or feed items).
- **Market watchers** — user-defined symbols / assets.

## Non-goals (v1 desk)

- **Margin** / **leverage** defaults off; if ever added, separate risk tier + disclosures.
- **HFT** co-location or uDos-run matching engine.

## Relationship to barter

**Barter uCoin** remains the **default community tracker**. Trading desk is for **opt-in crypto** assets only and must **not** imply barter points are securities.
