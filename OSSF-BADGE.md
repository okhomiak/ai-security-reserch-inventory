# OpenSSF Best Practices — criteria record

Project entry: https://www.bestpractices.dev/en/projects/16360

The passing-level criteria, the status this project claims for each, and why.
Kept here so the claims are reviewable in the repository rather than only
inside a form, and so a future change that invalidates one is visible in a diff.

**67 criteria** — 51 Met, 15 N/A, 1 Unmet.

Two entries deserve attention rather than a glance:

- **`test_most` is marked Unmet.** The Python agent is well covered; the
  dashboard's JavaScript is not tested at all. Claiming this one would be a
  lie that costs nothing, which is exactly why it is worth not telling. It is a
  SUGGESTED criterion, so it does not block the badge.
- **`know_secure_design` and `know_common_errors` are a maintainer's
  self-certification**, not something a tool can verify. The justifications
  point at the written threat model that backs them.

## Basics

| Criterion | Status | Why |
|---|---|---|
| `description_good` | Met | The README opens by stating the problem and the scope: a dashboard over AI-security research answering where the work is and where it is not, across 169 papers, 386 measured overlaps, 28 organisations and 8 open gaps. https://github.com/okhomiak/ai-security-reserch-inventory#readme |
| `interact` | Met | CONTRIBUTING.md covers all three in one table: obtain (clone, or read the published data over HTTPS), give feedback (issue tracker, with a separate private route for vulnerabilities), and contribute (fork, branch, pull request). https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/CONTRIBUTING.md |
| `contribution` | Met | CONTRIBUTING.md states that changes reach main through pull requests and that direct pushes are blocked by a repository ruleset for the maintainer too, then lists the five steps and the required status checks. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/CONTRIBUTING.md#the-contribution-process |
| `contribution_requirements` | Met | 'What makes a change acceptable' lists the requirements: verifiable data with real URLs, referential integrity (check.py at 0 errors), derived data regenerated not hand-edited, the authored/agent boundary on gaps, no inline styles, ruff clean, and a 110-character line limit. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/CONTRIBUTING.md#what-makes-a-change-acceptable |
| `floss_license` | Met | MIT. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/LICENSE |
| `floss_license_osi` | Met | MIT is OSI-approved. |
| `license_location` | Met | LICENSE in the repository root. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/LICENSE |
| `documentation_basics` | Met | The README documents what each view answers, the weekly agent and its inclusion bar, setup, local running, the data layout, how to edit by hand, known limits and the security posture. https://github.com/okhomiak/ai-security-reserch-inventory#readme |
| `documentation_interface` | Met | INTERFACE.md documents the whole external interface: the command line (every flag, exit codes), the environment variables, the sources.json input allowlist, and every field of each published JSON file with its type and constraints, plus the stability policy. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/INTERFACE.md |
| `sites_https` | Met | Both sites are HTTPS-only: the repository on github.com and the dashboard at https://okhomiak.github.io/ai-security-reserch-inventory/ (GitHub Pages enforces HTTPS). There are no separate download URLs. |
| `discussion` | Met | GitHub Issues: searchable, every issue and comment has its own URL, open to anyone with a GitHub account, and usable in a browser with no proprietary client. https://github.com/okhomiak/ai-security-reserch-inventory/issues |
| `english` | Met | All documentation, code comments and commit messages are in English, and bug reports in English are welcome. |
| `maintained` | Met | Actively maintained. In addition to human commits, a scheduled agent runs weekly to ingest new research, and Dependabot tracks Actions and pip dependencies. |

## Change Control

