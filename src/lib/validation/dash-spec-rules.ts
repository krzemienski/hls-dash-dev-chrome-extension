// DASH Specification Validation Rules - ISO/IEC 23009-1
// Each function validates one specific rule for DASH MPD files

import type { ValidationIssue } from '../../types/validation';

/**
 * Rule 1: MPD must be valid XML
 */
export function validateValidXML(xmlContent: string): ValidationIssue | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return {
        code: 'MPD_INVALID_XML',
        severity: 'error',
        element: 'MPD',
        message: 'MPD is not valid XML',
        specReference: 'ISO/IEC 23009-1 § 5',
        suggestion: 'Fix XML syntax errors'
      };
    }
  } catch (err) {
    return {
      code: 'MPD_PARSE_ERROR',
      severity: 'error',
      element: 'MPD',
      message: 'Failed to parse MPD',
      specReference: 'ISO/IEC 23009-1 § 5'
    };
  }

  return null;
}

/**
 * Rule 2: MPD must have type attribute
 * Spec: ISO/IEC 23009-1 § 5.3.1.2
 */
export function validateMPDType(xmlContent: string): ValidationIssue | null {
  const typeMatch = xmlContent.match(/<MPD[^>]*type="([^"]+)"/);

  if (!typeMatch) {
    return {
      code: 'MPD_TYPE_REQUIRED',
      severity: 'error',
      element: 'MPD',
      attribute: 'type',
      message: 'MPD element must have type attribute',
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Add type="static" for VOD or type="dynamic" for live'
    };
  }

  const type = typeMatch[1];
  if (type !== 'static' && type !== 'dynamic') {
    return {
      code: 'MPD_TYPE_INVALID',
      severity: 'error',
      element: 'MPD',
      attribute: 'type',
      message: `Invalid MPD type "${type}". Must be "static" or "dynamic"`,
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Use type="static" or type="dynamic"'
    };
  }

  return null;
}

/**
 * Rule 3: minBufferTime required and valid format
 * Spec: ISO/IEC 23009-1 § 5.3.1.2
 */
export function validateMinBufferTime(xmlContent: string): ValidationIssue | null {
  const minBufferMatch = xmlContent.match(/minBufferTime="([^"]+)"/);

  if (!minBufferMatch) {
    return {
      code: 'MIN_BUFFER_TIME_REQUIRED',
      severity: 'error',
      element: 'MPD',
      attribute: 'minBufferTime',
      message: 'MPD must have minBufferTime attribute',
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Add minBufferTime="PT2.0S" or similar ISO 8601 duration'
    };
  }

  const minBuffer = minBufferMatch[1];

  // Validate ISO 8601 duration format
  if (!/^PT[\d.]+S$/.test(minBuffer)) {
    return {
      code: 'MIN_BUFFER_TIME_FORMAT',
      severity: 'error',
      element: 'MPD',
      attribute: 'minBufferTime',
      message: `Invalid minBufferTime format: "${minBuffer}". Must be ISO 8601 duration`,
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Use format PTnnn.nnnS (e.g., PT2.0S for 2 seconds)'
    };
  }

  return null;
}

/**
 * Rule 4: At least one Period required
 * Spec: ISO/IEC 23009-1 § 5.3.2
 */
export function validatePeriodExists(xmlContent: string): ValidationIssue | null {
  if (!xmlContent.includes('<Period')) {
    return {
      code: 'PERIOD_REQUIRED',
      severity: 'error',
      element: 'MPD',
      message: 'MPD must contain at least one Period element',
      specReference: 'ISO/IEC 23009-1 § 5.3.2',
      suggestion: 'Add <Period> element with AdaptationSets'
    };
  }

  return null;
}

/**
 * Rule 5: Profile-specific validation for isoff-on-demand
 * Spec: DASH-IF IOP
 */
export function validateOnDemandProfile(xmlContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const profileMatch = xmlContent.match(/profiles="([^"]+)"/);
  if (!profileMatch) return [];

  const profiles = profileMatch[1];

  if (profiles.includes('isoff-on-demand')) {
    // Must be type="static"
    const typeMatch = xmlContent.match(/type="([^"]+)"/);
    const type = typeMatch ? typeMatch[1] : null;

    if (type !== 'static') {
      issues.push({
        code: 'ON_DEMAND_TYPE_STATIC',
        severity: 'error',
        element: 'MPD',
        attribute: 'type',
        message: 'isoff-on-demand profile requires type="static"',
        specReference: 'DASH-IF IOP § 3.2.2',
        suggestion: 'Change type to "static" for VOD content'
      });
    }

    // Must have mediaPresentationDuration
    if (!xmlContent.includes('mediaPresentationDuration=')) {
      issues.push({
        code: 'ON_DEMAND_DURATION_REQUIRED',
        severity: 'error',
        element: 'MPD',
        attribute: 'mediaPresentationDuration',
        message: 'isoff-on-demand profile requires mediaPresentationDuration',
        specReference: 'DASH-IF IOP § 3.2.2',
        suggestion: 'Add mediaPresentationDuration="PT634.566S" or appropriate duration'
      });
    }
  }

  return issues;
}

