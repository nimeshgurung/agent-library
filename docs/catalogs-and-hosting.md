# Catalogs & Hosting

The Agent Hub extension consumes `copilot-catalog.json`. Agent Library produces this file from `artifacts/index.json`.

## Where the catalog can live

- Frontend (static): `/copilot-catalog.json`
- GitHub Raw: `https://raw.githubusercontent.com/<org>/<repo>/<branch>/copilot-catalog.json`
- GitLab Raw: `https://gitlab.com/<org>/<repo>/-/raw/<branch>/copilot-catalog.json`

## Frontend auto-detection (fallbacks)

The frontend can pick the first reachable catalog URL using env vars:

```
VITE_CATALOG_FRONTEND_URL=/copilot-catalog.json
VITE_CATALOG_GITHUB_URL=https://raw.githubusercontent.com/<org>/<repo>/<branch>/copilot-catalog.json
VITE_CATALOG_GITLAB_URL=https://gitlab.com/<org>/<repo>/-/raw/<branch>/copilot-catalog.json
```

Only one needs to be valid at runtime; if multiple are set, the first reachable wins (Frontend → GitHub → GitLab).

## Building the catalog

```bash
npm run generate:catalog
```

Generates `copilot-catalog.json` using schemas in `schema/` and data in `artifacts/index.json`. The build fails on validation errors.

## Syncing artifacts to the frontend

```bash
npm run sync
```

Copies artifact content under `frontend/public/artifacts/` so the React app can render full details for each artifact.

## MIME types & CORS

- Ensure your hosting serves `copilot-catalog.json` with `application/json` (or at least `text/plain` for raw Git hosts).
- For private deployments behind gateways, allow the frontend’s origin to fetch `copilot-catalog.json` (CORS).
