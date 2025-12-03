// tests/utils/resolution-analyzer.test.ts
import { describe, it, expect } from 'vitest';
import {
  analyzeResolution,
  analyzeResolutions,
  getRecommendedResolution,
  calculateBitratePerPixel,
  analyzeBitrateEfficiency
} from '../../src/lib/utils/resolution-analyzer';
import type { Variant } from '../../src/types/manifest';

describe('analyzeResolution', () => {
  it('should identify 4K resolution', () => {
    const result = analyzeResolution({ width: 3840, height: 2160 });

    expect(result.label).toBe('4K UHD');
    expect(result.category).toBe('4K');
    expect(result.aspectRatio).toBe('16:9');
    expect(result.isWidescreen).toBe(true);
  });

  it('should identify 1080p resolution', () => {
    const result = analyzeResolution({ width: 1920, height: 1080 });

    expect(result.label).toBe('1080p Full HD');
    expect(result.category).toBe('1080p');
  });

  it('should identify 720p resolution', () => {
    const result = analyzeResolution({ width: 1280, height: 720 });

    expect(result.label).toBe('720p HD');
    expect(result.category).toBe('720p');
  });

  it('should calculate pixel density score', () => {
    const hd = analyzeResolution({ width: 1920, height: 1080 });
    const sd = analyzeResolution({ width: 640, height: 360 });

    expect(hd.pixelDensityScore).toBeGreaterThan(sd.pixelDensityScore);
  });

  it('should detect non-widescreen aspect ratios', () => {
    const result = analyzeResolution({ width: 1024, height: 768 }); // 4:3

    expect(result.isWidescreen).toBe(false);
    expect(result.aspectRatio).toBe('4:3');
  });
});

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
    bitrate: 1500000,
    resolution: { width: 1280, height: 720 },
    codecs: ['avc1'],
    url: 'v2.m3u8',
    type: 'video'
  },
  {
    id: 'v3',
    bitrate: 3000000,
    resolution: { width: 1920, height: 1080 },
    codecs: ['avc1'],
    url: 'v3.m3u8',
    type: 'video'
  },
  {
    id: 'v4',
    bitrate: 8000000,
    resolution: { width: 3840, height: 2160 },
    codecs: ['avc1'],
    url: 'v4.m3u8',
    type: 'video'
  }
];

describe('analyzeResolutions', () => {
  it('should analyze all video resolutions', () => {
    const analysis = analyzeResolutions(mockVariants);

    expect(analysis.resolutions).toHaveLength(4);
    expect(analysis.maxResolution?.category).toBe('4K');
    expect(analysis.minResolution?.category).toBe('360p');
  });

  it('should detect consistent aspect ratio', () => {
    const analysis = analyzeResolutions(mockVariants);

    expect(analysis.hasMultipleAspectRatios).toBe(false);
    expect(analysis.predominantAspectRatio).toBe('16:9');
  });

  it('should calculate quality distribution', () => {
    const analysis = analyzeResolutions(mockVariants);

    expect(analysis.qualityDistribution['4K']).toBe(1);
    expect(analysis.qualityDistribution['1080p']).toBe(1);
    expect(analysis.qualityDistribution['720p']).toBe(1);
    expect(analysis.qualityDistribution['360p']).toBe(1);
  });

  it('should recommend adding 720p if missing', () => {
    const variantsWithout720p = mockVariants.filter(v =>
      v.resolution?.width !== 1280
    );

    const analysis = analyzeResolutions(variantsWithout720p);

    expect(analysis.recommendations.some(r => r.includes('720p'))).toBe(true);
  });
});

describe('getRecommendedResolution', () => {
  it('should recommend 360p for mobile', () => {
    const recommended = getRecommendedResolution(mockVariants, 'mobile');

    expect(recommended?.resolution?.width).toBe(640);
  });

  it('should recommend 720p for tablet', () => {
    const recommended = getRecommendedResolution(mockVariants, 'tablet');

    expect(recommended?.resolution?.width).toBe(1280);
  });

  it('should recommend 1080p for desktop', () => {
    const recommended = getRecommendedResolution(mockVariants, 'desktop');

    expect(recommended?.resolution?.width).toBe(1920);
  });

  it('should recommend 4K for TV', () => {
    const recommended = getRecommendedResolution(mockVariants, 'tv');

    expect(recommended?.resolution?.width).toBe(3840);
  });
});

describe('calculateBitratePerPixel', () => {
  it('should calculate bits per pixel correctly', () => {
    const variant: Variant = {
      id: 'v1',
      bitrate: 1920000, // ~2 Mbps
      resolution: { width: 1920, height: 1080 },
      codecs: ['avc1'],
      url: 'v1.m3u8',
      type: 'video'
    };

    const bpp = calculateBitratePerPixel(variant);

    expect(bpp).toBeCloseTo(1920000 / (1920 * 1080), 4);
  });

  it('should return null for variants without resolution', () => {
    const variant: Variant = {
      id: 'a1',
      bitrate: 128000,
      codecs: ['mp4a'],
      url: 'a1.m3u8',
      type: 'audio'
    };

    expect(calculateBitratePerPixel(variant)).toBeNull();
  });
});

describe('analyzeBitrateEfficiency', () => {
  it('should identify most efficient variant', () => {
    const analysis = analyzeBitrateEfficiency(mockVariants);

    expect(analysis.mostEfficient).toBeDefined();
    expect(analysis.leastEfficient).toBeDefined();
    expect(analysis.avgBitsPerPixel).toBeGreaterThan(0);
  });

  it('should calculate efficiency scores', () => {
    const analysis = analyzeBitrateEfficiency(mockVariants);

    expect(analysis.variants.length).toBe(4);
    analysis.variants.forEach(v => {
      expect(v.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(v.efficiencyScore).toBeLessThanOrEqual(100);
    });
  });
});
