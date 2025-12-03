// src/lib/parsers/hls-parser.ts
import { Parser } from 'm3u8-parser';
import type { ParsedManifest, Variant, ManifestMetadata, VariantType } from '../../types/manifest';
import { resolveManifestUrl } from '../utils/url-resolver';

export function parseHLS(content: string, baseUrl: string): ParsedManifest {
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const manifest = parser.manifest;

  // Extract variants from playlists
  const variants: Variant[] = (manifest.playlists || []).map((playlist: any, index: number) => {
    const attrs = playlist.attributes || {};

    return {
      id: `variant-${index}`,
      bitrate: attrs.BANDWIDTH || attrs['AVERAGE-BANDWIDTH'] || 0,
      resolution: attrs.RESOLUTION ? {
        width: attrs.RESOLUTION.width,
        height: attrs.RESOLUTION.height
      } : undefined,
      codecs: attrs.CODECS ? attrs.CODECS.split(',').map((c: string) => c.trim()) : [],
      frameRate: attrs['FRAME-RATE'],
      url: resolveManifestUrl(playlist.uri, baseUrl),
      type: determineVariantType(attrs)
    };
  });

  // Extract metadata
  const metadata: ManifestMetadata = {
    version: manifest.version?.toString(),
    targetDuration: manifest.targetDuration,
    duration: manifest.duration,
    type: manifest.endList ? 'VOD' : (manifest.playlistType === 'EVENT' ? 'EVENT' : 'LIVE'),
    encrypted: manifest.segments?.some((s: any) => s.key) || false
  };

  // Extract segments (for media playlists)
  const segments = manifest.segments?.map((seg: any, i: number) => ({
    id: `segment-${i}`,
    duration: seg.duration,
    url: resolveManifestUrl(seg.uri, baseUrl),
    byteRange: seg.byterange ? {
      start: seg.byterange.offset,
      end: seg.byterange.offset + seg.byterange.length
    } : undefined,
    sequence: i + (manifest.mediaSequence || 0)
  }));

  return {
    format: 'hls',
    raw: content,
    url: baseUrl,
    variants,
    metadata,
    segments
  };
}

function determineVariantType(attrs: any): VariantType {
  const codecs = attrs.CODECS || '';

  // Video codecs: avc1, hvc1, vp9, av01
  if (/avc1|hvc1|hev1|vp0?9|av01/i.test(codecs)) {
    return 'video';
  }

  // Audio codecs: mp4a, ac-3, ec-3, opus
  if (/mp4a|ac-3|ec-3|opus/i.test(codecs)) {
    return 'audio';
  }

  // Subtitle codecs: wvtt, stpp
  if (/wvtt|stpp/i.test(codecs)) {
    return 'subtitle';
  }

  // Default: assume video if has resolution
  return attrs.RESOLUTION ? 'video' : 'audio';
}
