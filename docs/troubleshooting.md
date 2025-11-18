# Troubleshooting

## 404 or empty catalog
- Verify `copilot-catalog.json` exists at the URL you’re adding in VS Code.
- If hosting from the frontend, confirm the file is emitted in the build output and served by Pages.

## Wrong content type (HTML instead of JSON)
- Raw endpoints should serve JSON or plain text. For GitHub/GitLab Raw this is handled automatically.
- If proxied, force `Content-Type: application/json`.

## CORS errors
- Allow the catalog to be fetched by your frontend’s origin and VS Code environments if proxied behind a gateway.

## Frontend cannot load artifact content
- Ensure `npm run sync` was executed before building the frontend.
- Check that `frontend/public/artifacts/` contains the referenced files.

## Floating catalog button not visible
- The FAB hides when none of the candidate URLs resolve.
- Set `VITE_CATALOG_FRONTEND_URL` (or GitHub/GitLab URLs) and rebuild, or ensure `/copilot-catalog.json` is reachable.

## Extension cannot install artifacts
- Check repo write permissions for your workspace.
- Verify install root settings (default `.github/`) and disk permissions.


