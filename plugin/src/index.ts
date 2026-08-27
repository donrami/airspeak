// ste-lint — mechanical prose linter for technical writing.
// Runs on tool_result for write/edit/multi_edit to *.md/*.mdx files.
// English: ASD-STE100 Issue 9 mechanical subset.
//
// MODE: warn (default) — appends a violation list to the tool result so the
//                  model self-corrects on the next turn. Set to "block" for
//                  hard enforcement that rejects violating writes before they
//                  execute.
//
// MODE is the shipped default; downstream forks can flip it without touching
// call sites because tool_call and tool_result both read the same source.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

// --- Path / glob filtering ---------------------------------------------------

// Prose files the linter cares about. Mirrors the skill's `globs` so the
// extension and the portable skill agree on scope.
export const PROSE_GLOBS =
  /\.(md|mdx|markdown)$|\/(README|CHANGELOG|RELEASE|errors|runbooks)(\.[a-z]+)?\/?$/i;

// --- Lint thresholds (source constants, shared by handlers and tests) -------

export const MAX_WORDS_DESCRIPTIVE = 25;
export const MAX_WORDS_PROCEDURAL = 20;
export const MAX_EM_DASH_PER_PARAGRAPH = 1;
export const MIN_PARAGRAPH_WORDS_FOR_DASH_CHECK = 30;

// --- English rules -----------------------------------------------------------

// Banned vocabulary (English). Static lookup → Record, not Set.
const EN_BANNED: Record<string, true> = {
  seamless: true, seamlessly: true, robust: true, powerful: true,
  "cutting-edge": true, "cutting edge": true,
  effortless: true, effortlessly: true, "world-class": true,
  "next-generation": true, revolutionary: true,
  leverage: true, utilize: true, facilitate: true, empower: true,
  holistic: true, meticulously: true,
  crucial: true, pivotal: true, paramount: true,
  "game-changing": true, "game changer": true,
  tapestry: true, delve: true, "navigate the landscape": true,
  "in today's": true,
  "robust solution": true, "comprehensive guide": true, "seamless experience": true,
  "best-in-class": true, "state-of-the-art": true,
};

const EN_PHRASAL_VERBS = [
  /\bspin up\b/gi, /\breach out\b/gi, /\bdive into\b/gi, /\bdelve into\b/gi,
  /\bcircle back\b/gi, /\bdeep dive\b/gi, /\bhop on a call\b/gi,
  /\bping (me|us)\b/gi, /\bleverage\b/gi, /\butilize\b/gi,
];

const EN_NOMINALIZATIONS = [
  /\b(perform|conduct|carry out|do)\s+(a|an|the)?\s*(analysis|determination|assessment|evaluation|investigation|review)\b/gi,
  /\b(make|provide)\s+(a|an|the)?\s*(determination|assessment|decision|recommendation|assistance|support)\b/gi,
  /\bprovide\s+assistance\b/gi,
];

const EM_DASH = /—/g;

// Strip markdown formatting, but PRESERVE hyphens — they are semantically
// required for English compound-noun checks.
export function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[*_>~]{1,}/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
}

export function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0 && /[a-zA-Z0-9]/.test(w)).length;
}

// Split into sentences, handling common abbreviations (e.g., i.e., Mr., Dr.).
export function splitSentences(text: string): string[] {
  const protectedText = text
    .replace(/\b(e\.g|i\.e|Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc)\./gi, "$1<DOT>");
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.replace(/<DOT>/g, ".").trim())
    .filter((s) => s.length > 0);
}

