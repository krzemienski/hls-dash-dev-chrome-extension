// src/lib/parsers/index.ts
import type { ParsedManifest } from '../../types/manifest';
import { detectManifestFormat } from './format-detector';
import { parseHLS } from './hls-parser';
import { parseDASH } from './dash-parser';

/**
 * Unified manifest parser - auto-detects format and parses
 *
 * @param content - Raw manifest content (HLS or DASH)
 * @param url - URL of the manifest (for resolving relative URLs)
 * @returns Parsed manifest with variants, metadata, and segments
 * @throws Error if content is empty or invalid
 */
export function parseManifest(content: string, url: string): ParsedManifest {
  if (!content || content.trim().length === 0) {
    throw new Error('Manifest content is empty');
  }

  const format = detectManifestFormat(content);

  switch (format) {
    case 'hls':
      return parseHLS(content, url);

    case 'dash':
      return parseDASH(content, url);

    default:
      throw new Error(`Unsupported manifest format: ${format}`);
  }
}

// Re-export individual parsers for advanced use cases
export { parseHLS } from './hls-parser';
export { parseDASH } from './dash-parser';
export { detectManifestFormat } from './format-detector';
