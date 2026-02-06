// Main exports
export { detectFramework, getFrameworkInfo, readPackageJson } from './core/detector.js';
export { pullDocs, addToGitignore } from './core/docs-puller.js';
export { generateDocsIndex, generateReadableIndex } from './core/index-generator.js';
export { injectIntoAgentsMd, removeFromAgentsMd } from './core/injector.js';

// Framework exports
export {
  getRegisteredFrameworks,
  getFrameworkAdapter,
  getAllFrameworkAdapters,
  registerFramework,
} from './frameworks/index.js';

export type {
  FrameworkAdapter,
  FrameworkConfig,
  FrameworkInfo,
  DetectionConfig,
  SubEcosystem,
  PullOptions,
  IndexOptions,
  InjectOptions,
} from './frameworks/base.js';

// Utility exports
export { logger } from './utils/logger.js';
export { MARKERS, findMarkers, hasMarkers, buildMarkedSection } from './utils/markers.js';
export { isGitAvailable, gitExec, sparseClone, isGitRepo } from './utils/git.js';
export { cleanMarkdownContent, cleanDocsDirectory } from './utils/cleaner.js';

// Command exports
export { agentsMd, listFrameworks } from './commands/agents-md.js';
export type { AgentsMdOptions } from './commands/agents-md.js';
