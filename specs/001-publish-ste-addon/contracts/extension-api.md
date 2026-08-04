# Contract: Extension API (`plugin/src/index.ts`)

The extension is the mechanical linter. It is moved verbatim from `~/.omp/agent/extensions/ste-lint.ts` with one change: `MODE` becomes functional (see research R6).

## Module shape

- Default export: `(pi: ExtensionAPI) => void` — registered by omp as an extension module.
- No named exports required (helpers may stay private).
- Zero runtime dependencies; regex-only checks.

## Lifecycle hooks

`pi.on("tool_result", handler)`:

| Step | Rule |
|---|---|
| Error guard | `event.isError` → return; never lint failed results |
| Tool filter | tool name in `write` \| `edit` \| `multi_edit` only |
| Path | `input.file_path ?? input.path`; MUST match `\.(md\|mdx\|markdown)$` (case-insensitive) |
| Content | `input.content ?? new_text ?? newText ?? text`; length ≥ 40 chars |
| Language | path matches `GERMAN_PATH` → German; else `detectGerman(content)` → German; else English |
| Lint | run the matching rule set over stripped prose and raw text |
| Output | append the annotation block to the tool result text chunks + send `customType: "ste-lint"` message (`display: true`, `triggerTurn: false`) |

## Violation report format

```text
## ste-lint (English mode: ASD-STE100) — N issue(s)
- [STE 6.3] sentence has 37 words (cap 25): "<snippet>"
- [STE 8.1] 3 semicolon(s) in prose — STE bans semicolons. Replace with period or split.
```

German mode header: `## ste-lint (German mode: DIN 82079-1 + tekom) — N issue(s)`.

Rules:

- Every issue: `[<rule id>] <message> ("<snippet>" when applicable)`.
- Header reports mode + count.
- Zero issues → no annotation block, no message.
- Footer (when issues exist): `Disable linter: add \`disabledExtensions: ["ste-lint"]\` to ~/.omp/agent/config.yml.`

## Modes (FR-005 — implemented in this feature)

| Mode | Behavior |
|---|---|
| `warn` (default) | Append annotation block; the write always succeeds |
| `block` | Severe violations (sentence length, semicolons, banned words) reject the write with a clear message naming the violations and the kill switch |

Block semantics are implemented via the `tool_result` return shape; the exact mechanism is verified against the `ExtensionAPI` types during implementation. The annotation block stays the primary feedback in both modes.

## Configuration surface (source constants)

- `MODE: "warn" | "block"`
- `MAX_WORDS_DESCRIPTIVE = 25`, `MAX_WORDS_PROCEDURAL = 20`
- `MAX_EM_DASH_PER_PARAGRAPH = 1`, `MIN_PARAGRAPH_WORDS_FOR_DASH_CHECK = 30`
- Kill switch: `disabledExtensions: ["ste-lint"]` in `~/.omp/agent/config.yml` (agent-managed, documented in the footer)

## Fail-soft guarantee

- An exception anywhere in the handler MUST NOT break the write or the agent: wrap linting in try/catch, log, return.
- Non-prose files are never inspected.
- No file system access, no network, no state.

## Acceptance checks

1. Write a `.md` file with a known violation → annotation block appears; write succeeds (warn mode).
2. Write a `.ts` file with the same text → no annotation.
3. Set `MODE = "block"` → write of a file with a severe violation is rejected with the violation list.
4. Disable via `disabledExtensions` → no annotation, no errors.
5. Same fixture corpus → identical issue list as the current local extension (SC-002 parity).