| Criterion | Status | Why |
|---|---|---|
| `repo_public` | Met | https://github.com/okhomiak/ai-security-reserch-inventory |
| `repo_track` | Met | git records author, timestamp and diff for every change; the history is public. |
| `repo_interim` | Met | Development happens as ordinary commits on main and in pull requests between tags; the repository is the working history, not a drop of final releases. |
| `repo_distributed` | Met | git. |
| `version_unique` | Met | CalVer tags, YYYY.MM.MICRO. First tagged release 2026.11.0. https://github.com/okhomiak/ai-security-reserch-inventory/tags |
| `version_semver` | Met | CalVer with a micro level (2026.11.0). CalVer rather than SemVer because this is a continuously published dataset and website, not a library anyone pins - the useful question about a version is how current the data is, which a date answers. The rationale is stated at the top of CHANGELOG.md. |
| `version_tags` | Met | Each release is a git tag. https://github.com/okhomiak/ai-security-reserch-inventory/tags |
| `release_notes` | Met | CHANGELOG.md, written by hand and grouped by what changed in the inventory, the agent and the tooling - not a git log dump. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/CHANGELOG.md |
| `release_notes_vulns` | N/A | There have been no publicly known run-time vulnerabilities in this project's own results, so there are none to identify. Dependency advisories are tracked separately by Dependabot. |

## Reporting

| Criterion | Status | Why |
|---|---|---|
| `report_process` | Met | GitHub Issues, linked from the README and CONTRIBUTING.md, with an issue template config that routes vulnerabilities to a private advisory instead. https://github.com/okhomiak/ai-security-reserch-inventory/issues/new |
| `report_tracker` | Met | GitHub Issues. https://github.com/okhomiak/ai-security-reserch-inventory/issues |
| `report_responses` | Met | No external bug reports have been submitted in the last 2-12 months - the repository is new and has had no outside reporters yet. Issues opened by the maintainer are tracked and closed by the commits that fix them. This will be re-answered honestly once there are external reports to respond to. |
| `enhancement_responses` | Met | No external enhancement requests have been submitted in the last 2-12 months. Feature work so far has come from the maintainer and is visible in the commit history and CHANGELOG. |
| `report_archive` | Met | All issues and their replies remain publicly readable and searchable, including closed ones. https://github.com/okhomiak/ai-security-reserch-inventory/issues?q=is%3Aissue |
| `vulnerability_report_process` | Met | SECURITY.md gives the reporting route and a per-risk threat model, and asks reporters not to use public issues. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/SECURITY.md |
| `vulnerability_report_private` | Met | GitHub private security advisories, which keep the report private between reporter and maintainer. Linked from SECURITY.md and from the issue template chooser. https://github.com/okhomiak/ai-security-reserch-inventory/security/advisories/new |
| `vulnerability_report_response` | N/A | No vulnerability reports have been received in the last 6 months, so there is no response time to report. |

## Quality

