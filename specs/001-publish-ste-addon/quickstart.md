# Quickstart: Validate the Published STE Writing Addon

Run these scenarios to prove the feature works end to end. Each scenario is runnable and has an expected outcome. Details live in the contracts: [marketplace-catalog.md](contracts/marketplace-catalog.md), [plugin-manifest.md](contracts/plugin-manifest.md), [extension-api.md](contracts/extension-api.md), [release-workflow.md](contracts/release-workflow.md).

## Prerequisites

- `bun` ≥ 1.x (test runner; the omp agent runtime is Bun)
- `omp` ≥ 17 (plugin CLI)
- `git`
- `npm` (only for the pi.dev channel; needs `npm login`)

## Scenario 1: Rule tests pass

```sh
cd plugin
bun run typecheck
bun test
```

Expected: typecheck clean; every rule test green. Each check family has a violating fixture (must fire) and a conforming fixture (must stay silent). A parity test compares the packaged extension's issue list with a baseline captured from the current local extension on the same corpus (SC-002).

## Scenario 2: Live lint demo (warn mode)

In an omp session with the extension loaded, write a Markdown file containing a known violation, e.g. a 30-word sentence or the word `utilize`:

```
Write docs/example.md with the text: "The system utilizes a seamless and robust architecture for the purpose of facilitating seamless integration with external systems in a way that is both powerful and cutting edge."
```

Expected: the write succeeds and the tool result shows the annotation block (`## ste-lint ... — N issue(s)`) with rule ids, snippets, and the kill-switch footer. A `.ts` file with the same text produces no annotation.

Note: this repo's live config has `ste-lint` in `disabledExtensions`. Scenarios 3–7 use an isolated environment, so they do not depend on the live config.

## Scenario 3: End-to-end install from a local marketplace (no GitHub needed)

```sh
export STE_TEST_HOME=$(mktemp -d)
HOME=$STE_TEST_HOME omp plugin marketplace add /home/mainuser/Desktop/STE
HOME=$STE_TEST_HOME omp plugin install ste-writing@ste-writing
HOME=$STE_TEST_HOME omp plugin list --json
```

Expected: marketplace add succeeds (local directory source); install reports success; `plugin list` shows `ste-writing@ste-writing` with `version 1.0.0`. The installed copy is under `$STE_TEST_HOME/.omp/plugins/cache/plugins/ste-writing___ste-writing___1.0.0/`.

Fallback: if a fresh HOME triggers onboarding, run `HOME=$STE_TEST_HOME omp setup` once before the marketplace commands.

## Scenario 4: Enable and disable

```sh
HOME=$STE_TEST_HOME omp plugin disable ste-writing@ste-writing
# write a violating .md in a session under this HOME → no annotation, no errors
HOME=$STE_TEST_HOME omp plugin enable ste-writing@ste-writing
```

Expected: disabled → linting fully silent; enabled → annotation returns. The agent never errors in either state.

## Scenario 5: Upgrade path (SC-004)

1. Bump the version to `1.0.1` in both catalog files and `plugin/package.json`; add a CHANGELOG entry; commit; tag `v1.0.1`.
2. Refresh and upgrade:

```sh
HOME=$STE_TEST_HOME omp plugin marketplace update ste-writing
HOME=$STE_TEST_HOME omp plugin upgrade ste-writing@ste-writing
HOME=$STE_TEST_HOME omp plugin list --json
```

Expected: upgrade succeeds; `plugin list` shows `1.0.1`. A version-less catalog entry would be skipped by upgrades — the catalog MUST keep the `version` field.

## Scenario 6: Uninstall (FR-010)

```sh
HOME=$STE_TEST_HOME omp plugin uninstall ste-writing@ste-writing
HOME=$STE_TEST_HOME omp plugin list --json
```

Expected: uninstall succeeds; the plugin disappears from the list; the extension no longer runs; the agent works normally with no leftover hooks or errors.

## Scenario 7: Block mode (FR-005)

Set `MODE = "block"` in `plugin/src/index.ts`, reinstall, and write a `.md` file with a severe violation (e.g. a banned word).

Expected: the write is rejected with a clear message listing the violations and the kill switch (`disabledExtensions: ["ste-lint"]`). With the kill switch set, the same write succeeds with no lint feedback.

## Scenario 8: Public GitHub distribution (after the repo is pushed)

```sh
export STE_TEST_HOME=$(mktemp -d)
HOME=$STE_TEST_HOME omp plugin marketplace add <owner>/ste-writing
HOME=$STE_TEST_HOME omp plugin install ste-writing@ste-writing
HOME=$STE_TEST_HOME omp plugin list --json
```

Expected: same outcomes as Scenario 3, sourced from GitHub. This is the SC-001 acceptance: a fresh user installs in under 5 minutes following only the README.

## Scenario 9: pi.dev / npm channel (SC-007)

```sh
cd plugin
npm pack --dry-run        # verify contents: src, skills, README, LICENSE, CHANGELOG, AGENTS.md
npm publish               # requires npm auth; use --dry-run until ready
```

Expected: `npm pack --dry-run` lists only the intended files; after publish, `npm view ste-writing versions` shows the version and pi.dev/packages lists the package with the `pi install npm:ste-writing` command.

## Scenario 10: Skill portability (SC-006)

Install `plugin/skills/ste-writing/` into a second Agent-Skills-capable agent (Claude Code, Cursor, or GitHub Copilot) per that agent's skill install flow.

Expected: the agent loads the skill, applies the English rules to technical prose, and routes German file paths to German rules.
