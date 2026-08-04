# Implementation Plan: Publish STE Writing Addon

**Branch**: `001-publish-ste-addon` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-publish-ste-addon/spec.md`

## Summary

Ship the existing STE writing-style addon as a public, installable package with two distribution channels and one artifact:

1. **omp marketplace** (primary): the repo becomes a GitHub marketplace with a catalog at `.omp-plugin/marketplace.json`. Users run `omp plugin marketplace add <owner>/ste-writing` then `omp plugin install ste-writing@ste-writing`.
2. **npm / pi.dev** (secondary): the plugin's `package.json` (declaring `omp.extensions`) is published to npm, installable via `pi install npm:ste-writing` and listed automatically on pi.dev/packages.

The plugin contains the lint extension (moved verbatim from `~/.omp/agent/extensions/ste-lint.ts`), the portable skill (`~/.agent/skills/ste-writing/SKILL.md`), per-rule tests, and docs. Two plan-time findings shape the work:

- `MODE` ("block") is a dead constant in the current extension — FR-005 requires implementing it, not just packaging it (research R6).
- The linter flags HTML comments and template boilerplate as prose — documented as a known limitation, not fixed here (research R8).

Decisions are grounded in primary sources: the official omp marketplace documentation, the installed `omp-headroom` and `ponytail` plugins, live CLI behavior, and the pi.dev package catalog. See [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5.x, ESM (`"type": "module"`). The extension ships as raw `.ts` — no build step (Bun executes TS natively; proven by `omp-headroom` shipping `./src/index.ts`).

**Primary Dependencies**:
- Runtime: none — the linter is regex-only, zero runtime dependencies (preserved).
- Peer: `@oh-my-pi/pi-coding-agent` (ExtensionAPI types; peerDependency `^16.4.4 || ^17.0.0` like `omp-headroom`).
- Dev: `typescript`, `@types/bun`, `@oh-my-pi/pi-coding-agent`.

**Storage**: None. The linter is stateless; no persistence, no file writes, no network.

**Testing**: `bun test` (`plugin/tests/`): per-rule fixtures (violating fires / conforming silent) for every EN and DE check, language-detection tests, glob-filter tests, a parity test (packaged extension output == baseline captured from the current local extension), and packaging smoke tests (install/enable/disable/upgrade/uninstall in an isolated temp HOME).

**Target Platform**: omp ≥ 17 (agent runtime). The skill additionally targets any Agent-Skills-compatible agent (Claude Code, Cursor, GitHub Copilot).

**Project Type**: Plugin/addon package (marketplace plugin + npm extension package + portable skill) in a single public repo.

**Performance Goals**: lint completes in < 1 s on a 100 KB document; no measurable write delay vs. the current local extension; no hot-path allocation changes.

**Constraints**:
- Zero runtime dependencies.
- Rule parity: every rule that fires locally MUST fire from the packaged version (SC-002).
- Fail soft: a linter exception never breaks a write or the agent.
- Non-prose files are never linted.
- MIT license; standards attribution (ASD-STE100, DIN EN IEC/IEEE 82079-1, tekom) in skill frontmatter and README.
- Catalog must satisfy omp validation: required fields, naming rules (lowercase alnum + hyphen/dot, ≤ 64 chars), plugin entry `version` present.
- Names: marketplace `ste-writing`, plugin `ste-writing`, plugin ID `ste-writing@ste-writing`, npm `ste-writing` (fallback `@<owner>/ste-writing`).

**Scale/Scope**: one addon, two rule sets (EN ~6 check families, DE ~6 check families as implemented); target users are individual developers and documentation teams; the repo adds ~300 lines of tests around a ~260-line extension.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is the unfilled template — every principle is a `[PRINCIPLE_N_NAME]` placeholder, no version, not ratified. There are no binding principles, hence no violations to justify and no gates to enforce.

**Verdict (pre-research): PASS** — nothing to evaluate.
**Verdict (post-design): PASS** — Phase 0/1 introduced no constitution-relevant constraints (no new projects, no storage, no new dependencies beyond types).

## Project Structure

### Documentation (this feature)

```text
specs/001-publish-ste-addon/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── marketplace-catalog.md
│   ├── plugin-manifest.md
│   ├── extension-api.md
│   ├── skill-manifest.md
│   └── release-workflow.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/home/mainuser/Desktop/STE            # public repo root (git init; .specify/ and .omp/ gitignored)
├── .omp-plugin/
│   └── marketplace.json              # omp marketplace catalog (primary)
├── .claude-plugin/
│   └── marketplace.json              # Claude Code-compatible catalog (byte-identical)
├── .gitignore                        # .specify/, .omp/, node_modules/, *.tgz
├── plugin/                           # the installable addon (catalog source: "./plugin")
│   ├── package.json                  # name ste-writing; omp.extensions: ["./src/index.ts"]
│   ├── src/
│   │   └── index.ts                  # ste-lint extension (moved from ~/.omp/agent/extensions/ste-lint.ts)
│   ├── skills/
│   │   └── ste-writing/
│   │       └── SKILL.md              # portable skill (moved from ~/.agent/skills/ste-writing/SKILL.md)
│   ├── tests/
│   │   ├── rules.english.test.ts     # per-rule fixtures (EN)
│   │   ├── rules.german.test.ts      # per-rule fixtures (DE)
│   │   ├── language.test.ts          # language detection + glob filtering
│   │   └── packaging.test.ts         # temp-HOME install lifecycle smoke tests
│   ├── README.md                     # install, configure, disable, uninstall, contribute
│   ├── LICENSE                       # MIT
│   ├── CHANGELOG.md                  # Keep a Changelog format
│   └── AGENTS.md                     # guidance for agents working on this repo
└── specs/                            # speckit feature docs (committed)
```

**Structure Decision**: repo root = marketplace + plugin, one public repo, following the proven single-repo pattern of `DietrichGebert/ponytail`. The plugin is a subdirectory (`"source": "./plugin"`) so the shipped artifact is self-contained and the root stays the catalog (headroom uses the same layout with `metadata.pluginRoot`). Speckit machinery (`.specify/`, `.omp/`) is local tooling and gets gitignored; `specs/` is committed as feature documentation. The extension ships as TypeScript source with no build step — the `omp.extensions` contract proven by `omp-headroom`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. Table intentionally empty.
