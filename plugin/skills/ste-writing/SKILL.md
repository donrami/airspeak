---
name: ste-writing
description: Write and review technical documentation — docs, READMEs, PR descriptions, error messages, runbooks, release notes, changelogs. English follows ASD-STE100 Issue 9; German follows DIN EN IEC/IEEE 82079-1:2019 + tekom. Use when the user writes or edits technical prose, API docs, or any document where clarity and brevity matter — even if they don't explicitly mention a style guide or simplification. Never use for marketing copy, essays, creative writing, or anything that needs a distinctive voice. These specs intentionally strip voice.
license: MIT
compatibility: omp, Claude Code, Cursor, GitHub Copilot, and any agent supporting the Agent Skills spec
metadata:
  version: "1.0.0"
  author: Rami Abu-Hamad
  en-spec: ASD-STE100 Issue 9 (Jan 2025)
  de-specs: DIN EN IEC/IEEE 82079-1:2019 Edition 2; tekom "Deutsch für Technische Kommunikation – Regelbasiertes Schreiben"
globs:
  - "**/*.md"
  - "**/*.mdx"
  - "**/README*"
  - "**/CHANGELOG*"
  - "**/RELEASE*"
  - "**/errors/**"
  - "**/runbooks/**"
alwaysApply: false
hide: false
---

# ste-writing

Mechanical, machine-checkable prose rules for technical documentation. Two language modes. Auto-routes from the user's prompt and the target file path.

## Language detection

Detect in priority order:
1. **File path suffix** — `*.de.md`, `*.de.mdx`, path contains `/de/`, `/german/`, `/de_DE/` → German.
2. **User prompt language** — German stopwords (`der`, `die`, `das`, `und`, `ist`, `sind`, `nicht`, `werden`, `auch`) dominate English stopwords → German. Otherwise English.
3. **Project convention** — if sibling files are German, follow.
4. **Default: English.**

If the artifact mixes both languages, pick the dominant one and stay consistent. Code identifiers, commit messages, and enum values stay English even in German artifacts.

## English mode — ASD-STE100 Issue 9 (53 rules, 9 sections)

The full spec is 434 pages; the mechanical subset below is what actually matters. Read more via `skill://ste-writing/references/ste-rules.md` if you need a deeper lookup.

### Mechanical subset (12 rules, all lintable)

| Rule | What it kills | Lint pattern |
|---|---|---|
| 1.1 | Only approved / technical-noun / technical-verb vocabulary | word-list check (not enforced by linter; rely on training) |
| **1.11** | Synonym rotation — one name per item | regex: same concept named 3+ ways within a paragraph |
| **2.1** | Multi-word nouns > 3 words | regex: noun phrases > 3 tokens without hyphens |
| 3.1 | Only approved verb forms | (not enforced; rely on training) |
| **3.4** | Stacked auxiliaries (`is important to note that this may help to improve`) | regex: 3+ consecutive helper verbs |
| **3.7** | Verb-for-action rule: `perform an analysis of` → `analyze` | regex: `(perform\|make\|do\|conduct\|provide\|carry out) (a\|an\|the)? (analysis\|determination\|assessment\|evaluation\|investigation\|review\|assistance\|support)` |
| **4.1** | Short, clear sentences | sentence-length check |
| **5.1** | ≤ 20 words/sentence in procedures | sentence-length check, strict mode |
| **6.3** | ≤ 25 words/sentence in descriptions | sentence-length check, default mode |
| **8.1** | No semicolons | regex: `;` in prose (exclude code blocks, URLs) |
| 8.4-8.7 | List items, no nested sublists | structural check (not enforced by linter) |
| 9-GR-5 | False friends (`actual` ≠ current in en-GB contexts) | word-list (not enforced) |

### Quick application checklist

Before returning any technical English prose:

1. Any sentence over 20 words (procedures) or 25 (descriptions)? Split.
2. Any semicolon? Replace with a period (or rewrite as two sentences).
3. Any nominalization (`perform an analysis of`, `make a determination of`, `provide assistance with`, `carry out an assessment of`)? Replace with the verb (`analyze`, `determine`, `help`, `assess`).
4. Same thing named two ways within a paragraph? Pick one.
5. Marketing adjectives? Cut: `seamless`, `robust`, `powerful`, `cutting-edge`, `effortless`, `world-class`, `next-generation`, `revolutionary`, `leverage` (verb), `utilize`, `facilitate`, `empower`, `holistic`, `seamlessly`, `meticulously`, `crucial`, `pivotal`, `paramount`, `game-changing`, `tapestry`, `delve`, `navigate the landscape of`.
6. Phrasal verbs (`spin up`, `reach out`, `dive into`, `kick off`, `circle back`, `deep dive`)? Replace with a precise verb (`start`, `contact`, `open`, `begin`, `return`, `examine`).
7. Em-dashes (`—`)? Allowed by STE; the linter warns if more than 1 per paragraph. Keep at most one where it earns the pause.

