// src/lib/utils/resolution-analyzer.ts
import type { Variant, Resolution } from '../../types/manifest';

export interface ResolutionQuality {
  label: string;
  category: '4K' | '2K' | '1080p' | '720p' | '480p' | '360p' | 'SD';
  pixels: number;
  aspectRatio: string;
  isWidescreen: boolean;
  pixelDensityScore: number; // 0-100
}

export interface ResolutionAnalysis {
  maxResolution: ResolutionQuality | null;
  minResolution: ResolutionQuality | null;
  resolutions: ResolutionQuality[];
  hasMultipleAspectRatios: boolean;
  predominantAspectRatio: string;
  qualityDistribution: {
    '4K': number;
    '2K': number;
    '1080p': number;
    '720p': number;
    '480p': number;
    '360p': number;
    'SD': number;
  };
  recommendations: string[];
}

/**
 * Analyze resolution quality
 */
export function analyzeResolution(resolution: Resolution): ResolutionQuality {
  const pixels = resolution.width * resolution.height;
  const aspectRatio = calculateAspectRatio(resolution.width, resolution.height);
  const isWidescreen = resolution.width / resolution.height > 1.5;

  let label: string;
  let category: ResolutionQuality['category'];

  if (resolution.width >= 3840) {
    label = '4K UHD';
    category = '4K';
  } else if (resolution.width >= 2560) {
    label = '2K QHD';
    category = '2K';
  } else if (resolution.width >= 1920) {
    label = '1080p Full HD';
    category = '1080p';
  } else if (resolution.width >= 1280) {
    label = '720p HD';
    category = '720p';
  } else if (resolution.width >= 854) {
    label = '480p SD';
    category = '480p';
  } else if (resolution.width >= 640) {
    label = '360p';
    category = '360p';
  } else {
    label = `${resolution.width}x${resolution.height}`;
    category = 'SD';
  }

  // Calculate pixel density score (higher = better)
  const maxPixels = 3840 * 2160; // 4K
  const pixelDensityScore = Math.min(100, (pixels / maxPixels) * 100);

  return {
    label,
    category,
    pixels,
    aspectRatio,
    isWidescreen,
    pixelDensityScore
  };
}

/**
 * Analyze all resolutions in variant list
 */
