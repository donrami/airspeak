---
description: "Task list for publishing the STE writing addon"
---

# Tasks: Publish STE Writing Addon

**Input**: Design documents `/specs/001-publish-ste-addon/`

**Prerequisites**: plan.md (required), spec.md (required user stories), research.md, data-model.md, contracts/ (5 contracts), quickstart.md

**Tests**: REQUIRED by spec FR-011 ("Every lint rule MUST be covered by an automated test") — rule tests, parity test, packaging smoke tests are part of the deliverable.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: run in parallel (different files, no dependencies)
- **[Story]**: user story the task belongs to (US1..US5)
- Include file paths in descriptions

## Path Conventions

Repo root = `/home/mainuser/Desktop/STE` (becomes the public GitHub marketplace repo). The installable addon lives in `plugin/`. Speckit machinery (`.specify/`, `.omp/`, `specs/`) stays local; `specs/` is committed as feature docs.

Source of truth for layout: `plan.md` → Project Structure; for contracts: `contracts/*.md`; for validation: `quickstart.md`.

<!--
  Tests are required by spec FR-011 and SC-002 (rule parity). The plan's test
  tree (4 files) is extended with parity.test.ts, helpers.ts, and fixtures/ to
  satisfy FR-011/SC-002; everything else follows the plan tree exactly.
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — repo, package skeleton, verbatim asset moves.

- [ ] T001 Initialize git repo at repo root and create `.gitignore` (ignore `.specify/`, `.omp/`, `node_modules/`, `*.tgz`, `dist/`, `.DS_Store`)
- [ ] T002 [P] Create repo skeleton directories: `.omp-plugin/`, `.claude-plugin/`, `plugin/src/`, `plugin/skills/ste-writing/`, `plugin/tests/fixtures/`
- [ ] T003 [P] Move the lint extension verbatim from `~/.omp/agent/extensions/ste-lint.ts` to `plugin/src/index.ts` (no content changes yet)
- [ ] T004 [P] Move the skill verbatim from `~/.agent/skills/ste-writing/SKILL.md` to `plugin/skills/ste-writing/SKILL.md` (no content changes yet)
- [ ] T005 [P] Create `plugin/package.json` exactly per `contracts/plugin-manifest.md` (name `ste-writing`, version `1.0.0`, `type: module`, `exports: ./src/index.ts`, `omp.extensions: ["./src/index.ts"]`, scripts test/typecheck, peerDependencies `@oh-my-pi/pi-coding-agent`, files allowlist)
- [ ] T006 [P] Create `plugin/tsconfig.json` (strict, ESM, `types: ["bun"]`, `noEmit: true`, include `src` and `tests`)
- [ ] T007 [P] Create `LICENSE` (MIT, maintainer name/year) at repo root and `plugin/LICENSE` (MIT, identical text)
- [ ] T008 Install dev dependencies in `plugin/` with `bun install` (typescript, `@types/bun`, `@oh-my-pi/pi-coding-agent`) — depends on T005

**Checkpoint**: repo initialized; extension and skill moved verbatim; manifest/tsconfig/LICENSE in place; `bun run typecheck` on the moved source passes.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Testable core — fixture corpus, parity baseline pinned against the UNMODIFIED extension, and behavior-identical export refactor. Must complete before any user story tests can exist.

- [ ] T009 [P] Create the fixture corpus in `plugin/tests/fixtures/` — one violating sample and one conforming sample per check family, both languages: EN (sentence length 6.3/5.1, em-dash, banned vocabulary, phrasal verbs, nominalizations, semicolons 8.1) and DE (calques, Vorgangspassiv S 501, Passiv modal S 503, compound hyphen B 104-110, sentence length, Floskeln L 112), plus a non-prose sample (`sample.ts`) and a too-short sample (`short.md`)
- [ ] T010 Capture the parity baseline BEFORE any source edits: run the moved-but-unmodified `plugin/src/index.ts` checks over the fixture corpus and record the exact issue lists to `plugin/tests/fixtures/baseline.json` — depends on T003, T009
- [ ] T011 Add `export` to the check functions and rule tables in `plugin/src/index.ts` (`checkEnglish`, `checkGerman`, `detectGerman`, `stripMarkdown`, `splitSentences`, `wordCount`, rule constants) — behavior-identical refactor, no logic changes — depends on T010
- [ ] T012 [P] Create `plugin/tests/helpers.ts` — fixture loader, issue-list comparator, and baseline loader used by all test files — depends on T009

