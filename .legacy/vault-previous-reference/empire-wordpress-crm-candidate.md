# Empire WordPress CRM Candidate

Status: candidate
Owner: `uDOS-empire` with `uDOS-host`

## Outcome

Refine `uDOS-empire` as a WordPress plugin on the local Ubuntu host.

## Scope

- WordPress-native contact and CRM operations
- privacy-aware record intake and enrichment
- local email sending and audience operations
- activity logging linked to binder and workspace references
- local admin UX for imports, review, and campaign actions

## Non-Scope

- direct HubSpot sync ownership
- HubSpot as canonical CRM
- CSV consolidation as a product in itself

## Promotion Path

- promote runtime and boundary docs into `uDOS-empire/docs`
- place implementation notes in `uDOS-empire/@dev`
- keep Ubuntu host integration in `uDOS-host/docs`

## Rule

Do not keep the original brief pack in public git. Distill only the usable
boundary, data, and UX decisions into the owning repos.
