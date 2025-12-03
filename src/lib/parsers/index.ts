// src/lib/parsers/index.ts
import type { ParsedManifest } from '../../types/manifest';
import { detectManifestFormat } from './format-detector';
import { parseHLS } from './hls-parser';
import { parseDASH } from './dash-parser';
import { validateHLSCompliance } from '../validation/hls-spec-validator';
import { validateDASHCompliance } from '../validation/dash-spec-validator';

/**
 * Unified manifest parser - auto-detects format and parses
 *
 * @param content - Raw manifest content (HLS or DASH)
 * @param url - URL of the manifest (for resolving relative URLs)
 * @returns Parsed manifest with variants, metadata, segments, and validation results
 * @throws Error if content is empty or invalid
 */
export function parseManifest(content: string, url: string): ParsedManifest {
  if (!content || content.trim().length === 0) {
    throw new Error('Manifest content is empty');
  }

  const format = detectManifestFormat(content);

  let parsed: ParsedManifest;

  switch (format) {
    case 'hls':
      parsed = parseHLS(content, url);
      // NEW v1.1.0: Run HLS validation
      try {
        parsed.validation = validateHLSCompliance(parsed, content);
      } catch (err) {
        console.error('HLS validation failed:', err);
        // Don't fail parsing if validation has errors
      }
      break;

    case 'dash':
      parsed = parseDASH(content, url);
      // NEW v1.1.0: Run DASH validation
      try {
        parsed.validation = validateDASHCompliance(parsed, content);
      } catch (err) {
        console.error('DASH validation failed:', err);
        // Don't fail parsing if validation has errors
      }
      break;

    default:
      throw new Error(`Unsupported manifest format: ${format}`);
  }

  return parsed;
}

// Re-export individual parsers for advanced use cases
export { parseHLS } from './hls-parser';
export { parseDASH } from './dash-parser';
export { detectManifestFormat } from './format-detector';
