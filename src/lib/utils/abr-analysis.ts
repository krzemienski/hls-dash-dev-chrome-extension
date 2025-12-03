// src/lib/utils/abr-analysis.ts
import type { Variant } from '../../types/manifest';

/**
 * Calculate bitrate gaps between consecutive variants
 */
export function calculateBitrateGaps(variants: Variant[]): number[] {
  if (variants.length < 2) {
    return [];
  }

  // Sort by bitrate
  const sorted = [...variants].sort((a, b) => a.bitrate - b.bitrate);

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i].bitrate - sorted[i - 1].bitrate);
  }

  return gaps;
}

export interface BitrateAnalysis {
  totalVariants: number;
  lowestBitrate: number;
  highestBitrate: number;
  averageGap: number;
  largeGaps: Array<{
    fromBitrate: number;
    toBitrate: number;
    gap: number;
  }>;
  recommendations: string[];
}

/**
 * Analyze bitrate ladder quality
 */
export function analyzeBitrateLadder(variants: Variant[]): BitrateAnalysis {
  const videoVariants = variants
    .filter(v => v.type === 'video')
    .sort((a, b) => a.bitrate - b.bitrate);

  if (videoVariants.length === 0) {
    return {
      totalVariants: 0,
      lowestBitrate: 0,
      highestBitrate: 0,
      averageGap: 0,
      largeGaps: [],
      recommendations: ['No video variants found']
    };
  }

  const gaps = calculateBitrateGaps(videoVariants);
  const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

  // Identify large gaps (>1.5x average)
  const largeGaps: BitrateAnalysis['largeGaps'] = [];
  gaps.forEach((gap, index) => {
    if (gap > averageGap * 1.5) {
      largeGaps.push({
        fromBitrate: videoVariants[index].bitrate,
        toBitrate: videoVariants[index + 1].bitrate,
        gap
      });
    }
  });

  const recommendations: string[] = [];

  if (largeGaps.length > 0) {
    recommendations.push(
      `Consider adding intermediate variants to fill ${largeGaps.length} large gap(s) in the bitrate ladder`
    );
  }

  if (videoVariants.length < 3) {
    recommendations.push(
      'Consider adding more variants for better adaptive streaming (recommended: 4-6 variants)'
    );
  }

  if (videoVariants[0].bitrate > 500000) {
    recommendations.push(
      'Consider adding a lower bitrate variant (<500 Kbps) for poor network conditions'
    );
  }

  return {
    totalVariants: videoVariants.length,
    lowestBitrate: videoVariants[0].bitrate,
    highestBitrate: videoVariants[videoVariants.length - 1].bitrate,
    averageGap,
    largeGaps,
    recommendations
  };
}

/**
 * Get recommended variant for given connection speed
 * Uses 85% of bandwidth to leave headroom for fluctuations
 */
export function getRecommendedVariant(
  variants: Variant[],
  bandwidthBps: number
): Variant | null {
  const videoVariants = variants
    .filter(v => v.type === 'video')
    .sort((a, b) => a.bitrate - b.bitrate);

  if (videoVariants.length === 0) {
    return null;
  }

  // Use 85% of available bandwidth
  const safetyMargin = 0.85;
  const targetBitrate = bandwidthBps * safetyMargin;

  // Find highest variant that fits within target
  for (let i = videoVariants.length - 1; i >= 0; i--) {
    if (videoVariants[i].bitrate <= targetBitrate) {
      return videoVariants[i];
    }
  }

  // If all variants exceed bandwidth, return lowest
  return videoVariants[0];
}
