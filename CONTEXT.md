# OKF Viewer

A read-only consumer that lets a human browse an Open Knowledge Format (OKF) knowledge bundle.

## Language

**Viewer**:
The application that Opens a Knowledge Bundle and presents its Concepts for reading and navigation. Published on npm as the package name `okf-viewer`.
_Avoid_: Catalog, explorer, visualizer (unless referring to a graph surface); treating the Viewer as a programmable SDK

**Knowledge Bundle**:
A self-contained directory tree of markdown Concept documents conforming to OKF. The unit of distribution and the unit the Viewer opens.
_Avoid_: Repo, vault, wiki, corpus (as synonyms for the opened unit)

**Concept**:
A single unit of knowledge in a Bundle, represented as one markdown file with YAML frontmatter. Identity is the file path without the `.md` suffix.
_Avoid_: Page, document, node, entry (as the primary term)

**Browse**:
The Viewer's primary job: navigate from indexes into Concepts and read their content. Graph, Tags, and Types are secondary browse surfaces. Not search or validation as the primary surface.
_Avoid_: Explore, search, visualize (as descriptions of the primary job)

**Open**:
The act of pointing the Viewer at a local directory path via the CLI (default: current working directory). A local server reads that Bundle from disk and serves the UI in the browser. The Viewer does not use a browser folder picker, and does not fetch or host remote Bundles.
_Avoid_: Import, upload, load from URL, sync, File System Access picker

**Directory Tree**:
A sidebar view of the Bundle's folders and Concept files used for orientation and direct navigation.
_Avoid_: File browser, outline (as the primary term)

**Index**:
An `index.md` listing in a directory that supports progressive disclosure. When present, opening that directory prefers showing the Index over a synthesized listing.
_Avoid_: TOC, catalog page, directory listing (as the primary term for `index.md`)

**Concept View**:
The main reading surface for a selected Concept: a structured header from frontmatter (`type`, `title`, `description`, `tags`, `resource`, `timestamp`) plus a rendered markdown body.
_Avoid_: Detail page, document pane, preview

**Bundle Link**:
A markdown link that targets another Concept inside the same Knowledge Bundle (bundle-absolute `/…` or relative path). The Viewer navigates these in-app; external URLs open outside the Viewer. Missing targets show a clear missing-Concept state.
_Avoid_: Internal link, wiki link, wikilink

**Log**:
A reserved `log.md` file recording chronological updates for a directory scope. Shown in the Directory Tree and readable as markdown; not a Concept.
_Avoid_: History, changelog, activity feed (as product features)

**Best-effort browse**:
The Viewer opens any local folder of markdown files without a conformance gate. Files with valid frontmatter and `type` are Concepts; other `.md` files remain readable without Concept View chrome.
_Avoid_: Validation mode, strict mode, lint-on-open
