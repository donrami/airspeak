# airspeak

The cure for AI slop is a 1986 aircraft manual: this addon brings the mechanical writing discipline of ASD-STE100 to agent-written Markdown — a machine-checkable constraint set, not a word ban — enforced inside the write loop. It comes in two parts:

1. **Lint extension** (omp): checks every `*.md` / `*.mdx` / `*.markdown` file you write or edit (plus extensionless README/CHANGELOG/RELEASE/errors/runbooks) and reports violations with rule references.
2. **Writing-style skill** (any Agent-Skills-capable agent): the full rule guidance, installable in Claude Code, Cursor, GitHub Copilot, OpenAI Codex, and Google Gemini CLI.

This is not an STE compliance tool. The goal is unambiguous, low-jargon English — the same goal STE was built for — not STE certification. The rules are a mechanical subset inspired by ASD-STE100 Issue 9, chosen because they make agent output more deterministic and reviewable. No certification claim is made.

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

After installation, the extension hooks every `write`, `edit`, and `multi_edit` of a Markdown file. When the text violates a rule, the tool result carries an annotation block appended so the agent self-corrects on the next turn:

```text
## airspeak (English mode: ASD-STE100) — 7 issue(s)
- [STE 8.1] 1 semicolon(s) in prose — STE bans semicolons. Replace with period or split.
- [STE 9.3] phrasal verb "utilize" — use "use".
- [anti-slop] banned "utilize" — cut or replace with a concrete spec.
- [STE 4.2] contraction "doesn't" — write "does not".
- [STE 4.2] contraction "don't" — write "do not".
- [GR-1] add "that": "make sure that …".
- [GR-6] Latin abbreviation "e.g." — use "for example".
Disable linter: add `disabledExtensions: ["airspeak"]` to ~/.omp/agent/config.yml.
```

"utilize" appears twice on purpose: it legitimately triggers two rule families at once, [STE 9.3] (phrasal verb — replace with "use") and [anti-slop] (banned vocabulary). On the next turn the agent rewrites the text to clear every violation, and the second write passes clean. Output stays consistent and reviewable at speed, and you review less — a loop no CI linter can replicate.

Code files, configs, and other non-prose files are never checked.

The full rule-family table (with STE anchors) and a [before/after example](../README.md#what-it-does) live in the root README.

## Configure

**Modes**. The default mode is `warn`: violations are reported, writes always succeed. For hard enforcement, flip the `MODE` constant in `src/index.ts` to `"block"` and rebuild the package. In block mode, a write with violations is rejected before it executes. The error carries the violation list and the kill-switch hint.

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
