```
   ____  _  _______   __     ___
  / __ \| |/ /  ___|  \ \   / (_) _____      _____ _ __
 | |  | | ' /| |_      \ \ / /| |/ _ \ \ /\ / / _ \ '__|
 | |__| | . \|  _|      \ V / | |  __/\ V  V /  __/ |
  \____/|_|\_\_|         \_/  |_|\___| \_/\_/ \___|_|

  open → tree → concept
```

# OKF Viewer

[![npm](https://img.shields.io/npm/v/okf-viewer.svg)](https://www.npmjs.com/package/okf-viewer)
[![npm downloads](https://img.shields.io/npm/dm/okf-viewer.svg)](https://www.npmjs.com/package/okf-viewer)
[![license](https://img.shields.io/npm/l/okf-viewer.svg)](./LICENSE)

**Point the CLI at a folder. Browse your Knowledge Bundle in the browser.**

OKF Viewer is a read-only local viewer for [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) bundles. Run `okf-viewer open` to open a Directory Tree, follow Indexes into Concepts, and navigate Bundle Links — offline, on your machine.

## Quick start

```bash
npx okf-viewer@latest open /path/to/bundle
npx okf-viewer@latest validate /path/to/bundle
```

## CLI

```bash
okf-viewer open [path]       # browse bundle in browser (default: .)
okf-viewer validate <dir>    # OKF v0.1 §9 conformance check
okf-viewer open --bind 0.0.0.0 --port 3847   # listen on all interfaces
```

## Features

- **CLI Open.** Point at a local directory; no folder picker, no upload, no remote fetch.
- **Directory Tree.** Sidebar of folders and Concept files for orientation and direct jumps.
- **Index-first browse.** When a directory has `index.md`, opening it prefers that Index over a file listing.
- **Concept View.** Title, type, tags, and description from the Concept, plus rendered markdown.
- **Bundle Links.** In-bundle links stay in the Viewer; external URLs open outside; missing targets link to a clear missing-Concept state.
- **Backlinks.** Concept View shows other Concepts that link to the current one.
- **Graph, Tags, Types.** Searchable, filterable cross-link graph with type-colored nodes and switchable layouts, plus frontmatter grouping.
- **Validate.** `okf-viewer validate <dir>` checks OKF v0.1 §9 conformance (CLI only; open stays best-effort).
- **Best-effort.** Opens any local folder of markdown. Valid Concepts get Concept View; other `.md` files stay readable.
- **Light / dark.** Theme toggle when you need it.

## Knowledge Graph

Open **Graph** from the sidebar to explore cross-links between Concepts. Search by title, Concept ID, or tag; filter by frontmatter type; and switch between vertical and horizontal layouts. Selecting a node shows its type, ID, description, and tags before you open the full Concept View.

The graph is a secondary navigation surface: the Directory Tree and Indexes remain the primary way to understand and browse a Bundle. Missing link targets are handled in Concept View rather than rendered as graph nodes.

## What is OKF?

[Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) is an open, vendor-neutral way to package knowledge as plain markdown with YAML frontmatter — portable, no SDK, no database. A **Knowledge Bundle** is a self-contained directory of those Concepts; this Viewer Opens one and lets you Browse it.

## License

[MIT](./LICENSE).
