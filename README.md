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
[![node](https://img.shields.io/node/v/okf-viewer.svg)](https://www.npmjs.com/package/okf-viewer)
[![CI](https://github.com/manojbajaj95/okf-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/manojbajaj95/okf-viewer/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/okf-viewer.svg)](./LICENSE)

**Point the CLI at a folder. Browse your Knowledge Bundle in the browser.**

OKF Viewer is a read-only local viewer for [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) bundles. Run `okf-viewer open`, and it starts a small Next.js server that serves a Directory Tree, Index-preferring navigation, Concept View, and in-app Bundle Links — offline, on your machine.

Published on npm as [`okf-viewer`](https://www.npmjs.com/package/okf-viewer). Product language lives in [`CONTEXT.md`](./CONTEXT.md).

## Quick start

```bash
npx okf-viewer@latest open /path/to/bundle
```

## Features

- **CLI Open.** Point at a local directory; no folder picker, no upload, no remote fetch.
- **Directory Tree.** Sidebar of folders and Concept files for orientation and direct jumps.
- **Index-first browse.** When a directory has `index.md`, opening it prefers that Index over a synthesized listing.
- **Concept View.** Frontmatter chrome (`type`, `title`, `description`, `tags`, …) plus rendered markdown.
- **Bundle Links.** In-bundle links navigate in-app; external URLs open outside; missing targets show a clear missing-Concept state.
- **Best-effort.** Opens any local folder of markdown without a conformance gate. Valid Concepts get Concept View; other `.md` files stay readable.
- **Light / dark.** Theme toggle in the sidebar footer.

## What is OKF?

[Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) is an open, vendor-neutral way to package knowledge as plain markdown with YAML frontmatter — portable, no SDK, no database. A **Knowledge Bundle** is a self-contained directory tree of those Concepts; this Viewer Opens one and lets you Browse it.

## License

[MIT](./LICENSE).
