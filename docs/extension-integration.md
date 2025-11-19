# Extension Integration (Agent Hub)

The Agent Hub VS Code extension lets developers search and install artifacts from your catalog(s).

Marketplace: `https://marketplace.visualstudio.com/items?itemName=nimsbhai.agent-hub`

## Add a catalog

In VS Code:

1. Install the “Agent Hub” extension.
2. Open the “Repositories” view.
3. Click “Add Repository” and enter the raw catalog URL.

Examples:

```
GitHub: https://raw.githubusercontent.com/<org>/<repo>/<branch>/copilot-catalog.json
GitLab: https://gitlab.com/<org>/<repo>/-/raw/<branch>/copilot-catalog.json
Frontend: https://<your-frontend-host>/copilot-catalog.json
```

## Settings (JSON)

Add a repo directly via settings:

```json
{
  "agentHub.repositories": [
    {
      "id": "agent-library",
      "url": "https://<your-host>/copilot-catalog.json",
      "enabled": true
    }
  ]
}
```

## Installing artifacts

1. Search in the extension UI.
2. Preview details.
3. Click “Install”. Artifacts are installed under `.github/` by default.

## Private catalogs

See docs/private-catalogs.md for authentication strategies and examples using environment variables in settings.
