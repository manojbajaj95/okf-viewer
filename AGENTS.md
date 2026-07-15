<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent notes — okf-lib / OKF Viewer

## Product

- npm package name: `okf-lib`; product term: **Viewer** (see `CONTEXT.md`).
- Primary command: `okf-lib open [path]` → local Next.js server → browser.
- Bundle path is passed as `OKF_BUNDLE_PATH` (absolute). Do not add browser folder pickers or remote Open in v0.1.

## Commands

```bash
bun install
bun run lint
bun run typecheck
bun run test
bun run build
bun run okf-lib -- open .
```

## Layout

- `bin/okf-lib.mjs` — CLI entry
- `lib/` — shared CLI helpers (and tests)
- `app/` — Next.js App Router UI + route handlers that read the Bundle
- `CONTEXT.md` — glossary only (no implementation details)

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, …) — required for Release Please.
- Lint/format: Biome (`bun run lint` / `bun run format`).
- Prefer YAGNI: browse-only v0.1; no graph/search/validator/edit.
