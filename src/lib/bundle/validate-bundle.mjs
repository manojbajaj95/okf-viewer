import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { resolveBundlePath, walkBundle } from "./filesystem.mjs";

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
  const { markdownFiles } = walkBundle(root);

  let conceptCount = 0;

  for (const relPath of markdownFiles) {
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
