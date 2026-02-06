import { BaseFrameworkAdapter, FrameworkConfig } from './base.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

function getDirname(): string {
  // Handle ESM context
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return path.dirname(fileURLToPath(import.meta.url));
  }
  // CJS fallback - __dirname will be defined by tsup
  return __dirname;
}

function getRulesDir(): string {
  const dirname = getDirname();
  // Handle both ESM and CJS contexts
  // In the built package, rules/ is at the package root
  const possiblePaths = [
    // When running from dist/ (built)
    path.resolve(dirname, '../../rules'),
    path.resolve(dirname, '../rules'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback: use process.cwd() based path
  return path.resolve(process.cwd(), 'node_modules/@kipper/agents-md/rules');
}

export class VueAdapter extends BaseFrameworkAdapter {
  readonly id = 'vue';

  loadConfig(): FrameworkConfig {
    if (this.config) {
      return this.config;
    }

    const rulesDir = getRulesDir();
    const configPath = path.join(rulesDir, 'vue/config.json');
    this.config = fs.readJsonSync(configPath) as FrameworkConfig;
    return this.config;
  }

  loadImportantRules(): string[] {
    const rulesDir = getRulesDir();
    const rulesPath = path.join(rulesDir, 'vue/important-rules.md');
    const content = fs.readFileSync(rulesPath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}

export const vueAdapter = new VueAdapter();
