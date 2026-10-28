---
description: Bring in certificate metadata from a DigiCert CSV. Preview first and reconcile counts.
---

Read CLAUDE.md. Bring in certificate metadata from a DigiCert CSV. Preview first and reconcile counts.

```bash
npm run certificates -- import digicert --file=imports/certificates.csv --actor="Your name" --dry-run
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
