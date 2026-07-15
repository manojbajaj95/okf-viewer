import { existsSync, lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { resolveUnderRoot } from "./url";

const SKIP_NAMES = new Set([".git", "node_modules", ".DS_Store", ".next"]);

export function getBundleRoot(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.OKF_BUNDLE_PATH;
  if (!raw || raw.trim() === "") {
    throw new Error("OKF_BUNDLE_PATH is not set");
  }
  const root = resolve(raw);
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new Error(`OKF_BUNDLE_PATH is not a directory: ${root}`);
  }
  return realpathSync(root);
}

/**
 * Resolve a bundle-relative path (POSIX-style) to an absolute path under root.
 * Rejects escapes outside the bundle.
 */
export function resolveBundlePath(root: string, relPath: string): string {
  return resolveUnderRoot(root, relPath);
}

export function shouldSkipName(name: string): boolean {
  return SKIP_NAMES.has(name) || name.startsWith(".");
}

export {
  bundlePathToHref,
  slugToRelPath,
  toPosixRelative,
} from "./url";
