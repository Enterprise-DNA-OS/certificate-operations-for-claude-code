# Bring across DigiCert Trust Lifecycle Manager records

The free importer moves certificate metadata. Keep your certificate authority, discovery, issuance, renewal and deployment automation running during the transition. This build does not reproduce those services, import private keys or replace a trust provider.

## Export

In Trust Lifecycle Manager, open Inventory and choose the certificates to export. Use its reporting controls to create a custom certificate report and download the CSV. Include the common name, serial number, SHA256 thumbprint, issuer, valid-from and valid-to values. Review your selected scope and row count before saving it under imports/.

DigiCert's [2026 release notes](https://docs.digicert.com/en/whats-new/release-notes/trust-lifecycle-manager-release-notes.html), entry for 2 April 2026, document required Common name, Serial number, Seat ID and Thumbprint (SHA256) columns. Its [inventory documentation](https://docs.digicert.com/en/trust-lifecycle-manager/get-started/overview/what-do-you-want-to-learn-about-.html) describes reporting and inventory. Report columns vary by configuration. The fixture is synthetic, with documented identity labels plus explicitly selected date columns. It is not a customer export.

## One command, then reconcile

```bash
npm run certificates -- import digicert --file=imports/certificates.csv --actor="Your name" --dry-run
npm run certificates -- import digicert --file=imports/certificates.csv --actor="Your name"
```

The first command validates and reports counts without saving anything. The second imports. Each unique fingerprint becomes one certificate. Repeated rows for different seats retain the original rows together. Identical later imports are unchanged. Conflicting metadata for the same fingerprint rejects the entire file. An import never overwrites operational owners, endpoint bindings or approval evidence.

Common name, Serial number and Thumbprint (SHA256) map directly. Issuer maps to issuer. Valid from / Not before / Issued date and Valid to / Not after / Expiration date map to UTC timestamps. Date-only YYYY-MM-DD values explicitly become UTC midnight. For exact validity checks, export full UTC timestamps. Ambiguous local dates and local times are rejected.

Use --map=your-map.json when labels differ. The example fixtures/field-map.json maps destination field names to exact CSV headers. Every original column is retained. Unknown trust scope is the default and appears in the compliance findings. Use --trust-type=public-tls or --trust-type=private only for an export whose scope you have checked. Split mixed scopes before import.

Compare input rows, unique fingerprints, imported counts and retained source rows. Export a full JSON snapshot before moving more data. Add service ownership and explicit endpoint bindings after reconciliation. The certificate CSV alone does not prove which certificate is installed, whether a service is healthy or whether an approval took place.

## What needs separate migration

Discovery jobs, accounts, certificate profiles, secrets, private keys, access control, scheduled notifications, enrollment policies, connectors and historical audit logs do not move through this CSV. We scope their integration separately. No file import sends anything or connects to a customer system. Do not cancel an incumbent contract until the workflows you depend on have been tested in your agreed replacement.
