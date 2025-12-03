// DASH Specification Validator - Main Function
// Validates DASH MPD files against ISO/IEC 23009-1 and DASH-IF IOP

import type { ParsedManifest } from '../../types/manifest';
import type { ValidationResult, ValidationIssue } from '../../types/validation';
import * as rules from './dash-spec-rules';

/**
 * Validate DASH manifest against ISO/IEC 23009-1 specification
 *
 * @param manifest - Parsed DASH manifest
 * @param rawContent - Original MPD XML content
 * @returns ValidationResult with all issues categorized by severity
 */
export function validateDASHCompliance(
  _manifest: ParsedManifest,
  rawContent: string
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  // Detect MPD type
  const mpdType = rules.detectMPDType(rawContent);

  // Detect profile
  const dashProfile = rules.detectDASHProfile(rawContent);

  // Run all DASH validation rules
  const allIssues: (ValidationIssue | ValidationIssue[] | null)[] = [
    // Structural validations
    rules.validateValidXML(rawContent),
    rules.validateMPDType(rawContent),
    rules.validateMinBufferTime(rawContent),
    rules.validatePeriodExists(rawContent),

    // Element validations
    rules.validateAdaptationSetType(rawContent),
    rules.validateRepresentationAttributes(rawContent),

    // Profile-specific validations
    rules.validateOnDemandProfile(rawContent),
  ];

  // Flatten and filter
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

  // Detect features
  const detectedFeatures = rules.detectDASHFeatures(rawContent, mpdType);

  return {
    compliant: errors.length === 0,
    errors,
    warnings,
    info,
    playlistType: mpdType === 'static' ? 'mpd-static' : 'mpd-dynamic',
    version: dashProfile,
    detectedFeatures,
    checkedRules: rules.getAllDASHRuleNames(),
    timestamp: new Date().toISOString()
  };
}
