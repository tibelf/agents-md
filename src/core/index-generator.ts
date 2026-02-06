import fs from 'fs-extra';
import path from 'path';
import { FrameworkConfig, getFrameworkAdapter } from '../frameworks/index.js';
import { logger } from '../utils/logger.js';

interface DocSection {
  dir: string;
  files: string[];
}

/**
 * Collect all documentation files from a directory
 */
function collectDocFiles(docsDir: string, basePath = '', excludeDirs: string[] = []): string[] {
  const files: string[] = [];

  if (!fs.existsSync(docsDir)) {
    return files;
  }

  const entries = fs.readdirSync(docsDir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // Skip hidden directories and common non-doc directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      // Skip excluded directories (only at top level)
      if (!basePath && excludeDirs.includes(entry.name)) {
        continue;
      }
      files.push(...collectDocFiles(path.join(docsDir, entry.name), relativePath, excludeDirs));
    } else if (entry.isFile()) {
      // Only include markdown files
      if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(relativePath);
      }
    }
  }

  return files;
}

/**
 * Build a tree structure from file paths
 */
function buildDocTree(files: string[]): DocSection[] {
  const tree = new Map<string, string[]>();

  for (const file of files) {
    const dir = path.dirname(file);
    const fileName = path.basename(file, '.md');

    if (!tree.has(dir)) {
      tree.set(dir, []);
    }
    tree.get(dir)!.push(fileName);
  }

  // Sort directories and convert to array
  const sections: DocSection[] = [];
  const sortedDirs = Array.from(tree.keys()).sort();

  for (const dir of sortedDirs) {
    sections.push({
      dir: dir === '.' ? '' : dir,
      files: tree.get(dir)!.sort(),
    });
  }

  return sections;
}

/**
 * Load important rules for a framework
 */
function loadImportantRules(frameworkId: string, docsDir: string): string[] {
  const adapter = getFrameworkAdapter(frameworkId);

  if (!adapter) {
    return [];
  }

  const rules = adapter.loadImportantRules();

  // Replace {docsDir} placeholder
  return rules.map(rule => rule.replace(/{docsDir}/g, docsDir));
}

/**
 * Generate compressed documentation index
 */
export function generateDocsIndex(docsDir: string, config: FrameworkConfig): string {
  logger.debug(`Generating index for ${docsDir}`);

  const excludeDirs = config.excludeDirs || [];
  const files = collectDocFiles(docsDir, '', excludeDirs);
  logger.debug(`Found ${files.length} documentation files`);

  if (files.length === 0) {
    logger.warn('No documentation files found');
    return '';
  }

  const tree = buildDocTree(files);

  // Load important rules
  const frameworkId = config.name.toLowerCase().replace('-', '');
  const rules = loadImportantRules(
    frameworkId === 'uniapp' ? 'uniapp' : frameworkId,
    config.localDocsDir
  );

  // Build compressed format
  const parts: string[] = [
    `[${config.name} Docs Index]`,
    `root:${config.localDocsDir}`,
    ...rules,
  ];

  // Add directory structure
  for (const section of tree) {
    const dirName = section.dir || '.';
    const fileList = section.files.join(',');

    if (fileList) {
      parts.push(`${dirName}:{${fileList}}`);
    }
  }

  return parts.join('|');
}

/**
 * Generate a more readable documentation index (for --verbose mode)
 */
export function generateReadableIndex(docsDir: string, config: FrameworkConfig): string {
  const excludeDirs = config.excludeDirs || [];
  const files = collectDocFiles(docsDir, '', excludeDirs);
  const tree = buildDocTree(files);

  const frameworkId = config.name.toLowerCase().replace('-', '');
  const rules = loadImportantRules(
    frameworkId === 'uniapp' ? 'uniapp' : frameworkId,
    config.localDocsDir
  );

  const lines: string[] = [
    `## ${config.name} Documentation`,
    '',
    `**Location:** \`${config.localDocsDir}\``,
    '',
    '### Important Rules',
    '',
    ...rules.map(r => `- ${r}`),
    '',
    '### Documentation Structure',
    '',
  ];

  for (const section of tree) {
    const dirName = section.dir || '(root)';
    lines.push(`- **${dirName}/**`);
    for (const file of section.files) {
      lines.push(`  - ${file}.md`);
    }
  }

  return lines.join('\n');
}
