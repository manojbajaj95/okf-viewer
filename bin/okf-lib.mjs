#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgv } from "../lib/cli-args.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");

function usage(exitCode = 0) {
  console.log(`Usage: okf-lib <command> [options]

Commands:
  open [path]   Open a local OKF Knowledge Bundle (default: .)

Options:
  --port <n>    Prefer this port (default: first free port from 3847)
  --no-open     Do not open the system browser
  --help, -h    Show help
`);
  process.exit(exitCode);
}

function findFreePort(preferred) {
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
      server.listen(port, "127.0.0.1", () => {
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
      "okf-lib: next is not installed. Run from a built checkout or install dependencies.",
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
 * @param {boolean} shouldOpenBrowser
 */
async function openBundle(pathArg, portArg, shouldOpenBrowser) {
  const bundlePath = resolve(process.cwd(), pathArg ?? ".");
  if (!existsSync(bundlePath)) {
    console.error(`okf-lib: path does not exist: ${bundlePath}`);
    process.exit(1);
  }

  const preferred = portArg ?? 3847;
  const port = await findFreePort(preferred);
  const url = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    OKF_BUNDLE_PATH: bundlePath,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
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
      [nextBin(), nextMode, "--hostname", "127.0.0.1", "--port", String(port)],
      {
        cwd: packageRoot,
        env,
        stdio: "inherit",
      },
    );
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

const parsed = parseArgv(process.argv.slice(2));

if (parsed.help) {
  usage(0);
}
if (parsed.error) {
  console.error(`okf-lib: ${parsed.error}`);
  usage(1);
}
if (parsed.command === "open") {
  await openBundle(parsed.path, parsed.port, parsed.openBrowser !== false);
} else {
  console.error(`okf-lib: unknown command ${parsed.command ?? "(none)"}`);
  usage(1);
}
