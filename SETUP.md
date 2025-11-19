# Setup Guide

## Overview

The `artifact-hub-collection` repository is a complete enterprise scaffold for publishing internal AI artifacts. It includes:

- ✅ CLI generators for chatmodes, prompts, instructions, and tasks
- ✅ Automatic catalog generation (`copilot-catalog.json`)
- ✅ Dual CI/CD pipelines (GitLab + GitHub Pages)
- ✅ Frontend catalog viewer (Vite + React)
- ✅ TypeScript validation with Zod schemas
- ✅ No external skill downloads - pure local scaffolding

## Quick Verification

Test that everything works:

```bash
# 1. Install dependencies
npm install

# 2. Generate empty catalog (should work with 0 artifacts)
npm run generate:catalog

# 3. Create an example artifact
npx tsx scripts/generators/create-example.ts

# 4. Regenerate catalog with the example
npm run generate:catalog

# 5. Sync to frontend
npm run sync
```

## File Structure

### Core Configuration

- `package.json` - Root package with all npm scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore`, `.prettierrc.json`, `.editorconfig` - Code quality tools

### Schema & Types

- `schema/types.ts` - Zod schemas for all artifact types
- `schema/artifact-catalog.schema.json` - JSON Schema for validation

### Generators

- `scripts/generators/utils.ts` - Shared generator utilities
- `scripts/generators/chatmode.ts` - Chatmode generator
- `scripts/generators/prompt.ts` - Prompt generator
- `scripts/generators/instructions.ts` - Instructions generator
- `scripts/generators/task.ts` - Task generator

### Build Scripts

- `scripts/generate-catalog.ts` - Creates `copilot-catalog.json` from `artifacts/index.json`
- `scripts/sync-artifacts.ts` - Copies `artifacts/` to `frontend/public/artifacts/`

### CI/CD

- `.gitlab-ci.yml` - GitLab Pages deployment
- `.github/workflows/deploy.yml` - GitHub Actions deployment

Both pipelines:

1. Install dependencies
2. Lint & typecheck
3. Generate catalog
4. Build frontend
5. Deploy to Pages

### Frontend

- `frontend/src/types/artifact.ts` - Frontend TypeScript types
- `frontend/src/hooks/useArtifactsData.ts` - Data fetching hook
- `frontend/index.html` - Updated title and description

## Workflow for Enterprise Teams

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-org/artifact-hub-collection.git
   ```

2. **Customize catalog metadata**
   - Edit `scripts/generate-catalog.ts`
   - Update organization name, URLs, etc.

3. **Generate artifacts**

   ```bash
   npm run generate:chatmode -- --name "Internal API Helper" --tags "internal,development"
   ```

4. **Enrich content**
   - Edit the generated `.md` files
   - Add your organization-specific knowledge

5. **Push to deploy**

   ```bash
   git add .
   git commit -m "Add internal chatmodes"
   git push origin main
   ```

6. **Access via extension**
   - Add catalog URL to VS Code Agent Hub extension
   - Browse and install artifacts directly

## Testing Locally

```bash
# Build everything
npm run build

# Start dev server
npm run dev
```

Visit http://localhost:5173 to see the catalog viewer.

## Customization Points

### Generator Templates

Edit the `*_TEMPLATE` constants in `scripts/generators/*.ts` to match your style guide.

### Catalog Metadata

In `scripts/generate-catalog.ts`, update:

- `catalog.id`
- `catalog.name`
- `catalog.description`
- `catalog.author`
- `catalog.repository`
- `catalog.homepage`

### Frontend Styling

Modify `frontend/src/styles.css` and components in `frontend/src/components/`.

## Troubleshooting

### Generators not working

Ensure you're using `npx tsx` or install tsx globally:

```bash
npm install -g tsx
```

### Catalog validation fails

Check `artifacts/index.json` format matches the schema in `schema/types.ts`.

### Frontend not loading artifacts

1. Run `npm run sync` to copy artifacts to `frontend/public/`
2. Check browser console for fetch errors
3. Verify `artifacts/index.json` exists in `frontend/public/`

## Next Steps

- **Add more artifact types** - Extend the schema and create new generators
- **Custom categories** - Define your organization's taxonomy
- **Metadata extensions** - Add custom fields to `metadata.json`
- **Frontend enhancements** - Add artifact type filters, search improvements
- **Authentication** - Add private catalog support for internal use

## Support

- See `README.md` for full documentation
- Check `schema/types.ts` for TypeScript types
- Review example in `artifacts/chatmodes/example-chatmode/` after running `create-example.ts`
