import path from 'path';
import { detectFramework, getFrameworkInfo } from '../core/detector.js';
import { pullDocs, addToGitignore } from '../core/docs-puller.js';
import { generateDocsIndex, generateReadableIndex } from '../core/index-generator.js';
import { injectIntoAgentsMd } from '../core/injector.js';
import { getRegisteredFrameworks, getFrameworkAdapter } from '../frameworks/index.js';
import { logger } from '../utils/logger.js';

export interface AgentsMdOptions {
  cwd?: string;
  framework?: string;
  output?: string;
  claude?: boolean;
  dryRun?: boolean;
  force?: boolean;
  offline?: boolean;
  verbose?: boolean;
}

/**
 * Main agents-md command
 */
export async function agentsMd(options: AgentsMdOptions = {}): Promise<void> {
  const {
    cwd = process.cwd(),
    framework: frameworkOverride,
    output = 'AGENTS.md',
    claude = false,
    dryRun = false,
    force = false,
    offline = false,
    verbose = false,
  } = options;

  if (verbose) {
    logger.setLevel('debug');
  }

  logger.info(`Working directory: ${cwd}`);

  // Detect or use specified framework
  let frameworkInfo;

  if (frameworkOverride) {
    logger.info(`Using specified framework: ${frameworkOverride}`);
    frameworkInfo = await getFrameworkInfo(frameworkOverride, cwd);

    if (!frameworkInfo) {
      const supported = getRegisteredFrameworks().join(', ');
      logger.error(`Unknown framework: ${frameworkOverride}`);
      logger.info(`Supported frameworks: ${supported}`);
      process.exit(1);
    }
  } else {
    logger.info('Detecting project framework...');
    frameworkInfo = await detectFramework(cwd);

    if (!frameworkInfo) {
      logger.error('No supported framework detected');
      logger.info(`Supported frameworks: ${getRegisteredFrameworks().join(', ')}`);
      logger.info('Use --framework <name> to specify manually');
      process.exit(1);
    }
  }

  logger.success(`Detected: ${frameworkInfo.name} ${frameworkInfo.version}`);

  const config = frameworkInfo.config;
  const docsDir = path.join(cwd, config.localDocsDir);

  // Pull documentation
  try {
    await pullDocs({
      repo: config.docsRepo,
      branch: config.docsBranch,
      docsPath: config.docsPath,
      targetDir: docsDir,
      force,
      offline,
      excludePatterns: config.excludePatterns,
      includePatterns: config.includePatterns,
    });
  } catch (err) {
    logger.error(`Failed to pull docs: ${(err as Error).message}`);
    process.exit(1);
  }

  // Generate index
  const index = verbose
    ? generateReadableIndex(docsDir, config)
    : generateDocsIndex(docsDir, config);

  if (!index) {
    logger.error('Failed to generate documentation index');
    process.exit(1);
  }

  logger.debug(`Generated index (${index.length} chars)`);

  // Inject into AGENTS.md
  const agentsMdPath = path.join(cwd, output);
  await injectIntoAgentsMd({
    filePath: agentsMdPath,
    index,
    framework: frameworkInfo.name,
    dryRun,
  });

  // Optionally inject into CLAUDE.md
  if (claude) {
    const claudeMdPath = path.join(cwd, 'CLAUDE.md');
    await injectIntoAgentsMd({
      filePath: claudeMdPath,
      index,
      framework: frameworkInfo.name,
      dryRun,
    });
  }

  // Add to .gitignore
  if (!dryRun) {
    await addToGitignore(cwd, config.localDocsDir);
  }

  logger.success('Done!');
}

/**
 * List supported frameworks
 */
export function listFrameworks(): void {
  const frameworks = getRegisteredFrameworks();

  console.log('\nSupported frameworks:\n');

  for (const id of frameworks) {
    const adapter = getFrameworkAdapter(id);
    if (adapter) {
      const config = adapter.loadConfig();
      console.log(`  ${id.padEnd(12)} - ${config.name} ${config.version}`);
    }
  }

  console.log('');
}
