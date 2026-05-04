# CRDT sync protocol (T4) — intent

- Operations: `ADD_VECTOR`, `UPDATE_VECTOR`, `DELETE_VECTOR` (embedding + metadata).
- Merge: Lamport timestamps and/or vector clocks; default LWW documented in five-tier spec.
- Transport: mDNS peers, manual QR pairing, mesh (MeshCore / Bitchat) — product-specific.

Authority: [uDosDev `UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md`](../../uDosDev/docs/specs/v4/UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md).
