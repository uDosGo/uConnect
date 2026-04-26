# RFC-DEF-03 prep — memory sync import / export

**Status:** design prep only — **no vault or sync implementation**  
**Parent stub:** `docs/deferred-product-rfc-stubs.md` § RFC-DEF-03  
**Updated:** 2026-04-05

## Operator story (explicit, opt-in)

1. Operator runs **export memory pack** from a trusted surface (host UI, shell command, or future Core CLI).
2. Pack is a **signed, encrypted archive** (format TBD) containing only **allow-listed** memory slices; **redaction** pass runs first.
3. Import on another machine requires **explicit file pick + passphrase + audit log line**; no background sync.

## Threat model (summary)

| Risk | Mitigation (design level) |
| --- | --- |
| Exfiltration | Allow-list + operator confirmation; no default upload |
| Tampering | Signatures on export bundles |
| Re-import conflict | **Versioned** merge policy: reject, replace slice, or fork (TBD per slice type) |
| Wizard overreach | Wizard is **consumer/exporter only** when bounded; vault keys stay **Core / host** |

## Vocabulary alignment

- **Authoritative state:** local vault and family artifacts per **`uDOS-core`** / **`uDOS-host`** activation docs.
- **Host policy:** `~/.udos/` layout and publish roots stay the reference for “where packs may be written”.

## Open questions (narrowed)

1. **Envelope:** age vs gpg vs OS keychain — pick when implementing.
2. **Redaction:** PII regex pack vs manual strip — product choice.
3. **Conflict:** default **reject re-import** for assistant memory; **merge** only for explicitly mergeable slices.

## Related

- `uDOS-core` vault / survival contracts (`v2.0.8` lineage)
- `uDOS-host` `docs/activation.md`
- `docs/deferred-product-rfc-stubs.md` § RFC-DEF-03
