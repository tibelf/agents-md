import { FrameworkAdapter } from './base.js';
import { vueAdapter } from './vue.js';
import { uniappAdapter } from './uniapp.js';

export * from './base.js';
export * from './vue.js';
export * from './uniapp.js';

/**
 * Registry of all available framework adapters
 * Order matters - more specific frameworks should come first
 * (e.g., uniapp before vue, since uniapp projects also have vue)
 */
const frameworkRegistry: Map<string, FrameworkAdapter> = new Map();

// Register frameworks in detection priority order
// uniapp should be checked before vue since uniapp projects contain vue
frameworkRegistry.set('uniapp', uniappAdapter);
frameworkRegistry.set('vue', vueAdapter);

/**
 * Get all registered framework IDs
 */
export function getRegisteredFrameworks(): string[] {
  return Array.from(frameworkRegistry.keys());
}

/**
 * Get a specific framework adapter by ID
 */
export function getFrameworkAdapter(id: string): FrameworkAdapter | undefined {
  return frameworkRegistry.get(id);
}

/**
 * Get all framework adapters
 */
export function getAllFrameworkAdapters(): FrameworkAdapter[] {
  return Array.from(frameworkRegistry.values());
}

/**
 * Register a new framework adapter
 */
export function registerFramework(adapter: FrameworkAdapter): void {
  frameworkRegistry.set(adapter.id, adapter);
}
