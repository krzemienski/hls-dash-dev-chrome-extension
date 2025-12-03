// src/lib/utils/clipboard.ts
import type { Variant, Segment } from '../../types/manifest';

/**
 * Copy all variant URLs to clipboard
 */
export function copyVariantUrls(variants: Variant[]): void {
  const urls = variants.map(v => v.url).join('\n');
  navigator.clipboard.writeText(urls);
}

/**
 * Copy all segment URLs to clipboard
 */
export function copySegmentUrls(segments: Segment[]): void {
  const urls = segments.map(s => s.url).join('\n');
  navigator.clipboard.writeText(urls);
}

/**
 * Copy variant URLs as M3U playlist
 */
export function copyAsM3U(variants: Variant[], title: string = 'Variants'): void {
  const lines = ['#EXTM3U', `#PLAYLIST:${title}`, ''];

  variants.forEach((variant) => {
    const resolution = variant.resolution
      ? `${variant.resolution.width}x${variant.resolution.height}`
      : '';

    lines.push(
      `#EXTINF:-1 tvg-name="${variant.id}" group-title="${variant.type}",${resolution} ${formatBitrate(variant.bitrate)}`
    );
    lines.push(variant.url);
  });

  navigator.clipboard.writeText(lines.join('\n'));
}

/**
 * Copy URLs as cURL commands for downloading
 */
export function copyAsCurlCommands(urls: string[]): void {
  const commands = urls.map((url, index) =>
    `curl -o "segment_${index + 1}.ts" "${url}"`
  );

  navigator.clipboard.writeText(commands.join('\n'));
}

function formatBitrate(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)}Mbps`;
  }
  return `${(bps / 1000).toFixed(0)}Kbps`;
}
