---
description: Record an installation already completed by an authorised operator. This does not install anything.
---

Read CLAUDE.md. Record an installation already completed by an authorised operator. This does not install anything.

```bash
npm run certificates -- record-install --renewal=ROTATE-01 --endpoint=PORTAL-A --installed-at=2026-10-28T12:00:00Z --evidence="Deployment log 42" --actor="Your name"
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