export function checkEnglish(text: string): string[] {
  const issues: string[] = [];
  const prose = stripMarkdown(text);

  // Sentence length (STE 5.1 procedures / 6.3 descriptions).
  for (const s of splitSentences(prose)) {
    const wc = wordCount(s);
    if (wc > MAX_WORDS_DESCRIPTIVE) {
      issues.push(`[STE 6.3] sentence has ${wc} words (cap ${MAX_WORDS_DESCRIPTIVE}): "${s.slice(0, 60)}..."`);
    } else if (wc > MAX_WORDS_PROCEDURAL) {
      issues.push(`[STE 5.1] sentence has ${wc} words (procedural cap ${MAX_WORDS_PROCEDURAL}): "${s.slice(0, 60)}..."`);
    }
  }

  // Semicolons (STE 8.1).
  if (/;/.test(prose)) {
    const count = (prose.match(/;/g) || []).length;
    issues.push(`[STE 8.1] ${count} semicolon(s) in prose — STE bans semicolons. Replace with period or split.`);
  }

  // Nominalizations (STE 3.7).
  for (const re of EN_NOMINALIZATIONS) {
    const m = prose.match(re);
    if (m) {
      issues.push(`[STE 3.7] nominalization — use a verb: "${m[0]}"`);
    }
  }

  // Phrasal verbs.
  for (const re of EN_PHRASAL_VERBS) {
    const m = prose.match(re);
    if (m) issues.push(`[STE] phrasal verb "${m[0]}" — replace with a precise verb.`);
  }

  // Banned vocabulary.
  const lower = prose.toLowerCase();
  for (const term of Object.keys(EN_BANNED)) {
    const re = new RegExp(`\\b${term.replace(/[- ]/g, "[- ]")}\\b`);
    if (re.test(lower)) {
      issues.push(`[anti-slop] banned "${term}" — cut or replace with a concrete spec.`);
    }
  }

  // Em-dash density per paragraph.
  for (const p of text.split(/\n\s*\n/).filter((x) => x.trim().length > 0)) {
    const wc = wordCount(stripMarkdown(p));
    if (wc < MIN_PARAGRAPH_WORDS_FOR_DASH_CHECK) continue;
    const dashes = (p.match(EM_DASH) || []).length;
    if (dashes > MAX_EM_DASH_PER_PARAGRAPH) {
      issues.push(`[STE] ${dashes} em-dashes in a ${wc}-word paragraph — keep at most ${MAX_EM_DASH_PER_PARAGRAPH}.`);
    }
  }

  return issues;
}

// Pure decision for hard-enforcement mode: returns the block reason when the
// write must be rejected, or null when it may proceed. Wired into the
// tool_call handler with the shipped MODE; exported so tests can exercise
// both modes without mutating the source constant.
export function buildBlockReason(
  filePath: string,
  content: string,
  mode: "warn" | "block" = "warn"
): string | null {
  if (mode !== "block") return null;
  if (!PROSE_GLOBS.test(filePath)) return null;
  if (content.length < 40) return null;

  const issues = checkEnglish(content);
  if (issues.length === 0) return null;

  const preview = issues.slice(0, 5).join(" | ");
  return `ste-lint (English mode: ASD-STE100) blocked this write: ${issues.length} violation(s): ${preview}. Fix the violations or disable the linter with disabledExtensions: ["ste-lint"].`;
}

// Shared input extraction for write/edit/multi_edit tool events.
// The tool_call and tool_result events MUST stay in lockstep here: if the
// input shape changes, both blocking and annotation read the same fields.
function extractWriteTarget(input: unknown): { filePath?: string; content?: string } {
  if (typeof input !== "object" || input === null) return {};
  const record = input as Record<string, unknown>;
  const filePath = (record.file_path as string) ?? (record.path as string);
  const content = record.content ?? record.new_text ?? record.newText ?? record.text;
  return { filePath, content: typeof content === "string" ? content : undefined };
}

export default function steLint(pi: ExtensionAPI) {
  const MODE: "warn" | "block" = "warn"; // <- flip to "block" for hard enforcement

  pi.on("tool_result", async (event) => {
    try {
      if (event.isError) return;
      const toolName = String(event.toolName ?? "");
      if (!["write", "edit", "multi_edit"].includes(toolName)) return;

      const { filePath, content } = extractWriteTarget(event.input);
      if (!filePath || !PROSE_GLOBS.test(filePath)) return;
      if (typeof content !== "string" || content.length < 40) return;

      const issues = checkEnglish(content);
      if (issues.length === 0) return;

      const header = `## ste-lint (English mode: ASD-STE100) — ${issues.length} issue(s)`;
      const body = issues.map((i) => `- ${i}`).join("\n");
      const footer = `\nDisable linter: add \`disabledExtensions: ["ste-lint"]\` to ~/.omp/agent/config.yml.`;
      const annotation = `\n\n---\n${header}\n${body}${footer}\n`;

      const newContent = (event.content ?? []).map((chunk) => {
        if (chunk.type === "text" && typeof chunk.text === "string") {
          return { ...chunk, text: chunk.text + annotation };
        }
        return chunk;
      });

      pi.sendMessage(
        {
          customType: "ste-lint",
          content: `${header}\n${body}`,
          display: true,
        },
        { triggerTurn: false }
      );

      return { content: newContent };
    } catch (err) {
      // Fail soft: a linter error must never break the write or the agent.
      console.error("[ste-lint] tool_result handler failed", err);
    }
  });

  pi.on("tool_call", (event) => {
    const toolName = String(event.toolName ?? "");
    if (!["write", "edit", "multi_edit"].includes(toolName)) return;

    const { filePath, content } = extractWriteTarget(event.input);
    if (typeof filePath !== "string" || typeof content !== "string") return;

    const reason = buildBlockReason(filePath, content, MODE);
    if (reason) return { block: true, reason };
  });
}
