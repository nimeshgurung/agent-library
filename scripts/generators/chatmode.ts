#!/usr/bin/env tsx

import {
  parseArgs,
  interactivePrompt,
  createArtifactEntry,
  createArtifactFiles,
  addToIndex,
} from './utils.js';

const CHATMODE_TEMPLATE = `# {{NAME}}

{{DESCRIPTION}}

## Usage

This chatmode provides specialized assistance for {{CATEGORY}}.

## Instructions

Add your detailed instructions here. This section should include:

- What this chatmode does
- How to use it effectively
- Any specific commands or patterns
- Expected inputs and outputs

## Examples

Provide examples of how to use this chatmode:

\`\`\`
Example 1: Basic usage
\`\`\`

\`\`\`
Example 2: Advanced usage
\`\`\`

## Tips

- Tip 1: Best practices
- Tip 2: Common pitfalls to avoid
- Tip 3: Advanced techniques

---

*Created: {{DATE}}*
*Version: {{VERSION}}*
`;

async function generateChatmode(): Promise<void> {
  console.log('🤖 Generating new chatmode...\n');

  const args = parseArgs(process.argv.slice(2));

  const data = await interactivePrompt({
    type: 'chatmode',
    name: args.name,
    description: args.description,
    tags: args.tags,
    author: args.author,
  });

  const entry = createArtifactEntry({
    name: data.name,
    description: data.description,
    type: 'chatmode',
    tags: data.tags,
    author: data.author,
  });

  const content = CHATMODE_TEMPLATE.replace(/{{NAME}}/g, data.name)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{CATEGORY}}/g, data.tags[0] ?? 'general')
    .replace(/{{DATE}}/g, new Date().toISOString().split('T')[0] || '')
    .replace(/{{VERSION}}/g, entry.version);

  createArtifactFiles({
    entry,
    contentTemplate: content,
  });

  addToIndex(entry);

  console.log('\n✅ Chatmode created successfully!');
  console.log(`📁 Location: artifacts/${entry.slug}`);
  console.log(`📝 Edit: artifacts/${entry.paths.content}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Enrich the content in ${entry.paths.content}`);
  console.log(`  2. Run 'npm run build' to generate the catalog`);
  console.log(`  3. Commit and push to deploy`);
}

generateChatmode()
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

