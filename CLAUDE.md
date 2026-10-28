# Certificate Operations for Claude Code

For an infrastructure operator or service owner reviewing certificate ownership, expiry and renewal evidence. Ask for the business name, operator and critical services when customising the demo. Read current records before answering. Run npm run certificates -- help.

## Boundaries

This is a certificate operations record system. It never discovers assets, issues certificates, handles private keys, changes live endpoint bindings, sends notifications or proves that a real endpoint is healthy. record-install and verify-endpoint record human-supplied evidence. Never invent that evidence or turn a local status into a live-service claim. Keep existing certificate authorities and automation running until an agreed migration is tested.

Every mutation requires --actor. Ambiguous identifiers list candidates and exit 1. No delete commands. Record revoked certificates with set-state and source evidence. A retired record stays in history. Approval requires a supplied human decision. Drafts remain in drafts/ and never send. Read docs/compliance.md before describing a rule as a legal or industry requirement.

## One workflow library

| Ask | Recipe |
|---|---|
| activity | /activity |
| add | /add |
| approve-renewal | /approve-renewal |
| assign | /assign |
| attention | /attention |
| check-history | /check-history |
| close-renewal | /close-renewal |
| compliance | /compliance |
| deployment-gaps | /deployment-gaps |
| draft-renewal | /draft-renewal |
| draft-review | /draft-review |
| endpoints | /endpoints |
| expiry-calendar | /expiry-calendar |
| export | /export |
| help | /help |
| import | /import |
| inventory | /inventory |
| issuer-summary | /issuer-summary |
| log | /log |
| owner-load | /owner-load |
| plan-renewal | /plan-renewal |
| record-install | /record-install |
| renewals-due | /renewals-due |
| services | /services |
| set-state | /set-state |
| show | /show |
| stale-observations | /stale-observations |
| verify-endpoint | /verify-endpoint |
| weekly-review | /weekly-review |
| Branded paperwork | /docs |
| Read-only snapshots | /view |
| Change a field or rule | /customise |
| Add a report | /new-view |

Monday: /weekly-review. Before an approved change: /renewals-due and /deployment-gaps. After an operator performs the installation: /record-install, then /verify-endpoint for each target. /close-renewal refuses missing or stale evidence. /check-history keeps a later failure visible. /compliance flags closed renewals that lose current verification.

## Files and tests

scripts/certificates.mjs is the only domain CLI. scripts/lib/db.mjs selects local PGlite or DATABASE_URL PostgreSQL. supabase/migrations holds numbered migrations. documents.json and views.json define read-only renderers. brand.json controls business name and colour. All runtimes share .claude/commands.

Run npm test before shipping. It creates a temporary local database. TEST_DATABASE_URL, if set, must name a completely empty disposable PostgreSQL database. Never seed the working database. /customise writes and tests the next migration before applying it with authority. Never edit an applied migration. A database administrator can alter the history; this is not a signed or tamper-proof audit system.

Omni by Enterprise DNA customises and runs the agreed system for one setup fee, then a retainer.
