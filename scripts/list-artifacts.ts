#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ArtifactsIndex } from '../schema/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

function listArtifacts(): void {
  const indexPath = resolve(projectRoot, 'artifacts', 'index.json');
  const indexContent = readFileSync(indexPath, 'utf-8');
  const index: ArtifactsIndex = JSON.parse(indexContent);

  if (index.artifacts.length === 0) {
    console.log('📋 No artifacts found.');
    console.log('\nCreate one with:');
    console.log('  npm run generate:chatmode');
    console.log('  npm run generate:prompt');
    console.log('  npm run generate:instructions');
    console.log('  npm run generate:task');
    return;
  }

  console.log(`📋 Available Artifacts (${index.artifacts.length}):\n`);

  // Group by type
  const grouped = index.artifacts.reduce(
    (acc, artifact) => {
      if (!acc[artifact.type]) {
        acc[artifact.type] = [];
      }
      acc[artifact.type]?.push(artifact);
      return acc;
    },
    {} as Record<string, typeof index.artifacts>,
  );

  // Type labels with colors
  const typeLabels: Record<string, string> = {
    chatmode: '🤖 Chatmodes',
    prompt: '📝 Prompts',
    instructions: '📋 Instructions',
    task: '✅ Tasks',
  };

  // Print by type
  Object.entries(grouped).forEach(([type, artifacts]) => {
    console.log(`${typeLabels[type] || type}:`);
    artifacts.forEach((artifact) => {
      console.log(`  • ${artifact.id} - ${artifact.name}`);
      console.log(`    Category: ${artifact.category} | Tags: ${artifact.tags.join(', ')}`);
    });
    console.log('');
  });

  console.log('To delete an artifact:');
  console.log('  npm run delete:artifact -- --id <artifact-id>');
}

try {
  listArtifacts();
} catch (error) {
  console.error('❌ Error listing artifacts:', error);
  process.exit(1);
}

