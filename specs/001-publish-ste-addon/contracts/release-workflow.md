# Contract: Release Workflow

Versioned, reproducible releases with a working update path (SC-004).

## Version synchronization

Every release bumps all of these to the same SemVer:

1. `.omp-plugin/marketplace.json` → `plugins[0].version`
2. `.claude-plugin/marketplace.json` → `plugins[0].version`
3. `plugin/package.json` → `version`
4. `plugin/skills/ste-writing/SKILL.md` → `metadata.version`
5. `CHANGELOG.md` → new entry (Keep a Changelog format)
6. Git tag `v<version>` (e.g. `v1.0.0`)

## Release steps (maintainer)

1. Implement and merge changes; all tests pass (`bun test`, `bun run typecheck`).
2. Update the five version locations plus the changelog in one commit ("release vX.Y.Z").
3. Tag `vX.Y.Z` and push.
4. Marketplace channel: users run `omp plugin marketplace update` then `omp plugin upgrade ste-writing@ste-writing`. omp compares catalog `version` (semver must be newer) and reinstalls.
5. npm channel: `cd plugin && npm publish` (requires npm auth). pi.dev/packages lists the package automatically (npm catalog).
6. Verify on a clean machine: marketplace add → install → upgrade path → uninstall (quickstart scenarios).

## Semver policy

- MAJOR: breaking rule-set behavior, extension contract, or config surface.
- MINOR: new rules, new languages, new features (backward compatible).
- PATCH: rule fixes, message wording, docs, packaging fixes.

## Acceptance checks

1. After a PATCH bump, `omp plugin upgrade ste-writing@ste-writing` upgrades an installed v1.0.0 and `omp plugin list` shows the new version.
2. `npm view ste-writing versions` shows the published version.
3. pi.dev/packages search finds `ste-writing` with description and install command.
4. `CHANGELOG.md` has an entry for every tag from `git tag --list`.
