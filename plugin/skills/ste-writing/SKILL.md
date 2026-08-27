---
name: ste-writing
description: Write and review technical documentation — docs, READMEs, PR descriptions, error messages, runbooks, release notes, changelogs. English follows ASD-STE100 Issue 9. Use when the user writes or edits technical prose, API docs, or any document where clarity and brevity matter — even if they don't explicitly mention a style guide or simplification. Never use for marketing copy, essays, creative writing, or anything that needs a distinctive voice. These specs intentionally strip voice.
license: MIT
compatibility: omp, Claude Code, Cursor, GitHub Copilot, and any agent supporting the Agent Skills spec
metadata:
  version: "1.0.0"
  author: Rami Abu-Hamad
  en-spec: ASD-STE100 Issue 9 (Jan 2025)
globs:
  - "**/*.md"
  - "**/*.mdx"
  - "**/README*"
  - "**/CHANGELOG*"
  - "**/RELEASE*"
  - "**/errors/**"
  - "**/runbooks/**"
alwaysApply: false
hide: false
---

# ste-writing

Mechanical, machine-checkable prose rules for technical documentation. One language: English, per ASD-STE100 Issue 9.

## ASD-STE100 Issue 9 (53 rules, 9 sections)

The full spec is 434 pages; the mechanical subset below is what actually matters. Read more via `skill://ste-writing/references/ste-rules.md` if you need a deeper lookup.

### Mechanical subset (12 rules, all lintable)

| Rule | What it kills | Lint pattern |
|---|---|---|
| 1.1 | Only approved / technical-noun / technical-verb vocabulary | word-list check (not enforced by linter; rely on training) |
| **1.11** | Synonym rotation — one name per item | regex: same concept named 3+ ways within a paragraph |
| **2.1** | Multi-word nouns > 3 words | regex: noun phrases > 3 tokens without hyphens |
| 3.1 | Only approved verb forms | (not enforced; rely on training) |
| **3.4** | Stacked auxiliaries (`is important to note that this may help to improve`) | regex: 3+ consecutive helper verbs |
| **3.7** | Verb-for-action rule: `perform an analysis of` → `analyze` | regex: `(perform\|make\|do\|conduct\|provide\|carry out) (a\|an\|the)? (analysis\|determination\|assessment\|evaluation\|investigation\|review\|assistance\|support)` |
| **4.1** | Short, clear sentences | sentence-length check |
| **5.1** | ≤ 20 words/sentence in procedures | sentence-length check, strict mode |
| **6.3** | ≤ 25 words/sentence in descriptions | sentence-length check, default mode |
| **8.1** | No semicolons | regex: `;` in prose (exclude code blocks, URLs) |
| 8.4-8.7 | List items, no nested sublists | structural check (not enforced by linter) |
| 9-GR-5 | False friends (`actual` ≠ current in en-GB contexts) | word-list (not enforced) |

### Quick application checklist

Before returning any technical English prose:

1. Any sentence over 20 words (procedures) or 25 (descriptions)? Split.
2. Any semicolon? Replace with a period (or rewrite as two sentences).
3. Any nominalization (`perform an analysis of`, `make a determination of`, `provide assistance with`, `carry out an assessment of`)? Replace with the verb (`analyze`, `determine`, `help`, `assess`).
4. Same thing named two ways within a paragraph? Pick one.
5. Marketing adjectives? Cut: `seamless`, `robust`, `powerful`, `cutting-edge`, `effortless`, `world-class`, `next-generation`, `revolutionary`, `leverage` (verb), `utilize`, `facilitate`, `empower`, `holistic`, `seamlessly`, `meticulously`, `crucial`, `pivotal`, `paramount`, `game-changing`, `tapestry`, `delve`, `navigate the landscape of`.
6. Phrasal verbs (`spin up`, `reach out`, `dive into`, `kick off`, `circle back`, `deep dive`)? Replace with a precise verb (`start`, `contact`, `open`, `begin`, `return`, `examine`).
7. Em-dashes (`—`)? Allowed by STE; the linter warns if more than 1 per paragraph. Keep at most one where it earns the pause.

### Hard NO

- **Do not paste the full STE Issue 9 dictionary** (875 approved + ~1200 forbidden entries) into the prompt. It's copyrighted (ASD owns it; STEMG grants free use only to the listed categories of organizations) and burns ~8k tokens. The skill body covers the mechanical subset; the model knows STE-shaped prose from training.
- **Do not apply STE to voice work.** Marketing copy, essays, blog posts, narrative — running STE on these produces sterile text.

## Modes

The lint extension has two modes; the model always reads this skill regardless of mode.

- `warn` (default) — appends a violation list to the tool result so the model self-corrects on the next turn.
- `block` — rejects violating writes before they execute.

## Companion artifacts (for the full setup)

- **Linter**: `~/.omp/agent/extensions/ste-lint.ts` runs the mechanical rules above on every `write`/`edit` to `**/*.md*`. Default mode is `warn` (injects a list of violations into the tool result so the model self-corrects on the next turn); flip to `block` by editing the file or via `disabledExtensions: ["ste-lint"]` to disable entirely.
- **Pointer**: `~/.omp/agent/APPEND_SYSTEM.md` contains a one-line reminder to consult this skill.

## Kill switches

This skill is **off by default** — the model only reads it when it judges a doc-related task. To disable entirely:

- Delete `~/.agent/skills/ste-writing/SKILL.md`
- Add to `~/.omp/agent/config.yml`: `disabledExtensions: ["skill:ste-writing"]`
- Add to `ignoredSkills: ["ste-writing"]` in config
- Set `enableAgentsUser: false` to turn off the whole agents provider
- Tighten the `globs` list so it never matches your files
