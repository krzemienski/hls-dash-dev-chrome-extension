// src/lib/utils/framerate-analyzer.ts
import type { Variant } from '../../types/manifest';

export interface FrameRateCategory {
  label: string;
  useCase: string;
  smoothnessScore: number; // 0-100
  isHFR: boolean; // High Frame Rate (>30fps)
}

export interface FrameRateAnalysis {
  minFrameRate: number | null;
  maxFrameRate: number | null;
  avgFrameRate: number | null;
  hasHighFrameRate: boolean; // 60fps+
  hasConsistentFrameRates: boolean;
  frameRateDistribution: Map<number, number>;
  recommendations: string[];
}

/**
 * Categorize frame rate
 */
export function categorizeFrameRate(fps: number): FrameRateCategory {
  if (fps >= 120) {
    return {
      label: 'Ultra High',
      useCase: 'Gaming, ultra-smooth sports, slow-motion replay',
      smoothnessScore: 100,
      isHFR: true
    };
  }

  if (fps >= 60) {
    return {
      label: 'High (HFR)',
      useCase: 'Sports, action, fast-motion content, gaming',
      smoothnessScore: 95,
      isHFR: true
    };
  }

  if (fps >= 48 && fps < 60) {
    return {
      label: 'Enhanced',
      useCase: 'High-quality cinema, modern films',
      smoothnessScore: 85,
      isHFR: false
    };
  }

  if (fps >= 30) {
    return {
      label: 'Standard',
      useCase: 'TV broadcasts, most streaming content',
      smoothnessScore: 75,
      isHFR: false
    };
  }

  if (fps >= 24 && fps < 30) {
    return {
      label: 'Cinema',
      useCase: 'Traditional film, cinematic content',
      smoothnessScore: 65,
      isHFR: false
    };
  }

  // Below 24fps
  return {
    label: 'Low',
    useCase: 'Limited use - may appear choppy',
    smoothnessScore: 40,
    isHFR: false
  };
}

/**
 * Analyze frame rates across all variants
 */
export function analyzeFrameRates(variants: Variant[]): FrameRateAnalysis {
  const videoVariants = variants.filter(v => v.type === 'video' && v.frameRate);

  if (videoVariants.length === 0) {
    return {
      minFrameRate: null,
      maxFrameRate: null,
      avgFrameRate: null,
      hasHighFrameRate: false,
      hasConsistentFrameRates: false,
      frameRateDistribution: new Map(),
      recommendations: ['No frame rate information available']
    };
  }

  const frameRates = videoVariants.map(v => v.frameRate!);
  const minFrameRate = Math.min(...frameRates);
  const maxFrameRate = Math.max(...frameRates);
  const avgFrameRate = frameRates.reduce((sum, fr) => sum + fr, 0) / frameRates.length;

  const hasHighFrameRate = maxFrameRate >= 60;

  // Check consistency (all frame rates within 5fps of each other)
  const hasConsistentFrameRates = maxFrameRate - minFrameRate <= 5;

  // Distribution
  const frameRateDistribution = new Map<number, number>();
  frameRates.forEach(fr => {
    frameRateDistribution.set(fr, (frameRateDistribution.get(fr) || 0) + 1);
  });

  // Recommendations
  const recommendations: string[] = [];

  if (!hasConsistentFrameRates) {
    recommendations.push(
      'Multiple frame rates detected. Consider standardizing for consistency.'
    );
  }

  if (!hasHighFrameRate && maxFrameRate < 60) {
    recommendations.push(
      'Consider adding 60fps variant for sports and high-motion content'
    );
  }

  if (minFrameRate < 24) {
    recommendations.push(
      `Low frame rate detected (${minFrameRate}fps). May appear choppy.`
    );
  }

  // Check if HFR variants have appropriate bitrates
  const hfrVariants = videoVariants.filter(v => v.frameRate && v.frameRate >= 60);
  if (hfrVariants.length > 0) {
    const avgHfrBitrate = hfrVariants.reduce((sum, v) => sum + v.bitrate, 0) / hfrVariants.length;
    if (avgHfrBitrate < 3000000) {
      recommendations.push(
        'High frame rate variants may need higher bitrates for quality'
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Frame rate configuration looks good');
  }

  return {
    minFrameRate,
    maxFrameRate,
    avgFrameRate,
    hasHighFrameRate,
    hasConsistentFrameRates,
    frameRateDistribution,
    recommendations
  };
}

/**
 * Calculate motion smoothness score
 */
export function calculateMotionSmoothness(fps: number): number {
  // Based on perception research:
  // 24fps: baseline (cinema standard)
  // 30fps: smooth for most content
  // 60fps: very smooth, ideal for sports/action
  // 120fps: ultra-smooth

  if (fps >= 120) return 100;
  if (fps >= 60) return 95;
  if (fps >= 48) return 85;
  if (fps >= 30) return 75;
  if (fps >= 24) return 65;

  // Below 24fps
  return Math.max(0, (fps / 24) * 65);
}

/**
 * Calculate bits per frame
 */
export function calculateBitsPerFrame(variant: Variant): number | null {
  if (!variant.frameRate) return null;

  return variant.bitrate / variant.frameRate;
}

/**
 * Get recommended frame rate for content type
 */
export function getRecommendedFrameRate(
  contentType: 'film' | 'tv' | 'sports' | 'gaming' | 'general'
): {
  recommended: number;
  minimum: number;
  ideal: number;
  reason: string;
} {
  const recommendations = {
    film: {
      recommended: 24,
      minimum: 23.976,
      ideal: 24,
      reason: 'Traditional cinema standard, filmic motion blur'
    },
    tv: {
      recommended: 30,
      minimum: 29.97,
      ideal: 30,
      reason: 'TV broadcast standard, smooth for general content'
    },
    sports: {
      recommended: 60,
      minimum: 50,
      ideal: 60,
      reason: 'High motion content requires higher frame rate for clarity'
    },
    gaming: {
      recommended: 60,
      minimum: 30,
      ideal: 120,
      reason: 'Interactive content benefits from highest possible frame rate'
    },
    general: {
      recommended: 30,
      minimum: 24,
      ideal: 60,
      reason: 'Balanced between quality and bandwidth'
    }
  };

  return recommendations[contentType];
}
