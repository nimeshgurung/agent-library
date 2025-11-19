import { z } from 'zod';

// Artifact Types
export const ArtifactTypeSchema = z.enum(['chatmode', 'prompt', 'instructions', 'task', 'agent']);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

// Author Schema
export const AuthorSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
});
export type Author = z.infer<typeof AuthorSchema>;

// Metadata Schema (for individual artifacts)
export const ArtifactMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: ArtifactTypeSchema,
  category: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
  author: AuthorSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  supportingFiles: z.array(z.string()).optional(),
});
export type ArtifactMetadata = z.infer<typeof ArtifactMetadataSchema>;

// Catalog Artifact Schema (for copilot-catalog.json)
export const CatalogArtifactSchema = z.object({
  id: z.string(),
  type: ArtifactTypeSchema,
  name: z.string(),
  description: z.string(),
  path: z.string(),
  version: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  keywords: z.array(z.string()).optional(),
  author: AuthorSchema.optional(),
  supportingFiles: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CatalogArtifact = z.infer<typeof CatalogArtifactSchema>;

// Repository Schema
export const RepositorySchema = z.object({
  type: z.enum(['git', 'github', 'gitlab']),
  url: z.string(),
  branch: z.string(),
});
export type Repository = z.infer<typeof RepositorySchema>;

// Catalog Metadata Schema
export const CatalogMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  author: AuthorSchema,
  repository: RepositorySchema,
  license: z.string(),
  homepage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});
export type CatalogMetadata = z.infer<typeof CatalogMetadataSchema>;

// Complete Catalog Schema
export const CopilotCatalogSchema = z.object({
  $schema: z.string().optional(),
  version: z.string(),
  catalog: CatalogMetadataSchema,
  artifacts: z.array(CatalogArtifactSchema),
});
export type CopilotCatalog = z.infer<typeof CopilotCatalogSchema>;

// Index Entry Schema (for artifacts/index.json)
export const IndexEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: ArtifactTypeSchema,
  category: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
  author: AuthorSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  paths: z.object({
    metadata: z.string(),
    content: z.string(),
  }),
  supportingFiles: z.array(z.string()).optional(),
  slug: z.string(),
});
export type IndexEntry = z.infer<typeof IndexEntrySchema>;

// Artifacts Index Schema
export const ArtifactsIndexSchema = z.object({
  artifacts: z.array(IndexEntrySchema),
});
export type ArtifactsIndex = z.infer<typeof ArtifactsIndexSchema>;

