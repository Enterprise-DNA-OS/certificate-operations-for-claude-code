---
description: Record revocation or retirement. Revocation does not contact the issuer.
---

Read CLAUDE.md. Record revocation or retirement. Revocation does not contact the issuer.

```bash
npm run certificates -- set-state --ref=FINGERPRINT --state=revoked --evidence="Issuer revocation confirmation" --actor="Your name"
```

Replace example values only with the operator's supplied facts. Use --json for analysis. If a reference is ambiguous, show the returned candidates. Report facts from the current result, including unknowns and stale evidence. Every write needs --actor and the operator's authority. Never issue, install, scan, revoke, send or publish from these records. No private keys belong here.
