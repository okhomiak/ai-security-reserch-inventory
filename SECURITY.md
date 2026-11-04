# Security policy

## Reporting

Open a [private security advisory](https://github.com/okhomiak/ai-security-reserch-inventory/security/advisories/new).
Please do not open a public issue for a vulnerability.

## What this repository is, and what it is not

A static dashboard plus a scheduled ingest agent. It serves no users, stores no
personal data, and has no backend. The realistic risks are narrow and specific:

| Risk | Control |
|---|---|
| Prompt injection via a fetched abstract | Candidate text is delimited and labelled untrusted in the system prompt; the model is told to ignore directives inside it and record the attempt in `notes`. Model output is then re-validated against the taxonomy, and any invented id is dropped before it reaches the data. |
| A malicious or hijacked source feed | Sources are an explicit allowlist in `agent/sources.json`. Nothing is fetched from a URL discovered at runtime. |
| Agent output corrupting the inventory | `agent/check.py` runs before the commit and fails the job on any dangling reference. |
| Credential exposure | The workflow's only secret is `ANTHROPIC_API_KEY`, read from the environment and never written to a file or log. Gitleaks gates pull requests; GitHub secret scanning covers the default branch. |
| Supply chain | Dependabot tracks Actions and pip weekly. The runner is pinned to `ubuntu-24.04` rather than `ubuntu-latest`. |
| Stored XSS in the dashboard | Every value interpolated into the DOM goes through `esc()`. Data is author-controlled JSON, but agent-written fields derive from untrusted abstracts, so they are escaped on the same footing. |

## Scope

In scope: the ingest agent, the workflows, and the published page.
Out of scope: the accuracy of a classification or a demand score. Those are
editorial judgements — open a normal issue.
