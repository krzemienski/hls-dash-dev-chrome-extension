// Validation types for HLS and DASH spec compliance

export interface ValidationResult {
  compliant: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  playlistType: PlaylistType;
  version?: string;
  detectedFeatures: DetectedFeature[];
  checkedRules: string[];
  timestamp: string;
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  element?: string;
  tag?: string;
  attribute?: string;
  message: string;
  specReference: string;
  specUrl?: string;
  suggestion?: string;
}

export interface DetectedFeature {
  name: string;
  version?: number;
  detected: boolean;
  tag?: string;
}

export type PlaylistType = 'master' | 'media' | 'mpd-static' | 'mpd-dynamic';

export interface SegmentAvailability {
  checked: boolean;
  total: number;
  available: number;
  missing: number;
  segments: Map<string, SegmentStatus>;
  checkTime: string;
}

export interface SegmentStatus {
  url: string;
  available: boolean;
  statusCode?: number;
  error?: string;
  size?: number;
  responseTime?: number;
}
