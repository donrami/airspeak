# ste-writing

Automatic writing-style linting for Markdown prose, built for AI agents. English follows ASD-STE100 Issue 9, the controlled language of old military and aircraft manuals. German follows DIN EN IEC/IEEE 82079-1 and tekom.

Two parts, one package:

- **Lint extension for omp**: checks every Markdown write and edit and reports violations with rule references.
- **Portable skill**: the full rule guidance, installable on any Agent-Skills-capable agent.

## Why this exists

This project started with a video: [The cure for AI slop is a 1986 aircraft manual](https://www.youtube.com/watch?v=uJblcC4lKYw) by [Vusal Ismayilov](https://www.youtube.com/@woosal1337). The claim in it stuck: the fix for AI-generated prose is not banning a few words. It is a controlled language: ASD-STE100, the writing standard built for aircraft mechanics in 1986. Every sentence must be unambiguous enough that a mistake costs a human life.

That framing is why the rules here are mechanical, not tasteful. Instead of "write better", the linter enforces a small set of checkable constraints. The rules check sentence length, one idea per sentence, banned semicolons, marketing vocabulary, and em-dash stacking. Those constraints make agent output predictable and reviewable. They also make it more readable for humans.

The German mode applies the same idea to the German standards: DIN EN IEC/IEEE 82079-1 and tekom regelbasiertes Schreiben. These are the standards behind technical documentation in German.

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

## What it catches

English: sentence length, semicolons, nominalizations, phrasal verbs, marketing vocabulary, em-dash density.

German: passive voice, compound hyphens, Denglish calques, sentence length, filler phrases, em-dashes.

## Documentation

- [Full README](plugin/README.md): install, configure, disable, uninstall, standards.
- [Changelog](plugin/CHANGELOG.md)
- [Contributing guide](plugin/AGENTS.md)

## License

MIT. The rule semantics reference ASD-STE100 Issue 9, DIN EN IEC/IEEE 82079-1:2019, and tekom. No standard text is reproduced.
