---
description: Freeze the current endpoint list, replacement identity and rollback plan for a renewal.
---

Read CLAUDE.md. Freeze the current endpoint list, replacement identity and rollback plan for a renewal.

```bash
npm run certificates -- plan-renewal --code=ROTATE-02 --certificate=OLD-FINGERPRINT --replacement=NEW-FINGERPRINT --owner="Mere" --due-on=2026-12-01 --rollback="Approved rollback steps" --actor="Your name"
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