| Criterion | Status | Why |
|---|---|---|
| `build` | N/A | Nothing requires building. The dashboard is static HTML, CSS and vanilla JavaScript loaded directly by the browser with no bundler or transpiler, and the agent is Python run by the interpreter. There is no build artefact, which is why pyproject.toml carries tooling config and no [project] table. |
| `build_common_tools` | N/A | No build step - see the build criterion. |
| `build_floss_tools` | N/A | No build step - see the build criterion. |
| `test` | Met | A pytest suite under tests/, MIT-licensed with the rest of the repository, wrapping three suites - referential integrity (check.py), the end-to-end ingest path with the model stubbed (selftest.py), and a deterministic parser fuzzer (fuzz.py) - plus unit tests on the gate and the fetch boundary. How to run it is documented in both README.md and CONTRIBUTING.md, and it runs in CI on every push and pull request. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/tests/test_agent.py |
| `test_invocation` | Met | python -m pytest, the standard invocation for Python, configured by [tool.pytest.ini_options] in pyproject.toml. The three underlying suites also remain runnable standalone because the workflows call them directly. |
| `test_most` | Unmet | Honest answer: the suite covers the Python agent well - the untrusted-input parsers under fuzzing with assertions on the gate's contract, the full ingest and merge path end to end, and referential integrity over all published data - but the dashboard's own JavaScript (docs/app.js) has no automated tests and is a large share of the code. This is recorded as a known limit in CHANGELOG.md rather than claimed as covered. |
| `test_continuous_integration` | Met | GitHub Actions runs lint, the test suite, a deeper fuzz run, JSON validity, referential integrity, a check that derived data is not stale, and a check that every action is SHA-pinned - on every push and every pull request to main. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/.github/workflows/validate.yml |
| `test_policy` | Met | CONTRIBUTING.md states that new functionality comes with a test in the same pull request, and names three areas where it is strict: anything parsing input from outside the repository, anything deciding what reaches the model, and anything writing to the published data. It also requires that a test for a mitigation be checked to fail when the mitigation is removed. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/CONTRIBUTING.md#the-policy-on-adding-tests |
| `tests_are_added` | Met | The most recent substantive changes each shipped with their tests: the ingest agent with selftest.py (19 end-to-end checks including that invented taxonomy ids are scrubbed and authored gap claims are never overwritten); the fetch scheme check with seven refusal cases in the fuzzer and matching unit tests; and the newly added DTD/entity refusal with its own test, which was confirmed to fail when the guard is removed before being committed. |
| `tests_documented_added` | Met | The policy is in CONTRIBUTING.md, which the pull request template points contributors at. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/CONTRIBUTING.md#the-policy-on-adding-tests |
| `warnings` | Met | ruff for Python, configured with select = ['ALL'] - every rule the linter has - then a short ignore list where each entry carries a written reason. For the dashboard's JavaScript, semgrep's p/javascript ruleset runs in CI and node --check gates syntax. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/pyproject.toml |
| `warnings_fixed` | Met | ruff check agent/ tests/ reports zero findings, and the lint step fails the build on any new one. Getting there fixed real defects rather than silencing rules: a precedence ambiguity in the new DTD guard (RUF021), timezone-naive date.today() calls, an unnecessary lambda, an ambiguous variable name, and a cross-module call to a private function - which was resolved by making fetch.get public, since a function another module calls is not private. |
| `warnings_strict` | Met | select = ['ALL'] is the strictest setting ruff offers. Exclusions are per-rule with a stated reason, and per-file where the rule is wrong for that file - for example the fuzzer catches bare exceptions and seeds a non-cryptographic PRNG by design, and atheris requires the function name TestOneInput. |

## Security

