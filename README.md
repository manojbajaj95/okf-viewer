# okf-lib (OKF Viewer)

Browse an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) Knowledge Bundle on your machine.

Published on npm as **`okf-lib`**. Domain language lives in [`CONTEXT.md`](./CONTEXT.md).

## Quick start

```bash
# from this repo
bun install
bun run okf-lib -- open /path/to/bundle

# after publish
npx okf-lib@latest open /path/to/bundle
```

`open` defaults to `.`. The CLI starts a local Next.js server that reads the Bundle from disk (`OKF_BUNDLE_PATH`).

## Develop

```bash
bun install
bun run dev          # Next.js only (set OKF_BUNDLE_PATH yourself if needed)
bun run lint
bun run typecheck
bun run test
bun run build
```

## v0.1 scope

**In:** CLI `open`, Directory Tree + Index-preferring browse, Concept View, in-app Bundle Links, best-effort browse.

**Out:** graph view, search, validator UI, editing, remote/git open, browser folder picker, auth/SaaS, SDK APIs.

## Release

Conventional Commits drive [Release Please](https://github.com/googleapis/release-please). Merging the release PR tags a GitHub Release; [`publish.yml`](./.github/workflows/publish.yml) publishes to npm via OIDC trusted publishing.
