import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger.js';

/**
 * Clean VitePress-specific content from markdown files
 * Removes:
 * - YAML frontmatter
 * - <style> tags
 * - <script> tags
 * - <div> wrappers and promotional blocks
 * - Vue-specific components (VueSchoolLink, VueMastery, etc.)
 * - Style example blocks
 * - Advertisement/promotional HTML blocks
 * - Empty lines created by removals
 */
export function cleanMarkdownContent(content: string): string {
  let cleaned = content;

  // Remove YAML frontmatter
  cleaned = cleaned.replace(/^---[\s\S]*?---\n*/m, '');

  // Remove <style> tags and their content
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove <script setup> and <script> tags and their content
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove Vue-specific custom components (self-closing)
  cleaned = cleaned.replace(/<VueSchoolLink[^>]*\/>/gi, '');
  cleaned = cleaned.replace(/<VueMastery[^>]*\/>/gi, '');
  cleaned = cleaned.replace(/<VueJobs[^>]*\/>/gi, '');
  cleaned = cleaned.replace(/<Sponsors[^>]*\/>/gi, '');
  cleaned = cleaned.replace(/<Newsletter[^>]*\/>/gi, '');

  // Remove Vue-specific custom components (with content)
  cleaned = cleaned.replace(/<VueSchoolLink[^>]*>[\s\S]*?<\/VueSchoolLink>/gi, '');
  cleaned = cleaned.replace(/<VueMastery[^>]*>[\s\S]*?<\/VueMastery>/gi, '');

  // Remove entire promotional div blocks (vue-mastery, etc.)
  cleaned = cleaned.replace(/<div class="vue-mastery[^"]*">[\s\S]*?<\/a>\s*<\/div>/gi, '');

  // Remove style-example blocks (good/bad examples with specific styling)
  cleaned = cleaned.replace(/<div class="style-example[^"]*">[\s\S]*?<\/div>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<div class="style-example[^"]*">\s*/gi, '');

  // Remove demo divs
  cleaned = cleaned.replace(/<div class="demo">[\s\S]*?<\/div>/gi, '');

  // Remove vt-box-container and next-steps blocks
  cleaned = cleaned.replace(/<div class="vt-box-container[^"]*">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<div class="vt-box[^"]*">[\s\S]*?<\/a>/gi, '');

  // Remove options-api and composition-api wrapper divs (keep content)
  cleaned = cleaned.replace(/<div class="(options-api|composition-api)">\s*/gi, '');

  // Remove sfc-only and html-only wrapper divs (keep content)
  cleaned = cleaned.replace(/<div class="(sfc|html)-only">\s*/gi, '');

  // Remove standalone closing </div> tags
  cleaned = cleaned.replace(/^<\/div>\s*$/gm, '');

  // Remove <a> tags with specific classes (vt-box links)
  cleaned = cleaned.replace(/<a class="vt-box"[^>]*>[\s\S]*?<\/a>/gi, '');

  // Remove <img> tags with banner class or promotional images
  cleaned = cleaned.replace(/<img[^>]*(banner|vue-mastery)[^>]*\/?>/gi, '');

  // Remove <sup> tags with vt-badge class
  cleaned = cleaned.replace(/<sup class="vt-badge[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '');
  cleaned = cleaned.replace(/<sup class="vt-badge[^"]*"[^>]*\/?>/gi, '');

  // Convert VitePress custom containers to blockquotes
  cleaned = cleaned.replace(/:::info[^\n]*\n/g, '> **Info:** ');
  cleaned = cleaned.replace(/:::tip[^\n]*\n/g, '> **Tip:** ');
  cleaned = cleaned.replace(/:::warning[^\n]*\n/g, '> **Warning:** ');
  cleaned = cleaned.replace(/:::danger[^\n]*\n/g, '> **Danger:** ');
  cleaned = cleaned.replace(/:::details[^\n]*\n/g, '> **Details:** ');
  cleaned = cleaned.replace(/:::/g, '');

  // Remove remaining empty HTML tags
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, '');

  // Remove orphaned closing tags
  cleaned = cleaned.replace(/^\s*<\/div>\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*<\/a>\s*$/gm, '');

  // Clean up multiple empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Clean all markdown files in a directory
 */
export async function cleanDocsDirectory(docsDir: string): Promise<number> {
  let cleanedCount = 0;

  async function processDir(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await processDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const cleaned = cleanMarkdownContent(content);

        if (cleaned !== content) {
          await fs.writeFile(fullPath, cleaned);
          cleanedCount++;
        }
      }
    }
  }

  await processDir(docsDir);
  logger.debug(`Cleaned ${cleanedCount} markdown files`);

  return cleanedCount;
}
