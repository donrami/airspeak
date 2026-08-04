// Language detection, glob filtering, and extension wiring tests.
// The extension is exercised through a fake `pi` so no agent is needed.
import { describe, expect, test } from "bun:test";
import steLint, {
  buildBlockReason,
  detectGerman,
  GERMAN_PATH,
  PROSE_GLOBS,
} from "../src/index.ts";
import { loadCorpus } from "./helpers.ts";

const corpus = loadCorpus();
const ANNOTATION_MARKER = "## ste-lint";

// Minimal ExtensionAPI stand-in: records handlers, ignores messaging.
function makeFakePi() {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  return {
    handlers,
    pi: {
      on(event: string, handler: (...args: unknown[]) => unknown) {
        handlers.set(event, handler);
      },
      sendMessage() {},
    },
  };
}

describe("GERMAN_PATH routing", () => {
  const germanPaths = [
    "docs/de/foo.md",
    "de/foo.md",
    "foo.de.md",
    "german/notes.md",
    "de_DE/help.md",
    "docs/DE/README.md",
  ];
  const englishPaths = ["docs/en/foo.md", "foo.md", "src/main.ts", "docs/README.md"];

  for (const p of germanPaths) test(`German path: ${p}`, () => expect(GERMAN_PATH.test(p)).toBe(true));
  for (const p of englishPaths) test(`non-German path: ${p}`, () => expect(GERMAN_PATH.test(p)).toBe(false));
});

describe("detectGerman", () => {
  test("German text dominates", () => {
    expect(detectGerman("Der Benutzer gibt den Text ein und die Daten werden verarbeitet.")).toBe(true);
  });
  test("English text dominates", () => {
    expect(detectGerman("The user enters the text and the data is processed by the system.")).toBe(false);
  });
  test("mixed text routes by dominance", () => {
    expect(detectGerman("Die Daten werden verarbeitet und das Ergebnis wird angezeigt. The system then shows the result.")).toBe(true);
    expect(detectGerman("The system processes the data and shows the result. Der Benutzer gibt den Text ein.")).toBe(false);
  });
});

describe("PROSE_GLOBS filtering", () => {
  for (const p of ["a.md", "b.mdx", "c.markdown", "path/to/README.md"]) {
    test(`prose file: ${p}`, () => expect(PROSE_GLOBS.test(p)).toBe(true));
  }
  for (const p of ["a.ts", "b.json", "c.yml", "d.py", "e.txt", "f.md.bak"]) {
    test(`non-prose file: ${p}`, () => expect(PROSE_GLOBS.test(p)).toBe(false));
  }
});

describe("tool_result handler wiring", () => {
  const { handlers, pi } = makeFakePi();
  steLint(pi as never);

  const writeEvent = (overrides: Record<string, unknown>) => ({
    type: "tool_result",
    toolName: "write",
    toolCallId: "call_1",
    input: { file_path: "docs/example.md", content: corpus.en.banned.violating },
    content: [{ type: "text", text: "OK" }],
    isError: false,
    ...overrides,
  });

  test("registers tool_result and tool_call handlers", () => {
    expect(handlers.has("tool_result")).toBe(true);
    expect(handlers.has("tool_call")).toBe(true);
  });

  test("annotates a violating prose write", async () => {
    const result = await (handlers.get("tool_result") as (e: unknown) => Promise<unknown>)(writeEvent({}));
    const content = (result as { content: { text: string }[] }).content;
    expect(content[0].text).toContain(ANNOTATION_MARKER);
    expect(content[0].text).toContain("anti-slop");
    expect(content[0].text).toContain("disabledExtensions");
  });

  test("skips non-prose files", async () => {
    const result = await (handlers.get("tool_result") as (e: unknown) => Promise<unknown>)(
      writeEvent({ input: { file_path: "src/main.ts", content: corpus.en.banned.violating } })
    );
    expect(result).toBeUndefined();
  });

  test("skips failed tool results", async () => {
    const result = await (handlers.get("tool_result") as (e: unknown) => Promise<unknown>)(
      writeEvent({ isError: true })
    );
    expect(result).toBeUndefined();
  });

  test("skips content shorter than 40 chars", async () => {
    const result = await (handlers.get("tool_result") as (e: unknown) => Promise<unknown>)(
      writeEvent({ input: { file_path: "docs/example.md", content: corpus.meta.shortContent } })
    );
    expect(result).toBeUndefined();
  });

  test("ignores non-write tools", async () => {
    const result = await (handlers.get("tool_result") as (e: unknown) => Promise<unknown>)(
      writeEvent({ toolName: "bash", input: { command: corpus.en.banned.violating } })
    );
    expect(result).toBeUndefined();
  });

  test("leaves a clean write unmodified", async () => {
    const result = await (handlers.get("tool_result") as (e: unknown) => Promise<unknown>)(
      writeEvent({ input: { file_path: "docs/example.md", content: corpus.en.banned.conforming } })
    );
    expect(result).toBeUndefined();
  });
});

describe("buildBlockReason (block mode decision)", () => {
  test("warn mode never blocks", () => {
    expect(buildBlockReason("docs/example.md", corpus.en.banned.violating, "warn")).toBeNull();
  });

  test("block mode rejects a violating prose write with the kill-switch hint", () => {
    const reason = buildBlockReason("docs/example.md", corpus.en.banned.violating, "block");
    expect(reason).toContain("blocked this write");
    expect(reason).toContain("disabledExtensions");
  });

  test("block mode allows a conforming write", () => {
    expect(buildBlockReason("docs/example.md", corpus.en.banned.conforming, "block")).toBeNull();
  });

  test("block mode never blocks non-prose files", () => {
    expect(buildBlockReason("src/main.ts", corpus.en.banned.violating, "block")).toBeNull();
  });

  test("block mode routes German content to German checks", () => {
    const reason = buildBlockReason("docs/example.md", corpus.de["sentence-length"].violating, "block");
    expect(reason).toContain("German");
  });
});
