// src/lib/export/exporters.ts
import type { ParsedManifest, Variant } from '../../types/manifest';

/**
 * Export manifest to JSON format
 */
export function exportToJSON(manifest: ParsedManifest): string {
  return JSON.stringify(manifest, null, 2);
}

/**
 * Export manifest variants to CSV format
 */
export function exportToCSV(manifest: ParsedManifest): string {
  const headers = ['ID', 'Type', 'Bitrate', 'Resolution', 'Frame Rate', 'Codecs', 'URL'];
  const rows: string[] = [headers.join(',')];

  manifest.variants.forEach((variant) => {
    const row = [
      variant.id,
      variant.type,
      variant.bitrate.toString(),
      variant.resolution ? `${variant.resolution.width}x${variant.resolution.height}` : '',
      variant.frameRate?.toString() || '',
      `"${variant.codecs.join(', ')}"`,
      variant.url
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Export manifest to human-readable text format
 */
export function exportToText(manifest: ParsedManifest): string {
  const lines: string[] = [];

  // Header
  lines.push(`${manifest.format.toUpperCase()} Manifest Analysis`);
  lines.push('='.repeat(50));
  lines.push('');

  // Basic Info
  lines.push(`URL: ${manifest.url}`);
  lines.push(`Format: ${manifest.format.toUpperCase()}`);
  lines.push(`Type: ${manifest.metadata.type}`);

  if (manifest.metadata.duration) {
    lines.push(`Duration: ${manifest.metadata.duration}s`);
  }

  if (manifest.metadata.targetDuration) {
    lines.push(`Target Duration: ${manifest.metadata.targetDuration}s`);
  }

  if (manifest.metadata.minBufferTime) {
    lines.push(`Min Buffer Time: ${manifest.metadata.minBufferTime}s`);
  }

  lines.push(`Encrypted: ${manifest.metadata.encrypted ? 'Yes' : 'No'}`);
  lines.push('');

  // Variants by type
  const videoVariants = manifest.variants.filter(v => v.type === 'video');
  const audioVariants = manifest.variants.filter(v => v.type === 'audio');
  const subtitleVariants = manifest.variants.filter(v => v.type === 'subtitle');

  if (videoVariants.length > 0) {
    lines.push(`Video Variants (${videoVariants.length})`);
    lines.push('-'.repeat(50));
    videoVariants.forEach((v, i) => {
      lines.push(`  ${i + 1}. ${formatBitrate(v.bitrate)}`);
      if (v.resolution) {
        lines.push(`     Resolution: ${v.resolution.width}x${v.resolution.height}`);
      }
      if (v.frameRate) {
        lines.push(`     Frame Rate: ${v.frameRate} fps`);
      }
      lines.push(`     Codecs: ${v.codecs.join(', ')}`);
      lines.push(`     URL: ${v.url}`);
      lines.push('');
    });
  }

  if (audioVariants.length > 0) {
    lines.push(`Audio Variants (${audioVariants.length})`);
    lines.push('-'.repeat(50));
    audioVariants.forEach((v, i) => {
      lines.push(`  ${i + 1}. ${formatBitrate(v.bitrate)}`);
      lines.push(`     Codecs: ${v.codecs.join(', ')}`);
      lines.push(`     URL: ${v.url}`);
      lines.push('');
    });
  }

  if (subtitleVariants.length > 0) {
    lines.push(`Subtitle Variants (${subtitleVariants.length})`);
    lines.push('-'.repeat(50));
    subtitleVariants.forEach((v, i) => {
      lines.push(`  ${i + 1}. ${v.codecs.join(', ')}`);
      lines.push(`     URL: ${v.url}`);
      lines.push('');
    });
  }

  // Segments info
  if (manifest.segments && manifest.segments.length > 0) {
    lines.push(`Segments: ${manifest.segments.length}`);
    const avgDuration = manifest.segments.reduce((sum, s) => sum + s.duration, 0) / manifest.segments.length;
    lines.push(`Average Segment Duration: ${avgDuration.toFixed(2)}s`);
  }

  return lines.join('\n');
}

function formatBitrate(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} Kbps`;
}
