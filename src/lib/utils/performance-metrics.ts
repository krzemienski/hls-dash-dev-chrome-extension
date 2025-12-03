// src/lib/utils/performance-metrics.ts
import type { ParsedManifest, Variant } from '../../types/manifest';

export interface PerformanceMetrics {
  startupLatency: number; // Estimated time to first frame
  switchingLatency: number; // Estimated time for quality switch
  bufferRequirement: number; // Minimum buffer needed
  bandwidthEfficiency: number; // 0-100 score
  qualityConsistency: number; // 0-100 score
  recommendations: string[];
}

/**
 * Calculate performance metrics for manifest
 */
export function calculatePerformanceMetrics(manifest: ParsedManifest): PerformanceMetrics {
  const videoVariants = manifest.variants.filter(v => v.type === 'video');

  if (videoVariants.length === 0) {
    return {
      startupLatency: 0,
      switchingLatency: 0,
      bufferRequirement: 0,
      bandwidthEfficiency: 0,
      qualityConsistency: 0,
      recommendations: ['No video variants to analyze']
    };
  }

  // Estimate startup latency based on segment duration
  const targetDuration = manifest.metadata.targetDuration || 10;
  const startupLatency = estimateStartupLatency(targetDuration);

  // Estimate switching latency
  const switchingLatency = estimateSwitchingLatency(targetDuration);

  // Calculate buffer requirement
  const bufferRequirement = calculateBufferRequirement(
    manifest.metadata.minBufferTime || manifest.metadata.targetDuration || 10
  );

  // Calculate bandwidth efficiency (how well the bitrate ladder is structured)
  const bandwidthEfficiency = calculateBandwidthEfficiency(videoVariants);

  // Calculate quality consistency
  const qualityConsistency = calculateQualityConsistency(videoVariants);

  // Generate recommendations
  const recommendations = generatePerformanceRecommendations(
    manifest,
    bandwidthEfficiency,
    qualityConsistency
  );

  return {
    startupLatency,
    switchingLatency,
    bufferRequirement,
    bandwidthEfficiency,
    qualityConsistency,
    recommendations
  };
}

function estimateStartupLatency(segmentDuration: number): number {
  // Startup typically requires 1-2 segments
  return segmentDuration * 1.5;
}

function estimateSwitchingLatency(segmentDuration: number): number {
  // Quality switch happens at segment boundary
  return segmentDuration;
}

function calculateBufferRequirement(minBufferTime: number): number {
  // Recommended buffer is 2-3x minimum
  return minBufferTime * 2.5;
}

function calculateBandwidthEfficiency(variants: Variant[]): number {
  if (variants.length < 2) return 50;

  const sorted = [...variants].sort((a, b) => a.bitrate - b.bitrate);
  const gaps: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i].bitrate - sorted[i - 1].bitrate);
  }

  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const gapVariance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(gapVariance);

  // Lower variance = better efficiency (more consistent gaps)
  // Normalize to 0-100 score
  const consistency = Math.max(0, 100 - (stdDev / avgGap) * 100);

  // More variants = better efficiency
  const variantScore = Math.min(100, (variants.length / 6) * 100);

  // Combined score
  return (consistency * 0.6 + variantScore * 0.4);
}

function calculateQualityConsistency(variants: Variant[]): number {
  // Check if variants have consistent properties
  let score = 100;

  const videoVariants = variants.filter(v => v.type === 'video');

  // Penalty for missing resolutions
  const missingResolution = videoVariants.some(v => !v.resolution);
  if (missingResolution) score -= 20;

  // Penalty for missing frame rates
  const missingFrameRate = videoVariants.some(v => !v.frameRate);
  if (missingFrameRate) score -= 10;

  // Penalty for missing codecs
  const missingCodecs = videoVariants.some(v => !v.codecs || v.codecs.length === 0);
  if (missingCodecs) score -= 30;

  // Penalty for inconsistent codecs across variants
  const codecSets = videoVariants.map(v => v.codecs.join(','));
  const uniqueCodecSets = new Set(codecSets);
  if (uniqueCodecSets.size > 1) score -= 15;

  return Math.max(0, score);
}

function generatePerformanceRecommendations(
  manifest: ParsedManifest,
  bandwidthEfficiency: number,
  qualityConsistency: number
): string[] {
  const recommendations: string[] = [];

  if (bandwidthEfficiency < 60) {
    recommendations.push('Consider adjusting bitrate ladder for more consistent gaps between variants');
  }

  if (qualityConsistency < 70) {
    recommendations.push('Some variants are missing metadata (resolution, codecs, frame rate)');
  }

  const targetDuration = manifest.metadata.targetDuration;
  if (targetDuration && targetDuration > 10) {
    recommendations.push('Large segment duration may increase startup latency and switching time');
  }

  if (targetDuration && targetDuration < 2) {
    recommendations.push('Very small segment duration may increase overhead and server load');
  }

  if (!manifest.metadata.minBufferTime && manifest.format === 'dash') {
    recommendations.push('Consider setting minBufferTime for better playback stability');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance characteristics look good!');
  }

  return recommendations;
}
