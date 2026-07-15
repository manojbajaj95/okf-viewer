#!/usr/bin/env node
/**
 * Copy Next.js standalone static assets after `next build`.
 * See https://nextjs.org/docs/app/api-reference/config/next-config-js/output
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standalone = join(root, ".next", "standalone");
const staticSrc = join(root, ".next", "static");
const publicSrc = join(root, "public");

if (!existsSync(standalone)) {
  console.error(
    "postbuild: .next/standalone missing — was output: 'standalone' set?",
  );
  process.exit(1);
}

const staticDest = join(standalone, ".next", "static");
mkdirSync(dirname(staticDest), { recursive: true });
cpSync(staticSrc, staticDest, { recursive: true });

if (existsSync(publicSrc)) {
  cpSync(publicSrc, join(standalone, "public"), { recursive: true });
}

console.log("postbuild: copied static + public into .next/standalone");
