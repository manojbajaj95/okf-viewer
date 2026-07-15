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

async function openBundle(pathArg, portArg) {
  const bundlePath = resolve(process.cwd(), pathArg ?? ".");
  if (!existsSync(bundlePath)) {
    console.error(`okf-lib: path does not exist: ${bundlePath}`);
    process.exit(1);
  }

  const preferred = portArg ?? 3847;
  const port = await findFreePort(preferred);
  const env = {
    ...process.env,
    OKF_BUNDLE_PATH: bundlePath,
    PORT: String(port),
  };

  const nextMode = existsSync(join(packageRoot, ".next", "BUILD_ID"))
    ? "start"
    : "dev";

  console.log(`Opening Knowledge Bundle: ${bundlePath}`);
  console.log(`Viewer: http://127.0.0.1:${port} (${nextMode})`);

  const child = spawn(
    process.execPath,
    [nextBin(), nextMode, "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: packageRoot,
      env,
      stdio: "inherit",
    },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

const { command, path, port, help, error } = parseArgv(process.argv.slice(2));

if (help) {
  usage(0);
}
if (error) {
  console.error(`okf-lib: ${error}`);
  usage(1);
}
if (command === "open") {
  await openBundle(path, port);
} else {
  console.error(`okf-lib: unknown command ${command ?? "(none)"}`);
  usage(1);
}
