import {
  parseArgs,
  interactivePrompt,
  createArtifactEntry,
  createAgentFiles,
  addToIndex,
  slugify,
} from './utils.js';

async function generateAgent(): Promise<void> {
  console.log('🤖 Generating new agent artifact...');

  // 1. Parse arguments or prompt interactively
  const args = parseArgs(process.argv.slice(2));
  const params = await interactivePrompt({
    type: 'agent',
    name: args.name,
    description: args.description,
    tags: args.tags,
    author: args.author,
  });

  // 2. Define agent structure and content
  const slug = slugify(params.name);
  const agentRoot = `agents/${slug}`;

  const readmeContent = `# ${params.name}

${params.description}

## Components

This agent pack contains:

- **Agents**: Definition files (see \`.github/agents/\` under the workspace root)
- **Prompts**: System prompts (see \`.github/prompts/\` under the workspace root)
- **Resources**: Additional resources under \`resources/\` in this agent pack, which will be projected into the workspace root on install.

## Usage

Install this agent pack to access the included agents and resources.
`;

  const agentContent = `---
name: ${params.name} Agent
description: Default agent for ${params.name}
prompt: ../prompts/default.prompt.md
---

# ${params.name} Agent

This is a generic agent included in the agent pack.
`;

  const promptContent = `You are an expert assistant for ${params.name}.
Your goal is to help the user with their tasks.
`;

  // 3. Prepare files map (relative to artifact root)
  const agentFiles: Record<string, string> = {};

  // All content lives under resources/, which is projected to the workspace root
  // by Agent Hub during installation. This means:
  //   resources/.github/agents/...   -> ./.github/agents/...
  //   resources/.github/prompts/...  -> ./.github/prompts/...
  agentFiles['resources/.github/agents/default.agent.md'] = agentContent;
  agentFiles['resources/.github/prompts/default.prompt.md'] = promptContent;

  // 4. Calculate supporting files paths (relative to artifacts/ root)
  const supportingFiles = Object.keys(agentFiles).map(
    (relPath) => `${agentRoot}/${relPath}`
  );

  // 5. Create artifact entry
  const entry = createArtifactEntry({
    name: params.name,
    description: params.description,
    type: 'agent',
    tags: params.tags,
    author: params.author,
    supportingFiles,
  });

  // 6. Write files
  createAgentFiles({
    entry,
    contentTemplate: readmeContent,
    files: agentFiles,
  });

  // 7. Add to index
  addToIndex(entry);

  console.log(`\n✅ Generated agent pack "${params.name}" at artifacts/${entry.slug}`);
  console.log(`   Structure created:`);
  console.log(`   ├── README.md`);
  console.log(`   └── resources/`);
  console.log(`       ├── .github/agents/`);
  console.log(`       └── .github/prompts/`);
  console.log('\nDon\'t forget to run "npm run generate:catalog" to update the catalog!');
}

generateAgent()
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

