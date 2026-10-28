# Verification record

28 October 2026, authored for the DigiCert Trust Lifecycle Manager rebuild.

- npm install: complete, zero reported vulnerabilities.
- npm test on Linux, Node 22, PGlite: PASS, 84 assertions, all 29 CLI commands exercised.
- The same smoke suite on a disposable local PostgreSQL 17 instance: PASS, 85 assertions. The additional assertion requires an empty test database. The instance was stopped and removed afterward.
- npm run demo, npm run docs and npm run view: PASS. Three documents and three read-only views rendered.
- The weekly view was inspected in a headless browser with no horizontal page overflow at desktop size.
- README brand lint: PASS. Prose scan found no author placeholders, em dashes or banned terms.
- Page gate: PASS, with three captured demo command outputs.
- GitHub Actions run 40782445850 could not start any jobs because of the organisation's account payment or spending limit restriction. Windows and Node 20 have not been executed in this run. The workflow defines those checks for when runners become available. This is an infrastructure failure, not a passing CI result.

The certificate and CSV fixtures are fictional. Tests use disposable databases and never inspect a customer's live certificates or keys.
