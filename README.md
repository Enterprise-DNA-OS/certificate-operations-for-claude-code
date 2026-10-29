# Certificate Operations for Claude Code

Know which certificate expires next, who owns the service and whether every instance has been checked after renewal. Your certificate inventory and renewal evidence live in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install and run the demo. | Your service ownership, review rules, imports and documents. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=digicert-trust-lifecycle-manager) · [Instead of DigiCert Trust Lifecycle Manager](https://enterprisedna.co/omni/instead-of/digicert-trust-lifecycle-manager?utm_source=github&utm_medium=readme&utm_campaign=digicert-trust-lifecycle-manager)

## Start with a working certificate review

Node 20 or later.

```bash
git clone https://github.com/Enterprise-DNA-OS/certificate-operations-for-claude-code.git
cd certificate-operations-for-claude-code
npm install
npm run demo
npm run certificates -- weekly-review
npm run docs
npm run view
```

Open the folder in Claude Code, Codex, OpenCode or Cursor. AGENTS.md and CLAUDE.md point to the same command library. Local PGlite needs no separate server. DATABASE_URL selects PostgreSQL with a configured trusted operator role. DATA_DIR selects another local data directory. Never seed a shared working database.

The fictional Kauri demo has two services, four certificate records, three endpoints and one overdue renewal. It includes an expired internal certificate, a stale endpoint check and a public certificate with excessive validity. Dates are relative to the day you seed. Seeding twice preserves existing records.

## What this replaces

This is the ownership, planning and evidence desk around certificate operations. It imports DigiCert certificate metadata and produces review lists, renewal handovers and service registers. Keep your certificate authority, discovery and deployment automation. No command issues certificates, handles keys, scans a network or installs a certificate. Enterprise DNA scopes those connections into your custom version where required.

DigiCert already provides inventory, reporting and natural-language analysis. We do not claim those features are absent. Here you can change your own data model, evidence rules and paperwork. [Scope and sources](docs/research.md).

## Weekly rituals and proof

29 CLI commands and 33 slash-command recipes. Monday: /weekly-review. Before change approval: /renewals-due, /deployment-gaps and /compliance. During an operator-led change: /record-install records the work already done, then /verify-endpoint records the supplied check. /close-renewal requires a matching current pass for every listed endpoint. /draft-renewal and /draft-review write private HTML and never send.

A later failed check supersedes an earlier pass. Replacing a recorded endpoint binding makes older evidence stale. Closed renewals reappear when their supporting checks become stale or fail. Public TLS validity uses issuance-date thresholds and exact elapsed seconds. Missing trust scope is flagged for review. Ownership and 14-day check freshness are local policy, not claimed legal mandates. [Rules and sources](docs/compliance.md).

Every write records its actor and supporting history. Actor names are supplied text, not authenticated signatures. Administrators can change the database. This is not a tamper-proof audit ledger or a multi-tenant service.

## Ten questions the working build answers

These are demonstrated capabilities, not claims that DigiCert cannot answer them.

1. Which customer-facing endpoints expire soon and lack a recent check? Run attention.
2. Which approved renewal still has an unchecked instance? Run deployment-gaps.
3. Which service has no backup owner? Run services.
4. Which certificate observations are more than two weeks old? Run stale-observations.
5. Who owns the most endpoints that need checking? Run owner-load.
6. Which public certificates exceed the limit for their issue date? Run compliance.
7. Which completed renewal has lost its supporting evidence status? Run compliance.
8. Which later failed check superseded an earlier pass? Run check-history.
9. Which issuers account for our expired active records? Run issuer-summary.
10. Who changed a service owner and what was there before? Run activity.

## Bring your certificate history

Export a DigiCert custom certificate report, then run:

```bash
npm run certificates -- import digicert --file=imports/certificates.csv --actor="Your name" --dry-run
npm run certificates -- import digicert --file=imports/certificates.csv --actor="Your name"
```

Rows sharing a fingerprint become one certificate with the original rows retained. Repeating an identical import changes nothing. Conflicting metadata fails as one transaction. Review trust scope and ownership after import. No certificate export alone proves deployment or approval. [Export steps, mapping and reconciliation](docs/replace-digicert-trust-lifecycle-manager.md).

## Documents and read-only views

Change brand.json once. npm run docs writes renewal handovers and service certificate registers. npm run view writes the weekly review, ownership report and compliance findings. They are snapshots, not live monitors. Generated files stay outside version control. Print HTML to PDF after review. [Why no front end](docs/why-no-front-end.md).

## Your first hour: ten things to ask for

1. Put our business name on the renewal handover.
2. Preview our certificate export without saving it.
3. Map our expiry column.
4. Add a primary and backup owner for each service.
5. Show certificates expiring within the next month.
6. Flag endpoint observations older than our review cadence.
7. Add a customer reference to each service.
8. Show renewals missing a verified instance.
9. Produce a change handover with rollback instructions.
10. Prepare Monday's review by owner.

/customise adds a field or rule with a tested migration. /new-view adds a read-only report. [All commands and arguments](docs/cli.md).

## Verification

npm test creates temporary data, migrates and seeds twice, exercises all 29 CLI commands, tests atomic CSV imports, ambiguous names, approval and installation rules, latest failure handling, exact public TLS validity boundaries and escaped HTML. The CI workflow defines Node 20 and 22 on Windows and Linux plus PostgreSQL 17. Only actual run results establish which environments passed.

## Built and run for you

Enterprise DNA maps your exports, reconciles the records and builds the agreed ownership rules, reports and connections. A web front end or another stack can be included in your scope. Omni by Enterprise DNA installs and runs it for one setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=digicert-trust-lifecycle-manager).

MIT. Not affiliated with DigiCert or Anthropic. Hosting, agent usage and certificate authority services have their own costs.
