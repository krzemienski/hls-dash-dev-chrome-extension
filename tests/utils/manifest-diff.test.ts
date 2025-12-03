// tests/utils/manifest-diff.test.ts
import { describe, it, expect } from 'vitest';
import { diffManifests, type ManifestDiff } from '../../src/lib/utils/manifest-diff';
import type { ParsedManifest } from '../../src/types/manifest';

const createMockManifest = (overrides?: Partial<ParsedManifest>): ParsedManifest => ({
  format: 'hls',
  raw: '#EXTM3U',
  url: 'https://example.com/manifest.m3u8',
  variants: [],
  metadata: {
    type: 'VOD',
    encrypted: false
  },
  ...overrides
});

describe('diffManifests', () => {
  it('should detect added variants', () => {
    const manifest1 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' }
      ]
    });

    const manifest2 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' },
        { id: 'v2', bitrate: 2000000, codecs: ['avc1'], url: 'v2.m3u8', type: 'video' }
      ]
    });

    const diff = diffManifests(manifest1, manifest2);

    expect(diff.variantsAdded.length).toBe(1);
    expect(diff.variantsAdded[0].id).toBe('v2');
  });

  it('should detect removed variants', () => {
    const manifest1 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' },
        { id: 'v2', bitrate: 2000000, codecs: ['avc1'], url: 'v2.m3u8', type: 'video' }
      ]
    });

    const manifest2 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' }
      ]
    });

    const diff = diffManifests(manifest1, manifest2);

    expect(diff.variantsRemoved.length).toBe(1);
    expect(diff.variantsRemoved[0].id).toBe('v2');
  });

  it('should detect changed variants', () => {
    const manifest1 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' }
      ]
    });

    const manifest2 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 2000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' }
      ]
    });

    const diff = diffManifests(manifest1, manifest2);

    expect(diff.variantsChanged.length).toBe(1);
    expect(diff.variantsChanged[0].id).toBe('v1');
  });

  it('should detect no changes for identical manifests', () => {
    const manifest1 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' }
      ]
    });

    const manifest2 = createMockManifest({
      variants: [
        { id: 'v1', bitrate: 1000000, codecs: ['avc1'], url: 'v1.m3u8', type: 'video' }
      ]
    });

    const diff = diffManifests(manifest1, manifest2);

    expect(diff.variantsAdded.length).toBe(0);
    expect(diff.variantsRemoved.length).toBe(0);
    expect(diff.variantsChanged.length).toBe(0);
    expect(diff.hasChanges).toBe(false);
  });
});
