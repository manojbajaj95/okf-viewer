<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent notes — okf-lib / OKF Viewer

## Product

- npm package name: `okf-lib`; product term: **Viewer** (see `CONTEXT.md`).
- Primary command: `okf-lib open [path]` → local Next.js standalone server → browser.
- Bundle path is passed as `OKF_BUNDLE_PATH` (absolute). Do not add browser folder pickers or remote Open in v0.1.

## Commands

```bash
bun install
bun run lint
bun run typecheck
bun run test
bun run build          # next build + scripts/postbuild.mjs (standalone static copy)
bun run okf-lib -- open ./fixtures/sample-bundle --no-open
OKF_BUNDLE_PATH=./fixtures/sample-bundle bun run dev
```

## Layout

- `bin/okf-lib.mjs` — CLI entry (prefers `.next/standalone/server.js`)
- `lib/cli-args.mjs` — CLI argv parser
- `lib/bundle/` — server-side Bundle reader (paths, tree, readEntry); `url.ts` is isomorphic for link rewriting
- `app/(viewer)/layout.tsx` — Directory Tree shell
- `app/(viewer)/[[...slug]]/page.tsx` — Concept / Index / Log / missing pane
- `components/` — AppSidebar, DirectoryTree, EntryView, MarkdownBody, ModeToggle; shadcn primitives in `components/ui/`
- Themes: `next-themes` via `ThemeProvider` (`attribute="class"`); ModeToggle in sidebar footer
- `fixtures/sample-bundle/` — sample OKF for tests and smoke
- `CONTEXT.md` — glossary only

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, …) — required for Release Please.
- Lint/format: Biome (`bun run lint` / `bun run format`).
- Prefer YAGNI: browse-only v0.1; no graph/search/validator/edit.
- Never import `lib/bundle/read.ts` or `paths.ts` (fs) from client components — use `lib/bundle/url.ts` instead.
