# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-11-19

### BREAKING CHANGES

**Bundle → Agent Rename**

This release renames the `bundle` artifact type to `agent` (agent pack) across the entire codebase and catalog format.

#### What Changed

- **Artifact Type**: `bundle` → `agent` in schemas, catalog, and all documentation
- **Directory Structure**: `artifacts/bundles/` → `artifacts/agents/`
- **Generator Command**: `npm run generate:bundle` → `npm run generate:agent`
- **Terminology**: "bundles" are now called "agent packs" or "agents" throughout docs and UI

#### Migration Required

1. **Regenerate Catalogs**: Run `npm run generate:catalog` to update your `copilot-catalog.json` with the new `agent` type
2. **Update Existing Agents**: Any custom bundles must be:
   - Moved from `artifacts/bundles/<id>/` to `artifacts/agents/<id>/`
   - Updated in `artifacts/index.json` to use `type: "agent"` and updated paths/slugs
   - Their `metadata.json` files updated to reflect the new type and paths
3. **Update CI/CD**: Change any scripts that reference `bundles` or `generate:bundle` to use `agents` and `generate:agent`

#### Why This Change

The term "agent pack" better reflects the nature of these artifacts: they are collections of agents, prompts, and resources that work together as a cohesive development kit.

#### Compatibility

- **No backward compatibility**: Catalogs using `type: "bundle"` will not work with Agent Hub 1.0.0+
- Agent Hub now expects `type: "agent"` for directory-style artifact packs

## [1.0.0] - 2024-11-18

- Initial release with bundle support
