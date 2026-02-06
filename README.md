# @kipper/agents-md

Generate compressed documentation index for AGENTS.md / CLAUDE.md supporting Vue, uni-app, and more frameworks.

## Installation

```bash
# Use directly with npx
npx @kipper/agents-md

# Or install globally
npm install -g @kipper/agents-md
```

## Usage

```bash
# Auto-detect project type and generate index
npx @kipper/agents-md

# Specify framework manually
npx @kipper/agents-md --framework vue
npx @kipper/agents-md --framework uniapp

# Preview without writing files
npx @kipper/agents-md --dry-run

# Force re-pull documentation
npx @kipper/agents-md --force

# Also generate CLAUDE.md
npx @kipper/agents-md --claude

# Use cached docs (offline mode)
npx @kipper/agents-md --offline

# Verbose output
npx @kipper/agents-md --verbose

# List supported frameworks
npx @kipper/agents-md list-frameworks
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
import { agentsMd, detectFramework, generateDocsIndex } from '@kipper/agents-md';

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
