// HLS Specification Validator - Main Function
// Orchestrates all HLS validation rules and returns comprehensive results

import type { ParsedManifest } from '../../types/manifest';
import type { ValidationResult, ValidationIssue } from '../../types/validation';
import * as rules from './hls-spec-rules';

/**
 * Validate HLS manifest against RFC 8216 specification
 *
 * @param manifest - Parsed HLS manifest
 * @param rawContent - Original manifest text (for line number references)
 * @returns ValidationResult with all issues categorized by severity
 */
export function validateHLSCompliance(
  _manifest: ParsedManifest,
  rawContent: string
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  // Detect playlist type first (needed for type-specific validations)
  const playlistType = rules.detectPlaylistType(rawContent);

  // Detect HLS version
  const hlsVersion = rules.detectHLSVersion(rawContent);

  // Run all validation rules
  const allIssues: (ValidationIssue | ValidationIssue[] | null)[] = [
    // Structural validations
    rules.validateEXTM3UFirstLine(rawContent),
    rules.validateUTF8NoBOM(rawContent),
    rules.validateNoMixedPlaylistTypes(rawContent),

    // Type-specific validations
    rules.validateMediaTargetDuration(rawContent, playlistType),
    rules.validateEXTINFBeforeSegments(rawContent, playlistType),

    // Master playlist validations
    rules.validateStreamInfBandwidth(rawContent),
    rules.validateStreamInfCodecs(rawContent),

    // Version compatibility
    rules.validateVersionCompatibility(rawContent),

    // Codec validation
    rules.validateCodecStrings(rawContent),

    // Value validations
    rules.validateEXTINFDuration(rawContent, playlistType),
    rules.validateBandwidthPositive(rawContent),

    // Encryption validations
    rules.validateKeyMethod(rawContent),
  ];

  // Flatten and filter out nulls
  const flattenedIssues: ValidationIssue[] = allIssues
    .flat()
    .filter((issue): issue is ValidationIssue => issue !== null);

  // Categorize by severity
  flattenedIssues.forEach(issue => {
    if (issue.severity === 'error') {
      errors.push(issue);
    } else if (issue.severity === 'warning') {
      warnings.push(issue);
    } else {
      info.push(issue);
    }
  });

  // Detect features in use
  const detectedFeatures = rules.detectHLSFeatures(rawContent, hlsVersion);

  return {
    compliant: errors.length === 0,
    errors,
    warnings,
    info,
    playlistType,
    version: `HLS v${hlsVersion}`,
    detectedFeatures,
    checkedRules: rules.getAllHLSRuleNames(),
    timestamp: new Date().toISOString()
  };
}
