import fs from 'fs-extra';
import { findMarkers, buildMarkedSection } from '../utils/markers.js';
import { logger } from '../utils/logger.js';

export interface InjectOptions {
  filePath: string;
  index: string;
  framework: string;
  dryRun?: boolean;
}

/**
 * Inject documentation index into AGENTS.md or CLAUDE.md
 */
export async function injectIntoAgentsMd(options: InjectOptions): Promise<string> {
  const { filePath, index, framework, dryRun = false } = options;

  // Read existing content or start fresh
  let content = '';
  if (await fs.pathExists(filePath)) {
    content = await fs.readFile(filePath, 'utf-8');
  }

  // Build the new section
  const newSection = buildMarkedSection(framework, index);

  // Check for existing markers
  const markers = findMarkers(content, framework);

  let newContent: string;

  if (markers) {
    // Replace existing section
    logger.debug(`Replacing existing ${framework} section`);
    newContent =
      content.slice(0, markers.start) +
      newSection +
      content.slice(markers.end);
  } else {
    // Append to end
    logger.debug(`Appending new ${framework} section`);
    newContent = content.trimEnd() + '\n\n' + newSection + '\n';
  }

  if (dryRun) {
    logger.info(`[Dry Run] Would write to ${filePath}:`);
    console.log(newContent);
    return newContent;
  }

  await fs.writeFile(filePath, newContent);
  logger.success(`Injected ${framework} docs index into ${filePath}`);

  return newContent;
}

/**
 * Remove framework section from file
 */
export async function removeFromAgentsMd(
  filePath: string,
  framework: string
): Promise<boolean> {
  if (!await fs.pathExists(filePath)) {
    return false;
  }

  const content = await fs.readFile(filePath, 'utf-8');
  const markers = findMarkers(content, framework);

  if (!markers) {
    return false;
  }

  // Remove the section and any extra newlines
  let newContent =
    content.slice(0, markers.start) +
    content.slice(markers.end);

  // Clean up extra newlines
  newContent = newContent.replace(/\n{3,}/g, '\n\n').trim() + '\n';

  await fs.writeFile(filePath, newContent);
  logger.info(`Removed ${framework} section from ${filePath}`);

  return true;
}
