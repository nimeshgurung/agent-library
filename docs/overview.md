# Overview

Agent Library is an enterprise-ready scaffold to publish and browse internal AI artifacts:

- Chatmodes (`.chatmode.md`)
- Prompts (`.md`)
- Instructions (`.md`)
- Tasks (`.md`)

It pairs with the Agent Hub VS Code extension to let developers discover and install artifacts directly in VS Code.

## How it works

1. You generate artifacts with CLI generators; metadata is validated via Zod.
2. A `copilot-catalog.json` is produced from `artifacts/index.json`.
3. A Vite + React frontend renders a searchable catalog, and exposes the catalog at `/copilot-catalog.json`.
4. Teams add the catalog URL to the Agent Hub extension and install artifacts into their repos.

## Repository layout

```
agent-library/
├── artifacts/
│   ├── chatmodes/ | prompts/ | instructions/ | tasks/
│   └── index.json
├── frontend/
│   ├── public/
│   └── src/
├── scripts/
│   ├── generators/
│   ├── generate-catalog.ts
│   └── sync-artifacts.ts
├── schema/
└── ci configs
```

See also:
- docs/quickstart.md
- docs/generators.md
- docs/catalogs-and-hosting.md
- docs/extension-integration.md
- docs/ci-cd.md
- docs/private-catalogs.md
- docs/troubleshooting.md


