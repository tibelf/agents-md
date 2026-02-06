import fs from 'fs-extra';
import path from 'path';
import { getAllFrameworkAdapters, getFrameworkAdapter, FrameworkInfo } from '../frameworks/index.js';
import { logger } from '../utils/logger.js';

/**
 * Read and parse package.json from a directory
 */
export async function readPackageJson(cwd: string): Promise<Record<string, unknown>> {
  const pkgPath = path.join(cwd, 'package.json');

  if (!await fs.pathExists(pkgPath)) {
    return {};
  }

  try {
    return await fs.readJson(pkgPath);
  } catch {
    logger.warn('Failed to parse package.json');
    return {};
  }
}

/**
 * Detect the framework used in a project
 * Returns the first matching framework based on priority order
 */
export async function detectFramework(cwd: string): Promise<FrameworkInfo | null> {
  const packageJson = await readPackageJson(cwd);

  if (Object.keys(packageJson).length === 0) {
    logger.debug('No package.json found');
    return null;
  }

  const adapters = getAllFrameworkAdapters();

  for (const adapter of adapters) {
    logger.debug(`Checking for ${adapter.id}...`);

    const detected = await adapter.detect(cwd, packageJson);

    if (detected) {
      const config = adapter.loadConfig();
      const version = adapter.getVersion(packageJson);

      logger.debug(`Detected ${adapter.id} ${version || 'unknown version'}`);

      return {
        name: adapter.id,
        version: version || config.version,
        config,
      };
    }
  }

  logger.debug('No framework detected');
  return null;
}

/**
 * Get framework info by explicit framework name
 */
export async function getFrameworkInfo(
  frameworkId: string,
  cwd: string
): Promise<FrameworkInfo | null> {
  const adapter = getFrameworkAdapter(frameworkId);

  if (!adapter) {
    return null;
  }

  const packageJson = await readPackageJson(cwd);
  const config = adapter.loadConfig();
  const version = adapter.getVersion(packageJson);

  return {
    name: adapter.id,
    version: version || config.version,
    config,
  };
}
