// Skill manifest validation (T028): the portable skill's frontmatter must be
// parseable and consistent with the package (Agent Skills spec contract).
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SKILL = join(import.meta.dir, "..", "skills", "ste-writing", "SKILL.md");
const PKG = JSON.parse(readFileSync(join(import.meta.dir, "..", "package.json"), "utf8")) as {
  name: string;
  version: string;
};

// Minimal YAML-subset parser for the SKILL.md frontmatter: scalars (with
// boolean coercion), inline lists, and one level of nested maps (metadata).
function parseFrontmatter(text: string): Record<string, unknown> {
  const block = text.match(/^---\n([\s\S]*?)\n---/);
  if (!block) throw new Error("SKILL.md has no frontmatter block");
  const out: Record<string, unknown> = {};
  let listKey: string | null = null;
  let mapKey: string | null = null;
  const lines = block[1].split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*-\s+/.test(line)) {
      const item = line.trim().replace(/^- /, "").replace(/^"|"$/g, "");
      if (listKey) (out[listKey] as string[]).push(item);
      continue;
    }
    const m = line.match(/^(\s*)([A-Za-z0-9_.-]+):\s*(.*)$/);
    if (!m) continue;
    const [, indent, key, raw] = m;
    const value = raw.replace(/^"|"$/g, "").trim();
    if (indent.length > 0 && mapKey) {
      (out[mapKey] as Record<string, unknown>)[key] = value;
      continue;
    }
    if (value === "") {
      const next = lines[i + 1];
      if (next && /^\s*-\s+/.test(next)) {
        out[key] = [];
        listKey = key;
        mapKey = null;
      } else {
        out[key] = {};
        mapKey = key;
        listKey = null;
      }
    } else {
      out[key] = value === "true" ? true : value === "false" ? false : value;
      mapKey = null;
      listKey = null;
    }
  }
  return out;
}

const fm = parseFrontmatter(readFileSync(SKILL, "utf8"));

describe("skill manifest frontmatter", () => {
  test("parses and carries the required fields", () => {
    expect(fm.name).toBe("ste-writing");
    expect(fm.license).toBe("MIT");
    expect(fm.alwaysApply).toBe(false);
    expect(fm.hide).toBe(false);
  });

  test("declares compatibility with the target agents", () => {
    const compat = String(fm.compatibility ?? "");
    for (const agent of ["omp", "Claude Code", "Cursor", "GitHub Copilot"]) {
      expect(compat).toContain(agent);
    }
  });

  test("metadata.version is synced with package.json (release contract)", () => {
    const meta = fm.metadata as Record<string, unknown>;
    expect(String(meta.version)).toBe(PKG.version);
  });

  test("globs cover prose files only", () => {
    const globs = fm.globs as string[];
    expect(globs.length).toBeGreaterThan(0);
    for (const g of globs) {
      expect(g).toMatch(/md|README|CHANGELOG|RELEASE|errors|runbooks/);
    }
  });

  test("attribution fields name the standards (FR-013)", () => {
    const meta = fm.metadata as Record<string, unknown>;
    expect(String(meta["en-spec"])).toContain("ASD-STE100");
    expect(String(meta["de-specs"])).toContain("DIN EN IEC/IEEE 82079-1");
    expect(String(meta["de-specs"])).toContain("tekom");
  });
});
