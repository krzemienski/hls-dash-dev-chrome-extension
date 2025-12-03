// src/lib/validation/manifest-validator.ts
import type { ParsedManifest } from '../../types/manifest';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  category: 'variants' | 'codecs' | 'metadata' | 'abr-ladder';
}

/**
 * Validate manifest and return list of issues
 */
export function validateManifest(manifest: ParsedManifest): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Validate variants exist
  if (manifest.variants.length === 0) {
    issues.push({
      severity: 'error',
      message: 'No variants found in manifest',
      category: 'variants'
    });
    return issues; // Can't continue validation without variants
  }

  // Validate video variants
  const videoVariants = manifest.variants.filter(v => v.type === 'video');

  if (videoVariants.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'No video variants found',
      category: 'variants'
    });
  } else {
    // Check variant count
    if (videoVariants.length < 3) {
      issues.push({
        severity: 'warning',
        message: `Only ${videoVariants.length} video variant(s). Recommended: 4-6 variants for optimal ABR`,
        category: 'abr-ladder'
      });
    }

    // Check for duplicate bitrates
    const bitrates = videoVariants.map(v => v.bitrate);
    const uniqueBitrates = new Set(bitrates);
    if (bitrates.length !== uniqueBitrates.size) {
      issues.push({
        severity: 'warning',
        message: 'Multiple variants have the same bitrate',
        category: 'abr-ladder'
      });
    }

    // Check for missing resolutions
    const missingResolution = videoVariants.some(v => !v.resolution);
    if (missingResolution) {
      issues.push({
        severity: 'warning',
        message: 'Some video variants are missing resolution information',
        category: 'variants'
      });
    }

    // Check for missing codecs
    videoVariants.forEach((variant, index) => {
      if (!variant.codecs || variant.codecs.length === 0) {
        issues.push({
          severity: 'warning',
          message: `Variant ${index + 1} is missing codec information`,
          category: 'codecs'
        });
      }
    });

    // Check ABR ladder quality
    const sorted = [...videoVariants].sort((a, b) => a.bitrate - b.bitrate);
    const gaps: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      gaps.push(sorted[i].bitrate - sorted[i - 1].bitrate);
    }

    if (gaps.length > 0) {
      const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

      gaps.forEach((gap, index) => {
        if (gap > avgGap * 2) {
          issues.push({
            severity: 'info',
            message: `Large gap detected between variant ${index + 1} and ${index + 2}: ${(gap / 1000000).toFixed(2)} Mbps`,
            category: 'abr-ladder'
          });
        }
      });
    }
  }

  // Check metadata
  if (manifest.metadata.type === 'LIVE' && manifest.segments) {
    if (manifest.segments.length > 0 && !manifest.metadata.targetDuration) {
      issues.push({
        severity: 'warning',
        message: 'LIVE manifest should have targetDuration',
        category: 'metadata'
      });
    }
  }

  // Check for encrypted content without proper handling
  if (manifest.metadata.encrypted) {
    issues.push({
      severity: 'info',
      message: 'Manifest contains encrypted content (DRM)',
      category: 'metadata'
    });
  }

  return issues;
}

/**
 * Get validation summary
 */
export function getValidationSummary(issues: ValidationIssue[]): {
  errors: number;
  warnings: number;
  info: number;
  healthy: boolean;
} {
  return {
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    healthy: issues.filter(i => i.severity === 'error').length === 0
  };
}