### Hard NO

- **Do not paste the full STE Issue 9 dictionary** (875 approved + ~1200 forbidden entries) into the prompt. It's copyrighted (ASD owns it; STEMG grants free use only to the listed categories of organizations) and burns ~8k tokens. The skill body covers the mechanical subset; the model knows STE-shaped prose from training.
- **Do not apply STE to voice work.** Marketing copy, essays, blog posts, narrative — running STE on these produces sterile text.
- **Do not use STE for German.** STE is English-only by design. Use the German mode below.

## German mode — DIN EN IEC/IEEE 82079-1:2019 + tekom regelbasiert (~160 rules)

82079-1 Edition 2 (published 2019-05-16, cancels and replaces IEC 82079-1:2012) gives the **normative authority**. The three named clauses that matter for writing are **5.3.3 Minimalismus**, **5.3.4 Korrektheit**, **5.3.5 Prägnanz**. tekom regelbasiert (~160 rules, six categories T/S/B/L/R/Z) gives the concrete application.

The mechanical subset below is what the linter enforces; the rest is for you to follow.

### 82079-1 minimalism (always on)

- Only information needed for safe and effective use. Cut everything else.
- One topic per section.
- One idea per sentence.

### Sentence rules (tekom S rules)

- **S 101** Keine pronominalen Bezüge über Satzgrenzen — no pronoun references crossing the sentence boundary. If `dieser`, `jener`, `er`, `sie`, `es` opens a sentence, the referent must be in the same sentence.
- **S 401** Keine eingeschobenen Nebensätze — no relative clauses nested in the middle of a sentence. Move them to the end or split.
- **S 501** Vorgangspassiv vermeiden — `Es wird verarbeitet` → `Das System verarbeitet`. The "impersonal passive" without an actor. Flag: regex `\b(wird|werden|wurde|wurden)\s+\w+\b` where the subject is `Es` or absent.
- **S 502** Passiv mit Täterangabe vermeiden — `wird von X gemacht` → `X macht`. Flag: regex `\bwird?\s+von\s+\w+\s+\w+t\b`.
- **S 503** Passiv mit Modalverben vermeiden — `kann gemacht werden` → imperative or `man kann machen`. Flag: regex `\bkann\|muss\|soll\s+\w+t\s+werden\b`.
- **S 504** Passiv in Sicherheitsinformation vermeiden — no passive in safety text. Flag: any passive in a section starting with `Warnung`, `Gefahr`, `Vorsicht`, `Sicherheit`, `Achtung`.
- **S 505** Nominalstil vermeiden — verb, not noun. `die Durchführung der Analyse` → `die Analyse durchführen`. Flag: regex with common nominalization suffixes (`-ung`, `-ung`, `-tion`, `-ment`, `-ität`, `-heit`, `-keit`) when used with weak verbs (`durchführen`, `vornehmen`, `erfolgen`, `stattfinden`).

### Compound-word rules (tekom B rules) — highest-leverage for Denglish avoidance

These compose with the B-rules in your existing `german-readme-style` and the `netresearch/german-technical-writing-skill` references.

- **B 101** 2-Morphem-Komposita: kein Bindestrich — `Hausnummer`, not `Haus-Nummer`.
- **B 103** 4+-Morphem-Komposita: immer Bindestrich — `Software-as-a-Service-Modell` not `Softwareasaservicemodell`.
- **B 104** Komposita mit Abkürzungen: immer Bindestrich — `API-Aufruf`, `URL-Pfad`.
- **B 105** Komposita mit Akronymen: immer Bindestrich — `HTTP-Request`, `CSS-Klasse`.
- **B 106** Komposita mit Kurzwörtern: immer Bindestrich — `Info-Punkt`.
- **B 107** Komposita mit Einzelbuchstaben: immer Bindestrich — `C-Dur`, `T-Shirt`.
- **B 108** Komposita mit Ziffern: immer Bindestrich — `3-Wege-Ventil`, `64-Bit-System`.
- **B 109** Komposita mit Einheiten: immer Bindestrich — `5-kg-Gewicht`, `100-m-Lauf`.
- **B 110** Komposita mit Zahlen und Einheiten: immer Bindestrich — same as B 109.
- **B 115** Dreifachbuchstabe: immer Bindestrich — `Schiff-Fahrt`, `Brenn-Nessel`.
- **B 117** Produktnamen + Versionsnummern: niemals Bindestrich — `Firefox 89`, `Node.js 20`, `Ubuntu 22.04`. No `Firefox-89`.
- **B 119-B 121** Schrägstrich / Plus / Und-Zeichen in Komposita vermeiden — `oder` ausschreiben oder umformulieren.

