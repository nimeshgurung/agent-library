#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  ArtifactsIndexSchema,
  CopilotCatalogSchema,
  type ArtifactsIndex,
  type CopilotCatalog,
  type CatalogArtifact,
  type IndexEntry,
} from '../schema/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

function transformToCatalogArtifact(entry: IndexEntry): CatalogArtifact {
  // Ensure paths are relative to the catalog root (which is artifacts/)
  // But the catalog says "path": "artifacts/..." so clients can find it relative to catalog root
  return {
    id: entry.id,
    type: entry.type,
    name: entry.name,
    description: entry.description,
    path: `artifacts/${entry.paths.content}`,
    version: entry.version,
    category: entry.category,
    tags: entry.tags,
    keywords: entry.tags,
    ...(entry.author && { author: entry.author }),
    ...(entry.supportingFiles && entry.supportingFiles.length > 0
      ? { supportingFiles: entry.supportingFiles.map((f) => `artifacts/${f}`) }
      : {}),
    metadata: {
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      slug: entry.slug,
    },
  };
}

function generateCatalog(): void {
  console.log('📖 Reading artifacts/index.json...');

  const indexPath = resolve(projectRoot, 'artifacts', 'index.json');
  const indexContent = readFileSync(indexPath, 'utf-8');
  const parsed: unknown = JSON.parse(indexContent);

  // Validate the index
  const validationResult = ArtifactsIndexSchema.safeParse(parsed);
  if (!validationResult.success) {
    console.error('❌ Invalid index.json format:');
    console.error(validationResult.error.format());
    throw new Error('Invalid artifacts/index.json format');
  }

  const index: ArtifactsIndex = validationResult.data;

  console.log(`✅ Found ${String(index.artifacts.length)} artifacts`);

  // Transform all artifacts to catalog format
  const artifacts = index.artifacts.map(transformToCatalogArtifact);

  // Extract unique categories and tags
  const categories = [...new Set(index.artifacts.map((a) => a.category))];
  const allTags = [...new Set(index.artifacts.flatMap((a) => a.tags))];

  // Use placeholders that the extension can replace at runtime, or the user can replace with env vars if they want.
  const authorName = process.env['CATALOG_AUTHOR'] || 'Artifact Hub Collection';
  const authorUrl = process.env['CATALOG_URL'] || '__CATALOG_URL__';
  const repoUrl = process.env['CATALOG_URL'] || '__CATALOG_URL__';
  const homepage = process.env['CATALOG_HOMEPAGE'] || '__CATALOG_URL__';

  // Create the catalog
  const catalog: CopilotCatalog = {
    $schema:
      'https://raw.githubusercontent.com/artifact-hub/schema/v1/catalog.schema.json',
    version: '1.0.0',
    catalog: {
      id: 'artifact-hub-collection',
      name: 'Artifact Hub Collection',
      description:
        'Enterprise collection of AI development artifacts including chatmodes, prompts, instructions, and tasks',
      author: {
        name: authorName,
        url: authorUrl,
      },
      repository: {
        type: 'git',
        url: repoUrl,
        branch: 'main',
      },
      license: 'MIT',
      homepage,
      tags: allTags.slice(0, 20),
      categories,
    },
    artifacts,
  };

  // Validate the catalog
  const catalogValidation = CopilotCatalogSchema.safeParse(catalog);
  if (!catalogValidation.success) {
    console.error('❌ Generated catalog is invalid:');
    console.error(catalogValidation.error.format());
    throw new Error('Generated catalog failed validation');
  }

  // Write the catalog
  const catalogPath = resolve(projectRoot, 'copilot-catalog.json');
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');

  console.log(
    `✅ Generated copilot-catalog.json with ${String(artifacts.length)} artifacts`,
  );

  // Print statistics by type
  const stats = artifacts.reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    },
    {},
  );

  console.log('\n📊 Artifact Statistics:');
  Object.entries(stats).forEach(([type, count]) => {
    console.log(`  ${type}: ${String(count)}`);
  });

  console.log(`\n📂 Categories: ${categories.join(', ')}`);
  console.log(`🏷️  Tags: ${allTags.slice(0, 10).join(', ')}${allTags.length > 10 ? '...' : ''}`);
  console.log(`📝 File written to: ${catalogPath}`);
}

// Run the generator
try {
  generateCatalog();
  console.log('\n✨ Catalog generation complete!');
} catch (error) {
  console.error('❌ Error generating catalog:', error);
  process.exit(1);
}

