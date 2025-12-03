// src/types/manifest.ts

export type ManifestFormat = 'hls' | 'dash';
export type ManifestType = 'VOD' | 'LIVE' | 'EVENT';
export type VariantType = 'video' | 'audio' | 'subtitle';

export interface ParsedManifest {
  format: ManifestFormat;
  raw: string;
  url: string;
  variants: Variant[];
  metadata: ManifestMetadata;
  segments?: Segment[];
}

export interface Variant {
  id: string;
  bitrate: number; // bits per second
  resolution?: Resolution;
  codecs: string[];
  frameRate?: number;
  url: string;
  type: VariantType;
}

export interface Resolution {
  width: number;
  height: number;
}

export interface ManifestMetadata {
  version?: string;
  duration?: number; // seconds
  targetDuration?: number; // HLS target duration
  minBufferTime?: number; // DASH min buffer time
  type: ManifestType;
  encrypted: boolean;
  profiles?: string[]; // DASH profiles
}

export interface Segment {
  id: string;
  duration: number;
  url: string;
  byteRange?: ByteRange;
  sequence: number;
}

export interface ByteRange {
  start: number;
  end: number;
}

export interface ManifestHistoryItem {
  url: string;
  format: ManifestFormat;
  timestamp: number;
  variantCount: number;
  duration?: number;
  title?: string;
}

export interface DetectedManifest {
  url: string;
  format: ManifestFormat;
  source: 'link' | 'xhr' | 'video-src';
  pageUrl: string;
}
