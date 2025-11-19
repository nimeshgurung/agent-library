import { z } from 'zod';

// Artifact type enum
export const artifactTypeSchema = z.enum(['chatmode', 'prompt', 'instructions', 'task', 'bundle']);

export const categorySchema = z.string();

export const artifactAuthorSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

// Schema for multi-artifact support
export const artifactEntrySchema = z.object({
  id: z.string().min(1, 'Artifact id is required'),
  name: z.string().min(1, 'Artifact name is required'),
  description: z.string().min(1, 'Artifact description is required'),
  type: artifactTypeSchema,
  category: categorySchema,
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
  version: z.string().min(1, 'Version is required'),
  author: artifactAuthorSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  paths: z.object({
    metadata: z.string().min(1, 'Metadata path is required'),
    content: z.string().min(1, 'Content path is required'),
  }),
  slug: z.string().min(1, 'Slug is required'),
  supportingFiles: z.array(z.string()).optional(),
});

export const artifactsIndexSchema = z.object({
  artifacts: z.array(artifactEntrySchema),
});

export type ArtifactType = z.infer<typeof artifactTypeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ArtifactEntry = z.infer<typeof artifactEntrySchema>;
export type ArtifactsIndexDocument = z.infer<typeof artifactsIndexSchema>;

