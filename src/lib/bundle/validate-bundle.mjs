import { readdirSync, readFileSync } from "node:fs";
import { join, normalize, relative, resolve, sep } from "node:path";
import matter from "gray-matter";

const SKIP_NAMES = new Set([".git", "node_modules", ".DS_Store", ".next"]);

function shouldSkipName(name) {
  return SKIP_NAMES.has(name) || name.startsWith(".");
}

function resolveUnderRoot(root, relPath) {
  const cleaned = relPath.replace(/^\/+/, "").replaceAll("\\", "/");
  const absolute = normalize(
    resolve(root, ...cleaned.split("/").filter(Boolean)),
  );
  const rel = relative(root, absolute);
  if (rel.startsWith("..") || !absolute.startsWith(root)) {
    throw new Error(`Path escapes bundle root: ${relPath}`);
  }
  return absolute;
}

function resolveBundlePath(root, relPath) {
  return resolveUnderRoot(root, relPath);
}

function toPosixRelative(root, absolute) {
  return relative(root, absolute).split(sep).join("/");
}

function walkMarkdownFiles(root, dirAbs, files) {
  for (const entry of readdirSync(dirAbs, { withFileTypes: true })) {
    if (shouldSkipName(entry.name)) {
      continue;
    }
    const abs = join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(root, abs, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(toPosixRelative(root, abs));
    }
  }
}

function validateIndex(relPath, raw) {
  if (relPath === "index.md") {
    return [];
  }
  if (!raw.startsWith("---")) {
    return [];
  }
  try {
    const parsed = matter(raw);
    if (Object.keys(parsed.data).length > 0) {
      return [
        {
          path: relPath,
          rule: "§9.3",
          message: "nested index.md must not have frontmatter",
        },
      ];
    }
  } catch {
    return [
      {
        path: relPath,
        rule: "§9.3",
        message: "index.md has unparseable frontmatter",
      },
    ];
  }
  return [];
}

function validateLog(relPath, raw) {
  const errors = [];
  const lines = raw.split("\n");
  let inFrontmatter = false;
  let frontmatterClosed = false;

  for (const line of lines) {
    if (!frontmatterClosed && line.trim() === "---") {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      }
      frontmatterClosed = true;
      errors.push({
        path: relPath,
        rule: "§9.3",
        message: "log.md must not have frontmatter",
      });
      continue;
    }
    if (inFrontmatter && !frontmatterClosed) {
      // skip frontmatter body lines
    }
  }
  return errors;
}

function validateConcept(relPath, raw) {
  if (!raw.startsWith("---")) {
    return [
      {
        path: relPath,
        rule: "§9.1",
        message: "missing YAML frontmatter block",
      },
    ];
  }
  let parsed;
  try {
    parsed = matter(raw);
  } catch {
    return [
      {
        path: relPath,
        rule: "§9.1",
        message: "unparseable YAML frontmatter",
      },
    ];
  }
  const type = parsed.data.type;
  if (typeof type !== "string" || type.trim() === "") {
    return [
      {
        path: relPath,
        rule: "§9.2",
        message: "frontmatter must include non-empty type",
      },
    ];
  }
  return [];
}

/**
 * @param {string} root
 * @returns {{ conformant: boolean, errors: Array<{ path: string, rule: string, message: string }>, conceptCount: number }}
 */
export function validateBundle(rootInput) {
  const root = resolve(rootInput);
  const errors = [];
  const files = [];
  walkMarkdownFiles(root, root, files);

  let conceptCount = 0;

  for (const relPath of files) {
    const abs = resolveBundlePath(root, relPath);
    const raw = readFileSync(abs, "utf8");
    const name = relPath.split("/").pop() ?? "";

    if (name === "index.md") {
      errors.push(...validateIndex(relPath, raw));
      continue;
    }
    if (name === "log.md") {
      errors.push(...validateLog(relPath, raw));
      continue;
    }

    conceptCount += 1;
    errors.push(...validateConcept(relPath, raw));
  }

  return {
    conformant: errors.length === 0,
    errors,
    conceptCount,
  };
}
