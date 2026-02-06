import { execa } from 'execa';
import { logger } from './logger.js';

/**
 * Check if git is available
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    await execa('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a git command
 */
export async function gitExec(
  args: string[],
  options?: { cwd?: string }
): Promise<string> {
  logger.debug(`git ${args.join(' ')}`);

  const result = await execa('git', args, {
    cwd: options?.cwd,
    reject: false,
  });

  if (result.failed) {
    throw new Error(`Git command failed: ${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

/**
 * Clone a repository with sparse checkout
 */
export async function sparseClone(
  repo: string,
  targetDir: string,
  sparsePath: string,
  branch?: string
): Promise<void> {
  const branchArgs = branch ? ['--branch', branch] : [];

  // Clone with sparse checkout filter
  await gitExec([
    'clone',
    '--depth=1',
    '--filter=blob:none',
    '--sparse',
    ...branchArgs,
    repo,
    targetDir,
  ]);

  // Set sparse checkout path
  await gitExec(
    ['sparse-checkout', 'set', sparsePath],
    { cwd: targetDir }
  );
}

/**
 * Check if a directory is a git repository
 */
export async function isGitRepo(dir: string): Promise<boolean> {
  try {
    await gitExec(['rev-parse', '--git-dir'], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}
