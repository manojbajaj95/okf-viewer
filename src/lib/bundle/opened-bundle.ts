import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import matter from "gray-matter";
import {
  resolveBundlePath,
  toPosixRelative,
  walkBundle,
} from "./filesystem.mjs";
import type { BundleGraph, ConceptSummary, GraphNode } from "./graph";
import { normalizeConceptId, resolveConceptLinks } from "./links";
import { getBundleRoot } from "./paths";
import type {
  BundleEntry,
  BundleLogRoute,
  ConceptFrontmatter,
  TreeKind,
  TreeNode,
} from "./types";
import { bundlePathToHref } from "./url";

type MarkdownEntry = Exclude<BundleEntry, { kind: "directory" | "missing" }>;

type OpenedBundle = {
  readonly root: string;
  readonly tree: TreeNode[];
  readonly graph: BundleGraph;
  readonly logRoutes: Record<string, BundleLogRoute>;
  readEntry(relPath: string): BundleEntry;
  backlinksFor(conceptId: string): ConceptSummary[];
};

const openedBundles = new Map<string, OpenedBundle>();

function parseMarkdownFile(relPath: string, raw: string): MarkdownEntry {
  const name = basename(relPath);
  if (name === "index.md") {
    return { kind: "index", path: relPath, body: raw };
  }
  if (name === "log.md") {
    return { kind: "log", path: relPath, body: raw };
  }

  try {
    const parsed = matter(raw);
    const type = parsed.data.type;
    if (typeof type === "string" && type.trim() !== "") {
      const frontmatter = {
        ...parsed.data,
        type: type.trim(),
      } as ConceptFrontmatter;
      if (Array.isArray(parsed.data.tags)) {
        frontmatter.tags = parsed.data.tags.map(String);
      }
      return {
        kind: "concept",
        path: relPath,
        frontmatter,
        body: parsed.content.trimStart(),
      };
    }
    return {
      kind: "markdown",
      path: relPath,
      body: raw,
      title:
        typeof parsed.data.title === "string" ? parsed.data.title : undefined,
    };
  } catch {
    return { kind: "markdown", path: relPath, body: raw };
  }
}

function entryKind(entry: MarkdownEntry): TreeKind {
  return entry.kind;
}

function parentPath(relPath: string): string {
  const parent = dirname(relPath).replace(/^\.$/, "");
  return parent.split("\\").join("/");
}

