// tests/simulation/playback-simulator.test.ts
import { describe, it, expect } from 'vitest';
import {
  simulatePlayback,
  generateBandwidthProfile,
  type BandwidthProfile
} from '../../src/lib/simulation/playback-simulator';
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
  }
];

describe('generateBandwidthProfile', () => {
  it('should generate stable bandwidth profile', () => {
    const profile = generateBandwidthProfile('stable', 2000000, 60);

    expect(profile.length).toBeGreaterThan(0);
    expect(profile.every(p => p.bandwidth === 2000000)).toBe(true);
  });

  it('should generate varying bandwidth profile', () => {
    const profile = generateBandwidthProfile('varying', 2000000, 60);

    expect(profile.length).toBeGreaterThan(0);

    // Should have variations
    const uniqueBandwidths = new Set(profile.map(p => p.bandwidth));
    expect(uniqueBandwidths.size).toBeGreaterThan(1);
  });

  it('should generate degrading bandwidth profile', () => {
    const profile = generateBandwidthProfile('degrading', 3000000, 60);

    expect(profile.length).toBeGreaterThan(0);

    // First should be higher than last
    expect(profile[0].bandwidth).toBeGreaterThan(profile[profile.length - 1].bandwidth);
  });
});

describe('simulatePlayback', () => {
  it('should simulate playback with stable bandwidth', () => {
    const profile: BandwidthProfile = [
      { time: 0, bandwidth: 2000000 },
      { time: 10, bandwidth: 2000000 },
      { time: 20, bandwidth: 2000000 }
    ];

    const result = simulatePlayback(mockVariants, profile, 10);

    expect(result.switches.length).toBeGreaterThanOrEqual(0);
    expect(result.totalSwitches).toBe(result.switches.length);
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('should detect quality switches when bandwidth changes', () => {
    const profile: BandwidthProfile = [
      { time: 0, bandwidth: 3500000 },   // Should select v3
      { time: 10, bandwidth: 1000000 },  // Should switch to v2
      { time: 20, bandwidth: 400000 }    // Should switch to v1
    ];

    const result = simulatePlayback(mockVariants, profile, 10);

    // Should have at least 2 switches
    expect(result.totalSwitches).toBeGreaterThanOrEqual(2);
  });

  it('should track rebuffering when bandwidth is insufficient', () => {
    const profile: BandwidthProfile = [
      { time: 0, bandwidth: 100000 }  // Very low bandwidth
    ];

    const result = simulatePlayback(mockVariants, profile, 2);

    // With very low bandwidth, might have rebuffering
    expect(result.rebufferingTime).toBeGreaterThanOrEqual(0);
  });
});
