#!/usr/bin/env tsx

import { cp, mkdir, rm, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Sync artifacts from artifacts/ to frontend/public/artifacts/
 * This ensures the frontend can serve the latest artifacts.
 */
async function syncArtifacts(): Promise<void> {
  const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const sourceRoot = join(repositoryRoot, 'artifacts');
  const targetRoot = join(repositoryRoot, 'frontend', 'public', 'artifacts');

  process.stdout.write('🔄 Syncing artifacts to frontend/public/artifacts/...\n');

  // Clean and recreate target directory
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });

  // Copy everything from artifacts/ to frontend/public/artifacts/
  await cp(sourceRoot, targetRoot, { recursive: true });

  // After copying, create publish-safe aliases for agent resources so static hosts
  // that block dot-directories can still serve prompts/agents content.
  // For each agent:
  //   resources/.github/prompts/** -> resources/prompts/**
  //   resources/.github/agents/**  -> resources/agents/**
  // Then remove the dot .github folder from public artifacts to avoid hosting issues.
  try {
    const agentsDir = join(targetRoot, 'agents');
    const agentEntries = await readdir(agentsDir, { withFileTypes: true });

    for (const entry of agentEntries) {
      if (!entry.isDirectory()) continue;
      const agentDir = join(agentsDir, entry.name);
      const resourcesDir = join(agentDir, 'resources');
      const dotGithubDir = join(resourcesDir, '.github');
      const promptsSrc = join(dotGithubDir, 'prompts');
      const agentsSrc = join(dotGithubDir, 'agents');
      const promptsDst = join(resourcesDir, 'prompts');
      const agentsDst = join(resourcesDir, 'agents');

      // Copy prompts alias if present
      try {
        await stat(promptsSrc);
        await cp(promptsSrc, promptsDst, { recursive: true });
      } catch {
        // no prompts source; skip
      }

      // Copy agents alias if present
      try {
        await stat(agentsSrc);
        await cp(agentsSrc, agentsDst, { recursive: true });
      } catch {
        // no agents source; skip
      }

      // Remove .github directory from public to avoid blocked serving
      try {
        await rm(dotGithubDir, { recursive: true, force: true });
      } catch {
        // already absent; fine
      }
    }
  } catch {
    // No agents or resources; skip aliasing
  }

  // Also copy copilot-catalog.json to frontend/public/
  const catalogSource = join(repositoryRoot, 'copilot-catalog.json');
  const catalogTarget = join(repositoryRoot, 'frontend', 'public', 'copilot-catalog.json');

  try {
    await cp(catalogSource, catalogTarget);
    process.stdout.write('📋 Copied copilot-catalog.json to frontend/public/\n');
  } catch {
    // Catalog might not exist yet, that's okay
    process.stdout.write('⚠️  copilot-catalog.json not found (run generate:catalog first)\n');
  }

  process.stdout.write('✅ Artifacts synced successfully!\n');
}

syncArtifacts().catch((error: unknown) => {
  if (error instanceof Error) {
    process.stderr.write(`❌ ${error.message}\n`);
  } else {
    process.stderr.write('❌ Unknown error while syncing artifacts.\n');
  }
  process.exit(1);
});
