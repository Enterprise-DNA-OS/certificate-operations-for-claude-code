---
description: Record primary and backup ownership and the next review date.
---

Read CLAUDE.md. Record primary and backup ownership and the next review date.

```bash
npm run certificates -- assign --ref=PORTAL --owner="Mere" --backup="Lin" --review-on=2026-12-01 --actor="Your name"
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
