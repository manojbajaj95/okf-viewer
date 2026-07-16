#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateBundle } from "../src/lib/bundle/validate-bundle.mjs";
import { parseArgv } from "../src/lib/cli-args.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");

function usage(exitCode = 0) {
  console.log(`Usage: okf-viewer <command> [options]

Commands:
  open [path]       Open a local OKF Knowledge Bundle (default: .)
  validate <dir>    Check OKF v0.1 conformance (§9)

Options (open):
  --port <n>        Prefer this port (default: first free port from 3847)
  --bind <addr>     Bind address (default: 127.0.0.1)
  --no-open         Do not open the system browser

Options (validate):
  --json            Emit JSON report

Global:
  --help, -h        Show help
`);
  process.exit(exitCode);
}

function findFreePort(preferred, host) {
  return new Promise((resolvePort, reject) => {
    const tryListen = (port) => {
      const server = createServer();
      server.unref();
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && port < preferred + 50) {
          tryListen(port + 1);
          return;
        }
        reject(err);
      });
      server.listen(port, host, () => {
        const { port: bound } = /** @type {import('node:net').AddressInfo} */ (
          server.address()
        );
        server.close(() => resolvePort(bound));
      });
    };
    tryListen(preferred);
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  /** @type {string[]} */
  let args;
  if (platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }
  const child = spawn(cmd, args, { stdio: "ignore", detached: true });
  child.unref();
}

function nextBin() {
  const candidate = join(
    packageRoot,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  if (!existsSync(candidate)) {
    console.error(
      "okf-viewer: next is not installed. Run from a built checkout or install dependencies.",
    );
    process.exit(1);
  }
  return candidate;
}

function standaloneServer() {
  const direct = join(packageRoot, ".next", "standalone", "server.js");
  if (existsSync(direct)) {
    return { serverJs: direct, cwd: join(packageRoot, ".next", "standalone") };
  }
  return null;
}

/**
 * @param {string | undefined} pathArg
 * @param {number | undefined} portArg
 * @param {string} bindHost
 * @param {boolean} shouldOpenBrowser
 */
async function openBundle(pathArg, portArg, bindHost, shouldOpenBrowser) {
  const bundlePath = resolve(process.cwd(), pathArg ?? ".");
  if (!existsSync(bundlePath)) {
    console.error(`okf-viewer: path does not exist: ${bundlePath}`);
    process.exit(1);
  }

  const preferred = portArg ?? 3847;
  const port = await findFreePort(preferred, bindHost);
  const displayHost = bindHost === "0.0.0.0" ? "127.0.0.1" : bindHost;
  const url = `http://${displayHost}:${port}`;
  const env = {
    ...process.env,
    OKF_BUNDLE_PATH: bundlePath,
    PORT: String(port),
    HOSTNAME: bindHost,
  };

  console.log(`Opening Knowledge Bundle: ${bundlePath}`);

  const standalone = standaloneServer();
  /** @type {import('node:child_process').ChildProcess} */
  let child;

  if (standalone) {
    console.log(`Viewer: ${url} (standalone)`);
    child = spawn(process.execPath, [standalone.serverJs], {
      cwd: standalone.cwd,
      env,
      stdio: "inherit",
    });
  } else {
    const nextMode = existsSync(join(packageRoot, ".next", "BUILD_ID"))
      ? "start"
      : "dev";
    console.log(`Viewer: ${url} (${nextMode})`);
    child = spawn(
      process.execPath,
      [nextBin(), nextMode, "--hostname", bindHost, "--port", String(port)],
      {
        cwd: packageRoot,
        env,
        stdio: "inherit",
      },
    );
  }

  if (bindHost === "0.0.0.0") {
    console.log(`Listening on all interfaces — use http://<this-host>:${port}`);
  }

  if (shouldOpenBrowser) {
    setTimeout(() => openBrowser(url), 800);
  }

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

/**
 * @param {string | undefined} pathArg
 * @param {boolean} json
 */
function runValidate(pathArg, json) {
  const bundlePath = resolve(process.cwd(), pathArg ?? ".");
  if (!existsSync(bundlePath) || !statSync(bundlePath).isDirectory()) {
    console.error(`okf-viewer: not a directory: ${bundlePath}`);
    process.exit(2);
  }

  const result = validateBundle(bundlePath);

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`OKF v0.1 conformance — ${bundlePath}`);
    console.log(`  concepts: ${result.conceptCount}`);
    for (const err of result.errors) {
      console.log(`  ✗ ${err.rule}  ${err.path}: ${err.message}`);
    }
    if (result.conformant) {
      console.log("  ✓ conformant");
    }
  }

  process.exit(result.conformant ? 0 : 1);
}

const parsed = parseArgv(process.argv.slice(2));

if (parsed.help) {
  usage(0);
}
if (parsed.error) {
  console.error(`okf-viewer: ${parsed.error}`);
  usage(2);
}
if (parsed.command === "open") {
  await openBundle(
    parsed.path,
    parsed.port,
    parsed.bind ?? "127.0.0.1",
    parsed.openBrowser !== false,
  );
} else if (parsed.command === "validate") {
  runValidate(parsed.path, parsed.json === true);
} else {
  console.error(`okf-viewer: unknown command ${parsed.command ?? "(none)"}`);
  usage(2);
}
