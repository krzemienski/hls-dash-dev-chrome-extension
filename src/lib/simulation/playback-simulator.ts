// src/lib/simulation/playback-simulator.ts
import type { Variant } from '../../types/manifest';
import { getRecommendedVariant } from '../utils/abr-analysis';

export interface BandwidthProfile {
  time: number;      // seconds from start
  bandwidth: number; // bits per second
}

export interface QualitySwitch {
  time: number;
  fromVariant: Variant | null;
  toVariant: Variant;
  reason: 'startup' | 'upgrade' | 'downgrade';
}

export interface PlaybackSegment {
  time: number;
  variant: Variant;
  bufferHealth: number; // seconds of buffer
}

export interface SimulationResult {
  segments: PlaybackSegment[];
  switches: QualitySwitch[];
  totalSwitches: number;
  rebufferingTime: number; // total seconds of rebuffering
  averageQuality: number;  // average bitrate
}

/**
 * Generate bandwidth profile for simulation
 */
export function generateBandwidthProfile(
  type: 'stable' | 'varying' | 'degrading' | 'improving',
  baseBandwidth: number,
  durationSeconds: number
): BandwidthProfile[] {
  const profile: BandwidthProfile[] = [];
  const interval = 5; // 5 second intervals

  for (let time = 0; time < durationSeconds; time += interval) {
    let bandwidth: number;

    switch (type) {
      case 'stable':
        bandwidth = baseBandwidth;
        break;

      case 'varying':
        // Random variations between 50% and 150% of base
        const variation = 0.5 + Math.random();
        bandwidth = baseBandwidth * variation;
        break;

      case 'degrading':
        // Linear degradation from 100% to 30%
        const degradePercent = 1.0 - (time / durationSeconds) * 0.7;
        bandwidth = baseBandwidth * degradePercent;
        break;

      case 'improving':
        // Linear improvement from 30% to 100%
        const improvePercent = 0.3 + (time / durationSeconds) * 0.7;
        bandwidth = baseBandwidth * improvePercent;
        break;
    }

    profile.push({ time, bandwidth });
  }

  return profile;
}

/**
 * Simulate ABR playback with given bandwidth profile
 */
export function simulatePlayback(
  variants: Variant[],
  bandwidthProfile: BandwidthProfile[],
  targetDuration: number = 10 // segment duration in seconds
): SimulationResult {
  const segments: PlaybackSegment[] = [];
  const switches: QualitySwitch[] = [];

  let currentVariant: Variant | null = null;
  let bufferHealth = 0;
  let rebufferingTime = 0;

  bandwidthProfile.forEach((point, index) => {
    // Get recommended variant for current bandwidth
    const recommendedVariant = getRecommendedVariant(variants, point.bandwidth);

    if (!recommendedVariant) {
      return;
    }

    // Detect quality switch
    if (!currentVariant) {
      // Startup
      switches.push({
        time: point.time,
        fromVariant: null,
        toVariant: recommendedVariant,
        reason: 'startup'
      });
      currentVariant = recommendedVariant;
    } else if (recommendedVariant.id !== currentVariant.id) {
      // Quality switch
      const reason =
        recommendedVariant.bitrate > currentVariant.bitrate ? 'upgrade' : 'downgrade';

      switches.push({
        time: point.time,
        fromVariant: currentVariant,
        toVariant: recommendedVariant,
        reason
      });
      currentVariant = recommendedVariant;
    }

    // Calculate buffer health
    // If bandwidth > bitrate, buffer increases; otherwise decreases
    const downloadSpeed = point.bandwidth;
    const playbackRate = currentVariant.bitrate;

    if (downloadSpeed >= playbackRate) {
      // Buffer increases
      bufferHealth += targetDuration * (downloadSpeed / playbackRate - 1);
      bufferHealth = Math.min(bufferHealth, 30); // Max 30s buffer
    } else {
      // Buffer decreases
      bufferHealth -= targetDuration * (1 - downloadSpeed / playbackRate);

      // Rebuffering if buffer depleted
      if (bufferHealth < 0) {
        const rebufferDuration = Math.abs(bufferHealth);
        rebufferingTime += rebufferDuration;
        bufferHealth = 0;
      }
    }

    segments.push({
      time: point.time,
      variant: currentVariant,
      bufferHealth
    });
  });

  // Calculate average quality
  const averageQuality =
    segments.reduce((sum, s) => sum + s.variant.bitrate, 0) / segments.length;

  return {
    segments,
    switches,
    totalSwitches: switches.filter(s => s.reason !== 'startup').length,
    rebufferingTime,
    averageQuality
  };
}
