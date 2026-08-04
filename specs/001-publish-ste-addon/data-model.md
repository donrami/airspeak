# Data Model: Publish STE Writing Addon

Entities, fields, validation rules, and state transitions. All formats grounded in the omp marketplace documentation and installed plugin artifacts.

## 1. Marketplace Catalog

File: `.omp-plugin/marketplace.json` at repo root, with a `.claude-plugin/marketplace.json` copy for Claude Code compatibility (omp reads `.omp-plugin/` first, falls back to `.claude-plugin/`).

| Field | Type | Required | Rules |
|---|---|---|---|
| `$schema` | URL | yes | `https://anthropic.com/claude-code/marketplace.schema.json` |
| `name` | string | yes | Lowercase alphanumeric, hyphens, dots; start and end alphanumeric; max 64 chars. Value: `ste-writing`. |
| `owner.name` | string | yes | Maintainer name |
| `owner.url` | string | no | Maintainer URL |
| `metadata.description` | string | no | Marketplace description |
| `metadata.version` | string | no | Marketplace catalog version |
| `plugins` | array | yes | Plugin entries; one entry for `ste-writing` |

Plugin entry:

| Field | Required | Value for this feature |
|---|---|---|
| `name` | yes | `ste-writing` (same naming rules as marketplace name) |
| `source` | yes | `"./plugin"` (relative path resolved inside the marketplace root) |
| `description` | no | Short user-facing description |
| `version` | no, but REQUIRED here | `"1.0.0"` — enables upgrade comparison |
| `author` | no | `{ name }` |
| `homepage` / `repository` | no | Public repo URLs |
| `license` | no | `"MIT"` |
| `category` | no | `"productivity"` |
| `keywords` | no | Array of keywords |

Validation (from docs): invalid catalog JSON or missing required top-level fields rejects the catalog; an invalid plugin entry is logged and skipped without rejecting the rest.

## 2. Plugin Manifest (`plugin/package.json`)

| Field | Value | Purpose |
|---|---|---|
| `name` | `ste-writing` (or `@<owner>/ste-writing`) | npm package name; must be free on npm |
| `version` | `1.0.0` | SemVer; synced with catalog entry and git tag |
| `type` | `module` | ESM |
| `exports` | `./src/index.ts` | Entry resolution |
| `omp.extensions` | `["./src/index.ts"]` | omp extension declaration (proven by `omp-headroom`) |
| `peerDependencies` | `@oh-my-pi/pi-coding-agent: "^16.4.4 \|\| ^17.0.0"` | ExtensionAPI types at runtime |
| `devDependencies` | `typescript`, `@types/bun`, `@oh-my-pi/pi-coding-agent` | Build/typecheck only |
| `files` | `src`, `skills`, `README.md`, `LICENSE`, `CHANGELOG.md`, `AGENTS.md` | npm publish contents |
| `scripts.test` | `bun test tests/` | Rule + packaging tests |

## 3. Lint Extension (`plugin/src/index.ts`)

Contract: default export `(pi: ExtensionAPI) => void`.

- Event: `pi.on("tool_result", handler)`
- Skip rules: `event.isError` → return; tool not in `write|edit|multi_edit` → return.
- Path extraction: `input.file_path ?? input.path`; prose glob `\.(md|mdx|markdown)$`; no match → return.
- Content extraction: `input.content ?? new_text ?? newText ?? text`; length < 40 chars → return (too short to lint).
- Language: German if path matches `GERMAN_PATH` regex, else `detectGerman(content)` on the content; otherwise English.
- Output: append annotation block to the tool result text chunks; send a `customType: "ste-lint"` message with `display: true`, `triggerTurn: false`.
- Config surface (all source constants):
  - `MODE: "warn" | "block"` — implemented in this feature (currently a dead constant; see research R6).
  - Thresholds: `MAX_WORDS_DESCRIPTIVE = 25`, `MAX_WORDS_PROCEDURAL = 20`, `MAX_EM_DASH_PER_PARAGRAPH = 1`, `MIN_PARAGRAPH_WORDS_FOR_DASH_CHECK = 30`.
- Kill switch: `disabledExtensions: ["ste-lint"]` in `~/.omp/agent/config.yml` (documented in the output footer).
- Fail-soft: all checks are wrapped so an exception in linting never breaks the write; the hook returns only annotations.

## 4. Rule Sets

English (ASD-STE100 Issue 9, mechanical subset):

| Check | ID | Behavior |
|---|---|---|
| Sentence length | STE 6.3 / 5.1 | > 25 words (descriptive) / > 20 (procedural) |
| Em-dash per paragraph | — | > 1 per paragraph of ≥ 30 words |
| Banned vocabulary | — | Static banned-word list |
| Phrasal verbs | — | Static list |
| Nominalizations | — | Static list |
| Semicolons | STE 8.1 | Any `;` in prose |

German (DIN EN IEC/IEEE 82079-1:2019 + tekom regelbasiert):

| Check | ID | Behavior |
|---|---|---|
| Denglish calques | — | Banned calque list |
| Vorgangspassiv | tekom S 501 | `wird/werden/wurde/wurden + Partizip` without actor |
| Passiv mit Modalverb | tekom S 503 | `kann/muss/soll/will/möchte + Partizip + werden` |
| Compound hyphen | tekom B 104-110 | digit/unit/acronym + word without Bindestrich |
| Sentence length | 82079-1 minimalism | > 25 words |
| Floskeln | tekom L 112 | Filler phrases list |

Each check has a stable id, a detection rule, and a severity. Tests: violating fixture must fire the check; conforming fixture must stay silent.

## 5. Writing-Style Skill (`plugin/skills/ste-writing/SKILL.md`)

Frontmatter fields (Agent Skills spec): `name`, `description`, `license` (MIT), `compatibility` (omp, Claude Code, Cursor, GitHub Copilot), `metadata.version`, `en-spec` (ASD-STE100 Issue 9), `de-specs` (DIN 82079-1:2019, tekom), `globs`, `alwaysApply: false`, `hide: false`.

Language detection priority: (1) file path suffix/segment (`.de.md`, `/de/`, `/german/`, `/de_DE/`), (2) prompt language (German stopword dominance), (3) project convention (sibling files), (4) default English.

## 6. Release

A release is a git tag `v<X.Y.Z>` with: `CHANGELOG.md` entry, catalog plugin `version` updated, `package.json` `version` updated, and (for pi.dev) the npm package published. Upgrade detection (docs): semver must be newer; non-semver treated as changed when unequal.

## 7. Installation State (omp-managed, not authored by this feature)

`~/.omp/plugins/installed_plugins.json`: plugin id `ste-writing@ste-writing`, `installPath` under `~/.omp/plugins/cache/plugins/ste-writing___ste-writing___<version>/`, `version`, `installedAt`, `lastUpdated`, scope (`user` default, `project` optional).

State transitions: `not installed → installed (disabled) → enabled → upgraded (version change) → uninstalled`. Disabled installs do not shadow enabled installs of the same plugin at another scope.
