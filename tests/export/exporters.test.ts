// tests/export/exporters.test.ts
import { describe, it, expect } from 'vitest';
import { exportToJSON, exportToCSV, exportToText } from '../../src/lib/export/exporters';
import type { ParsedManifest } from '../../src/types/manifest';

const mockManifest: ParsedManifest = {
  format: 'hls',
  raw: '#EXTM3U\n#EXT-X-VERSION:3',
  url: 'https://example.com/master.m3u8',
  variants: [
    {
      id: 'variant-0',
      bitrate: 2000000,
      resolution: { width: 1920, height: 1080 },
      codecs: ['avc1.64001f', 'mp4a.40.2'],
      frameRate: 30,
      url: 'https://example.com/2000k.m3u8',
      type: 'video'
    },
    {
      id: 'variant-1',
      bitrate: 128000,
      codecs: ['mp4a.40.2'],
      url: 'https://example.com/audio.m3u8',
      type: 'audio'
    }
  ],
  metadata: {
    type: 'VOD',
    duration: 120,
    targetDuration: 10,
    encrypted: false
  }
};

describe('exportToJSON', () => {
  it('should export manifest to formatted JSON', () => {
    const result = exportToJSON(mockManifest);

    expect(result).toContain('"format": "hls"');
    expect(result).toContain('"bitrate": 2000000');
    expect(JSON.parse(result)).toEqual(mockManifest);
  });

  it('should produce valid JSON', () => {
    const result = exportToJSON(mockManifest);
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

describe('exportToCSV', () => {
  it('should export variants to CSV format', () => {
    const result = exportToCSV(mockManifest);

    expect(result).toContain('ID,Type,Bitrate,Resolution,Frame Rate,Codecs,URL');
    expect(result).toContain('variant-0,video,2000000,1920x1080,30');
    expect(result).toContain('variant-1,audio,128000');
  });

  it('should handle missing optional fields', () => {
    const result = exportToCSV(mockManifest);
    expect(result).toContain('variant-1,audio,128000,,'); // No resolution or framerate
  });
});

describe('exportToText', () => {
  it('should export manifest to human-readable text', () => {
    const result = exportToText(mockManifest);

    expect(result).toContain('HLS Manifest Analysis');
    expect(result).toContain('URL: https://example.com/master.m3u8');
    expect(result).toContain('Type: VOD');
    expect(result).toContain('Duration: 120s');
    expect(result).toContain('Video Variants (1)');
    expect(result).toContain('Audio Variants (1)');
  });
});
