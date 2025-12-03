// tests/validation/manifest-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateManifest, type ValidationIssue } from '../../src/lib/validation/manifest-validator';
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

describe('validateManifest', () => {
  it('should pass validation for healthy manifest', () => {
    const manifest = createMockManifest({
      variants: [
        {
          id: 'v1',
          bitrate: 1000000,
          resolution: { width: 1280, height: 720 },
          codecs: ['avc1'],
          url: 'v1.m3u8',
          type: 'video'
        },
        {
          id: 'v2',
          bitrate: 2000000,
          resolution: { width: 1920, height: 1080 },
          codecs: ['avc1'],
          url: 'v2.m3u8',
          type: 'video'
        }
      ]
    });

    const issues = validateManifest(manifest);
    expect(issues).toHaveLength(0);
  });

  it('should detect missing variants', () => {
    const manifest = createMockManifest({ variants: [] });

    const issues = validateManifest(manifest);
    const errorIssues = issues.filter(i => i.severity === 'error');

    expect(errorIssues.length).toBeGreaterThan(0);
    expect(errorIssues[0].message).toContain('No variants');
  });

  it('should warn about insufficient variant count', () => {
    const manifest = createMockManifest({
      variants: [
        {
          id: 'v1',
          bitrate: 1000000,
          resolution: { width: 1280, height: 720 },
          codecs: ['avc1'],
          url: 'v1.m3u8',
          type: 'video'
        }
      ]
    });

    const issues = validateManifest(manifest);
    const warnings = issues.filter(i => i.severity === 'warning');

    expect(warnings.some(w => w.message.includes('variant'))).toBe(true);
  });

  it('should detect duplicate bitrates', () => {
    const manifest = createMockManifest({
      variants: [
        {
          id: 'v1',
          bitrate: 1000000,
          resolution: { width: 1280, height: 720 },
          codecs: ['avc1'],
          url: 'v1.m3u8',
          type: 'video'
        },
        {
          id: 'v2',
          bitrate: 1000000,  // Same bitrate
          resolution: { width: 1920, height: 1080 },
          codecs: ['avc1'],
          url: 'v2.m3u8',
          type: 'video'
        }
      ]
    });

    const issues = validateManifest(manifest);
    expect(issues.some(i => i.message.includes('duplicate') || i.message.includes('same bitrate'))).toBe(true);
  });

  it('should warn about missing codecs', () => {
    const manifest = createMockManifest({
      variants: [
        {
          id: 'v1',
          bitrate: 1000000,
          resolution: { width: 1280, height: 720 },
          codecs: [],  // No codecs
          url: 'v1.m3u8',
          type: 'video'
        }
      ]
    });

    const issues = validateManifest(manifest);
    expect(issues.some(i => i.message.includes('codec'))).toBe(true);
  });
});
