# airspeak

<p align="center">
  <img src="docs/assets/mascot.png" alt="airspeak mascot — a cub in a leather aviator cap" width="160" />
</p>

The cure for AI slop is a 1986 aircraft manual: airspeak brings the mechanical writing discipline of ASD-STE100 to agent-written Markdown — a machine-checkable constraint set, not a word ban — enforced inside the write loop as an omp extension or a portable Agent Skill on Claude Code, Cursor, Copilot, Codex, and Gemini.

Lints READMEs, changelogs, release notes, runbooks, and API docs on every Markdown write and edit. English only, inspired by ASD-STE100 Issue 9 — a mechanical subset of the standard, not an STE compliance tool, no certification claim.

[![npm version](https://img.shields.io/npm/v/airspeak?logo=npm&color=cb3837)](https://www.npmjs.com/package/airspeak)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Free, open source (MIT), no hosted service — everything runs locally inside your agent.

## Contents

- [Why this exists](#why-this-exists)
- [What it does](#what-it-does)
- [Install](#install)
- [Known limitations](#known-limitations)
- [Why not vale or textlint?](#why-not-vale-or-textlint)
- [License](#license)

## Why this exists

This project started with a video: [The cure for AI slop is a 1986 aircraft manual](https://www.youtube.com/watch?v=uJblcC4lKYw) by [Vusal Ismayilov](https://www.youtube.com/@woosal1337). The claim in it stuck: the fix for AI-generated prose is not banning a few words. It is a controlled language: ASD-STE100, the writing standard built for aircraft mechanics in 1986. Every sentence must be unambiguous enough that a mistake costs a human life.

That framing is why the rules here are mechanical, not tasteful. Instead of "write better", the linter enforces a small set of checkable constraints. The rules check sentence length, one idea per sentence, banned semicolons, nominalizations, phrasal verbs, marketing vocabulary, contractions, missing "that", Latin abbreviations, gendered pronouns, and em-dash stacking. The ban list is a small component of that constraint set, not the pitch: slop, in README terms, is exactly what the rule table flags — marketing vocabulary, em-dashes, semicolons, nominalizations, phrasal verbs, the telltales of prose that reads like a press release. Those constraints make agent output predictable and reviewable through two mechanisms: the agent can anticipate the violations, so it writes fewer of them; and consistent output shape means smaller diffs and faster review. They also make it more readable for humans.

This is not an STE compliance tool. The goal is unambiguous, low-jargon English — the same goal STE was built for — not STE certification. The rules are a mechanical subset inspired by ASD-STE100 Issue 9, with agentic-clarity caps where the standard and agent output diverge.

The name is the lineage: airspeak is the plain, unambiguous English an aircraft manual is written in.

## What it does

The extension lints every Markdown write and edit, then appends a violation list to the tool result so the agent self-corrects on the next turn. The payoff: the agent fixes its own violations on the next write, output stays consistent and reviewable at speed, and you review less — a loop no CI linter can replicate. Default mode is warn: violations are reported and writes always succeed; a block mode exists for hard enforcement. Ten rule families, each carrying the anchor it descends from:

| Family | Label |
|---|---|
| Sentence length (descriptions ≤ 25 words, procedures ≤ 20) | [STE 6.3] / [STE 5.1] |
| Semicolons | [STE 8.1] |
| Nominalizations | [STE 3.7] |
| Phrasal verbs (with a replacement hint) | [STE 9.3] |
| Banned marketing vocabulary | [anti-slop] |
| Em-dash density (a style cap — STE allows the em-dash) | [style] |
| Contractions | [STE 4.2] |
| Missing "that" | [GR-1] |
| Latin abbreviations | [GR-6] |
| Gendered pronouns | [GR-7] |

### Before / after

Before — typical agent output:

> The API retries failed requests automatically, e.g. when the database is down. Make sure the retry loop doesn't spin forever; utilize a bounded queue instead, and don't log the same error twice.

The linter annotates the write:

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

"utilize" appears twice on purpose: it legitimately triggers two rule families at once, [STE 9.3] (phrasal verb — replace with "use") and [anti-slop] (banned vocabulary). On the next turn the agent rewrites the text to clear every violation, and the second write passes clean.

After — the corrected write passes clean:

> The API retries failed requests automatically, for example when the database is down. Make sure that the retry loop does not spin forever. Use a bounded queue and do not log the same error twice.

## Install

The extension and the skill install independently — the extension lints every write automatically, the skill carries the rule guidance agents follow when they write. The omp paths below deliver both; the per-harness rows deliver the skill only.

### omp (extension + skill)

Requires omp 16.4.4 or newer.

```sh
omp plugin marketplace add donrami/airspeak
omp plugin install airspeak@airspeak
```

or via npm / pi.dev (`pi install npm:airspeak` delivers extension + skill):

```sh
pi install npm:airspeak
```

| Harness | Discovers from | Install |
|---|---|---|
| Claude Code | `~/.claude/skills/` or `.claude/skills/` | `mkdir -p ~/.claude/skills/airspeak && cp plugin/skills/airspeak/SKILL.md ~/.claude/skills/airspeak/SKILL.md` |
| Cursor | `~/.cursor/skills/`, shared `~/.agents/skills/` | same copy command with `~/.cursor/skills/` |
| GitHub Copilot | `~/.copilot/skills/` or `.github/skills/` | `mkdir -p ~/.copilot/skills/airspeak && cp plugin/skills/airspeak/SKILL.md ~/.copilot/skills/airspeak/SKILL.md`; restart session |
| OpenAI Codex | `~/.codex/skills/`, repo-local `.agents/skills/` | copy command with `~/.codex/skills/`; invoke with `$airspeak` |
| Google Gemini CLI | `~/.gemini/skills/` or `.gemini/skills/` | `gemini skills install https://github.com/donrami/airspeak --path plugin/skills/airspeak --consent` |

- [Full README](plugin/README.md): install, configure, disable, uninstall, standards.
- [Changelog](plugin/CHANGELOG.md) · [Contributing guide](plugin/AGENTS.md)

### Any Agent-Skills agent
Copy `plugin/skills/airspeak/` (the folder containing `SKILL.md`) into the agent's skills directory. The skill follows the [Agent Skills specification](https://agentskills.io). Every harness listed above accepts the same file unchanged.

## Known limitations

- HTML comments and template boilerplate (for example Given/When/Then scaffolding) are counted as prose and can produce false positives.
- Code files, configs, and other non-prose files are never checked.
- The rules are a mechanical subset of the full standard — inspired by ASD-STE100 Issue 9, not STE certification.
- Disable without uninstalling: add `disabledExtensions: ["airspeak"]` to `~/.omp/agent/config.yml`. Uninstall: `omp plugin uninstall airspeak@airspeak`.

## Why not vale or textlint?

- No config surface: the rules ship fixed, there is nothing to tune or maintain.
- It runs inside the write loop, where the agent is already working — not as a CI step after the fact.
- Self-correction: the agent fixes its own violations on the next turn, a loop a CI linter cannot replicate.

## License

MIT. The rule semantics are inspired by ASD-STE100 Issue 9. No standard text is reproduced.
