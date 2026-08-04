# Feature Specification: Publish STE Writing Addon

**Feature Branch**: `001-publish-ste-addon`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "a while a go I vibe coded an STE addon for omp that applies writing style rules and i was inspired to make it by a youtube video that talked about old military/aircraft manuals with this type of language framework. Now I want to ship this tool as a public pi.dev / omp addon or extension and I need your help to deliver a high quality product."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Maintainer publishes the addon publicly (Priority: P1)

A maintainer packages the existing writing-style addon, which today exists only on one machine, into a public, installable release. The release contains a marketplace catalog, the lint extension, the writing-style skill, a license, and usage documentation. The release appears on pi.dev so the public can find it.

**Why this priority**: Without a public, installable package, no one else can use the addon. Publication is the entire purpose of this feature, so it comes first.

**Independent Test**: A reviewer with a clean omp environment follows the published installation instructions and installs the addon from the public source.

**Acceptance Scenarios**:

1. **Given** a clean omp environment, **When** the reviewer runs the documented install commands, **Then** the addon installs and appears in the installed plugin list.
2. **Given** the public release, **When** the reviewer opens the pi.dev listing, **Then** they see the addon name, description, version, and install instructions.
3. **Given** the release tag, **When** the maintainer inspects the release contents, **Then** it contains the catalog, the extension, the skill, the license, and the changelog.

---

### User Story 2 - User gets automatic writing-style checks in omp (Priority: P1)

A technical writer or developer installs the addon. From then on, when they write or edit Markdown documentation, the addon automatically checks the prose against the writing-style rules. English prose follows the ASD-STE100 rules. German prose follows the DIN EN IEC/IEEE 82079-1 and tekom rules. The addon reports each violation with its location and rule reference, so the writer or the agent can correct the text.

**Why this priority**: Automatic checking is the core value the user gets from the addon. The published package must preserve this behavior exactly.

**Independent Test**: Install the addon, write a Markdown file that contains a known violation, such as a banned word or a sentence over the length limit, and observe that the violation report appears.

**Acceptance Scenarios**:

1. **Given** the addon installed and enabled, **When** the user writes a Markdown file with a known violation, **Then** the addon reports the violation with its location and rule reference.
2. **Given** a German-language Markdown file, **When** the user edits it, **Then** the German rule set applies, such as passive-voice and compound-hyphen checks.
3. **Given** an English-language Markdown file, **When** the user edits it, **Then** the English rule set applies, such as sentence-length and banned-vocabulary checks.
4. **Given** a code or configuration file, **When** the user edits it, **Then** no linting runs and no errors appear.
5. **Given** the default configuration, **When** the addon finds a violation, **Then** the write still succeeds and the violation appears as a warning; in hard-enforcement mode, a severe violation blocks the write with a clear message.

---

### User Story 3 - User uses the skill on another agent (Priority: P2)

A user who works in an agent that supports the Agent Skills format, such as Claude Code, Cursor, or GitHub Copilot, installs the writing-style skill from the addon package. The agent then follows the rule guidance when it writes technical prose, in English or German.

**Why this priority**: The skill is portable and already agent-neutral. This widens reach beyond omp with little extra effort, but it is secondary to the primary omp release.

**Independent Test**: Install the skill into a second agent environment, ask for a technical document, and confirm that the output follows the rules.

**Acceptance Scenarios**:

1. **Given** a supported agent, **When** the user installs the skill from the addon package, **Then** the agent loads the skill and applies the rules to the technical prose it writes.
2. **Given** a German writing task, **When** the skill is active, **Then** the German rules apply, detected from the file path or the prompt language.

---

### User Story 4 - User receives updates (Priority: P2)

The maintainer ships fixes and rule improvements as new releases. An installed user updates the addon with documented commands, without uninstalling and reinstalling, and sees the new version.

**Why this priority**: A public addon that cannot be updated becomes a maintenance burden and a support risk. An update path is required for a quality product.

**Independent Test**: Install the addon at the first release version, publish a second version, and run the update command.

**Acceptance Scenarios**:

1. **Given** the addon installed at version X, **When** the maintainer publishes version X+1, **Then** the user's update command upgrades the addon and the installed list shows the new version.
2. **Given** an available update, **When** the user reviews it, **Then** the changelog documents what changed between versions.

---

### User Story 5 - User disables or removes the addon (Priority: P3)

A user who does not want automatic linting disables the addon without uninstalling it, or removes it completely. In both cases the agent stays fully functional and no errors appear.

**Why this priority**: A clean exit path is part of quality, but it only matters after installation and use work well.

**Independent Test**: Install the addon, disable it, write a Markdown file, and confirm no linting runs. Then remove it and confirm the environment still works.

**Acceptance Scenarios**:

1. **Given** the addon installed, **When** the user disables it, **Then** no linting runs and no errors appear.
2. **Given** the addon installed, **When** the user removes it, **Then** the environment returns to its pre-install state with no leftover hooks or errors.

