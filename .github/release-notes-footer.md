---

### Verifying this release

The bundle is signed with [cosign](https://docs.sigstore.dev/) keyless signing.
There is no public key to trust — the signing identity is this repository's
release workflow, recorded publicly in the Rekor transparency log:

```bash
cosign verify-blob ai-security-research-inventory-VERSION.tar.gz \
  --signature ai-security-research-inventory-VERSION.tar.gz.sig \
  --certificate ai-security-research-inventory-VERSION.tar.gz.pem \
  --certificate-identity-regexp '^https://github\.com/okhomiak/ai-security-reserch-inventory/\.github/workflows/release\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

`SHA256SUMS` is signed the same way.

Build provenance ships as `ai-security-research-inventory-VERSION.intoto.jsonl`
— an in-toto attestation recording which workflow, commit and runner produced
this tarball. It is a release asset rather than only an API record, so it can
be checked on a machine with no access to GitHub:

```bash
gh attestation verify ai-security-research-inventory-VERSION.tar.gz \
  --bundle ai-security-research-inventory-VERSION.intoto.jsonl \
  --repo okhomiak/ai-security-reserch-inventory
```

### What is in the bundle

`data/` is the inventory itself — the same JSON the dashboard reads, documented
field by field in `INTERFACE.md`. Cite it with `CITATION.cff`.
