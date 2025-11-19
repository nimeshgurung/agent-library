#!/usr/bin/env tsx

import { cp, mkdir, rm } from 'node:fs/promises';
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
