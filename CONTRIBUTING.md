# Contributing

## Setup

```bash
bun install
OKF_BUNDLE_PATH=./fixtures/sample-bundle bun run dev
```

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

Smoke the production Viewer locally:

```bash
bun run build
bun run okf-viewer -- open ./fixtures/sample-bundle --no-open
```

For graph changes, manually check search by title, ID, and tag; type filtering; both layouts; reset; node selection; and **Open Concept** in light and dark themes.

## Pull requests

1. Branch from `main`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit subjects and the PR title (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
3. Keep PRs focused. `main` requires review and green CI.

## Releases

Release Please opens a Release PR from conventional commits on `main`. Merging it tags a GitHub Release; `.github/workflows/publish.yml` then publishes to npm via [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers) (no `NPM_TOKEN`).

One-time on npmjs.com for package `okf-viewer`: Settings → Trusted Publisher → GitHub Actions → user `manojbajaj95`, repo `okf-viewer`, workflow `publish.yml`, allow `npm publish`.

## Engineering principles

- **YAGNI** — keep the Viewer browse-first; graph, tags, and types are secondary navigation surfaces.
- Prefer trusted libraries over custom parsers, servers, or graph engines for solved problems.
- Prefer deep modules (small surface, clear responsibility) over shallow wrappers.
- Separation of concerns: the CLI opens and serves, server-side Bundle modules read files, and client components provide interaction. Never import filesystem modules into client components.
- No premature optimization; comment the *why*; update docs with behavior changes.

See `CONTEXT.md` for product language.