| Criterion | Status | Why |
|---|---|---|
| `know_secure_design` | Met | SECURITY.md sets out the threat model for this specific system and the control answering each risk, applying least privilege (every workflow declares minimal permissions; the default is permissions: {}), input validation at the trust boundary, fail-closed defaults (hash-verified installs, SHA-pinned actions, digest-pinned images) and defence in depth. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/SECURITY.md |
| `know_common_errors` | Met | SECURITY.md names the error classes that apply to this kind of software and the mitigation for each: prompt injection through fetched text (delimited untrusted input, model output re-validated against the taxonomy, invented ids dropped), a hijacked source feed (explicit allowlist, no runtime-discovered URLs), stored XSS in the dashboard (every interpolated value escaped, plus a CSP with no unsafe-inline), SSRF and local file disclosure via urllib (scheme checked before any I/O, proven by the fuzzer), XML entity expansion (DTDs refused, download capped), credential exposure (gitleaks, secret scanning, no secret written to disk or log) and supply chain (pinning throughout). https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/SECURITY.md |
| `crypto_published` | N/A | The software produced by this project includes no cryptographic functionality and publishes or reviews no cryptographic protocol. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_call` | N/A | The software produced by this project includes no cryptographic functionality and implements none. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_floss` | N/A | The software produced by this project includes no cryptographic functionality and depends on none. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_keylength` | N/A | The software produced by this project includes no cryptographic functionality and sets no keylengths. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_working` | N/A | The software produced by this project includes no cryptographic functionality and selects no algorithms. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_weaknesses` | N/A | The software produced by this project includes no cryptographic functionality and selects no algorithms. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_pfs` | N/A | The software produced by this project includes no cryptographic functionality and runs no key agreement. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_password_storage` | N/A | The software produced by this project includes no cryptographic functionality and has no users, no accounts and no passwords. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `crypto_random` | N/A | The software produced by this project includes no cryptographic functionality and generates no keys or nonces. It is a static dashboard plus a scheduled script: no backend, no authentication, no accounts, no stored personal data. Transport security comes from HTTPS as provided by GitHub Pages and by Python's standard library TLS, neither of which this project configures or reimplements. |
| `delivery_mitm` | Met | Everything moves over TLS or SSH. The repository is cloned over HTTPS or SSH, the dashboard is served over HTTPS-enforced GitHub Pages, and the agent refuses any non-HTTP(S) URL before making a request. |
| `delivery_unsigned` | Met | No hash is ever retrieved over http and trusted. Python dependencies install with pip --require-hashes from a committed hash list, so a substituted artefact fails the build; every GitHub Action is pinned to a full commit SHA and CI fails if one is not; container images are pinned by sha256 digest; and the arXiv API endpoint was moved from http to https. |
| `vulnerabilities_fixed_60_days` | Met | No unpatched vulnerability of medium or higher severity is outstanding. The five Dependabot advisories that appeared in this repository were transitive dependencies of a CI-only static analysis tool whose closure had been vendored; they were resolved within a day by running that tool from a digest-pinned image instead, which removed the manifest and the surface together. |
| `vulnerabilities_critical_fixed` | Met | Dependabot runs weekly on Actions and pip and opens pull requests; code scanning alerts are triaged as they appear. Recent alerts were addressed the same day, including ones created by an earlier fix of my own. |
| `no_leaked_credentials` | Met | gitleaks runs on every push and pull request, GitHub secret scanning covers the default branch, and the only secret the project uses (ANTHROPIC_API_KEY) is read from the environment at call time and never written to a file or a log. |

## Analysis

| Criterion | Status | Why |
|---|---|---|
| `static_analysis` | Met | semgrep runs in CI on every push and pull request with p/default, p/javascript, p/python, p/secrets and p/github-actions, uploading SARIF to GitHub code scanning. GitHub's CodeQL default setup also runs. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/.github/workflows/sast.yml |
| `static_analysis_common_vulnerabilities` | Met | semgrep's p/default and p/python rulesets target exactly this: injection, SSRF, unsafe deserialisation, insecure transport and XML attacks in Python, with p/javascript for the dashboard, p/secrets for credentials and p/github-actions for workflow-level injection. CodeQL's security queries run alongside. |
| `static_analysis_fixed` | Met | Every finding has been resolved in code rather than waved away. semgrep found three real defects in this repository's own code and all three were fixed: shell injection through an unquoted workflow input interpolated into a run block, urllib honouring file:// URLs, and a missing Dependabot cooldown. One finding remains suppressed - the dynamic-URL warning on the module whose entire purpose is fetching URLs that vary - and the exposure behind it is closed by a scheme check that the fuzzer proves on seven schemes every run. The suppression is declared in the workflow where a reviewer sees it. |
| `static_analysis_often` | Met | On every push and every pull request to main, not merely before releases. |
| `dynamic_analysis` | Met | A deterministic fuzzer (agent/fuzz.py) runs on every push and pull request, mutating seed feeds through ten mutators into the XML parser and the gate, and asserting that every non-HTTP scheme is refused. ClusterFuzzLite with atheris runs coverage-guided fuzzing of the same parsers against the OSS-Fuzz base image. https://github.com/okhomiak/ai-security-reserch-inventory/blob/main/agent/fuzz.py |
| `dynamic_analysis_unsafe` | N/A | The project contains no code written in a memory-unsafe language. It is Python and browser JavaScript only, with no native extensions and no FFI. |
| `dynamic_analysis_enable_assertions` | Met | The fuzzer asserts invariants on every case rather than only checking that nothing raised: that the parser returns a real element with a string tag, and that the gate's verdict is a dict carrying a boolean 'eligible' and a string 'reason' with non-negative integer scores. A run that merely survived hostile input would not have caught a score going negative. Assertions are enabled - ruff's S101 is disabled for exactly this reason - and the tests were verified to fail when the mitigations they cover are removed. |
| `dynamic_analysis_fixed` | Met | The fuzzer fails the build on any unhandled exception or failed assertion, so a finding cannot be merged. It currently reports none over 4000 parser cases, 1333 gate cases and 7 scheme cases. |