**Checkpoint**: foundation ready — core is importable by tests, baseline.json pins current behavior. User story implementation can begin.

## Phase 3: User Story 1 - Maintainer publishes the addon publicly (Priority: P1)

🎯 **MVP**

**Goal**: The addon becomes a public, installable package: marketplace catalogs, docs, license, valid npm contents.

**Independent Test**: On a clean temp-HOME omp environment, `omp plugin marketplace add /home/mainuser/Desktop/STE` then `omp plugin install ste-writing@ste-writing` succeeds and `omp plugin list` shows the plugin at 1.0.0.

### Implementation User Story 1

- [ ] T013 [US1] Write `.omp-plugin/marketplace.json` exactly per `contracts/marketplace-catalog.md` (name `ste-writing`, owner placeholder, plugin entry name `ste-writing`, `source: "./plugin"`, `version: "1.0.0"`, license MIT, category productivity)
- [ ] T014 [US1] Write `.claude-plugin/marketplace.json` byte-identical to T013's catalog (Claude Code-compatible fallback) — depends on T013
- [ ] T015 [P] [US1] Write `plugin/README.md` — install (marketplace add + install + pi install npm), configure (warn/block), disable (disabledExtensions), uninstall, contribute, standards attribution (ASD-STE100, DIN 82079-1, tekom), known limitation: comments and template boilerplate are linted as prose (research R8)
- [ ] T016 [P] [US1] Write `plugin/CHANGELOG.md` (Keep a Changelog format, `## [1.0.0]` entry, date, links)
- [ ] T017 [P] [US1] Write `plugin/AGENTS.md` (repo conventions, rule list, parity requirement, release process pointer)
- [ ] T018 [P] [US1] Write root `README.md` (repo landing page: what the addon does, quick install, links to plugin/README.md, license)
- [ ] T019 [US1] Validate the catalogs: `jq empty` both files, then in a temp HOME run `omp plugin marketplace add /home/mainuser/Desktop/STE` and `omp plugin discover` shows `ste-writing` — depends on T013, T014
- [ ] T020 [US1] Validate npm contents: `cd plugin && npm pack --dry-run` lists only the `files` allowlist entries — depends on T005

**Checkpoint**: User Story 1 fully functional — a clean environment can install the addon from the local marketplace and see it in the plugin list (spec US1 acceptance 1).

## Phase 4: User Story 2 - User gets automatic writing-style checks in omp (Priority: P1)

**Goal**: After install, the addon automatically lints Markdown prose on write/edit, in warn mode by default and block mode when configured, with rule parity against the pre-package behavior.

**Independent Test**: Install the addon in a temp HOME, write a `.md` file with a known violation, and observe the annotation block with rule ids and the kill-switch footer; a `.ts` file with the same text produces no annotation.

### Tests User Story 2 (required by FR-011)

- [ ] T021 [P] [US2] Write English rule tests in `plugin/tests/rules.english.test.ts` — every EN check family fires on its violating fixture and stays silent on its conforming fixture (uses helpers from T012)
- [ ] T022 [P] [US2] Write German rule tests in `plugin/tests/rules.german.test.ts` — every DE check family fires on its violating fixture and stays silent on its conforming fixture
- [ ] T023 [P] [US2] Write language detection and filter tests in `plugin/tests/language.test.ts` — GERMAN_PATH routing, detectGerman fallback, PROSE_GLOBS (`.ts` never linted), tool filter (write/edit/multi_edit only), content minimum length, error guard
- [ ] T024 [P] [US2] Write the parity test in `plugin/tests/parity.test.ts` — packaged `checkEnglish`/`checkGerman` output over the fixture corpus equals `baseline.json` (SC-002)

### Implementation User Story 2

- [ ] T025 [US2] Implement block mode in `plugin/src/index.ts` — wire the `MODE` constant (research R6, contract extension-api.md): in `block` mode severe violations (sentence length, semicolons, banned words) reject the write with a clear message naming violations and the kill switch; verify the exact `tool_result` return semantics against the `@oh-my-pi/pi-coding-agent` ExtensionAPI types — depends on T011
- [ ] T026 [US2] Add the fail-soft guard in `plugin/src/index.ts` — wrap linting in try/catch so any exception logs and returns without breaking the write; verify malformed input (binary bytes, lone surrogates, huge single line) never throws — depends on T025
- [ ] T027 [US2] Write the packaging smoke test in `plugin/tests/packaging.test.ts` — temp HOME: `omp plugin marketplace add <repo root>`, `omp plugin install ste-writing@ste-writing`, `omp plugin list --json` shows 1.0.0, then an omp session writes a violating `.md` and the annotation block appears, and a `.ts` write stays silent (SC-003: zero config) — depends on T013, T026

