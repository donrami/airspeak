# Research: Publish STE Writing Addon

Phase 0 output for `/speckit.plan`. Every decision grounded in a primary source: the official omp marketplace documentation (`can1357/oh-my-pi/docs/marketplace.md`), installed plugin artifacts on this machine, live CLI behavior, and the pi.dev package catalog.

## R1: Distribution channel

- **Decision**: Publish as a GitHub-hosted omp marketplace. Catalog at `.omp-plugin/marketplace.json` (preferred location), with a `.claude-plugin/marketplace.json` copy for Claude Code compatibility.
- **Rationale**: Official docs: "A marketplace is a Git repository (or local directory) containing a catalog file at `.omp-plugin/marketplace.json` (preferred) or `.claude-plugin/marketplace.json` (Claude Code-compatible fallback)". This matches how the installed addons on this machine are distributed (`ponytail` from `DietrichGebert/ponytail`, `headroom` from `chopratejas/headroom`, cached under `~/.omp/plugins/cache/marketplaces/`).
- **Alternatives considered**: `pi install git:<repo>` installs extension sources but bypasses the plugin lifecycle (scoped enable/disable, versioned upgrades, marketplace registry); local-only distribution contradicts the feature purpose.

## R2: Install and management command flow

- **Decision**: Document and validate exactly these commands (verified live):
  - `omp plugin marketplace add <owner>/ste-writing`
  - `omp plugin install ste-writing@ste-writing`
  - `omp plugin list` | `omp plugin enable|disable ste-writing@ste-writing` | `omp plugin upgrade ste-writing@ste-writing` | `omp plugin uninstall ste-writing@ste-writing`
  - In-session equivalents: `/marketplace add <source>`, `/marketplace install <name>@<marketplace>`, `/reload-plugins`.
- **Rationale**: Live-verified on this machine: `omp plugin marketplace` lists configured marketplaces; `omp plugin marketplace add` usage is `add <source>`; `omp plugin list --json` shows installed plugins with versions. Official docs confirm CLI equivalents and the `name@marketplace` plugin ID scheme.
- **Alternatives considered**: `pi install` (npm/git sources) — a different surface; retained only as the npm channel (R4).

## R3: Extension packaging contract

- **Decision**: Ship TypeScript source directly. Declare the entry via `package.json` `"omp": { "extensions": ["./src/index.ts"] }`.
- **Rationale**: Grounded in the installed `omp-headroom` npm plugin, which loads `./src/index.ts` as raw TypeScript: `{"omp": {"extensions": ["./src/index.ts"]}, "exports": "./src/index.ts", "peerDependencies": {"@oh-my-pi/pi-coding-agent": "^16.4.4 || ^17.0.0"}}`. The agent runs on Bun, which executes TS natively; the local `ste-lint.ts` is already loaded as raw `.ts` from `~/.omp/agent/extensions/`. Marketplace docs confirm: "Marketplace installs also load extension modules declared by `package.json` `omp.extensions`". No build step, no bundler.
- **Alternatives considered**: Compile to ESM JS (ponytail's `pi-extension/index.js`) — extra build step with no benefit on Bun; a bundler — rejected, zero runtime deps.

## R4: pi.dev listing

- **Decision**: Publish the plugin directory as an npm package (`ste-writing`, or `@<owner>/ste-writing` if the bare name is taken; checked at publish time). pi.dev/packages is the npm package catalog: "Extensions, skills, prompt templates, and themes published to npm. Install with `pi install npm:<package>`" (fetched live). Listing on pi.dev is automatic once the package is on npm. `@dietrichgebert/ponytail` is listed there under the same pattern.
- **Rationale**: SC-007 requires pi.dev discoverability; the pi.dev catalog only lists npm packages. One `package.json` serves both channels: the marketplace catalog points at `./plugin`, and `npm publish` from `plugin/` produces the pi.dev package.
- **Alternatives considered**: GitHub-only — fails FR-012/SC-007.

## R5: Versioning and updates

- **Decision**: SemVer. Version lives in three synchronized places: catalog plugin entry `version`, `package.json` `version`, and git tag `v1.0.0`. The catalog entry MUST declare `version` (headroom does; ponytail does not — version-less entries cannot be upgrade-compared).
- **Rationale**: Official docs: "Upgrading all plugins compares only catalog entries that declare `version`. Semver versions must be newer". Installed evidence: `installed_plugins.json` records per-plugin `version`, `installedAt`, `lastUpdated`.
- **Alternatives considered**: Version-less catalog — breaks the SC-004 upgrade path.

## R6: Block-mode gap (FR-005)

- **Decision**: Implement the `MODE` behavior. The current extension declares `MODE: "warn" | "block"` but never uses it (`void MODE`) — the handler always appends warnings and never blocks a write. Wire block mode: in `block` mode, severe violations must reject the write with a clear message. The exact `tool_result` return semantics for blocking are verified against the `ExtensionAPI` types during implementation; the documented kill switch (`disabledExtensions: ["ste-lint"]`) remains the escape hatch.
- **Rationale**: FR-005 and acceptance scenario 2.5 require hard enforcement. Shipping a dead constant would not satisfy the spec.
- **Alternatives considered**: Drop block mode and ship warn-only — violates FR-005.

## R7: Behavioral parity (SC-002)

- **Decision**: Move `ste-lint.ts` and `SKILL.md` verbatim; no rule changes in this feature. `bun test` pins current behavior: each check family gets a violating fixture (must fire) and a conforming fixture (must stay silent). A parity test asserts the packaged extension produces the identical issue list as a baseline captured from the current local extension on the same corpus.
- **Rationale**: SC-002 (100% rule parity) and FR-011 (per-rule automated tests). A verbatim move preserves parity by construction; tests prove it.
- **Alternatives considered**: Refactoring rules while packaging — scope creep, regression risk.

## R8: Known linter precision limitation

- **Decision**: Document as a known limitation in README and AGENTS.md; do not fix in this feature. The linter counts HTML comments and template boilerplate (Given/When/Then scaffolding) as prose — observed while authoring `spec.md` (27 warnings, most from template comments).
- **Rationale**: Spec scope is publication, not rule precision (spec Assumptions: new rule coverage is future work). Fixing it now would break parity testing and expand scope.
- **Alternatives considered**: Skip-comment logic now — scope creep, parity risk.

## Open items (no design impact)

- GitHub account and repo name for the public repository (`<owner>/ste-writing`) — provided by the user at publish time; local-directory marketplace sources (`omp plugin marketplace add ./`) enable full validation before GitHub exists.
- npm package name availability (`ste-writing` vs `@<owner>/ste-writing`) — checked at publish time.
