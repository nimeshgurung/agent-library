#!/usr/bin/env tsx

import {
  createArtifactEntry,
  createArtifactFiles,
  addToIndex,
} from './utils.js';

// Create a sample chatmode
const chatmodeEntry = createArtifactEntry({
  name: 'Example Chatmode',
  description: 'A sample chatmode to demonstrate the artifact structure',
  type: 'chatmode',
  category: 'Examples',
  tags: ['example', 'demo'],
  author: { name: 'Artifact Hub' },
});

const chatmodeContent = `# Example Chatmode

A sample chatmode to demonstrate the artifact structure.

## Usage

This is an example chatmode that shows how artifacts are structured in the Artifact Hub Collection.

## Instructions

1. Fork this repository
2. Run the generators to create your own artifacts
3. Customize the generated templates
4. Push to deploy via CI/CD

## Features

- Multi-artifact support (chatmodes, prompts, instructions, tasks)
- Automatic catalog generation
- Dual CI/CD pipelines (GitLab + GitHub)
- Beautiful frontend catalog viewer
- VS Code extension integration

---

*Created: ${new Date().toISOString().split('T')[0]}*
*Version: 1.0.0*
`;

createArtifactFiles({
  entry: chatmodeEntry,
  contentTemplate: chatmodeContent,
});

addToIndex(chatmodeEntry);

console.log('✅ Example chatmode created!');
console.log(`📁 Location: artifacts/${chatmodeEntry.slug}`);

