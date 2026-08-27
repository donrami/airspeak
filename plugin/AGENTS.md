# AGENTS.md

Guidance for agents working on this repository.

## What this repo is

`ste-writing` is a writing-style lint addon for AI agents. The repo root is an omp marketplace (`.omp-plugin/marketplace.json`); the installable addon lives in `plugin/`.

## Layout

- `plugin/src/index.ts` — the lint extension. Pure check functions at module scope (exported and unit-tested); `steLint(pi)` is the default export the agent loads.
- `plugin/skills/ste-writing/SKILL.md` — the portable writing-style skill.
- `plugin/tests/` — rule tests, language/wiring tests, parity test, packaging (install lifecycle) test.
- `plugin/tests/fixtures/` — corpus.json (violating + conforming samples per check family) and baseline.json (captured issue lists).

## Rules of the repo

- **Parity is load-bearing.** `baseline.json` pins the exact issue lists for the fixture corpus. Any change to check behavior must update the baseline consciously: run `bun test` in `plugin/`, inspect failures, and if the new behavior is intended, regenerate `baseline.json` with the same script that produced it (importing `checkEnglish`/`checkGerman` over corpus.json — see git history) and document why in the changelog.
- **Zero runtime dependencies.** The linter is regex-only. Do not add a runtime dependency.
- **Fail soft.** A linter error must never break a write or the agent. Both event handlers are wrapped in try/catch; keep it that way.
- **Non-prose files are never linted.** `PROSE_GLOBS` gates everything.
- **Language routing.** German by path (`GERMAN_PATH`), else by text dominance (`detectGerman`), else English. Never run STE German; German mode follows 82079-1 + tekom.

## Testing

```sh
cd plugin
bun run typecheck
bun test
```

## Release process

See `CHANGELOG.md` and the release-workflow contract in `specs/001-publish-ste-addon/contracts/release-workflow.md`. Every release bumps the version in six places: both catalog files, `plugin/package.json`, `plugin/skills/ste-writing/SKILL.md` (`metadata.version`), the changelog, and the git tag.
