# Generators & Management

Use the CLI to generate artifacts and maintain your index.

## Create artifacts

```bash
npm run generate:chatmode
npm run generate:prompt
npm run generate:instructions
npm run generate:task
```

### Arguments

All generators support non-interactive flags:

```bash
npm run generate:chatmode -- --name "My Chatmode" --tags "dev,typescript,testing" --author "Your Name" --description "Short summary"
```

## List artifacts

```bash
npm run list:artifacts
```

Prints IDs, names, and types from `artifacts/index.json`.

## Delete an artifact

```bash
npm run delete:artifact -- --id <artifact-id>
# Non-interactive:
npm run delete:artifact -- --id <artifact-id> --yes
```

Removes the artifact folder and updates `artifacts/index.json`.

## ID and slug rules

- IDs are derived from names (slugified).
- ID collisions are prevented by the generators.
- Avoid renaming IDs after publishing; treat IDs as stable references.
