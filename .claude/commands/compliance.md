---
description: Check public TLS validity and local ownership and evidence rules.
---

Read CLAUDE.md. Check public TLS validity and local ownership and evidence rules.

```bash
npm run certificates -- compliance
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
