# Contract: Skill Manifest (`plugin/skills/ste-writing/SKILL.md`)

The portable writing-style skill. Moved verbatim from `~/.agent/skills/ste-writing/SKILL.md`.

## Frontmatter (Agent Skills spec)

| Field | Value | Rule |
|---|---|---|
| `name` | `ste-writing` | Matches package and plugin names |
| `description` | One-paragraph description of what the skill does | Must trigger on doc-writing tasks; must state English and German rule sets |
| `license` | `MIT` | Matches LICENSE file |
| `compatibility` | `omp, Claude Code, Cursor, GitHub Copilot` | Any agent supporting Agent Skills |
| `metadata.version` | `1.0.0` | SemVer; synced with package/catalog/tag |
| `en-spec` | `ASD-STE100 Issue 9 (Jan 2025)` | Standards attribution (FR-013) |
| `de-specs` | `DIN EN IEC/IEEE 82079-1:2019 Edition 2; tekom "Deutsch für Technische Kommunikation – Regelbasiertes Schreiben"` | Standards attribution (FR-013) |
| `globs` | `**/*.md`, `**/*.mdx`, `**/README*`, `**/CHANGELOG*`, `**/RELEASE*`, `**/errors/**`, `**/runbooks/**` | Prose files only |
| `alwaysApply` | `false` | Skill loads on matching tasks, not always |
| `hide` | `false` | Visible to users |

## Content invariants

- Language detection priority: file path → prompt language → project convention → default English.
- English mode: ASD-STE100 Issue 9 rules; German mode: DIN 82079-1 + tekom rules; never run STE German (English-only standard).
- No marketing copy guidance; the skill explicitly refuses voice work.
- Kill-switch documentation stays accurate (delete file, `disabledExtensions`, `ignoredSkills`).

## Acceptance checks

1. Frontmatter parses (YAML valid; required fields present).
2. `metadata.version` equals `package.json` version and catalog version.
3. The skill loads in omp (`--skills=ste-writing` flag or skills discovery) and in at least one other Agent-Skills agent (manual verification per SC-006).
4. A German file path (`de/foo.md`) routes to German mode; an English path routes to English mode.