function buildOpenedBundle(root: string): OpenedBundle {
  const walked = walkBundle(root);
  const directories = new Set(walked.directories);
  const files = new Map<string, MarkdownEntry>();

  for (const relPath of walked.markdownFiles) {
    const raw = readFileSync(join(root, relPath), "utf8");
    files.set(relPath, parseMarkdownFile(relPath, raw));
  }

  function directoryChildren(dirPath: string) {
    const children: Extract<BundleEntry, { kind: "directory" }>["children"] =
      [];

    for (const directory of directories) {
      if (directory && parentPath(directory) === dirPath) {
        children.push({
          name: basename(directory),
          path: directory,
          kind: "dir",
        });
      }
    }
    for (const [relPath, entry] of files) {
      if (parentPath(relPath) !== dirPath) {
        continue;
      }
      children.push({
        name: basename(relPath),
        path: relPath,
        kind: entryKind(entry),
        title:
          entry.kind === "concept"
            ? entry.frontmatter.title
            : entry.kind === "markdown"
              ? entry.title
              : undefined,
        description:
          entry.kind === "concept" ? entry.frontmatter.description : undefined,
      });
    }
    children.sort((a, b) => a.name.localeCompare(b.name));
    return children;
  }

  function treeForDirectory(dirPath: string): TreeNode[] {
    const nodes: TreeNode[] = [];
    for (const child of directoryChildren(dirPath)) {
      if (child.kind === "index" || child.kind === "log") {
        continue;
      }
      nodes.push({
        name: child.name,
        path: child.path,
        kind: child.kind,
        children:
          child.kind === "dir" ? treeForDirectory(child.path) : undefined,
      });
    }
    nodes.sort((a, b) => {
      if (a.kind === "dir" && b.kind !== "dir") return -1;
      if (a.kind !== "dir" && b.kind === "dir") return 1;
      return a.name.localeCompare(b.name);
    });
    return nodes;
  }

  const nodes: GraphNode[] = [];
  const conceptBodies = new Map<string, string>();
  for (const entry of files.values()) {
    if (entry.kind !== "concept") {
      continue;
    }
    const id = normalizeConceptId(entry.path);
    nodes.push({
      id,
      path: entry.path,
      title:
        entry.frontmatter.title ??
        entry.path.replace(/\.md$/i, "").split("/").pop() ??
        entry.path,
      type: entry.frontmatter.type,
      description: entry.frontmatter.description,
      tags: entry.frontmatter.tags,
    });
    conceptBodies.set(entry.path, entry.body);
  }

  const edges: BundleGraph["edges"] = [];
  const backlinks: BundleGraph["backlinks"] = {};
  for (const node of nodes) {
    for (const targetId of resolveConceptLinks(
      node.path,
      conceptBodies.get(node.path) ?? "",
    )) {
      edges.push({ from: node.id, to: targetId });
      backlinks[targetId] ??= [];
      const sources = backlinks[targetId];
      if (!sources.includes(node.id)) {
        sources.push(node.id);
      }
    }
  }
  const graph: BundleGraph = { nodes, edges, backlinks };

  const logRoutes: Record<string, BundleLogRoute> = {};
  for (const directory of directories) {
    const logPath = directory ? `${directory}/log.md` : "log.md";
    const log = files.get(logPath);
    if (log?.kind === "log") {
      logRoutes[bundlePathToHref(directory)] = { entry: log, autoOpen: false };
    }
  }
  for (const entry of files.values()) {
    if (entry.kind === "log") {
      logRoutes[bundlePathToHref(entry.path)] = {
        entry,
        autoOpen: true,
      };
      continue;
    }
    const logPath = parentPath(entry.path)
      ? `${parentPath(entry.path)}/log.md`
      : "log.md";
    const log = files.get(logPath);
    if (log?.kind === "log") {
      logRoutes[bundlePathToHref(entry.path)] = {
        entry: log,
        autoOpen: false,
      };
    }
  }

  function normalizeLookup(relPath: string): string | null {
    try {
      const cleaned = relPath.replace(/^\/+/, "");
      return toPosixRelative(root, resolveBundlePath(root, cleaned));
    } catch {
      return null;
    }
  }

  function readEntry(relPath: string): BundleEntry {
    const cleaned = normalizeLookup(relPath);
    if (cleaned === null) {
      return { kind: "missing", path: relPath.replace(/^\/+/, "") };
    }

    const exact = files.get(cleaned);
    if (exact) {
      return exact;
    }
    if (cleaned && !cleaned.endsWith(".md")) {
      const markdown = files.get(`${cleaned}.md`);
      if (markdown) {
        return markdown;
      }
    }
    if (directories.has(cleaned)) {
      const indexPath = cleaned ? `${cleaned}/index.md` : "index.md";
      const index = files.get(indexPath);
      return {
        kind: "directory",
        path: cleaned,
        indexBody: index?.kind === "index" ? index.body : undefined,
        children: directoryChildren(cleaned),
      };
    }
    return { kind: "missing", path: cleaned };
  }

  function backlinksFor(conceptId: string): ConceptSummary[] {
    const linkerIds = graph.backlinks[normalizeConceptId(conceptId)] ?? [];
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    return linkerIds
      .map((id) => byId.get(id))
      .filter((node): node is GraphNode => node !== undefined)
      .map((node) => ({ ...node }));
  }

  return {
    root,
    tree: treeForDirectory(""),
    graph,
    logRoutes,
    readEntry,
    backlinksFor,
  };
}

/** Open and parse a Knowledge Bundle once for this server process. */
export function openBundle(root = getBundleRoot()): OpenedBundle {
  const canonicalRoot = resolveBundlePath(root, "");
  let opened = openedBundles.get(canonicalRoot);
  if (!opened) {
    opened = buildOpenedBundle(canonicalRoot);
    openedBundles.set(canonicalRoot, opened);
  }
  return opened;
}
