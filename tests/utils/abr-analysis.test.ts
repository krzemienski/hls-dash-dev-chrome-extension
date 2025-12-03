// tests/utils/abr-analysis.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateBitrateGaps,
  analyzeBitrateLadder,
  getRecommendedVariant
} from '../../src/lib/utils/abr-analysis';
import type { Variant } from '../../src/types/manifest';

const mockVariants: Variant[] = [
  {
    id: 'v1',
    bitrate: 500000,
    resolution: { width: 640, height: 360 },
    codecs: ['avc1'],
    url: 'v1.m3u8',
    type: 'video'
  },
  {
    id: 'v2',
    bitrate: 1000000,
    resolution: { width: 854, height: 480 },
    codecs: ['avc1'],
    url: 'v2.m3u8',
    type: 'video'
  },
  {
    id: 'v3',
    bitrate: 2500000,
    resolution: { width: 1280, height: 720 },
    codecs: ['avc1'],
    url: 'v3.m3u8',
    type: 'video'
  },
  {
    id: 'v4',
    bitrate: 5000000,
    resolution: { width: 1920, height: 1080 },
    codecs: ['avc1'],
    url: 'v4.m3u8',
    type: 'video'
  }
];

describe('calculateBitrateGaps', () => {
  it('should calculate gaps between consecutive variants', () => {
    const gaps = calculateBitrateGaps(mockVariants);

    expect(gaps).toHaveLength(3);
    expect(gaps[0]).toBe(500000); // 1M - 500K
    expect(gaps[1]).toBe(1500000); // 2.5M - 1M
    expect(gaps[2]).toBe(2500000); // 5M - 2.5M
  });

  it('should return empty array for single variant', () => {
    const gaps = calculateBitrateGaps([mockVariants[0]]);
    expect(gaps).toHaveLength(0);
  });
});

describe('analyzeBitrateLadder', () => {
  it('should identify bitrate ladder quality', () => {
    const analysis = analyzeBitrateLadder(mockVariants);

    expect(analysis.totalVariants).toBe(4);
    expect(analysis.lowestBitrate).toBe(500000);
    expect(analysis.highestBitrate).toBe(5000000);
    expect(analysis.averageGap).toBeGreaterThan(0);
  });

  it('should detect large gaps in bitrate ladder', () => {
    const analysis = analyzeBitrateLadder(mockVariants);

    // Should identify the 2.5M gap as large
    expect(analysis.largeGaps.length).toBeGreaterThan(0);
  });
});

describe('getRecommendedVariant', () => {
  it('should recommend variant based on connection speed', () => {
    // 3 Mbps connection
    const recommended = getRecommendedVariant(mockVariants, 3000000);

    // Should recommend 2.5 Mbps variant (not 5 Mbps which is too high)
    expect(recommended?.bitrate).toBe(2500000);
  });

  it('should return lowest variant for slow connection', () => {
    const recommended = getRecommendedVariant(mockVariants, 100000);

    expect(recommended?.bitrate).toBe(500000);
  });

  it('should return highest variant for fast connection', () => {
    const recommended = getRecommendedVariant(mockVariants, 10000000);

    expect(recommended?.bitrate).toBe(5000000);
  });
});
