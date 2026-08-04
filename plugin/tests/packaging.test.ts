// Packaging smoke tests: the full install lifecycle against the real omp CLI
// in an isolated HOME. Covers T027 (install + artifact integrity), T034
// (enable/disable), T032 (upgrade), T035 (uninstall).
//
// These tests spawn the real `omp` binary. They never touch the live agent
// config: every invocation runs with a fresh temp HOME and no XDG roots, so
// plugin state lands under $HOME/.omp (the documented non-XDG default).
import { describe, expect, test, beforeAll } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const REPO = join(import.meta.dir, "..", ".."); // plugin/tests -> repo root
const OMP = "omp";

function omp(home: string, args: string[]): { status: number | null; stdout: string } {
  const env: Record<string, string | undefined> = { ...process.env, HOME: home };
  delete env.XDG_DATA_HOME;
  delete env.XDG_STATE_HOME;
  delete env.XDG_CACHE_HOME;
  const r = spawnSync(OMP, args, { env, encoding: "utf8", timeout: 90_000 });
  if (r.error) throw new Error(`failed to run omp: ${r.error.message}`);
  return { status: r.status, stdout: r.stdout };
}

function freshHome(): string {
  return mkdtempSync(join(tmpdir(), "ste-writing-test-"));
}

function installedVersion(home: string): string | null {
  const { stdout } = omp(home, ["plugin", "list", "--json"]);
  const data = JSON.parse(stdout) as {
    marketplace?: { id: string; entries: { version: string; installPath: string }[] }[];
  };
  const entry = (data.marketplace ?? []).find((p) => p.id === "ste-writing@ste-writing");
  return entry?.entries?.[0]?.version ?? null;
}

function installPathOf(home: string): string | null {
  const { stdout } = omp(home, ["plugin", "list", "--json"]);
  const data = JSON.parse(stdout) as {
    marketplace?: { id: string; entries: { version: string; installPath: string }[] }[];
  };
  const entry = (data.marketplace ?? []).find((p) => p.id === "ste-writing@ste-writing");
  return entry?.entries?.[0]?.installPath ?? null;
}

function lockEnabled(home: string): boolean | null {
  const lock = join(home, ".omp", "plugins", "omp-plugins.lock.json");
  if (!existsSync(lock)) return null;
  const data = JSON.parse(readFileSync(lock, "utf8")) as { plugins: Record<string, { enabled: boolean }> };
  return data.plugins?.["ste-writing"]?.enabled ?? null;
}

function installFrom(home: string, repo: string): void {
  const add = omp(home, ["plugin", "marketplace", "add", repo]);
  expect(add.status).toBe(0);
  const install = omp(home, ["plugin", "install", "ste-writing@ste-writing"]);
  expect(install.status).toBe(0);
  expect(installedVersion(home)).toBe("1.0.0");
}

beforeAll(() => {
  const probe = spawnSync("which", [OMP], { encoding: "utf8" });
  if (probe.status !== 0) {
    throw new Error(`omp binary not found on PATH; packaging tests cannot run`);
  }
});

describe("install lifecycle (US1 acceptance)", () => {
  const home = freshHome();

  test("marketplace add, install, and list show ste-writing@1.0.0", () => {
    installFrom(home, REPO);
  });

  test("installed artifact is complete and functional", async () => {
    const installed = installPathOf(home);
    expect(installed).not.toBeNull();
    expect(existsSync(join(installed!, "src", "index.ts"))).toBe(true);
    expect(existsSync(join(installed!, "skills", "ste-writing", "SKILL.md"))).toBe(true);

    // The installed extension loads standalone (type-only import is erased)
    // and registers both lifecycle handlers.
    const mod = await import(join(installed!, "src", "index.ts"));
    expect(typeof mod.default).toBe("function");
    expect(typeof mod.checkEnglish).toBe("function");
    expect(typeof mod.buildBlockReason).toBe("function");
    const handlers = new Map<string, unknown>();
    mod.default({ on: (e: string, h: unknown) => handlers.set(e, h), sendMessage() {} });
    expect(handlers.has("tool_result")).toBe(true);
    expect(handlers.has("tool_call")).toBe(true);
  });
});

describe("enable and disable (US5)", () => {
  const home = freshHome();

  beforeAll(() => installFrom(home, REPO));

  test("disable flips the lock state and reports success", () => {
    const r = omp(home, ["plugin", "disable", "ste-writing@ste-writing"]);
    expect(r.status).toBe(0);
    expect(lockEnabled(home)).toBe(false);
  });

  test("enable restores the lock state", () => {
    const r = omp(home, ["plugin", "enable", "ste-writing@ste-writing"]);
    expect(r.status).toBe(0);
    expect(lockEnabled(home)).toBe(true);
  });
});

describe("upgrade path (US4, SC-004)", () => {
  const home = freshHome();

  beforeAll(() => installFrom(home, REPO));

  test("bumping the catalog version upgrades the installed plugin", () => {
    // Disposable copy of the repo with versions bumped to 1.0.1.
    const copy = mkdtempSync(join(tmpdir(), "ste-writing-repo-"));    cpSync(REPO, copy, {
      recursive: true,
      filter: (src) => {
        const base = src.split(/[\\/]/).pop() ?? "";
        return !["node_modules", ".git", ".specify", ".omp", "specs"].includes(base);
      },
    });
    for (const rel of [".omp-plugin/marketplace.json", ".claude-plugin/marketplace.json"]) {
      const p = join(copy, rel);
      const cat = JSON.parse(readFileSync(p, "utf8")) as { plugins: { version: string }[] };
      cat.plugins[0].version = "1.0.1";
      writeFileSync(p, JSON.stringify(cat, null, 2));
    }
    const pkg = join(copy, "plugin", "package.json");
    const manifest = JSON.parse(readFileSync(pkg, "utf8")) as { version: string };
    manifest.version = "1.0.1";
    writeFileSync(pkg, JSON.stringify(manifest, null, 2));

    // Point the existing marketplace at the bumped copy, refresh, upgrade.
    omp(home, ["plugin", "marketplace", "remove", "ste-writing"]);
    const add = omp(home, ["plugin", "marketplace", "add", copy]);
    expect(add.status).toBe(0);
    const update = omp(home, ["plugin", "marketplace", "update", "ste-writing"]);
    expect(update.status).toBe(0);
    const upgrade = omp(home, ["plugin", "upgrade", "ste-writing@ste-writing"]);
    expect(upgrade.status).toBe(0);
    expect(installedVersion(home)).toBe("1.0.1");
  }, 120_000);
});

describe("uninstall (US5, FR-010)", () => {
  const home = freshHome();

  beforeAll(() => installFrom(home, REPO));

  test("uninstall removes the plugin from the list and disk", () => {
    const installed = installPathOf(home);
    expect(installed).not.toBeNull();
    const r = omp(home, ["plugin", "uninstall", "ste-writing@ste-writing"]);
    expect(r.status).toBe(0);
    expect(installedVersion(home)).toBeNull();
    expect(existsSync(installed!)).toBe(false);
  });
});
