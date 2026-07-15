# okf-lib (OKF Viewer)

Browse an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) Knowledge Bundle on your machine.

Published on npm as **`okf-lib`**. Domain language lives in [`CONTEXT.md`](./CONTEXT.md).

## Quick start

```bash
# from this repo
bun install
bun run build
bun run okf-lib -- open ./fixtures/sample-bundle

# after publish
npx okf-lib@latest open /path/to/bundle
```

`open` defaults to `.`. Options: `--port <n>`, `--no-open`.

The CLI sets `OKF_BUNDLE_PATH` and starts the prebuilt Next.js **standalone** server (falls back to `next dev` / `next start` if no build exists), then opens the browser.

## Develop

```bash
bun install
OKF_BUNDLE_PATH=./fixtures/sample-bundle bun run dev
bun run lint
bun run typecheck
bun run test
bun run build
```

## v0.1 scope

**In:** CLI `open`, Directory Tree + Index-preferring browse, Concept View, in-app Bundle Links, best-effort browse, standalone npm packaging.

**Out:** graph view, search, validator UI, editing, remote/git open, browser folder picker, auth/SaaS, SDK APIs.

## Release

Conventional Commits drive [Release Please](https://github.com/googleapis/release-please). Merging the release PR tags a GitHub Release; [`publish.yml`](./.github/workflows/publish.yml) builds the standalone bundle and publishes to npm via OIDC trusted publishing.