/**
 * Rule 6: AdaptationSet must have mimeType or contentType
 * Spec: ISO/IEC 23009-1 § 5.3.3
 */
export function validateAdaptationSetType(xmlContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find all AdaptationSet opening tags
  const adaptationSetPattern = /<AdaptationSet[^>]*>/g;
  let match;
  let adaptationSetIndex = 0;

  while ((match = adaptationSetPattern.exec(xmlContent)) !== null) {
    adaptationSetIndex++;
    const tag = match[0];

    if (!tag.includes('mimeType=') && !tag.includes('contentType=')) {
      issues.push({
        code: 'ADAPTATION_SET_TYPE_REQUIRED',
        severity: 'error',
        element: 'AdaptationSet',
        message: `AdaptationSet #${adaptationSetIndex} must have either mimeType or contentType attribute`,
        specReference: 'ISO/IEC 23009-1 § 5.3.3',
        suggestion: 'Add mimeType="video/mp4" or contentType="video"'
      });
    }
  }

  return issues;
}

/**
 * Rule 7: Representation must have id and bandwidth
 * Spec: ISO/IEC 23009-1 § 5.3.5
 */
export function validateRepresentationAttributes(xmlContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const repPattern = /<Representation[^>]*>/g;
  let match;
  let repIndex = 0;

  while ((match = repPattern.exec(xmlContent)) !== null) {
    repIndex++;
    const tag = match[0];

    if (!tag.includes('id=')) {
      issues.push({
        code: 'REPRESENTATION_ID_REQUIRED',
        severity: 'error',
        element: 'Representation',
        attribute: 'id',
        message: `Representation #${repIndex} must have id attribute`,
        specReference: 'ISO/IEC 23009-1 § 5.3.5',
        suggestion: 'Add id="1" or similar unique identifier'
      });
    }

    if (!tag.includes('bandwidth=')) {
      issues.push({
        code: 'REPRESENTATION_BANDWIDTH_REQUIRED',
        severity: 'error',
        element: 'Representation',
        attribute: 'bandwidth',
        message: `Representation #${repIndex} must have bandwidth attribute`,
        specReference: 'ISO/IEC 23009-1 § 5.3.5',
        suggestion: 'Add bandwidth="1000000" (bitrate in bits per second)'
      });
    }
  }

  return issues;
}

/**
 * Detect MPD type (static vs dynamic)
 */
export function detectMPDType(xmlContent: string): 'static' | 'dynamic' {
  const typeMatch = xmlContent.match(/type="([^"]+)"/);
  const type = typeMatch ? typeMatch[1] : 'static';

  return type === 'dynamic' ? 'dynamic' : 'static';
}

/**
 * Detect DASH profile
 */
export function detectDASHProfile(xmlContent: string): string {
  const profileMatch = xmlContent.match(/profiles="([^"]+)"/);
  return profileMatch ? profileMatch[1] : 'unknown';
}

/**
 * Detect DASH features
 */
export function detectDASHFeatures(xmlContent: string, mpdType: 'static' | 'dynamic'): Array<{ name: string; detected: boolean }> {
  const features: Array<{ name: string; detected: boolean }> = [];

  features.push({
    name: `${mpdType === 'static' ? 'Video On Demand (VOD)' : 'Live Streaming'}`,
    detected: true
  });

  features.push({
    name: 'SegmentTemplate Addressing',
    detected: xmlContent.includes('<SegmentTemplate')
  });

  features.push({
    name: 'SegmentList Addressing',
    detected: xmlContent.includes('<SegmentList')
  });

  features.push({
    name: 'SegmentBase Addressing',
    detected: xmlContent.includes('<SegmentBase')
  });

  features.push({
    name: 'Multi-Period',
    detected: (xmlContent.match(/<Period/g) || []).length > 1
  });

  features.push({
    name: 'Content Protection (DRM)',
    detected: xmlContent.includes('<ContentProtection')
  });

  return features;
}

/**
 * Get all DASH rule names
 */
export function getAllDASHRuleNames(): string[] {
  return [
    'MPD_INVALID_XML',
    'MPD_TYPE_REQUIRED',
    'MPD_TYPE_INVALID',
    'MIN_BUFFER_TIME_REQUIRED',
    'MIN_BUFFER_TIME_FORMAT',
    'PERIOD_REQUIRED',
    'ADAPTATION_SET_TYPE_REQUIRED',
    'REPRESENTATION_ID_REQUIRED',
    'REPRESENTATION_BANDWIDTH_REQUIRED',
    'ON_DEMAND_TYPE_STATIC',
    'ON_DEMAND_DURATION_REQUIRED',
  ];
}
