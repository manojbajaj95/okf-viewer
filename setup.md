# Setup log

Date: 2026-07-14

## Repo shape

- Single package: npm `okf-lib` (OKF Viewer CLI + Next.js local UI)
- Stack: Next.js 16 (App Router), React 19, TypeScript, Biome, Vitest, bun
- Not a monorepo

## Applied

- `git init` + GitHub repo + `main` default branch
- MIT `LICENSE`
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CONTEXT.md` (glossary)
- Biome (via create-next-app)
- Vitest + CLI arg unit tests
- CI: `.github/workflows/ci.yml` (lint, typecheck, test, build)
- Conventional Commits documented; Release Please: `release-please.yml` + config/manifest
- npm trusted publishing workflow: `.github/workflows/publish.yml` (OIDC `id-token: write`)
- Branch protection on `main` (PR required, status checks when available)
- Minimal CLI stub: `okf-lib open [path]` sets `OKF_BUNDLE_PATH` and starts Next

## Manual follow-up (cannot fully automate)

1. **npm trusted publisher** — After the first package version exists on npmjs.com, open package settings → Trusted Publisher → GitHub Actions:
   - Owner: `manojbajaj95` (or org)
   - Repository: `okf-viewer`
   - Workflow filename: `publish.yml`
   - Allow: `npm publish`
2. **First publish chicken-and-egg** — Trusted publishing needs the package + publisher config. Options: one manual `npm publish` with a token, then switch to OIDC; or create the empty package on npm and attach the trusted publisher before the first CI publish.
3. Confirm branch protection required checks match the CI job name after the first green run.

## Skipped / deferred

- ADR for Next.js (declined)
- Pre-commit hooks (not requested)
- Agent skill packs (Superpowers / Matt Pocock / Addy Osmani) — not requested
- Autoskills install — not requested
- Browser folder picker, graph, search, validator, edit — product v0.1 non-goals
- Full browse UI — intentionally stubbed after Open wiring; implement next
