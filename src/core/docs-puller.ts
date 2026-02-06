import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { minimatch } from 'minimatch';
import { PullOptions } from '../frameworks/base.js';
import { sparseClone, isGitAvailable } from '../utils/git.js';
import { cleanDocsDirectory } from '../utils/cleaner.js';
import { logger } from '../utils/logger.js';

export interface PullDocsOptions extends PullOptions {
  force?: boolean;
  offline?: boolean;
  clean?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
}

/**
 * Filter documentation files based on include/exclude patterns
 */
async function filterDocs(
  targetDir: string,
  excludePatterns?: string[],
  includePatterns?: string[]
): Promise<number> {
  let removedCount = 0;

  async function shouldKeep(relativePath: string): Promise<boolean> {
    // If includePatterns exist, file must match at least one
    if (includePatterns && includePatterns.length > 0) {
      const included = includePatterns.some(pattern =>
        minimatch(relativePath, pattern, { dot: true })
      );
      if (!included) return false;
    }

    // If excludePatterns exist, file must not match any
    if (excludePatterns && excludePatterns.length > 0) {
      const excluded = excludePatterns.some(pattern =>
        minimatch(relativePath, pattern, { dot: true })
      );
      if (excluded) return false;
    }

    return true;
  }

  async function processDir(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(targetDir, fullPath);

      if (entry.isDirectory()) {
        // Check if directory should be kept
        const keep = await shouldKeep(relativePath + '/');
        if (!keep) {
          await fs.remove(fullPath);
          removedCount++;
          logger.debug(`Removed directory: ${relativePath}`);
          continue;
        }
        // Recursively process subdirectory
        await processDir(fullPath);
      } else if (entry.isFile()) {
        // Check if file should be kept
        const keep = await shouldKeep(relativePath);
        if (!keep) {
          await fs.remove(fullPath);
          removedCount++;
          logger.debug(`Removed file: ${relativePath}`);
        }
      }
    }
  }

  await processDir(targetDir);
  return removedCount;
}

/**
 * Pull documentation from a remote repository using git sparse-checkout
 */
export async function pullDocs(options: PullDocsOptions): Promise<string> {
  const {
    repo,
    branch,
    docsPath,
    targetDir,
    force = false,
    offline = false,
    clean = true,
    excludePatterns,
    includePatterns
  } = options;

  // Check if docs already exist
  if (await fs.pathExists(targetDir)) {
    if (offline) {
      logger.info(`Using cached docs at ${targetDir}`);
      return targetDir;
    }

    if (!force) {
      logger.info(`Docs already exist at ${targetDir}. Use --force to re-pull.`);
      return targetDir;
    }

    logger.info(`Removing existing docs at ${targetDir}...`);
    await fs.remove(targetDir);
  }

  if (offline) {
    throw new Error(`Docs not found at ${targetDir}. Cannot pull in offline mode.`);
  }

  // Check git availability
  if (!await isGitAvailable()) {
    throw new Error('Git is not available. Please install git to pull documentation.');
  }

  // Create temp directory for cloning
  const tempDir = path.join(os.tmpdir(), `agents-md-docs-${Date.now()}`);
  logger.debug(`Using temp directory: ${tempDir}`);

  try {
    logger.info(`Pulling docs from ${repo}...`);

    // Clone with sparse checkout
    await sparseClone(repo, tempDir, docsPath, branch);

    // Ensure target directory parent exists
    await fs.ensureDir(path.dirname(targetDir));

    // Copy docs to target directory
    const sourceDir = path.join(tempDir, docsPath);

    if (!await fs.pathExists(sourceDir)) {
      throw new Error(`Docs path '${docsPath}' not found in repository`);
    }

    await fs.copy(sourceDir, targetDir);
    logger.success(`Docs pulled to ${targetDir}`);

    // Filter docs based on include/exclude patterns
    if (excludePatterns || includePatterns) {
      logger.info('Filtering documentation files...');
      const removedCount = await filterDocs(targetDir, excludePatterns, includePatterns);
      logger.success(`Filtered docs: removed ${removedCount} items`);
    }

    // Clean markdown files (remove VitePress-specific content)
    if (clean) {
      logger.info('Cleaning markdown files...');
      const cleanedCount = await cleanDocsDirectory(targetDir);
      logger.success(`Cleaned ${cleanedCount} files`);
    }

    return targetDir;
  } finally {
    // Clean up temp directory
    await fs.remove(tempDir).catch(() => {
      logger.debug(`Failed to clean up temp directory: ${tempDir}`);
    });
  }
}

/**
 * Add docs directory to .gitignore
 */
export async function addToGitignore(cwd: string, dirName: string): Promise<void> {
  const gitignorePath = path.join(cwd, '.gitignore');
  const entry = `${dirName}/`;

  let content = '';

  if (await fs.pathExists(gitignorePath)) {
    content = await fs.readFile(gitignorePath, 'utf-8');

    // Check if already present
    const lines = content.split('\n').map(l => l.trim());
    if (lines.includes(entry) || lines.includes(dirName)) {
      logger.debug(`${entry} already in .gitignore`);
      return;
    }
  }

  // Add entry
  const newContent = content.trimEnd() + '\n' + entry + '\n';
  await fs.writeFile(gitignorePath, newContent);
  logger.info(`Added ${entry} to .gitignore`);
}