export function analyzeResolutions(variants: Variant[]): ResolutionAnalysis {
  const videoVariants = variants.filter(v => v.type === 'video' && v.resolution);

  if (videoVariants.length === 0) {
    return {
      maxResolution: null,
      minResolution: null,
      resolutions: [],
      hasMultipleAspectRatios: false,
      predominantAspectRatio: '16:9',
      qualityDistribution: {
        '4K': 0,
        '2K': 0,
        '1080p': 0,
        '720p': 0,
        '480p': 0,
        '360p': 0,
        'SD': 0
      },
      recommendations: []
    };
  }

  const resolutionQualities = videoVariants.map(v =>
    analyzeResolution(v.resolution!)
  );

  // Find max and min
  const maxRes = resolutionQualities.reduce((max, current) =>
    current.pixels > max.pixels ? current : max
  );

  const minRes = resolutionQualities.reduce((min, current) =>
    current.pixels < min.pixels ? current : min
  );

  // Check aspect ratios
  const aspectRatios = new Set(resolutionQualities.map(r => r.aspectRatio));
  const hasMultipleAspectRatios = aspectRatios.size > 1;

  // Find predominant aspect ratio
  const ratioCount = new Map<string, number>();
  resolutionQualities.forEach(r => {
    ratioCount.set(r.aspectRatio, (ratioCount.get(r.aspectRatio) || 0) + 1);
  });

  const predominantAspectRatio = Array.from(ratioCount.entries())
    .reduce((max, current) => current[1] > max[1] ? current : max)[0];

  // Quality distribution
  const qualityDistribution = {
    '4K': resolutionQualities.filter(r => r.category === '4K').length,
    '2K': resolutionQualities.filter(r => r.category === '2K').length,
    '1080p': resolutionQualities.filter(r => r.category === '1080p').length,
    '720p': resolutionQualities.filter(r => r.category === '720p').length,
    '480p': resolutionQualities.filter(r => r.category === '480p').length,
    '360p': resolutionQualities.filter(r => r.category === '360p').length,
    'SD': resolutionQualities.filter(r => r.category === 'SD').length
  };

  // Generate recommendations
  const recommendations: string[] = [];

  if (hasMultipleAspectRatios) {
    recommendations.push(
      `Multiple aspect ratios detected. Ensure consistent aspect ratio across variants for best user experience.`
    );
  }

  if (!resolutionQualities.some(r => r.category === '720p')) {
    recommendations.push(
      '720p variant missing - this is a popular resolution for mid-range devices'
    );
  }

  if (maxRes.category === '4K' && !resolutionQualities.some(r => r.category === '1080p')) {
    recommendations.push(
      '4K content present but missing 1080p fallback'
    );
  }

  if (resolutionQualities.length < 3) {
    recommendations.push(
      'Consider adding more resolution options for better device compatibility'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Resolution ladder looks well-structured');
  }

  return {
    maxResolution: maxRes,
    minResolution: minRes,
    resolutions: resolutionQualities,
    hasMultipleAspectRatios,
    predominantAspectRatio,
    qualityDistribution,
    recommendations
  };
}

/**
 * Calculate aspect ratio as simplified fraction
 */
function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Get recommended resolution for device type
 */
export function getRecommendedResolution(
  variants: Variant[],
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv'
): Variant | null {
  const videoVariants = variants
    .filter(v => v.type === 'video' && v.resolution)
    .sort((a, b) => {
      const aPixels = a.resolution!.width * a.resolution!.height;
      const bPixels = b.resolution!.width * b.resolution!.height;
      return aPixels - bPixels;
    });

  if (videoVariants.length === 0) return null;

  const targetResolutions: Record<typeof deviceType, number> = {
    mobile: 640 * 360,   // 360p
    tablet: 1280 * 720,  // 720p
    desktop: 1920 * 1080, // 1080p
    tv: 3840 * 2160      // 4K
  };

  const targetPixels = targetResolutions[deviceType];

  // Find closest resolution
  let closest = videoVariants[0];
  let closestDiff = Math.abs(
    (closest.resolution!.width * closest.resolution!.height) - targetPixels
  );

  for (const variant of videoVariants) {
    const pixels = variant.resolution!.width * variant.resolution!.height;
    const diff = Math.abs(pixels - targetPixels);

    if (diff < closestDiff) {
      closest = variant;
      closestDiff = diff;
    }
  }

  return closest;
}

/**
 * Calculate bitrate per pixel (efficiency metric)
 */
export function calculateBitratePerPixel(variant: Variant): number | null {
  if (!variant.resolution) return null;

  const pixels = variant.resolution.width * variant.resolution.height;
  return variant.bitrate / pixels;
}

/**
 * Analyze bitrate efficiency across resolutions
 */
export function analyzeBitrateEfficiency(variants: Variant[]): {
  variants: Array<{
    variant: Variant;
    bitsPerPixel: number;
    efficiencyScore: number; // 0-100, higher = more efficient compression
  }>;
  avgBitsPerPixel: number;
  mostEfficient: Variant | null;
  leastEfficient: Variant | null;
} {
  const videoVariants = variants.filter(v => v.type === 'video' && v.resolution);

  if (videoVariants.length === 0) {
    return {
      variants: [],
      avgBitsPerPixel: 0,
      mostEfficient: null,
      leastEfficient: null
    };
  }

  const analyzed = videoVariants.map(variant => {
    const bitsPerPixel = calculateBitratePerPixel(variant)!;

    // Lower bits per pixel = more efficient compression
    // Typical range: 0.05 - 0.3 bits/pixel
    // Score: higher bpp = lower score
    const efficiencyScore = Math.max(0, 100 - (bitsPerPixel / 0.3) * 100);

    return {
      variant,
      bitsPerPixel,
      efficiencyScore
    };
  });

  const avgBitsPerPixel = analyzed.reduce((sum, a) => sum + a.bitsPerPixel, 0) / analyzed.length;

  const mostEfficient = analyzed.reduce((best, current) =>
    current.efficiencyScore > best.efficiencyScore ? current : best
  ).variant;

  const leastEfficient = analyzed.reduce((worst, current) =>
    current.efficiencyScore < worst.efficiencyScore ? current : worst
  ).variant;

  return {
    variants: analyzed,
    avgBitsPerPixel,
    mostEfficient,
    leastEfficient
  };
}
