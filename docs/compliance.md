# Certificate record checks

Checked 28 October 2026. These checks inspect supplied metadata and operator evidence. They do not scan endpoints, validate certificate signatures, establish browser trust, issue certificates or certify compliance. Unknown scope is a finding, never a pass. No private keys or credentials belong here.

## Public TLS validity: TLS-VALIDITY

The CA/Browser Forum's adopted [SC081v3 schedule](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/) and [baseline text, section 6.3.2](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/BR-SC081v3-redlined.pdf) set maximum validity by issuance date: 398 days before 15 March 2026, 200 days from that date, 100 days from 15 March 2027 and 47 days from 15 March 2029. A day is 86,400 seconds. The database compares the exact elapsed seconds to the applicable maximum. This applies only to records explicitly classified public-tls. Private certificates are excluded. Historical records are not assessed against the later issuance window.

DigiCert has its own shorter issuance limit. This check uses the Forum maximum, not a promise to reproduce DigiCert policy. Other baseline requirements, domain validation, revocation status and cryptographic algorithm requirements are outside this record check. Retired or revoked certificates are excluded from the active issuance review. Endpoints still bound to them remain unhealthy.

## Local operational policy

OWNER requires a primary and backup service owner. REVIEW flags a past service review date. SCOPE flags unknown trust classification. DEPLOYMENT flags a closed renewal whose target endpoints no longer all have current passing evidence. These are local rules chosen for this build, not statutory mandates or claims about DigiCert tiers.

A verification is current only when it matches the expected fingerprint, follows the latest recorded installation, is the latest supplied result and is no older than 14 days. A later failure supersedes a pass. Future evidence is rejected. Change the local review cadence through /customise and keep the tests with the rule.

A renewal records a human approval and rollback plan. Closure requires an installation record tied to that renewal and current passing evidence for every target. No command installs or renews anything on a real system. An administrator can alter database records, so activity history is not tamper-proof and actor names are not authenticated signatures.
