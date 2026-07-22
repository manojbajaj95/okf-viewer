import { readdirSync } from "node:fs";
import { isAbsolute, join, normalize, relative, resolve, sep } from "node:path";

const SKIP_NAMES = new Set([".git", "node_modules", ".DS_Store", ".next"]);

/** @param {string} name */
export function shouldSkipName(name) {
  return SKIP_NAMES.has(name) || name.startsWith(".");
}

/**
 * Resolve a Bundle-relative path beneath root.
 *
 * @param {string} root
 * @param {string} relPath
 */
export function resolveBundlePath(root, relPath) {
  const cleaned = relPath.replace(/^\/+/, "").replaceAll("\\", "/");
  const absolute = normalize(
    resolve(root, ...cleaned.split("/").filter(Boolean)),
  );
  const rel = relative(root, absolute);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Path escapes bundle root: ${relPath}`);
  }
  return absolute;
}

/**
 * @param {string} root
 * @param {string} absolute
 */
export function toPosixRelative(root, absolute) {
  return relative(root, absolute).split(sep).join("/");
}

/**
 * Walk visible Bundle directories and markdown files once.
 *
 * @param {string} root
 * @returns {{ directories: string[], markdownFiles: string[] }}
 */
export function walkBundle(root) {
  const directories = [""];
  const markdownFiles = [];

  /** @param {string} dirAbs */
  function walk(dirAbs) {
    const entries = readdirSync(dirAbs, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const entry of entries) {
      if (shouldSkipName(entry.name)) {
        continue;
      }
      const absolute = join(dirAbs, entry.name);
      if (entry.isDirectory()) {
        directories.push(toPosixRelative(root, absolute));
        walk(absolute);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        markdownFiles.push(toPosixRelative(root, absolute));
      }
    }
  }

  walk(root);
  return { directories, markdownFiles };
}
