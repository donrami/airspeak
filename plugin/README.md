# airspeak

Automatic writing-style linting for Markdown prose, built for AI agents. English rules inspired by ASD-STE100 Issue 9 (Simplified Technical English).

The addon has two parts:

1. **Lint extension** (omp): checks every `*.md` / `*.mdx` / `*.markdown` file you write or edit (plus extensionless README/CHANGELOG/RELEASE/errors/runbooks) and reports violations with rule references.
2. **Writing-style skill** (any Agent-Skills-capable agent): the full rule guidance, installable in Claude Code, Cursor, GitHub Copilot, and others.

This is not an STE compliance tool. The rules are a mechanical subset inspired by ASD-STE100 Issue 9, chosen because they make agent output more deterministic and reviewable — not a claim of STE certification.

## Contents

- [Install](#install)
- [How it works](#how-it-works)
- [Configure](#configure)
- [Uninstall](#uninstall)
- [Update](#update)
- [Standards and license](#standards-and-license)
- [Known limitations](#known-limitations)
- [Contribute](#contribute)

## Install

Requires omp 16.4.4 or newer (see `package.json` peerDependencies).

### omp (marketplace)

```sh
omp plugin marketplace add donrami/airspeak
omp plugin install airspeak@airspeak
```

Restart the session (or run `/reload-plugins`) so the extension loads.

### omp (npm / pi.dev)

```sh
pi install npm:airspeak
# older omp versions: omp install npm:airspeak
```

### Other agents (skill only)

Per-harness install commands for Claude Code, Cursor, GitHub Copilot, OpenAI Codex, and Google Gemini CLI: see [Install in the root README](../README.md#install).

## How it works

After installation, the extension hooks every `write`, `edit`, and `multi_edit` of a Markdown file. When the text violates a rule, the tool result carries an annotation block:

```text
## airspeak (English mode: ASD-STE100) — 2 issue(s)
- [STE 6.3] sentence has 37 words (cap 25): "The system utilizes a seamless..."
- [anti-slop] banned "utilize" — cut or replace with a concrete spec.
Disable linter: add `disabledExtensions: ["airspeak"]` to ~/.omp/agent/config.yml.
```

Code files, configs, and other non-prose files are never checked.

The full rule-family table (with STE anchors) and a [before/after example](../README.md#what-it-does) live in the root README.

## Configure

**Modes**. The shipped default is `warn`: violations are reported, writes always succeed. For hard enforcement, flip the `MODE` constant in `src/index.ts` to `"block"` and rebuild the package. In block mode, a write with violations is rejected before it executes. The error carries the violation list and the kill-switch hint.

**Kill switch**. To disable linting without uninstalling:

```yaml
# ~/.omp/agent/config.yml
disabledExtensions:
  - airspeak
```

## Uninstall

```sh
omp plugin uninstall airspeak@airspeak
```

Removal is clean: the extension stops loading, the agent keeps working, and no hooks remain.

## Update

```sh
omp plugin marketplace update airspeak
omp plugin upgrade airspeak@airspeak
```

## Standards and license

- ASD-STE100 Issue 9 (January 2025), Simplified Technical English. STE is an English-only controlled language.

This project is released under the MIT license. The standard above is referenced for rule semantics. No standard text is reproduced.

## Known limitations

- The em-dash rule is a style cap for agent output, not an STE rule — STE itself allows the em-dash.
- The banned-vocabulary list is an anti-slop list for marketing adjectives, not a claim to enforce the STE dictionary.
- HTML comments and template boilerplate (for example Given/When/Then scaffolding) are counted as prose and can produce false positives.
- The mechanical rules are a subset of the full standard. The skill document carries the full rule guidance for agents.

## Contribute

See [AGENTS.md](AGENTS.md) for repo conventions and the release process in [CHANGELOG.md](CHANGELOG.md).
