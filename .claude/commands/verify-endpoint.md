---
description: Record an independent check supplied by the operator. Never invent a result.
---

Read CLAUDE.md. Record an independent check supplied by the operator. Never invent a result.

```bash
npm run certificates -- verify-endpoint --ref=PORTAL-A --fingerprint=OBSERVED-SHA256 --result=pass --checked-at=2026-10-28T12:10:00Z --evidence="Endpoint inspection 42" --actor="Your name"
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