Linter enforcement of B 101-B 117 is partial — regex catches the digit/unit/acronym patterns reliably but cannot count morphemes. The linter flags long compound words (≥ 4 joined tokens with no separator, ≥ 18 chars) for human review.

### Logic rules (tekom L rules)

- **L 111** Ausnahmen explizit formulieren — exceptions stated positively, not as omissions.
- **L 112** Floskeln vermeiden — cut `im Allgemeinen`, `grundsätzlich`, `prinzipiell`, `in der Regel`, `eigentlich`, `gewissermaßen`. Replace with concrete condition or cut entirely.
- **L 113** Morphologische Varianten vermeiden — one term per concept across the document.
- **L 114** Überflüssige Präfixe vermeiden — cut empty intensifiers (`sehr`, `äußerst`, `besonders` before adjectives that don't need them).

### Orthography + punctuation (tekom R/Z rules)

- **R 101** Einheitlicher Rechtschreibstil — pick one (new or old German orthography) and stick to it across the document.
- **Z 103a** Typografische Anführungszeichen in DE-Prosa: „…", nicht "…" — but use straight quotes inside code/identifiers.
- **Z 107** Kein Apostroph bei Possessiv — `Hans Buch`, not `Hans' Buch`. The `Hans sein Buch` construct is dialect.

### English-mixing rules (compose with `german-readme-style`)

- **No em-dash (—) in user-facing German.** Replace with Komma, Punkt, Doppelpunkt, or Gedankenstrich-as-parenthesis (round brackets). En-dash (–) is OK for number ranges (`80–451 €`, `1990–1995`).
- **No Denglish.** The 60-entry false-friend catalogue from `netresearch/german-technical-writing-skill/references/anti-patterns.md` covers literal English→German calques: `brechen → werfen`, `gefangen → abgefangen`, `returnen → zurückgeben`, `triggern → auslösen`, `failen → fehlschlagen`. Accept ecosystem-standard Denglisch loanwords: `der Commit`, `die Pipeline`, `die Exception`, `der Bug`, `das Deployment`. The linter flags the calques only.
- **User-facing prose in German. Code identifiers, commit messages, enum values, CSV column headers, domain names stay English.** This composes with your existing `german-readme-style` skill.
- **Glossary discipline.** First mention of an English technical term in a German document gets a parenthetical translation: `die Pipeline (Verarbeitungsstrecke)`. Subsequent mentions can use the loanword alone if it's standard.

### Quick application checklist (German)

1. Nominalstil? (`Durchführung`, `Bearbeitung`, `Verarbeitung`, `Bereitstellung`) → verb form.
2. Vorgangspassiv? (`Es wird verarbeitet`, `wird durchgeführt`) → active with explicit subject.
3. Kompositum with digit/unit/acronym? Add Bindestrich.
4. Pronoun across sentence boundary? Restructure so the referent is in the same sentence.
5. Em-dash? Cut (Komma, Punkt, Doppelpunkt, or round brackets).
6. Denglish calque? Replace with German verb/noun.
7. Marketing adjectives (`revolutionär`, `nahtlos`, `robust`, `leistungsstark`, `zukunftsweisend`)? Cut.
8. Floskeln (`im Allgemeinen`, `grundsätzlich`, `eigentlich`)? Cut or replace.

### Hard NO

- **Do not translate technical jargon literally back into English** (`committen`, `pushen`, `deployen` as German verbs). Use either the German form (`die Übergabe`, `bereitstellen`) or the standard Denglisch loanword (`der Commit`, `die Pipeline`, `deployen` if your project uses it).
- **Do not run this mode on artifacts in English** even if the project is German-dominant. Detect from the user's prompt and file path; never default to German.
- **Do not bypass 82079-1 minimalism** by padding documentation with "explanatory" content. The norm says cut it.

## Modes

The skill itself does not switch mode — the model decides per artifact based on language detection above. If you want to force a mode, ask explicitly: "Write this in STE-flavored English" or "Write this as German technical prose per DIN 82079-1".

## Companion artifacts (for the full setup)

- **Linter**: `~/.omp/agent/extensions/ste-lint.ts` runs the mechanical rules above on every `write`/`edit` to `**/*.md*`. Default mode is `warn` (injects a list of violations into the tool result so the model self-corrects on the next turn); flip to `block` by editing the file or via `disabledExtensions: ["ste-lint"]` to disable entirely.
- **Pointer**: `~/.omp/agent/APPEND_SYSTEM.md` contains a one-line reminder to consult this skill.

## Kill switches

This skill is **off by default** — the model only reads it when it judges a doc-related task. To disable entirely:

- Delete `~/.agent/skills/ste-writing/SKILL.md`
- Add to `~/.omp/agent/config.yml`: `disabledExtensions: ["skill:ste-writing"]`
- Add to `ignoredSkills: ["ste-writing"]` in config
- Set `enableAgentsUser: false` to turn off the whole agents provider
- Tighten the `globs` list so it never matches your files
