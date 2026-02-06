#!/usr/bin/env node
import { Command } from 'commander';
import { agentsMd, listFrameworks, AgentsMdOptions } from './commands/agents-md.js';

const program = new Command();

program
  .name('agents-md')
  .description('Generate compressed docs index for AGENTS.md (Vue, uni-app, etc.)')
  .version('1.0.0');

program
  .command('generate', { isDefault: true })
  .description('Generate and inject documentation index')
  .option('-f, --framework <name>', 'Specify framework (skip auto-detection)')
  .option('-o, --output <file>', 'Output file (default: AGENTS.md)', 'AGENTS.md')
  .option('--claude', 'Also generate CLAUDE.md')
  .option('--dry-run', 'Preview without writing files')
  .option('--force', 'Force re-pull documentation')
  .option('--offline', 'Use cached docs only (no network)')
  .option('-v, --verbose', 'Verbose output with debug logging')
  .action(async (options: AgentsMdOptions) => {
    try {
      await agentsMd(options);
    } catch (err) {
      console.error('Error:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('list-frameworks')
  .description('List supported frameworks')
  .action(() => {
    listFrameworks();
  });

program
  .command('list')
  .description('Alias for list-frameworks')
  .action(() => {
    listFrameworks();
  });

// Parse CLI arguments
program.parse();
