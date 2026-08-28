# ste-writing

Automatic writing-style linting for Markdown prose, built for AI agents. English rules inspired by ASD-STE100 Issue 9 (Simplified Technical English).

## Contents

- [Why this exists](#why-this-exists)
- [What it does](#what-it-does)
- [Install](#install)
- [Documentation](#documentation)
- [License](#license)

## Why this exists

This project started with a video: [The cure for AI slop is a 1986 aircraft manual](https://www.youtube.com/watch?v=uJblcC4lKYw) by [Vusal Ismayilov](https://www.youtube.com/@woosal1337). The claim in it stuck: the fix for AI-generated prose is not banning a few words. It is a controlled language: ASD-STE100, the writing standard built for aircraft mechanics in 1986. Every sentence must be unambiguous enough that a mistake costs a human life.

That framing is why the rules here are mechanical, not tasteful. Instead of "write better", the linter enforces a small set of checkable constraints. The rules check sentence length, one idea per sentence, banned semicolons, nominalizations, phrasal verbs, marketing vocabulary, contractions, missing "that", Latin abbreviations, gendered pronouns, and em-dash stacking. Those constraints make agent output predictable and reviewable. They also make it more readable for humans.

This is not an STE compliance tool. The goal is unambiguous, low-jargon English — the same goal STE was built for — not STE certification. The rules are a mechanical subset inspired by ASD-STE100 Issue 9, with agentic-clarity caps where the standard and agent output diverge.

## What it does

The extension lints every Markdown write and edit, then appends a violation list to the tool result so the agent self-corrects on the next turn. Ten rule families, each carrying the anchor it descends from:

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
## ste-lint (English mode: ASD-STE100) — 7 issue(s)
- [STE 8.1] 1 semicolon(s) in prose — STE bans semicolons. Replace with period or split.
- [STE 9.3] phrasal verb "utilize" — use "use".
- [anti-slop] banned "utilize" — cut or replace with a concrete spec.
- [STE 4.2] contraction "doesn't" — write "does not".
- [STE 4.2] contraction "don't" — write "do not".
- [GR-1] add "that": "make sure that …".
- [GR-6] Latin abbreviation "e.g." — use "for example".
Disable linter: add `disabledExtensions: ["ste-lint"]` to ~/.omp/agent/config.yml.
```

After — the corrected write passes clean:

> The API retries failed requests automatically, for example when the database is down. Make sure that the retry loop does not spin forever. Use a bounded queue and do not log the same error twice.

## Install

The extension and the skill install independently. Install the extension for automatic linting, the skill for rule guidance that agents follow when they write.

### omp (extension + skill)

```sh
omp plugin marketplace add donrami/ste-writing
omp plugin install ste-writing@ste-writing
```

or via npm / pi.dev:

```sh
pi install npm:ste-writing
```

### Claude Code (skill)

```sh
/plugin marketplace add donrami/ste-writing
/plugin install ste-writing@ste-writing
```

or copy the skill folder:

```sh
mkdir -p ~/.claude/skills/ste-writing
cp plugin/skills/ste-writing/SKILL.md ~/.claude/skills/ste-writing/SKILL.md
```

Claude Code discovers personal skills at startup from `~/.claude/skills/` and project skills from `.claude/skills/`.

### Cursor (skill)

```sh
mkdir -p ~/.cursor/skills/ste-writing
cp plugin/skills/ste-writing/SKILL.md ~/.cursor/skills/ste-writing/SKILL.md
```

Project-level install goes to `.cursor/skills/ste-writing/`. Cursor also resolves the shared `~/.agents/skills/` and `.agents/skills/` directories.

### GitHub Copilot (skill)

```sh
gh skill install donrami/ste-writing ste-writing
```

or copy the folder to `~/.copilot/skills/ste-writing/` (personal) or `.github/skills/ste-writing/` (project). Copilot auto-discovers skills at session start. Start a new session after installing.

### OpenAI Codex (skill)

```sh
mkdir -p ~/.codex/skills/ste-writing
cp plugin/skills/ste-writing/SKILL.md ~/.codex/skills/ste-writing/SKILL.md
```

Repo-local install goes to `.agents/skills/ste-writing/`. Invoke explicitly with `$ste-writing`.

### Google Gemini CLI (skill)

```sh
gemini skills install https://github.com/donrami/ste-writing --path ste-writing --consent
```

or copy the folder to `~/.gemini/skills/ste-writing/` (user) or `.gemini/skills/ste-writing/` (workspace).

### Any Agent-Skills agent

Copy `plugin/skills/ste-writing/` (the folder containing `SKILL.md`) into the agent's skills directory. The skill follows the [Agent Skills specification](https://agentskills.io). Every harness listed above accepts the same file unchanged.

## Documentation

- [Full README](plugin/README.md): install, configure, disable, uninstall, standards.
- [Changelog](plugin/CHANGELOG.md)
- [Contributing guide](plugin/AGENTS.md)

## License

MIT. The rule semantics are inspired by ASD-STE100 Issue 9. No standard text is reproduced.