**Checkpoint**: User Story 2 fully functional — installed plugin lints automatically with zero configuration; all rule tests and the parity test green.

## Phase 5: User Story 3 - User uses the skill on another agent (Priority: P2)

**Goal**: The portable skill installs and works on at least one Agent-Skills-capable agent besides omp (SC-006).

**Independent Test**: Install `plugin/skills/ste-writing/` into a second agent (Claude Code, Cursor, or GitHub Copilot); the agent loads the skill and applies the rules to technical prose it writes.

### Implementation User Story 3

- [ ] T028 [P] [US3] Validate the skill manifest — YAML frontmatter parses; `name`, `license: MIT`, `compatibility`, `metadata.version` (= 1.0.0, matches package.json), `globs`, `alwaysApply: false` all present per `contracts/skill-manifest.md` (write a small validation script or test in `plugin/tests/language.test.ts` additions)
- [ ] T029 [US3] Document the second-agent install steps in `plugin/README.md` (Claude Code / Cursor / GitHub Copilot skill install per `contracts/skill-manifest.md` acceptance 3) — depends on T015
- [ ] T030 [US3] Portability verification — install the skill in one non-omp agent, generate a technical document, confirm English rules apply and a German file path routes to German mode; record the outcome in `plugin/README.md` — depends on T028

**Checkpoint**: User Story 3 complete — the skill works outside omp, documented.

## Phase 6: User Story 4 - User receives updates (Priority: P2)

**Goal**: Versioned releases with a working upgrade path (SC-004): catalog version → marketplace update → upgrade → new version installed.

**Independent Test**: Install 1.0.0, bump to 1.0.1 in all version locations, `omp plugin marketplace update` + `omp plugin upgrade ste-writing@ste-writing`, and `omp plugin list` shows 1.0.1.

### Implementation User Story 4

- [ ] T031 [US4] Add the release process to `plugin/README.md` (or AGENTS.md) per `contracts/release-workflow.md` — the six synchronized version locations, semver policy, npm publish step, changelog discipline — depends on T015
- [ ] T032 [US4] Extend `plugin/tests/packaging.test.ts` with the upgrade scenario — bump catalog + package.json to 1.0.1, `omp plugin marketplace update ste-writing`, `omp plugin upgrade ste-writing@ste-writing`, assert `plugin list` shows 1.0.1 — depends on T027
- [ ] T033 [P] [US4] Verify the npm channel — `cd plugin && npm publish --dry-run` succeeds and `npm view ste-writing` (after a real publish, needs npm auth) shows the version; confirm pi.dev/packages listing path per research R4 — depends on T020

**Checkpoint**: User Story 4 complete — upgrades work end to end; release process documented.

## Phase 7: User Story 5 - User disables or removes the addon (Priority: P3)

**Goal**: Clean exit paths — disable without uninstalling, and uninstall with a fully functional agent afterward (FR-010).

**Independent Test**: Install, disable, write a `.md` → no linting and no errors; remove → plugin gone from the list, no leftover hooks.

### Implementation User Story 5

- [ ] T034 [US5] Extend `plugin/tests/packaging.test.ts` with the disable scenario — `omp plugin disable ste-writing@ste-writing` → write a violating `.md` → no annotation, no agent errors; `omp plugin enable` → annotation returns — depends on T032
- [ ] T035 [US5] Extend `plugin/tests/packaging.test.ts` with the uninstall scenario — `omp plugin uninstall ste-writing@ste-writing` → absent from `plugin list`, extension inert, no leftover hooks — depends on T034
- [ ] T036 [US5] Verify the kill switch — temp config with `disabledExtensions: ["ste-lint"]` → writes silent and succeed; confirm the footer text in `plugin/README.md` matches the real mechanism — depends on T015

**Checkpoint**: User Story 5 complete — disable, kill switch, and uninstall all verified clean.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates — full suite green, quickstart end to end, docs complete, release prepared.

