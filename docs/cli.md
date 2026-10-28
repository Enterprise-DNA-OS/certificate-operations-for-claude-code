# Command reference

Every command supports --json. The CLI accepts --key=value and --key value. All writes need --actor. Read commands require no actor. Identifiers match exact codes, fingerprints, case-insensitive names or partial UUIDs. An ambiguous reference lists candidates and exits 1. Human output is an aligned table. Commands run against local PGlite unless DATABASE_URL is configured.

Certificate fingerprints use 64 hexadecimal SHA256 characters, with optional colons. UTC evidence timestamps use YYYY-MM-DDTHH:mm:ssZ or millisecond precision. Calendar due dates use YYYY-MM-DD. Do not supply invented check times or evidence.

## Add records

```bash
npm run certificates -- add --kind=service --code=SUPPORT --name="Support portal" --owner="Mere" --backup="Lin" --critical --review-on=2026-12-01 --actor="Operator"
npm run certificates -- add --kind=certificate --name=portal.example.test --serial=AA01 --issuer="Issuing authority" --fingerprint=FULL-SHA256 --not-before=2026-10-01T00:00:00Z --not-after=2027-03-01T00:00:00Z --trust-type=public-tls --actor="Operator"
npm run certificates -- add --kind=endpoint --code=SUPPORT-A --name=portal.example.test:443 --service=SUPPORT --certificate=FULL-SHA256 --observed-at=2026-10-28T12:00:00Z --actor="Operator"
```

Trust type is public-tls, private or unknown. Omitted trust type remains unknown. An endpoint is an observed binding, not discovery performed by this tool. A certificate's identity and validity are immutable through the CLI. A replacement is a new record. set-state changes only the recorded lifecycle state. It never revokes a certificate with its issuer.

## Recurring jobs

### activity

Read changes with actor and before/after values.

```bash
npm run certificates -- activity
```

### add

Add a supplied service, certificate or endpoint. Read docs/cli.md for each field set.

```bash
npm run certificates -- add --kind=service --code=PORTAL --name="Customer portal" --owner="Mere" --backup="Lin" --review-on=2026-12-01 --actor="Your name"
```

### approve-renewal

Record a human approval and its evidence reference.

```bash
npm run certificates -- approve-renewal --ref=ROTATE-01 --evidence="Change review 42" --actor="Your name"
```

### assign

Record primary and backup ownership and the next review date.

```bash
npm run certificates -- assign --ref=PORTAL --owner="Mere" --backup="Lin" --review-on=2026-12-01 --actor="Your name"
```

### attention

Find expired, unverified and soon-expiring endpoint records.

```bash
npm run certificates -- attention
```

### check-history

Read the sequence of supplied endpoint checks.

```bash
npm run certificates -- check-history
```

### close-renewal

Close only after every target has recorded installation and current matching passing evidence.

```bash
npm run certificates -- close-renewal --ref=ROTATE-01 --evidence="Both instances reviewed" --actor="Your name"
```

### compliance

Check public TLS validity and local ownership and evidence rules.

```bash
npm run certificates -- compliance
```

### deployment-gaps

Find renewals with incomplete installation or verification evidence.

```bash
npm run certificates -- deployment-gaps
```

### draft-renewal

Prepare the renewal handover as private branded HTML.

```bash
npm run certificates -- draft-renewal
```

### draft-review

Prepare the attention list for human review as private branded HTML.

```bash
npm run certificates -- draft-review
```

### endpoints

Review each recorded endpoint and the freshness of its check.

```bash
npm run certificates -- endpoints
```

### expiry-calendar

Plan certificate work over the next 90 days.

```bash
npm run certificates -- expiry-calendar
```

### export

Write a private full JSON snapshot, or certificate CSV with --format=csv. Existing files are never overwritten.

```bash
npm run certificates -- export --file=exports/certificates.json
```

### help

List the supported commands.

```bash
npm run certificates -- help
```

### import

Bring in certificate metadata from a DigiCert CSV. Preview first and reconcile counts.

```bash
npm run certificates -- import digicert --file=imports/certificates.csv --actor="Your name" --dry-run
```

### inventory

See certificates, expiry, issuer and endpoint counts.

```bash
npm run certificates -- inventory
```

### issuer-summary

Group active certificates by issuer and trust scope.

```bash
npm run certificates -- issuer-summary
```

### log

Record a supplied note about a known record.

```bash
npm run certificates -- log --kind=endpoints --ref=PORTAL-A --note="Inspection scheduled" --actor="Your name"
```

### owner-load

Compare owners by expiring endpoints and incomplete checks.

```bash
npm run certificates -- owner-load
```

### plan-renewal

Freeze the current endpoint list, replacement identity and rollback plan for a renewal.

```bash
npm run certificates -- plan-renewal --code=ROTATE-02 --certificate=OLD-FINGERPRINT --replacement=NEW-FINGERPRINT --owner="Mere" --due-on=2026-12-01 --rollback="Approved rollback steps" --actor="Your name"
```

### record-install

Record an installation already completed by an authorised operator. This does not install anything.

```bash
npm run certificates -- record-install --renewal=ROTATE-01 --endpoint=PORTAL-A --installed-at=2026-10-28T12:00:00Z --evidence="Deployment log 42" --actor="Your name"
```

### renewals-due

Review renewal deadlines and endpoint evidence counts.

```bash
npm run certificates -- renewals-due
```

### services

Review primary and backup service owners.

```bash
npm run certificates -- services
```

### set-state

Record revocation or retirement. Revocation does not contact the issuer.

```bash
npm run certificates -- set-state --ref=FINGERPRINT --state=revoked --evidence="Issuer revocation confirmation" --actor="Your name"
```

### show

Read one record before changing it.

```bash
npm run certificates -- show --kind=endpoints --ref=PORTAL-A
```

### stale-observations

Find endpoint observations older than 14 days.

```bash
npm run certificates -- stale-observations
```

### verify-endpoint

Record an independent check supplied by the operator. Never invent a result.

```bash
npm run certificates -- verify-endpoint --ref=PORTAL-A --fingerprint=OBSERVED-SHA256 --result=pass --checked-at=2026-10-28T12:10:00Z --evidence="Endpoint inspection 42" --actor="Your name"
```

### weekly-review

Combine attention, renewal work, owner workload and policy findings.

```bash
npm run certificates -- weekly-review
```

## Private output and concurrency

export writes a full JSON snapshot by default. --format=csv writes the certificate list with spreadsheet formula protection. Export is not a restore command. Back up the database using the chosen database's backup tools and test recovery separately. Exports and drafts stay outside version control. Do not run two processes against one PGlite directory. Shared PostgreSQL writes are serialized over the operational records within transactions. The trusted database operator role owns the records. RLS is enabled without public policies. This is a single-organisation desk, not a tenant-isolated service.
