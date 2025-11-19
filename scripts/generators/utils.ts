import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ArtifactsIndex, IndexEntry, ArtifactType, Author } from '../../schema/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProjectRoot(): string {
  return projectRoot;
}

export function readIndex(): ArtifactsIndex {
  const indexPath = join(projectRoot, 'artifacts', 'index.json');
  const content = readFileSync(indexPath, 'utf-8');
  return JSON.parse(content) as ArtifactsIndex;
}

export function writeIndex(index: ArtifactsIndex): void {
  const indexPath = join(projectRoot, 'artifacts', 'index.json');
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf-8');
}

function getPluralFolder(type: ArtifactType): string {
  // Handle types that are already plural
  if (type === 'instructions') {
    return 'instructions';
  }
  // Add 's' to make plural
  return `${type}s`;
}

export function createArtifactEntry(params: {
  name: string;
  description: string;
  type: ArtifactType;
  tags: string[];
  author?: Author | undefined;
  version?: string | undefined;
  supportingFiles?: string[] | undefined;
}): IndexEntry {
  const slug = slugify(params.name);
  const now = new Date().toISOString();
  const folder = getPluralFolder(params.type);
  const category = params.tags[0] ?? 'general';

  let contentPath: string;
  if (params.type === 'bundle') {
    contentPath = `${folder}/${slug}/README.md`;
  } else {
    const contentExtension = params.type === 'chatmode' ? 'chatmode.md' : `${params.type}.md`;
    contentPath = `${folder}/${slug}/${slug}.${contentExtension}`;
  }

  return {
    id: slug,
    name: params.name,
    description: params.description,
    type: params.type,
    category,
    tags: params.tags,
    version: params.version || '1.0.0',
    author: params.author,
    createdAt: now,
    updatedAt: now,
    paths: {
      metadata: `${folder}/${slug}/metadata.json`,
      content: contentPath,
    },
    slug: `${folder}/${slug}`,
    supportingFiles: params.supportingFiles,
  };
}

export function createArtifactFiles(params: {
  entry: IndexEntry;
  contentTemplate: string;
}): void {
  const artifactDir = join(projectRoot, 'artifacts', params.entry.slug);

  // Create directory
  if (!existsSync(artifactDir)) {
    mkdirSync(artifactDir, { recursive: true });
  }

  // Write metadata.json
  const metadata = {
    id: params.entry.id,
    name: params.entry.name,
    description: params.entry.description,
    type: params.entry.type,
    category: params.entry.category,
    tags: params.entry.tags,
    version: params.entry.version,
    author: params.entry.author,
    createdAt: params.entry.createdAt,
    updatedAt: params.entry.updatedAt,
    supportingFiles: params.entry.supportingFiles,
  };
  const metadataPath = join(projectRoot, 'artifacts', params.entry.paths.metadata);
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');

  // Write content file
  const contentPath = join(projectRoot, 'artifacts', params.entry.paths.content);
  writeFileSync(contentPath, params.contentTemplate, 'utf-8');
}

export function createBundleFiles(params: {
  entry: IndexEntry;
  contentTemplate: string;
  files: Record<string, string>; // relative path -> content
}): void {
  // First create the standard files (metadata and main content/README)
  createArtifactFiles({
    entry: params.entry,
    contentTemplate: params.contentTemplate
  });

  const artifactDir = join(projectRoot, 'artifacts', params.entry.slug);

  // Create additional bundle files
  for (const [relPath, content] of Object.entries(params.files)) {
    const fullPath = join(artifactDir, relPath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, content, 'utf-8');
  }
}

export function addToIndex(entry: IndexEntry): void {
  const index = readIndex();

  // Check for duplicates
  const existing = index.artifacts.find((a) => a.id === entry.id);
  if (existing) {
    throw new Error(`Artifact with id "${entry.id}" already exists`);
  }

  index.artifacts.push(entry);
  writeIndex(index);
}

export function parseArgs(
  args: string[],
): {
  name?: string | undefined;
  description?: string | undefined;
  tags?: string[] | undefined;
  author?: string | undefined;
} {
  const parsed: {
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    author?: string | undefined;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === '--name' && nextArg) {
      parsed.name = nextArg;
      i++;
    } else if (arg === '--description' && nextArg) {
      parsed.description = nextArg;
      i++;
    } else if (arg === '--tags' && nextArg) {
      parsed.tags = nextArg.split(',').map((t) => t.trim());
      i++;
    } else if (arg === '--author' && nextArg) {
      parsed.author = nextArg;
      i++;
    }
  }

  return parsed;
}

export function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

export async function interactivePrompt(params: {
  type: ArtifactType;
  name?: string | undefined;
  description?: string | undefined;
  tags?: string[] | undefined;
  author?: string | undefined;
}): Promise<{
  name: string;
  description: string;
  tags: string[];
  author?: Author | undefined;
}> {
  const name = params.name ?? (await prompt(`${params.type} name: `));
  const description = params.description ?? (await prompt('Description: '));
  const tagsInput =
    params.tags?.join(', ') ??
    (await prompt('Tags (comma-separated): '));
  const tags = tagsInput.split(',').map((t) => t.trim());
  const authorName = params.author ?? (await prompt('Author name (optional): '));

  const result: {
    name: string;
    description: string;
    tags: string[];
    author?: Author | undefined;
  } = {
    name,
    description,
    tags,
  };

  if (authorName) {
    result.author = { name: authorName };
  }

  return result;
}
