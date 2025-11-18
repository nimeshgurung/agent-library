#!/usr/bin/env tsx

import {
  parseArgs,
  interactivePrompt,
  createArtifactEntry,
  createArtifactFiles,
  addToIndex,
} from './utils.js';

const INSTRUCTIONS_TEMPLATE = `# {{NAME}}

{{DESCRIPTION}}

## Overview

These instructions define how to {{CATEGORY}}.

## Prerequisites

Before using these instructions, ensure:

- [ ] Prerequisite 1
- [ ] Prerequisite 2
- [ ] Prerequisite 3

## Instructions

### Step 1: Initial Setup

Detailed instructions for the first step...

### Step 2: Core Process

Continue with the main process...

### Step 3: Validation

Verify the results...

### Step 4: Completion

Final steps and cleanup...

## Configuration

If applicable, describe any configuration options:

\`\`\`json
{
  "option1": "value1",
  "option2": "value2"
}
\`\`\`

## Best Practices

1. **Practice 1**: Description
2. **Practice 2**: Description
3. **Practice 3**: Description

## Troubleshooting

### Issue 1: Common Problem

**Solution:** How to fix it...

### Issue 2: Another Problem

**Solution:** How to resolve it...

## Examples

### Example 1: Basic Scenario

Step-by-step walkthrough...

### Example 2: Advanced Scenario

More complex example...

## Resources

- [Resource 1](https://example.com)
- [Resource 2](https://example.com)

---

*Created: {{DATE}}*
*Version: {{VERSION}}*
`;

async function generateInstructions(): Promise<void> {
  console.log('📋 Generating new instructions...\n');

  const args = parseArgs(process.argv.slice(2));

  const data = await interactivePrompt({
    type: 'instructions',
    name: args.name,
    description: args.description,
    category: args.category,
    tags: args.tags,
    author: args.author,
  });

  const entry = createArtifactEntry({
    name: data.name,
    description: data.description,
    type: 'instructions',
    category: data.category,
    tags: data.tags,
    author: data.author,
  });

  const content = INSTRUCTIONS_TEMPLATE.replace(/{{NAME}}/g, data.name)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{CATEGORY}}/g, data.category)
    .replace(/{{DATE}}/g, new Date().toISOString().split('T')[0] || '')
    .replace(/{{VERSION}}/g, entry.version);

  createArtifactFiles({
    entry,
    contentTemplate: content,
  });

  addToIndex(entry);

  console.log('\n✅ Instructions created successfully!');
  console.log(`📁 Location: artifacts/${entry.slug}`);
  console.log(`📝 Edit: artifacts/${entry.paths.content}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Fill in the step-by-step instructions in ${entry.paths.content}`);
  console.log(`  2. Add prerequisites and configuration details`);
  console.log(`  3. Include troubleshooting tips`);
  console.log(`  4. Run 'npm run build' to generate the catalog`);
}

generateInstructions()
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