---

### Edge Cases

- A fresh environment with no agent configuration: installation must create whatever it needs without manual setup.
- An extension load failure: the agent's other functions must keep working (fail soft, never fail hard).
- Malformed or unusual Markdown, such as tables, code fences, or mermaid blocks: linting must not crash, and code blocks must not be linted.
- Mixed-language documents: the addon must not apply the wrong rule set; it defaults to the dominant language.
- Very large files: linting must finish without a noticeable delay or excessive memory use.
- Hard-enforcement mode: a documented escape hatch must exist so one false positive cannot permanently block the user's work.
- Duplicate installation: if the user already has a local copy of the extension or skill, installation must not corrupt either copy.
- A broken catalog, such as invalid JSON or a missing source path: installation must fail with a clear message, not silently.
- Parallel or concurrent writes: linting results must not interleave or corrupt each other.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The addon MUST be published as a public, installable package that includes a marketplace catalog, the lint extension, the writing-style skill, a license, and usage documentation.
- **FR-002**: A user MUST be able to install the addon into omp with documented commands, and the addon MUST appear in the installed plugin list.
- **FR-003**: After installation, the addon MUST check Markdown prose automatically when prose files are written or edited, applying the English rule set and the German rule set.
- **FR-004**: The addon MUST report each violation with its location and its rule reference so the writer or the agent can correct the text.
- **FR-005**: The addon MUST default to warning mode, where writes succeed, and MUST support a hard-enforcement mode, where severe violations block the write.
- **FR-006**: The addon MUST provide a documented kill switch that disables linting without uninstalling.
- **FR-007**: The addon MUST NOT lint or alter non-prose files, such as code, configuration, or binary files.
- **FR-008**: The package MUST include the portable writing-style skill with installation instructions for at least one agent besides omp that supports the Agent Skills format.
- **FR-009**: The package MUST include a version number, a changelog, and a documented update path.
- **FR-010**: The package MUST include removal instructions, and removal MUST leave the environment functional.
- **FR-011**: Every lint rule MUST be covered by an automated test that shows the rule fires on a violating sample and stays silent on a conforming sample.
- **FR-012**: The addon MUST be listed on pi.dev with a description, a version, and installation instructions.
- **FR-013**: The package MUST declare a license and MUST document the underlying standards it implements, namely ASD-STE100, DIN EN IEC/IEEE 82079-1, and tekom.

### Key Entities *(include if feature involves data)*

- **Marketplace catalog**: Metadata that describes the addon, such as name, description, source, and category, and enables installation from a public source.
- **Plugin package**: The installable unit that contains the lint extension, the writing-style skill, the license, and the documentation.
- **Lint extension**: The omp agent extension that listens for writes and edits of prose files and checks them against the rule sets.
- **Writing-style skill**: The portable rule guidance, in English and German, that installs on agents that support the Agent Skills format.
- **Rule set**: The mechanical rules that the addon enforces, namely the ASD-STE100 Issue 9 subset for English and the DIN EN IEC/IEEE 82079-1 and tekom rules for German.
- **Release**: A versioned, tagged snapshot of the package, with a changelog, that users install and update.
- **Installation state**: The record of whether the addon is installed, enabled, or disabled in a given environment.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: A user with a clean environment installs the addon from the public source in under 5 minutes, following only the published documentation.
- **SC-002**: Every lint rule that fires in the current local version also fires after installation from the published package; none are lost in packaging.
- **SC-003**: Linting runs automatically on the first Markdown write after installation, with zero configuration.
- **SC-004**: A user updates from the first released version to the next in under 2 minutes, using documented commands.
- **SC-005**: After removal, the agent works normally and no lint errors or leftover hooks appear.
- **SC-006**: The writing-style skill installs and works on at least one agent besides omp.
- **SC-007**: The addon is discoverable on pi.dev, with a description, a version, and installation instructions.
- **SC-008**: The published documentation passes a completeness check: install, configure, disable, uninstall, and contribute sections are all present and accurate.

## Assumptions

- Distribution follows the marketplace pattern that other public omp addons use: a public source repository whose catalog file describes the addon. This matches how the addons already installed in this environment are distributed.
- The addon is released under the MIT license, which the skill already declares.
- Target users are technical writers, documentation engineers, and developers who produce technical prose with AI agents.
- The first public release keeps the current feature set: English and German linting with warning and hard-enforcement modes. New rule coverage is future work.
- The primary platform is omp. Portability of the skill to other agents is included but secondary.
- The locally installed extension and skill are the source of truth for behavior. Packaging must not change how the rules behave.
- The pi.dev listing is part of this feature; the addon ships to the public ecosystem, not just to a private repository.
- Versioning follows semantic versioning. The first public release is version 1.0.0.
- Automated tests for the lint rules run in an isolated environment and do not depend on a specific agent being installed.
