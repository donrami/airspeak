# airspeak

<p align="center">
  <img src="docs/assets/mascot.png" alt="airspeak mascot, a cub in a leather aviator cap" width="160" />
</p>

airspeak brings the mechanical writing discipline of ASD-STE100 to agent-written Markdown. It is a machine-checkable constraint set, not a word ban. It runs inside the write loop as an omp extension or a portable Agent Skill on Claude Code, Cursor, Copilot, Codex, and Gemini.

It lints READMEs, changelogs, release notes, runbooks, and API docs on every Markdown write and edit. English only, inspired by ASD-STE100 Issue 9.

[![npm version](https://img.shields.io/npm/v/airspeak?logo=npm&color=cb3837)](https://www.npmjs.com/package/airspeak)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI](https://github.com/donrami/airspeak/actions/workflows/ci.yml/badge.svg)](https://github.com/donrami/airspeak/actions/workflows/ci.yml)

Free, open source (MIT), no hosted service — everything runs locally inside your agent.

Status: actively maintained.

- [Why this exists](#why-this-exists)
- [What it does](#what-it-does)
- [Install](#install)
- [Known limitations](#known-limitations)
- [Why not vale or textlint?](#why-not-vale-or-textlint)
- [Support](#support)
- [License](#license)

## Why this exists

This project started with a video: [The cure for AI slop is a 1986 aircraft manual](https://www.youtube.com/watch?v=uJblcC4lKYw) by [Vusal Ismayilov](https://www.youtube.com/@woosal1337). The claim in it stuck: the fix for AI-generated prose is not banning a few words. It is a controlled language: ASD-STE100, the writing standard built for aircraft mechanics in 1986. Every sentence must be unambiguous enough that a mistake costs a human life.

That framing is why the rules here are mechanical, not tasteful. Instead of "write better", the linter enforces a small set of checkable constraints. Those constraints make agent output predictable and reviewable through two mechanisms. The agent can anticipate the violations, so it writes fewer of them. And consistent output shape means smaller diffs and faster review.

This is not an STE compliance tool. The goal is unambiguous, low-jargon English, the same goal STE was built for, not STE certification. The rules are a mechanical subset inspired by ASD-STE100 Issue 9, with agentic-clarity caps where the standard and agent output diverge.

The name is the lineage: airspeak is the plain, unambiguous English an aircraft manual is written in.

The extension lints every Markdown write and edit, then appends a violation list to the tool result. The agent fixes its own violations on the next write, so output stays consistent and reviewable at speed. Default mode is warn: violations are reported and writes always succeed. A block mode exists for hard enforcement: set `AIRSPEAK_MODE=block` to enable it; see [Configure](plugin/README.md#configure). Ten rule families, each carrying the anchor it descends from:

The annotation the linter appends:

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

Typical agent output, and the same text after airspeak corrected it. The right column passes with zero violations. The agent fixes its own text on the next turn.

| Agent output | After airspeak |
|---|---|
| Deploying the new service is a seamless process, but there are a few things to watch out for. First, the config file can't be edited while the service runs, so make sure you stop the service first — the restart procedure is simple — but don't skip it. Next, utilize the retry mechanism for transient failures, e.g. database timeouts; without it, the service may spin up again and crash. Finally, the operator should perform a review of the logs before he closes the ticket. | Deploying the new service takes a few steps. First, stop the service before you edit the config file. The file cannot be changed while the service runs. Next, use the retry mechanism for transient failures such as database timeouts. Without retries, the service can crash on startup. Finally, the operator should review the logs before closing the ticket. |

## Install

The extension and the skill install independently — the extension lints every write automatically, the skill carries the rule guidance agents follow when they write. The omp paths below deliver both, and the per-harness rows deliver the skill only.

### omp (extension + skill)

Requires omp 16.4.4 or newer.

```sh
omp plugin marketplace add donrami/airspeak
omp plugin install airspeak@airspeak
```

or via npm with [pi](https://pi.dev), the pi coding-agent runtime (`pi install npm:airspeak` delivers extension + skill):

```sh
pi install npm:airspeak
```

| Harness | Discovers from | Install |
|---|---|---|
| Claude Code | `~/.claude/skills/` or `.claude/skills/` | `mkdir -p ~/.claude/skills/airspeak && cp plugin/skills/airspeak/SKILL.md ~/.claude/skills/airspeak/SKILL.md` |
| Cursor | `~/.cursor/skills/`, shared `~/.agents/skills/` | `mkdir -p ~/.cursor/skills/airspeak && cp plugin/skills/airspeak/SKILL.md ~/.cursor/skills/airspeak/SKILL.md` |
| GitHub Copilot | `~/.copilot/skills/` or `.github/skills/` | `mkdir -p ~/.copilot/skills/airspeak && cp plugin/skills/airspeak/SKILL.md ~/.copilot/skills/airspeak/SKILL.md`; restart session |
| OpenAI Codex | `~/.codex/skills/`, repo-local `.agents/skills/` | `mkdir -p ~/.codex/skills/airspeak && cp plugin/skills/airspeak/SKILL.md ~/.codex/skills/airspeak/SKILL.md`; invoke with `$airspeak` |
| Google Gemini CLI | `~/.gemini/skills/` or `.gemini/skills/` | `gemini skills install https://github.com/donrami/airspeak --path plugin/skills/airspeak --consent` |

Skill-only installs are version-independent; only the omp extension pins a version. To update a skill install, re-copy `SKILL.md` from the repo after upgrading (marketplace and npm installs update themselves).

- [Full README](plugin/README.md): install, configure, disable, uninstall, standards.
- [Changelog](plugin/CHANGELOG.md) · [Repo conventions](plugin/AGENTS.md)

### Any Agent-Skills agent

Copy `plugin/skills/airspeak/` (the folder containing `SKILL.md`) into the agent's skills directory. The skill follows the [Agent Skills specification](https://agentskills.io). Every harness listed above accepts the same file unchanged.

Disable / uninstall: add `disabledExtensions: ["airspeak"]` to `~/.omp/agent/config.yml`; uninstall with `omp plugin uninstall airspeak@airspeak`.

## Known limitations

- HTML comments and template boilerplate (for example Given/When/Then scaffolding) are counted as prose and can produce false positives.
- Code files, configs, and other non-prose files are never checked.
- The rules are a mechanical subset inspired by ASD-STE100 Issue 9, not the full standard and not STE certification.

## Why not vale or textlint?

- No config surface: the rules ship fixed, there is nothing to tune or maintain.
- It runs inside the write loop, where the agent is already working, not as a CI step after the fact.
- Self-correction: the agent fixes its own violations on the next turn, a loop a CI linter cannot replicate.

## Support

Bugs and false positives: open an issue at https://github.com/donrami/airspeak/issues.

## License

MIT. The rule semantics are inspired by ASD-STE100 Issue 9. No standard text is reproduced.
