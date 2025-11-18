# Quickstart

Follow these steps to scaffold your catalog and browse it locally.

## Prerequisites
- Node.js 18+
- npm

## 1) Install dependencies
```bash
npm run bootstrap
```

## 2) Generate artifacts
```bash
npm run generate:chatmode
npm run generate:prompt
npm run generate:instructions
npm run generate:task
```
Artifacts are created under `artifacts/<type>/<slug>/` and indexed in `artifacts/index.json`.

## 3) Build catalog + frontend
```bash
npm run build
```
This will:
- Generate `copilot-catalog.json`
- Sync artifacts to `frontend/public/artifacts/`
- Build the React frontend

## 4) Run locally
```bash
npm run dev
```
Open `http://localhost:5173`. Use the floating “View copilot-catalog.json” button to inspect the catalog.

## 5) Use with Agent Hub extension
Install the VS Code extension and add your catalog URL. See docs/extension-integration.md.


