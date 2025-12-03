// src/lib/parsers/dash-parser.ts
import { parse } from 'mpd-parser';
import type { ParsedManifest, Variant, ManifestMetadata, VariantType } from '../../types/manifest';
import { resolveManifestUrl } from '../utils/url-resolver';

export function parseDASH(content: string, baseUrl: string): ParsedManifest {
  const manifest = parse(content, { manifestUri: baseUrl });

  // Extract variants from representations
  const variants: Variant[] = [];
  let variantIndex = 0;

  // Process video/main playlists
  if (manifest.playlists) {
    manifest.playlists.forEach((playlist: any) => {
      const attrs = playlist.attributes || {};

      variants.push({
        id: `variant-${variantIndex++}`,
        bitrate: attrs.BANDWIDTH || attrs.bandwidth || 0,
        resolution: attrs.RESOLUTION || attrs.resolution ? {
          width: (attrs.RESOLUTION || attrs.resolution).width,
          height: (attrs.RESOLUTION || attrs.resolution).height
        } : undefined,
        codecs: extractCodecs(attrs),
        frameRate: attrs['FRAME-RATE'] || attrs.frameRate,
        url: resolveManifestUrl(playlist.uri || '', baseUrl),
        type: determineVariantType(attrs, playlist)
      });
    });
  }

  // Process audio variants from mediaGroups
  if (manifest.mediaGroups?.AUDIO) {
    Object.values(manifest.mediaGroups.AUDIO).forEach((audioGroup: any) => {
      Object.values(audioGroup).forEach((audioTrack: any) => {
        if (audioTrack.playlists && audioTrack.playlists.length > 0) {
          audioTrack.playlists.forEach((playlist: any) => {
            const attrs = playlist.attributes || {};
            variants.push({
              id: `variant-${variantIndex++}`,
              bitrate: attrs.BANDWIDTH || attrs.bandwidth || 0,
              resolution: undefined,
              codecs: extractCodecs(attrs),
              frameRate: undefined,
              url: resolveManifestUrl(playlist.resolvedUri || playlist.uri || '', baseUrl),
              type: 'audio'
            });
          });
        }
      });
    });
  }

  // Duration is already parsed to number by mpd-parser
  const duration = typeof manifest.duration === 'number' ? manifest.duration : undefined;

  // minBufferTime needs to be parsed from XML manually
  const minBufferTime = parseMinBufferTime(content);

  // Determine VOD vs LIVE - check if manifest has endList or check original XML
  const isVOD = manifest.endList || content.includes('type="static"');

  // Extract metadata
  const metadata: ManifestMetadata = {
    duration,
    minBufferTime,
    type: isVOD ? 'VOD' : 'LIVE',
    encrypted: checkIfEncrypted(manifest),
    profiles: manifest.profiles ? [manifest.profiles] : undefined
  };

  return {
    format: 'dash',
    raw: content,
    url: baseUrl,
    variants,
    metadata
  };
}

function extractCodecs(attrs: any): string[] {
  const codecsStr = attrs.CODECS || attrs.codecs || '';
  if (!codecsStr) return [];

  return codecsStr.split(',').map((c: string) => c.trim());
}

function determineVariantType(attrs: any, playlist: any): VariantType {
  // Check mimeType first
  const mimeType = attrs.mimeType || playlist.mimeType || '';

  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('text') || mimeType.includes('subtitle')) return 'subtitle';

  // Fallback to codec analysis
  const codecs = extractCodecs(attrs).join(',');

  if (/avc1|hvc1|hev1|vp0?9|av01/i.test(codecs)) return 'video';
  if (/mp4a|ac-3|ec-3|opus/i.test(codecs)) return 'audio';
  if (/wvtt|stpp/i.test(codecs)) return 'subtitle';

  // Default based on resolution
  return attrs.RESOLUTION || attrs.resolution ? 'video' : 'audio';
}

function checkIfEncrypted(manifest: any): boolean {
  // Check for ContentProtection elements
  if (manifest.contentProtection) return true;

  // Check playlists for DRM
  if (manifest.playlists) {
    return manifest.playlists.some((p: any) =>
      p.contentProtection || p.attributes?.contentProtection
    );
  }

  return false;
}

/**
 * Parse minBufferTime from MPD XML
 * Example: minBufferTime="PT2.00S" → 2.0
 */
function parseMinBufferTime(xmlContent: string): number | undefined {
  const match = xmlContent.match(/minBufferTime="PT([\d.]+)S"/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return undefined;
}
