# Contract: Marketplace Catalog

The repository root is the marketplace. Two catalog files with identical content:

- `.omp-plugin/marketplace.json` — primary (omp reads this first)
- `.claude-plugin/marketplace.json` — Claude Code-compatible fallback

## Schema

`https://anthropic.com/claude-code/marketplace.schema.json`

## Exact content for v1.0.0

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "ste-writing",
  "owner": {
    "name": "<maintainer name>",
    "url": "https://github.com/<owner>"
  },
  "metadata": {
    "description": "Simplified Technical English writing-style rules for AI agents. English: ASD-STE100 Issue 9. German: DIN EN IEC/IEEE 82079-1 + tekom.",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "ste-writing",
      "description": "Automatic writing-style linting for Markdown prose. English: ASD-STE100 Issue 9. German: DIN EN IEC/IEEE 82079-1 + tekom. Warn mode by default; block mode available.",
      "source": "./plugin",
      "version": "1.0.0",
      "author": {
        "name": "<maintainer name>"
      },
      "homepage": "https://github.com/<owner>/ste-writing",
      "repository": "https://github.com/<owner>/ste-writing",
      "license": "MIT",
      "category": "productivity",
      "keywords": [
        "ste",
        "asd-ste100",
        "technical-writing",
        "documentation",
        "lint",
        "din-82079",
        "tekom"
      ]
    }
  ]
}
```

## Naming rules (enforced by omp)

- Marketplace and plugin names: lowercase letters, digits, hyphens, dots only; must start and end with a letter or digit; max 64 chars.
- Plugin ID: `ste-writing@ste-writing` (max 128 chars total).

## Validation semantics (from omp docs)

- Invalid catalog JSON or invalid required top-level fields → the whole catalog is rejected with a clear error.
- An invalid plugin entry → logged and skipped; other valid entries remain usable.
- Plugin `version` present → upgrade comparisons use semver (must be newer); absent → plugin can still install but is excluded from version-based upgrades.

## Acceptance checks

1. `jq empty < .omp-plugin/marketplace.json` exits 0 (valid JSON).
2. Both catalog files are byte-identical.
3. `omp plugin marketplace add /home/mainuser/Desktop/STE` succeeds and lists `ste-writing` in `omp plugin discover`.
4. After a version bump, `omp plugin upgrade ste-writing@ste-writing` detects the new version.