- [ ] T037 [P] Run `cd plugin && bun run typecheck && bun test` — full suite green (all rule, parity, language, packaging tests)
- [ ] T038 [P] Run `quickstart.md` scenarios end to end in a temp HOME; fix any drift between documentation and observed behavior
- [ ] T039 [P] Documentation completeness pass per SC-008 — install, configure, disable, uninstall, and contribute sections all present and accurate in `plugin/README.md` and root `README.md`
- [ ] T040 Prepare the release — sync version `1.0.0` across all six locations (both catalogs, `plugin/package.json`, `plugin/skills/ste-writing/SKILL.md` `metadata.version`, `plugin/CHANGELOG.md`, git tag `v1.0.0`), single release commit — depends on T037, T038, T039
- [ ] T041 Publish publicly (requires the user's GitHub account and npm auth) — create the public repo `<owner>/ste-writing`, push, add the marketplace; verify SC-001 (clean install from GitHub) and SC-007 (pi.dev/packages listing) — depends on T040

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T002–T007 run in parallel; T008 waits on T005.
- **Foundational (Phase 2)**: Depends on Setup (T003). T009 is the first dependency; T010 MUST run before T011 (baseline pins the unmodified source); T012 runs in parallel with T010/T011.
- **User Stories (Phase 3+)**: Depend on Foundational (T011 exports, T012 helpers).
- **Polish (Phase 8)**: Depends on all user stories.

### User Story Dependencies

- **US1 (P1)**: Depends on Setup only. No dependency on other stories. MVP = Setup + Foundational + US1.
- **US2 (P1)**: Depends on Foundational; T027 (installed-environment test) integrates US1's catalog (T013) but US2 remains independently testable via unit tests (T021–T024).
- **US3 (P2)**: Depends on US1's README (T029); skill itself independent.
- **US4 (P2)**: Depends on US1 (README T031) and US2 (T032 extends T027's test file).
- **US5 (P3)**: Depends on US2 (T034/T035 extend T027's test file) and US1 (README T036).

### Within Each User Story

- US2: tests (T021–T024) before implementation (T025/T026); `src/index.ts` edits are serial (T011 → T025 → T026); `packaging.test.ts` grows serially (T027 → T032 → T034 → T035).
- US3/US4/US5: docs before verification; verification last.

### Parallel Opportunities

- Setup: T002–T007 together; T008 after.
- Foundational: T009 and T012 parallel; T010 then T011 serial (baseline order is load-bearing).
- US1: T013 → T014 serial (byte-identical); T015–T018 parallel; T019/T020 after.
- US2: T021–T024 all parallel (four test files, no shared writes); T025 then T026 serial on `src/index.ts`.
- US3: T028 parallel with US2 tests; T029 after T015; T030 last.
- US4: T033 parallel; T031 after T015; T032 serial on the shared test file.
- US5: T034 → T035 serial on the shared test file; T036 parallel.
- Polish: T037–T039 parallel; T040 then T041 serial.

## Parallel Example: User Story 2

```bash
# Launch all US2 test files together (four files, no shared writes):
Task: "Write English rule tests in plugin/tests/rules.english.test.ts"
Task: "Write German rule tests in plugin/tests/rules.german.test.ts"
Task: "Write language detection and filter tests in plugin/tests/language.test.ts"
Task: "Write the parity test in plugin/tests/parity.test.ts"
# Then, serially on src/index.ts:
Task: "Implement block mode in plugin/src/index.ts"
Task: "Add the fail-soft guard in plugin/src/index.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — baseline order: T009 → T010 → T011)
3. Complete Phase 3: User Story 1
4. **STOP VALIDATE**: install from the local marketplace in a temp HOME (T019) — the addon is installable and documented
5. Demo/publish path ready

### Incremental Delivery

1. Setup + Foundational → foundation ready (testable core, parity pinned)
2. US1 → installable package (MVP)
3. US2 → automatic linting with rule tests + block mode + packaging smoke (P1 pair complete — this is the shippable 1.0.0)
4. US3 → skill portability (P2)
5. US4 → upgrade path (P2)
6. US5 → disable/remove (P3)
7. Polish → release v1.0.0, GitHub push, pi.dev listing

Each story adds value without breaking previous stories; the parity test and packaging smoke tests guard every increment.

## Notes

- [P] tasks = different files, no dependencies. `src/index.ts` edits are serial (T011, T025, T026). `plugin/tests/packaging.test.ts` grows serially (T027, T032, T034, T035).
- [Story] labels map to spec.md user stories: US1 publish, US2 automatic linting, US3 portable skill, US4 updates, US5 disable/remove.
- Tests are REQUIRED here (spec FR-011, SC-002), not optional: the fixture corpus (T009) and parity baseline (T010) are the evidence for rule parity.
- T041 needs the user's GitHub account and npm credentials — the only external prerequisite (research.md open items).
- The ste-lint extension itself runs on every `*.md` write in this repo and will flag these planning documents; that output is expected and does not block work (warn mode).
