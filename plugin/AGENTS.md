# AGENTS.md

Guidance for agents working on this repository.

## What this repo is

`ste-writing` is a writing-style lint addon for AI agents. The repo root is an omp marketplace (`.omp-plugin/marketplace.json`); the installable addon lives in `plugin/`.

## Layout

- `plugin/src/index.ts` — the lint extension. Pure check functions at module scope (exported and unit-tested); `steLint(pi)` is the default export the agent loads.
- `plugin/skills/ste-writing/SKILL.md` — the portable Agent Skills document (frontmatter + body). Same content as the bundled skill.
- `plugin/tests/` — `bun test` runner. Fixtures live in `tests/fixtures/` (`corpus.json` for samples, `baseline.json` for the pinned issue lists).
- `specs/001-publish-ste-addon/` — design / data-model / task artifacts. Gitignored, not shipped.

## Conventions

- One language: English (ASD-STE100 Issue 9 mechanical subset).
- Rules are mechanical and machine-checkable. Word lists and string constants live at the top of `src/index.ts`.
- Thresholds are exported so tests can read them; do not hard-code duplicates.

## Testing

```sh
cd plugin
bun run typecheck
bun test
```

## Release process

See `CHANGELOG.md` and the release-workflow contract in `specs/001-publish-ste-addon/contracts/release-workflow.md`. Every release bumps the version in six places: both catalog files, `plugin/package.json`, `plugin/skills/ste-writing/SKILL.md` (`metadata.version`), the changelog, and the git tag.
