# ste-writing

Automatic writing-style linting for Markdown prose, built for AI agents. English rules inspired by ASD-STE100 Issue 9 (Simplified Technical English).

The addon has two parts:

1. **Lint extension** (omp): checks every `*.md` / `*.mdx` file you write or edit and reports violations with rule references.
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

## Requirements

omp 16.4.4 or newer (see `package.json` peerDependencies).

## Install

### omp (marketplace)

```sh
omp plugin marketplace add donrami/ste-writing
omp plugin install ste-writing@ste-writing
```

Restart the session (or run `/reload-plugins`) so the extension loads.

### omp (npm / pi.dev)

```sh
pi install npm:ste-writing
```

### Other agents (skill only)

Install the `skills/ste-writing/` directory per your agent's skill flow:

- Claude Code: `/plugin marketplace add donrami/ste-writing` then `/plugin install ste-writing@ste-writing`, or copy `skills/ste-writing` into your skills directory.
- Cursor / GitHub Copilot: copy `skills/ste-writing/` into the agent's skills folder.

## How it works

After installation, the extension hooks every `write`, `edit`, and `multi_edit` of a Markdown file. When the text violates a rule, the tool result carries an annotation block:

```text
## ste-lint (English mode: ASD-STE100) — 2 issue(s)
- [STE 6.3] sentence has 37 words (cap 25): "The system utilizes a seamless..."
- [anti-slop] banned "utilize" — cut or replace with a concrete spec.
Disable linter: add `disabledExtensions: ["ste-lint"]` to ~/.omp/agent/config.yml.
```

Code files, configs, and other non-prose files are never checked.

Rule families:

- Sentence length (STE 6.3 descriptions ≤ 25 words, STE 5.1 procedures ≤ 20)
- Semicolons (STE 8.1)
- Nominalizations (STE 3.7)
- Phrasal verbs (STE 9.3)
- Banned marketing vocabulary (anti-slop)
- Em-dash density (style)
- Contractions (STE 4.2)
- Missing "that" (GR-1)
- Latin abbreviations (GR-6)
- Gendered pronouns (GR-7)

See the [before/after example in the root README](../README.md#what-it-does) for annotated output showing the contraction, missing-"that", and Latin-abbreviation checks in action.

## Configure

**Modes**. The shipped default is `warn`: violations are reported, writes always succeed. For hard enforcement, flip the `MODE` constant in `src/index.ts` to `"block"` and rebuild the package. In block mode, a write with violations is rejected before it executes. The error carries the violation list and the kill-switch hint.

**Kill switch**. To disable linting without uninstalling:

```yaml
# ~/.omp/agent/config.yml
disabledExtensions:
  - ste-lint
```

## Uninstall

```sh
omp plugin uninstall ste-writing@ste-writing
```

Removal is clean: the extension stops loading, the agent keeps working, and no hooks remain.

## Update

```sh
omp plugin marketplace update ste-writing
omp plugin upgrade ste-writing@ste-writing
```

## Standards and license

- ASD-STE100 Issue 9 (January 2025), Simplified Technical English. STE is an English-only controlled language. The rules here are inspired by it, not an implementation of the full standard.

This project is released under the MIT license. The standard above is referenced for rule semantics. No standard text is reproduced.

## Known limitations

- This is not an STE compliance tool. The checks are a mechanical subset of the standard, not full STE.
- The em-dash rule is a style cap for agent output, not an STE rule — STE itself allows the em-dash.
- The banned-vocabulary list is an anti-slop list for marketing adjectives, not a claim to enforce the STE dictionary.
- HTML comments and template boilerplate (for example Given/When/Then scaffolding) are counted as prose and can produce false positives.
- The mechanical rules are a subset of the full standard. The skill document carries the full rule guidance for agents.

## Contribute

See [AGENTS.md](AGENTS.md) for repo conventions and the release process in [CHANGELOG.md](CHANGELOG.md).
