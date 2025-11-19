#!/usr/bin/env tsx

import {
  parseArgs,
  interactivePrompt,
  createArtifactEntry,
  createArtifactFiles,
  addToIndex,
} from './utils.js';

const TASK_TEMPLATE = `# {{NAME}}

{{DESCRIPTION}}

## Task Definition

This task is designed to {{CATEGORY}}.

## Objective

Define the main goal of this task...

## Inputs

List what inputs are required:

| Input | Type | Description | Required |
|-------|------|-------------|----------|
| input1 | string | Description | Yes |
| input2 | number | Description | No |

## Process

### Phase 1: Preparation

1. Step 1
2. Step 2
3. Step 3

### Phase 2: Execution

1. Step 1
2. Step 2
3. Step 3

### Phase 3: Validation

1. Step 1
2. Step 2
3. Step 3

## Expected Outputs

Describe what the task should produce:

| Output | Type | Description |
|--------|------|-------------|
| output1 | file | Description |
| output2 | data | Description |

## Success Criteria

Define what success looks like:

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Examples

### Example 1: Basic Task Execution

**Input:**
\`\`\`
Sample input data
\`\`\`

**Process:**
1. Process step 1
2. Process step 2

**Output:**
\`\`\`
Expected output
\`\`\`

### Example 2: Advanced Task Execution

**Input:**
\`\`\`
More complex input
\`\`\`

**Process:**
1. Advanced step 1
2. Advanced step 2

**Output:**
\`\`\`
Expected advanced output
\`\`\`

## Error Handling

Describe how to handle common errors:

- **Error Type 1**: Solution
- **Error Type 2**: Solution
- **Error Type 3**: Solution

## Dependencies

List any dependencies or prerequisites:

- Dependency 1
- Dependency 2
- Dependency 3

## Notes

Additional information:

- Note 1
- Note 2
- Note 3

---

*Created: {{DATE}}*
*Version: {{VERSION}}*
`;

async function generateTask(): Promise<void> {
  console.log('✅ Generating new task...\n');

  const args = parseArgs(process.argv.slice(2));

  const data = await interactivePrompt({
    type: 'task',
    name: args.name,
    description: args.description,
    tags: args.tags,
    author: args.author,
  });

  const entry = createArtifactEntry({
    name: data.name,
    description: data.description,
    type: 'task',
    tags: data.tags,
    author: data.author,
  });

  const content = TASK_TEMPLATE.replace(/{{NAME}}/g, data.name)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{CATEGORY}}/g, data.tags[0] ?? 'general')
    .replace(/{{DATE}}/g, new Date().toISOString().split('T')[0] || '')
    .replace(/{{VERSION}}/g, entry.version);

  createArtifactFiles({
    entry,
    contentTemplate: content,
  });

  addToIndex(entry);

  console.log('\n✅ Task created successfully!');
  console.log(`📁 Location: artifacts/${entry.slug}`);
  console.log(`📝 Edit: artifacts/${entry.paths.content}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Define inputs, outputs, and success criteria in ${entry.paths.content}`);
  console.log(`  2. Document the process phases`);
  console.log(`  3. Add examples and error handling`);
  console.log(`  4. Run 'npm run build' to generate the catalog`);
}

generateTask()
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
