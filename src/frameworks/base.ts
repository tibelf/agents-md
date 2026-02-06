/**
 * Base framework adapter interface
 * All framework adapters must implement this interface
 */

export interface DetectionConfig {
  dependencies: string[];
  devDependencies: string[];
  files: string[];
}

export interface SubEcosystem {
  name: string;
  detect: string[];
  docsRepo: string;
  docsPath: string;
}

export interface FrameworkConfig {
  name: string;
  version: string;
  detect: DetectionConfig;
  docsRepo: string;
  docsBranch: string;
  docsPath: string;
  localDocsDir: string;
  excludeDirs?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
  subEcosystems: SubEcosystem[];
}

export interface FrameworkInfo {
  name: string;
  version: string;
  config: FrameworkConfig;
}

export interface PullOptions {
  repo: string;
  branch: string;
  docsPath: string;
  targetDir: string;
  force?: boolean;
}

export interface IndexOptions {
  docsDir: string;
  config: FrameworkConfig;
}

export interface InjectOptions {
  filePath: string;
  index: string;
  framework: string;
}

export interface FrameworkAdapter {
  /**
   * Framework identifier (e.g., 'vue', 'uniapp')
   */
  readonly id: string;

  /**
   * Load framework configuration
   */
  loadConfig(): FrameworkConfig;

  /**
   * Load important rules for this framework
   */
  loadImportantRules(): string[];

  /**
   * Check if this framework is detected in the given directory
   */
  detect(cwd: string, packageJson: Record<string, unknown>): Promise<boolean>;

  /**
   * Get the detected version of the framework
   */
  getVersion(packageJson: Record<string, unknown>): string | null;
}

export abstract class BaseFrameworkAdapter implements FrameworkAdapter {
  abstract readonly id: string;
  protected config: FrameworkConfig | null = null;

  abstract loadConfig(): FrameworkConfig;
  abstract loadImportantRules(): string[];

  async detect(cwd: string, packageJson: Record<string, unknown>): Promise<boolean> {
    const config = this.loadConfig();
    const deps = {
      ...(packageJson.dependencies as Record<string, string> || {}),
      ...(packageJson.devDependencies as Record<string, string> || {}),
    };

    // Check dependencies
    const depMatch = [
      ...config.detect.dependencies,
      ...config.detect.devDependencies,
    ].some(dep => dep in deps);

    if (depMatch) {
      return true;
    }

    // Check files
    if (config.detect.files && config.detect.files.length > 0) {
      const fsExtra = await import('fs-extra');
      const pathModule = await import('path');
      for (const file of config.detect.files) {
        const filePath = pathModule.join(cwd, file);
        if (await fsExtra.pathExists(filePath)) {
          return true;
        }
      }
    }

    return false;
  }

  getVersion(packageJson: Record<string, unknown>): string | null {
    const config = this.loadConfig();
    const deps = {
      ...(packageJson.dependencies as Record<string, string> || {}),
      ...(packageJson.devDependencies as Record<string, string> || {}),
    };

    // Find the first matching dependency and return its version
    const allDeps = [
      ...config.detect.dependencies,
      ...config.detect.devDependencies,
    ];

    for (const dep of allDeps) {
      if (dep in deps) {
        return deps[dep];
      }
    }

    return null;
  }
}
