import { z } from 'zod';

export const difficultySchema = z.union([
  z.literal('introductory'),
  z.literal('intermediate'),
  z.literal('advanced'),
]);

export const categorySchema = z.union([
  // New 5-tag taxonomy
  z.literal('CI CD Pipeline'),
  z.literal('Testing'),
  z.literal('Code Quality'),
  z.literal('Product'),
  z.literal('AI Engineering'),
  // Legacy (deprecated, kept for backward compatibility)
  z.literal('development-workflow'),
  z.literal('testing'),
  z.literal('collaboration'),
  z.literal('git-workflow'),
  z.literal('meta'),
  z.literal('general'),
]);

export const chatmodeMetadataSourceSchema = z.object({
  url: z.string().url('Source URL must be valid.'),
  owner: z.string().optional(),
  repository: z.string().optional(),
  path: z.string().optional(),
});

export const chatmodeEntrySchema = z.object({
  id: z.string().min(1, 'Chatmode id is required'),
  name: z.string().min(1, 'Chatmode name is required'),
  summary: z.string().min(1, 'Chatmode summary is required'),
  description: z.string().min(1, 'Chatmode description is required'),
  category: categorySchema,
  difficulty: difficultySchema,
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
  tools: z.array(z.string().min(1)).default([]),
  model: z.string().min(1, 'Model is required'),
  author: z.string().min(1, 'Author is required'),
  license: z.string().min(1, 'License is required'),
  version: z.string().min(1, 'Version is required'),
  source: chatmodeMetadataSourceSchema,
  paths: z.object({
    metadata: z.string().min(1, 'Metadata path is required'),
    chatmode: z.string().min(1, 'Chatmode path is required'),
  }),
  updatedAt: z.string().datetime({ offset: true }),
  slug: z.string().min(1, 'Slug is required'),
});

export const chatmodeIndexSchema = z.object({
  chatmodes: z.array(chatmodeEntrySchema).min(1, 'At least one chatmode must be present'),
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Category = z.infer<typeof categorySchema>;
export type ChatmodeEntry = z.infer<typeof chatmodeEntrySchema>;
export type ChatmodeIndexDocument = z.infer<typeof chatmodeIndexSchema>;

export const orderedDifficulties: ReadonlyArray<Difficulty> = [
  'introductory',
  'intermediate',
  'advanced',
];
