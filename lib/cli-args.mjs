/**
 * Parse okf-lib CLI argv (after node + script path).
 * @param {string[]} argv
 */
export function parseArgv(argv) {
  /** @type {{ command?: string, path?: string, port?: number, help?: boolean, openBrowser?: boolean, error?: string }} */
  const result = { openBrowser: true };
  const args = [...argv];

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    result.help = true;
    return result;
  }

  result.command = args.shift();

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--port") {
      const value = args.shift();
      const port = Number(value);
      if (!value || !Number.isInteger(port) || port < 1 || port > 65535) {
        result.error = `invalid --port value: ${value ?? "(missing)"}`;
        return result;
      }
      result.port = port;
      continue;
    }
    if (token === "--no-open") {
      result.openBrowser = false;
      continue;
    }
    if (token?.startsWith("-")) {
      result.error = `unknown option: ${token}`;
      return result;
    }
    if (result.path !== undefined) {
      result.error = `unexpected argument: ${token}`;
      return result;
    }
    result.path = token;
  }

  return result;
}
