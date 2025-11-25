# VS Code Deep Linking Integration

This document describes how the Agent Library frontend integrates with the Agent Hub VS Code extension using deep links.

## Overview

When a user clicks "Install in VS Code" on an artifact in the Agent Library frontend, we use VS Code's URI protocol handler to:

1. Open VS Code (or focus it if already open)
2. Activate the Agent Hub extension
3. Trigger an artifact installation flow with context from the web

## How It Works

### Frontend (Agent Library)

The frontend builds a deep link using the format:

```
vscode://nimsbhai.agent-hub/installArtifact?artifactType=TYPE&artifactId=ID&catalogRepoUrl=URL&catalogPath=PATH
```

**Parameters:**

- `artifactType`: The type of artifact (e.g., `chatmode`, `prompt`, `agent`, `task`, `instructions`)
- `artifactId`: The unique ID of the artifact from the catalog
- `catalogRepoUrl`: The URL of the catalog JSON file (helps the extension auto-add the catalog if missing)
- `catalogPath`: The path to the catalog file (default: `copilot-catalog.json`)
- `source`: Tracking parameter (set to `agent-library-web`)

**Implementation:**

- See `frontend/src/utils/vscodeDeepLink.ts` for the link builder
- Used in `frontend/src/components/ChatmodeDetail.tsx` for the install button

### Extension (Agent Hub)

The extension registers a URI handler in `src/extension.ts` that:

1. **Parses the deep link** and extracts parameters
2. **Ensures the catalog exists**:
   - If the catalog URL is not already configured, prompts the user to add it
   - Pre-fills the catalog URL and path from the deep link
3. **Finds the artifact** in the search index
4. **Installs the artifact** using the existing installation flow
5. **Shows success/error feedback** to the user

**Key functions:**

- `handleDeepLink()`: Main router for deep link actions
- `handleInstallArtifact()`: Handles the `/installArtifact` action
- `ensureCatalogExists()`: Ensures catalog is added before installing

## User Experience Flow

### Happy Path

1. User browses Agent Library website
2. User clicks "Install in VS Code" on an artifact
3. Browser prompts: "Open Visual Studio Code?"
4. User confirms
5. VS Code opens/focuses
6. Agent Hub extension activates
7. If catalog is not installed:
   - Extension shows: "The Agent Library catalog is not installed. Would you like to add it now?"
   - User clicks "Add Catalog"
8. Extension finds and installs the artifact
9. User sees: "Installed [type] '[name]' from Agent Library"

### Missing Extension

- If the Agent Hub extension is not installed, the deep link won't work
- The frontend displays helper text: "Requires VS Code and the Agent Hub extension"
- Users can click the "Install Agent Hub" badge in the header to install the extension

## Testing

### Test the deep link locally:

1. Start the frontend dev server:

   ```bash
   cd frontend
   npm run dev
   ```

2. Build and run the extension:

   ```bash
   cd ../agent-hub
   npm run build
   # Press F5 in VS Code to launch Extension Development Host
   ```

3. Open the Agent Library in a browser, click an artifact, then "Install in VS Code"

4. The deep link should open VS Code and trigger the installation

### Manual deep link test:

Open this URL directly in your browser (replace with your catalog):

```
vscode://nimsbhai.agent-hub/installArtifact?artifactType=chatmode&artifactId=example-chatmode&catalogRepoUrl=https://nimeshgurung.github.io/agent-library/copilot-catalog.json&catalogPath=copilot-catalog.json
```

## Configuration

### Changing the extension ID

If the extension publisher or ID changes, update:

- `frontend/src/utils/vscodeDeepLink.ts`: `EXTENSION_ID` constant
- `agent-hub/package.json`: `publisher` field

### Changing the default catalog URL

Update `DEFAULT_CATALOG_URL` in `frontend/src/utils/vscodeDeepLink.ts`.

## Limitations

1. **Browser can't detect if VS Code is installed**: If VS Code is not installed, clicking the deep link does nothing. We rely on helper text to guide users.

2. **Browser can't detect if extension is installed**: If the extension is not installed, the deep link opens VS Code but does nothing. We show a clear message about this requirement.

3. **Cross-origin restrictions**: The frontend can't communicate back to confirm success. The flow is one-way: web → VS Code.

## Future Enhancements

- **Bi-directional communication**: Extension could POST back to an API endpoint to confirm installation (requires auth design)
- **First-time setup modal**: Show a step-by-step guide on first click (detect via localStorage)
- **Timeout hints**: Show a helper modal after 3-5s if VS Code doesn't appear to open
