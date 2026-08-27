# ste-writing

Automatic writing-style linting for Markdown prose, built for AI agents. English follows ASD-STE100 Issue 9 (Simplified Technical English), the controlled language of military aircraft maintenance manuals.

## Contents

- [Why this exists](#why-this-exists)
- [What it does](#what-it-does)
- [Install](#install)
- [Documentation](#documentation)
- [License](#license)

## Why this exists

This project started with a video: [The cure for AI slop is a 1986 aircraft manual](https://www.youtube.com/watch?v=uJblcC4lKYw) by [Vusal Ismayilov](https://www.youtube.com/@woosal1337). The claim in it stuck: the fix for AI-generated prose is not banning a few words. It is a controlled language: ASD-STE100, the writing standard built for aircraft mechanics in 1986. Every sentence must be unambiguous enough that a mistake costs a human life.

That framing is why the rules here are mechanical, not tasteful. Instead of "write better", the linter enforces a small set of checkable constraints. The rules check sentence length, one idea per sentence, banned semicolons, banned nominalizations, banned marketing vocabulary, and em-dash stacking. Those constraints make agent output predictable and reviewable. They also make it more readable for humans.

## What it does

The extension lints every Markdown write and edit, then appends a violation list to the tool result so the agent self-corrects on the next turn. English follows ASD-STE100: sentences at most 25 words, no semicolons, no nominalizations, no phrasal verbs, no marketing vocabulary, at most one em-dash per paragraph.

| Language | Before — typical agent output | After — rewritten to the rules |
|---|---|---|
| **English** | This change updates the authentication service so that it can handle token refresh more efficiently. We utilize a cache to store session data, which means we don't have to reach out to the database on every request; this is a crucial improvement because the previous implementation was causing significant performance issues. Let me walk you through the details — the new flow leverages a background job — and make sure you spin up the service to test it. | The change updates the authentication service. It caches session data so requests do not query the database. The previous implementation caused performance issues. Test the service after you start it. |

### See it in action

Ask your agent to write this sentence:

> The system utilizes a seamless and robust architecture.

The linter flags it immediately:

```text
- [anti-slop] banned "seamless" — cut or replace with a concrete spec.
- [anti-slop] banned "robust" — cut or replace with a concrete spec.
- [STE] phrasal verb "utilize" — replace with a precise verb.
```

Rewrite it as "The system stores data in a cache." and the write passes clean.

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

MIT. The rule semantics reference ASD-STE100 Issue 9. No standard text is reproduced.
