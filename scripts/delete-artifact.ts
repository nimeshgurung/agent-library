#!/usr/bin/env tsx

import { readFileSync, writeFileSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { ArtifactsIndex } from '../schema/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

function parseArgs(args: string[]): { id?: string | undefined; confirm?: boolean } {
  const parsed: { id?: string | undefined; confirm?: boolean } = { confirm: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === '--id' && nextArg) {
      parsed.id = nextArg;
      i++;
    } else if (arg === '--yes' || arg === '-y') {
      parsed.confirm = true;
    }
  }

  return parsed;
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function deleteArtifact(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.id) {
    console.error('❌ Error: --id argument is required');
    console.log('\nUsage:');
    console.log('  npm run delete:artifact -- --id <artifact-id> [--yes]');
    console.log('\nTo see available artifacts:');
    console.log('  npm run list:artifacts');
    process.exit(1);
  }

  const indexPath = resolve(projectRoot, 'artifacts', 'index.json');
  const indexContent = readFileSync(indexPath, 'utf-8');
  const index: ArtifactsIndex = JSON.parse(indexContent);

  // Find the artifact
  const artifact = index.artifacts.find((a) => a.id === args.id);
  if (!artifact) {
    console.error(`❌ Artifact with id "${args.id}" not found`);
    console.log('\nAvailable artifacts:');
    index.artifacts.forEach((a) => {
      console.log(`  • ${a.id} (${a.type})`);
    });
    process.exit(1);
  }

  // Show what will be deleted
  console.log(`\n🗑️  About to delete:`);
  console.log(`   ID: ${artifact.id}`);
  console.log(`   Name: ${artifact.name}`);
  console.log(`   Type: ${artifact.type}`);
  console.log(`   Location: artifacts/${artifact.slug}`);

  // Confirm deletion
  if (!args.confirm) {
    const answer = await prompt('\nAre you sure? (yes/no): ');
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Deletion cancelled');
      process.exit(0);
    }
  }

  // Delete the folder
  const artifactPath = join(projectRoot, 'artifacts', artifact.slug);
  try {
    rmSync(artifactPath, { recursive: true, force: true });
    console.log(`✅ Deleted folder: artifacts/${artifact.slug}`);
  } catch (error) {
    console.error(`⚠️  Warning: Could not delete folder:`, error);
  }

  // Remove from index
  const updatedIndex: ArtifactsIndex = {
    artifacts: index.artifacts.filter((a) => a.id !== args.id),
  };

  writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2) + '\n', 'utf-8');
  console.log(`✅ Removed from artifacts/index.json`);

  console.log('\n✨ Artifact deleted successfully!');
  console.log('\nNext steps:');
  console.log('  1. Run "npm run generate:catalog" to update the catalog');
  console.log('  2. Run "npm run sync" to sync to frontend');
}

deleteArtifact().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`❌ Error: ${error.message}`);
  } else {
    console.error('❌ Unknown error occurred');
  }
  process.exit(1);
});

