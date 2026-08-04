# ste-writing

Automatic writing-style linting for Markdown prose, built for AI agents. English follows ASD-STE100 Issue 9 — the controlled language of old military and aircraft manuals. German follows DIN EN IEC/IEEE 82079-1 and tekom.

Two parts, one package:

- **Lint extension for omp** — checks every Markdown write and edit, reports violations with rule references.
- **Portable skill** — the full rule guidance, installable on any Agent-Skills-capable agent (Claude Code, Cursor, GitHub Copilot).

## Quick install (omp)

```sh
omp plugin marketplace add <owner>/ste-writing
omp plugin install ste-writing@ste-writing
```

or via npm / pi.dev:

```sh
pi install npm:ste-writing
```

## What it catches

English: sentence length, semicolons, nominalizations, phrasal verbs, marketing vocabulary, em-dash density. German: passive voice, compound hyphens, Denglish calques, sentence length, filler phrases, em-dashes.

## Documentation

- [Full README](plugin/README.md) — install, configure, disable, uninstall, standards.
- [Changelog](plugin/CHANGELOG.md)
- [Contributing guide](plugin/AGENTS.md)

## License

MIT. The rule semantics reference ASD-STE100 Issue 9, DIN EN IEC/IEEE 82079-1:2019, and tekom; no standard text is reproduced.
