<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent notes — okf-viewer / OKF Viewer

## Product

- npm package name: `okf-viewer`; product term: **Viewer** (see `CONTEXT.md`).
- Primary command: `okf-viewer open [path]` → local Next.js standalone server → browser.
- Bundle path is passed as `OKF_BUNDLE_PATH` (absolute). Do not add browser folder pickers or remote Open in v0.1.

## Commands

```bash
bun install
bun run lint
bun run typecheck
bun run test
bun run build          # next build + scripts/postbuild.mjs (standalone static copy)
bun run okf-viewer -- open ./fixtures/sample-bundle --no-open
bun run okf-viewer -- validate ./fixtures/sample-bundle
OKF_BUNDLE_PATH=./fixtures/sample-bundle bun run dev
```

## Layout

- `bin/okf-viewer.mjs` — CLI entry (prefers `.next/standalone/server.js`)
- `src/lib/cli-args.mjs` — CLI argv parser
- `src/lib/bundle/` — server-side opened Bundle snapshot and filesystem policy; `url.ts` is isomorphic for link rewriting
- `src/app/(viewer)/layout.tsx` — Directory Tree shell
- `src/app/(viewer)/[[...slug]]/page.tsx` — Concept / Index / Log / missing pane
- `src/components/` — AppSidebar, DirectoryTree, EntryView, MarkdownBody, ModeToggle; shadcn primitives in `src/components/ui/`
- Themes: `next-themes` via `ThemeProvider` (`attribute="class"`); ModeToggle in sidebar footer
- `fixtures/sample-bundle/` — sample OKF for tests and smoke
- `CONTEXT.md` — glossary only

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, …) — required for Release Please.
- Lint/format: Biome (`bun run lint` / `bun run format`).
- Prefer YAGNI: browse-first; graph is a secondary nav surface; `validate` is CLI-only (open stays best-effort). No search or edit.
- `src/lib/bundle/links.ts`, `graph.ts` — link extraction and graph index (server); `validate-bundle.mjs` — CLI validate
- `src/app/(viewer)/graph|tags|types/` — browse surfaces
- Never import `src/lib/bundle/opened-bundle.ts`, `filesystem.mjs`, or `paths.ts` from client modules — use `src/lib/bundle/url.ts` instead.
