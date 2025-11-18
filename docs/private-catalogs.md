# Private Catalogs

You can serve `copilot-catalog.json` from private GitHub/GitLab or internal endpoints. The Agent Hub extension supports tokens.

## Options
- Personal Access Token (GitHub/GitLab) with `read_repository` scope
- Bearer token for custom gateways
- Environment variables in VS Code settings

## Settings with environment variables
```json
{
  "agentHub.repositories": [
    {
      "id": "private-catalog",
      "url": "https://gitlab.company.com/<group>/<repo>/-/raw/main/copilot-catalog.json",
      "auth": {
        "type": "bearer",
        "token": "${env:GITLAB_TOKEN}"
      }
    }
  ]
}
```

## Notes
- Avoid committing tokens; prefer environment variables.
- For self-hosted gateways, allow CORS for the frontend and VS Code environment as needed.
- Rotate tokens regularly; monitor access logs.


