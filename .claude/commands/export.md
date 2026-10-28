---
description: Write a private full JSON snapshot, or certificate CSV with --format=csv. Existing files are never overwritten.
---

Read CLAUDE.md. Write a private full JSON snapshot, or certificate CSV with --format=csv. Existing files are never overwritten.

```bash
npm run certificates -- export --file=exports/certificates.json
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
