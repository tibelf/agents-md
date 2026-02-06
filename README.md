# @askchiefleo/agents-md

Generate compressed documentation index for AGENTS.md / CLAUDE.md supporting Vue, uni-app, and more frameworks.

## Installation

```bash
# Use directly with npx
npx @askchiefleo/agents-md

# Or install globally
npm install -g @askchiefleo/agents-md
```

## Usage

```bash
# Auto-detect project type and generate index
npx @askchiefleo/agents-md

# Specify framework manually
npx @askchiefleo/agents-md --framework vue
npx @askchiefleo/agents-md --framework uniapp

# Preview without writing files
npx @askchiefleo/agents-md --dry-run

# Force re-pull documentation
npx @askchiefleo/agents-md --force

# Also generate CLAUDE.md
npx @askchiefleo/agents-md --claude

# Use cached docs (offline mode)
npx @askchiefleo/agents-md --offline

# Verbose output
npx @askchiefleo/agents-md --verbose

# List supported frameworks
npx @askchiefleo/agents-md list-frameworks
```

## What it does

1. **Detects** your project type (Vue / uni-app / etc.)
2. **Pulls** official documentation using git sparse-checkout to `.{framework}-docs/`
3. **Generates** a compressed documentation index
4. **Injects** the index into AGENTS.md (or CLAUDE.md) with markers for easy updates
5. **Updates** .gitignore to exclude the docs directory

## Output Format

The generated index uses a compressed format:

```
[Vue Docs Index]|root:.vue-docs|STOP. What you remember about Vue may be outdated...|guide:{introduction,essentials,scaling-up}|api:{reactivity,composition}
```

This format is optimized for AI agents to quickly locate relevant documentation.

## Supported Frameworks

- **Vue** - Vue.js 3.x
- **uni-app** - uni-app 3.x (coming soon)

## Configuration

Each framework has its own configuration in the `rules/` directory:

```
rules/
├── vue/
│   ├── config.json       # Framework detection & docs source
│   └── important-rules.md # AI instructions
└── uniapp/
    ├── config.json
    └── important-rules.md
```

## Programmatic API

```typescript
import { agentsMd, detectFramework, generateDocsIndex } from '@askchiefleo/agents-md';

// Run the full process
await agentsMd({
  cwd: '/path/to/project',
  framework: 'vue',
  output: 'AGENTS.md',
});

// Detect framework only
const info = await detectFramework('/path/to/project');

// Generate index from existing docs
const index = generateDocsIndex('.vue-docs', config);
```

## License

MIT
