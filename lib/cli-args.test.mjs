import { describe, expect, it } from "vitest";
import { parseArgv } from "./cli-args.mjs";

describe("parseArgv", () => {
  it("parses open with default path", () => {
    expect(parseArgv(["open"])).toEqual({
      command: "open",
      openBrowser: true,
    });
  });

  it("parses open with path and port", () => {
    expect(parseArgv(["open", "./bundle", "--port", "4000"])).toEqual({
      command: "open",
      path: "./bundle",
      port: 4000,
      openBrowser: true,
    });
  });

  it("returns help for -h", () => {
    expect(parseArgv(["-h"]).help).toBe(true);
  });

  it("rejects invalid port", () => {
    expect(parseArgv(["open", "--port", "nope"]).error).toMatch(
      /invalid --port/,
    );
  });

  it("honors --no-open", () => {
    expect(parseArgv(["open", "--no-open"]).openBrowser).toBe(false);
  });
});
