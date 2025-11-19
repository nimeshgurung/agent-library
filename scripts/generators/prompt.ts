#!/usr/bin/env tsx

import {
  parseArgs,
  interactivePrompt,
  createArtifactEntry,
  createArtifactFiles,
  addToIndex,
} from './utils.js';

const PROMPT_TEMPLATE = `# {{NAME}}

{{DESCRIPTION}}

## Prompt

\`\`\`
{{PROMPT_CONTENT}}
\`\`\`

## Context

This prompt is designed for {{CATEGORY}} tasks.

## Variables

List any variables that should be replaced:

- \`{{VARIABLE1}}\`: Description
- \`{{VARIABLE2}}\`: Description

## Usage Examples

### Example 1: Basic Usage

**Input:**
\`\`\`
Replace variables with actual values
\`\`\`

**Expected Output:**
\`\`\`
Describe what the AI should produce
\`\`\`

### Example 2: Advanced Usage

**Input:**
\`\`\`
More complex example
\`\`\`

**Expected Output:**
\`\`\`
Expected advanced results
\`\`\`

## Notes

- Note 1: Important considerations
- Note 2: Tips for best results
- Note 3: Common use cases

---

*Created: {{DATE}}*
*Version: {{VERSION}}*
`;

async function generatePrompt(): Promise<void> {
  console.log('📝 Generating new prompt...\n');

  const args = parseArgs(process.argv.slice(2));

  const data = await interactivePrompt({
    type: 'prompt',
    name: args.name,
    description: args.description,
    tags: args.tags,
    author: args.author,
  });

  const entry = createArtifactEntry({
    name: data.name,
    description: data.description,
    type: 'prompt',
    tags: data.tags,
    author: data.author,
  });

  const promptContent = `Write your prompt template here.
Use {{VARIABLES}} for dynamic content.
Be specific about what the AI should do.`;

  const content = PROMPT_TEMPLATE.replace(/{{NAME}}/g, data.name)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{CATEGORY}}/g, data.tags[0] ?? 'general')
    .replace(/{{PROMPT_CONTENT}}/g, promptContent)
    .replace(/{{DATE}}/g, new Date().toISOString().split('T')[0] || '')
    .replace(/{{VERSION}}/g, entry.version);

  createArtifactFiles({
    entry,
    contentTemplate: content,
  });

  addToIndex(entry);

  console.log('\n✅ Prompt created successfully!');
  console.log(`📁 Location: artifacts/${entry.slug}`);
  console.log(`📝 Edit: artifacts/${entry.paths.content}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Replace the prompt content in ${entry.paths.content}`);
  console.log(`  2. Define any variables needed`);
  console.log(`  3. Add usage examples`);
  console.log(`  4. Run 'npm run build' to generate the catalog`);
}

generatePrompt()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error('❌ Unknown error occurred');
    }
    process.exit(1);
  });

