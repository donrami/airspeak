# Contract: Plugin Manifest (`plugin/package.json`)

The plugin is the installable unit at `./plugin`, referenced by the catalog's `"source": "./plugin"`. The same `package.json` serves the npm channel (`npm publish` → pi.dev listing).

## Exact content for v1.0.0

```json
{
  "name": "ste-writing",
  "version": "1.0.0",
  "description": "Writing-style linting for Markdown prose. English: ASD-STE100 Issue 9. German: DIN EN IEC/IEEE 82079-1 + tekom. omp extension + portable Agent Skills.",
  "license": "MIT",
  "type": "module",
  "exports": "./src/index.ts",
  "files": [
    "src",
    "skills",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "AGENTS.md"
  ],
  "omp": {
    "extensions": [
      "./src/index.ts"
    ]
  },
  "scripts": {
    "test": "bun test tests/",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "@oh-my-pi/pi-coding-agent": "^16.4.4 || ^17.0.0"
  },
  "devDependencies": {
    "@oh-my-pi/pi-coding-agent": "^17.0.0",
    "@types/bun": "^1.3.5",
    "typescript": "^5.9.3"
  }
}
```

## Field rules

| Field | Rule |
|---|---|
| `name` | Lowercase alnum + hyphen/dot; must be available on npm (fallback: `@<owner>/ste-writing`). Same value as the marketplace and plugin names. |
| `version` | SemVer; MUST equal the catalog plugin `version` and the git tag `v<version>`. |
| `omp.extensions` | Array of entry files relative to the package root. `./src/index.ts` ships as raw TypeScript (Bun executes it; proven by `omp-headroom`). No build step. |
| `exports` | Points at the extension entry for ESM resolution. |
| `peerDependencies` | `@oh-my-pi/pi-coding-agent` — the ExtensionAPI the extension imports. Peer (not dev) so the host agent's copy is used. |
| `files` | npm publish allowlist. Keeps `.specify/`, `specs/`, tests, and local tooling out of the published package. |

## Acceptance checks

1. `cd plugin && bun run typecheck` exits 0.
2. `cd plugin && bun test` — all rule and packaging tests pass.
3. `npm pack --dry-run` lists only `files` entries (plus package.json/README auto-includes).
4. `bun pm ls` in an agent that installed the package resolves `@oh-my-pi/pi-coding-agent` from the host.
