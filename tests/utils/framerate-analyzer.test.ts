// tests/utils/framerate-analyzer.test.ts
import { describe, it, expect } from 'vitest';
import {
  analyzeFrameRates,
  categorizeFrameRate,
  calculateMotionSmoothness
} from '../../src/lib/utils/framerate-analyzer';
import type { Variant } from '../../src/types/manifest';

const mockVariants: Variant[] = [
  {
    id: 'v1',
    bitrate: 1000000,
    resolution: { width: 1280, height: 720 },
    frameRate: 24,
    codecs: ['avc1'],
    url: 'v1.m3u8',
    type: 'video'
  },
  {
    id: 'v2',
    bitrate: 2000000,
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    codecs: ['avc1'],
    url: 'v2.m3u8',
    type: 'video'
  },
  {
    id: 'v3',
    bitrate: 5000000,
    resolution: { width: 1920, height: 1080 },
    frameRate: 60,
    codecs: ['avc1'],
    url: 'v3.m3u8',
    type: 'video'
  }
];

describe('categorizeFrameRate', () => {
  it('should categorize cinema frame rate (24fps)', () => {
    const category = categorizeFrameRate(24);

    expect(category.label).toBe('Cinema');
    expect(category.useCase).toContain('film');
  });

  it('should categorize standard frame rate (30fps)', () => {
    const category = categorizeFrameRate(30);

    expect(category.label).toBe('Standard');
    expect(category.useCase).toContain('TV');
  });

  it('should categorize high frame rate (60fps)', () => {
    const category = categorizeFrameRate(60);

    expect(category.label).toBe('High (HFR)');
    expect(category.useCase).toContain('sports');
  });

  it('should categorize ultra high frame rate (120fps)', () => {
    const category = categorizeFrameRate(120);

    expect(category.label).toBe('Ultra High');
    expect(category.smoothnessScore).toBeGreaterThan(90);
  });
});

describe('analyzeFrameRates', () => {
  it('should analyze all frame rates in variants', () => {
    const analysis = analyzeFrameRates(mockVariants);

    expect(analysis.minFrameRate).toBe(24);
    expect(analysis.maxFrameRate).toBe(60);
    expect(analysis.hasHighFrameRate).toBe(true);
  });

  it('should detect consistent frame rates', () => {
    const consistent = [mockVariants[0], mockVariants[1]]; // Both 24 and 30
    const analysis = analyzeFrameRates(consistent);

    expect(analysis.hasConsistentFrameRates).toBe(false); // Different rates
  });

  it('should handle variants without frame rate', () => {
    const variantsNoFps: Variant[] = [{
      id: 'v1',
      bitrate: 1000000,
      resolution: { width: 1280, height: 720 },
      codecs: ['avc1'],
      url: 'v1.m3u8',
      type: 'video'
    }];

    const analysis = analyzeFrameRates(variantsNoFps);

    expect(analysis.minFrameRate).toBeNull();
    expect(analysis.maxFrameRate).toBeNull();
  });
});

describe('calculateMotionSmoothness', () => {
  it('should calculate smoothness score for different frame rates', () => {
    const score24 = calculateMotionSmoothness(24);
    const score30 = calculateMotionSmoothness(30);
    const score60 = calculateMotionSmoothness(60);

    expect(score30).toBeGreaterThan(score24);
    expect(score60).toBeGreaterThan(score30);
    expect(score60).toBeGreaterThan(90);
  });

  it('should handle low frame rates', () => {
    const score = calculateMotionSmoothness(15);

    expect(score).toBeLessThan(60);
  });
});
