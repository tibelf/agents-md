/**
 * Marker management for AGENTS.md / CLAUDE.md injection
 */

export const MARKERS = {
  START: (framework: string) => `<!-- ${framework.toUpperCase()}-AGENTS-MD-START -->`,
  END: (framework: string) => `<!-- ${framework.toUpperCase()}-AGENTS-MD-END -->`,
};

export interface MarkerPosition {
  start: number;
  end: number;
  startMarker: string;
  endMarker: string;
}

/**
 * Find marker positions in content
 */
export function findMarkers(content: string, framework: string): MarkerPosition | null {
  const startMarker = MARKERS.START(framework);
  const endMarker = MARKERS.END(framework);

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    return null;
  }

  if (endIdx < startIdx) {
    // Malformed markers
    return null;
  }

  return {
    start: startIdx,
    end: endIdx + endMarker.length,
    startMarker,
    endMarker,
  };
}

/**
 * Check if content has markers for a framework
 */
export function hasMarkers(content: string, framework: string): boolean {
  return findMarkers(content, framework) !== null;
}

/**
 * Build a marked section with content
 */
export function buildMarkedSection(framework: string, content: string): string {
  const startMarker = MARKERS.START(framework);
  const endMarker = MARKERS.END(framework);

  return `${startMarker}\n${content}\n${endMarker}`;
}
