import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";
import {
  getBundleRoot,
  resolveBundlePath,
  shouldSkipName,
  toPosixRelative,
} from "./paths";
import type {
  BundleEntry,
  ConceptFrontmatter,
  TreeKind,
  TreeNode,
} from "./types";

function classifyMarkdownFile(name: string, absolute: string): TreeKind {
  if (name === "index.md") {
    return "index";
  }
  if (name === "log.md") {
    return "log";
  }
  try {
    const raw = readFileSync(absolute, "utf8");
    const { data } = matter(raw);
    if (typeof data.type === "string" && data.type.trim() !== "") {
      return "concept";
    }
  } catch {
    // best-effort
  }
  return "markdown";
}

function peekConceptMeta(
  absolute: string,
): { title?: string; description?: string } | undefined {
  try {
    const { data } = matter(readFileSync(absolute, "utf8"));
    return {
      title: typeof data.title === "string" ? data.title : undefined,
      description:
        typeof data.description === "string" ? data.description : undefined,
    };
  } catch {
    return undefined;
  }
}

export function listTree(root = getBundleRoot()): TreeNode[] {
  function walk(dirAbs: string): TreeNode[] {
    const entries = readdirSync(dirAbs, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries) {
      if (shouldSkipName(entry.name)) {
        continue;
      }
      const abs = join(dirAbs, entry.name);
      const rel = toPosixRelative(root, abs);

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: rel,
          kind: "dir",
          children: walk(abs),
        });
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        continue;
      }
      nodes.push({
        name: entry.name,
        path: rel,
        kind: classifyMarkdownFile(entry.name, abs),
      });
    }

    nodes.sort((a, b) => {
      if (a.kind === "dir" && b.kind !== "dir") {
        return -1;
      }
      if (a.kind !== "dir" && b.kind === "dir") {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    return nodes;
  }

  return walk(root);
}

function readMarkdownFile(abs: string, rel: string): BundleEntry {
  const name = basename(abs);
  const raw = readFileSync(abs, "utf8");

  if (name === "index.md") {
    return { kind: "index", path: rel, body: raw };
  }
  if (name === "log.md") {
    return { kind: "log", path: rel, body: raw };
  }

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
      path: rel,
      frontmatter,
      body: parsed.content.trimStart(),
    };
  }

  return {
    kind: "markdown",
    path: rel,
    body: raw,
    title:
      typeof parsed.data.title === "string" ? parsed.data.title : undefined,
  };
}

function listDirectoryChildren(
  root: string,
  dirAbs: string,
): Extract<BundleEntry, { kind: "directory" }>["children"] {
  const children: Extract<BundleEntry, { kind: "directory" }>["children"] = [];
  for (const entry of readdirSync(dirAbs, { withFileTypes: true })) {
    if (shouldSkipName(entry.name)) {
      continue;
    }
    const abs = join(dirAbs, entry.name);
    const rel = toPosixRelative(root, abs);
    if (entry.isDirectory()) {
      children.push({ name: entry.name, path: rel, kind: "dir" });
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const kind = classifyMarkdownFile(entry.name, abs);
    const meta = kind === "concept" ? peekConceptMeta(abs) : undefined;
    children.push({
      name: entry.name,
      path: rel,
      kind,
      title: meta?.title,
      description: meta?.description,
    });
  }
  children.sort((a, b) => a.name.localeCompare(b.name));
  return children;
}

/**
 * Resolve a viewer path (slug-style, may omit `.md`) to a BundleEntry.
 */
export function readEntry(
  relPath: string,
  root = getBundleRoot(),
): BundleEntry {
  const cleaned = relPath.replace(/^\/+/, "");

  if (cleaned === "") {
    const indexAbs = join(root, "index.md");
    if (existsSync(indexAbs) && statSync(indexAbs).isFile()) {
      const withIndex = readMarkdownFile(indexAbs, "index.md");
      if (withIndex.kind === "index") {
        return {
          kind: "directory",
          path: "",
          indexBody: withIndex.body,
          children: listDirectoryChildren(root, root),
        };
      }
    }
    return {
      kind: "directory",
      path: "",
      children: listDirectoryChildren(root, root),
    };
  }

  const candidates = [cleaned];
  if (!cleaned.endsWith(".md")) {
    candidates.push(`${cleaned}.md`);
  }

  for (const candidate of candidates) {
    let abs: string;
    try {
      abs = resolveBundlePath(root, candidate);
    } catch {
      continue;
    }
    if (!existsSync(abs)) {
      continue;
    }
    const st = statSync(abs);
    if (st.isFile() && abs.endsWith(".md")) {
      return readMarkdownFile(abs, toPosixRelative(root, abs));
    }
    if (st.isDirectory()) {
      const rel = toPosixRelative(root, abs);
      const indexAbs = join(abs, "index.md");
      let indexBody: string | undefined;
      if (existsSync(indexAbs) && statSync(indexAbs).isFile()) {
        indexBody = readFileSync(indexAbs, "utf8");
      }
      return {
        kind: "directory",
        path: rel,
        indexBody,
        children: listDirectoryChildren(root, abs),
      };
    }
  }

  try {
    const abs = resolveBundlePath(root, cleaned);
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      const rel = toPosixRelative(root, abs);
      const indexAbs = join(abs, "index.md");
      return {
        kind: "directory",
        path: rel,
        indexBody:
          existsSync(indexAbs) && statSync(indexAbs).isFile()
            ? readFileSync(indexAbs, "utf8")
            : undefined,
        children: listDirectoryChildren(root, abs),
      };
    }
  } catch {
    // missing
  }

  return { kind: "missing", path: cleaned };
}
