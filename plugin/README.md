# ste-writing

Automatic writing-style linting for Markdown prose, built for AI agents.

- **English**: ASD-STE100 Issue 9 (Simplified Technical English) — the controlled-language framework used in military and aircraft maintenance manuals.
- **German**: DIN EN IEC/IEEE 82079-1:2019 (use of instructions for products) + tekom regelbasiertes Schreiben.

The addon has two parts:

1. **Lint extension** (omp): checks every `*.md` / `*.mdx` file you write or edit and reports violations with rule references.
2. **Writing-style skill** (any Agent-Skills-capable agent): the full rule guidance, installable in Claude Code, Cursor, GitHub Copilot, and others.

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

Language is auto-detected from the file path (`de/foo.md`, `foo.de.md`, `/de_DE/`, `/german/`) or, failing that, from the text. Code files, configs, and other non-prose files are never checked.

Rule families, English:

- Sentence length (STE 6.3 descriptions ≤ 25 words, STE 5.1 procedures ≤ 20)
- Semicolons (STE 8.1)
- Nominalizations (STE 3.7)
- Phrasal verbs
- Banned marketing vocabulary
- Em-dash density

Rule families, German:

- Vorgangspassiv (tekom S 501) and Passiv mit Modalverb (S 503)
- Compound hyphen rules (tekom B 104-110)
- Denglish calques
- Sentence length (82079-1 minimalism)
- Floskeln (tekom L 112)
- Em-dashes (banned in DE user-facing prose)

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

- ASD-STE100 Issue 9 (January 2025), Simplified Technical English. STE is an English-only controlled language. The German mode follows the German standards below instead.
- DIN EN IEC/IEEE 82079-1:2019 Edition 2, "Preparation of information for use (instructions for use) of products".
- tekom, "Deutsch für Technische Kommunikation – Regelbasiertes Schreiben".

This project is released under the MIT license. The standards above are referenced for rule semantics. No standard text is reproduced.

## Known limitations

- HTML comments and template boilerplate (for example Given/When/Then scaffolding) are counted as prose and can produce false positives.
- German compound-word detection is regex-based and cannot count morphemes. Very long compounds are flagged for human review.
- The mechanical rules are a subset of the full standards. The skill document carries the full rule guidance for agents.

## Contribute

See [AGENTS.md](AGENTS.md) for repo conventions and the release process in [CHANGELOG.md](CHANGELOG.md).
