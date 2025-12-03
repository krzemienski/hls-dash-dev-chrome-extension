// src/lib/utils/drm-detector.ts
import type { ManifestFormat } from '../../types/manifest';

export interface DRMDetectionResult {
  isEncrypted: boolean;
  systems: string[];
  keyFormats: string[];
  hasMultipleSystems: boolean;
}

export interface DRMSystemInfo {
  name: string;
  vendor: string;
  platforms: string[];
  level?: string;
  description: string;
  uuid?: string;
}

// DRM System UUIDs for DASH
const DRM_UUIDS: Record<string, string> = {
  'Widevine': 'edef8ba9-79d6-4ace-a3c8-27dcd51d21ed',
  'PlayReady': '9a04f079-9840-4286-ab92-e65be0885f95',
  'FairPlay': '94ce86fb-07ff-4f43-adb8-93d2fa968ca2',
  'Clearkey': 'e2719d58-a985-b3c9-781a-b030af78d30e'
};

/**
 * Detect DRM systems in manifest
 */
export function detectDRM(content: string, format: ManifestFormat): DRMDetectionResult {
  const systems: string[] = [];
  const keyFormats: string[] = [];

  if (format === 'hls') {
    // Check for encryption keys
    const hasKeys = content.includes('#EXT-X-KEY');

    if (hasKeys) {
      // Extract key methods
      const methodMatches = content.matchAll(/#EXT-X-KEY:METHOD=([^,\n]+)/g);
      for (const match of methodMatches) {
        const method = match[1];
        if (method !== 'NONE') {
          keyFormats.push(method);
        }
      }

      // Detect DRM systems from URIs
      if (content.includes('skd://') || content.includes('fairplay')) {
        systems.push('FairPlay');
      }

      if (content.includes('widevine')) {
        systems.push('Widevine');
      }

      if (content.includes('playready')) {
        systems.push('PlayReady');
      }

      // Check for common key formats
      if (content.includes('urn:uuid:')) {
        // Check for specific UUIDs
        Object.entries(DRM_UUIDS).forEach(([system, uuid]) => {
          if (content.includes(uuid) && !systems.includes(system)) {
            systems.push(system);
          }
        });
      }
    }
  } else if (format === 'dash') {
    // Check for ContentProtection elements
    const hasContentProtection = content.includes('<ContentProtection');

    if (hasContentProtection) {
      // Check for DRM system UUIDs
      Object.entries(DRM_UUIDS).forEach(([system, uuid]) => {
        if (content.includes(uuid)) {
          systems.push(system);
        }
      });

      // Also check by scheme name
      if (content.includes('widevine') && !systems.includes('Widevine')) {
        systems.push('Widevine');
      }

      if (content.includes('playready') && !systems.includes('PlayReady')) {
        systems.push('PlayReady');
      }

      if (content.includes('fairplay') && !systems.includes('FairPlay')) {
        systems.push('FairPlay');
      }

      // Check for cenc (common encryption)
      if (content.includes('cenc') || content.includes('cbcs')) {
        keyFormats.push('CENC');
      }
    }
  }

  return {
    isEncrypted: systems.length > 0 || keyFormats.length > 0,
    systems: Array.from(new Set(systems)),
    keyFormats: Array.from(new Set(keyFormats)),
    hasMultipleSystems: new Set(systems).size > 1
  };
}

/**
 * Get detailed information about DRM systems
 */
export function analyzeDRMSystems(systemNames: string[]): DRMSystemInfo[] {
  return systemNames.map(name => getDRMInfo(name));
}

/**
 * Get information about a specific DRM system
 */
export function getDRMInfo(systemName: string): DRMSystemInfo {
  const drmInfo: Record<string, DRMSystemInfo> = {
    'Widevine': {
      name: 'Widevine',
      vendor: 'Google',
      platforms: ['Android', 'Chrome', 'Firefox', 'Edge', 'ChromeOS'],
      level: 'L1/L2/L3',
      description: 'Google Widevine is the most widely supported DRM system, available on Android devices, Chrome browsers, and many smart TVs.',
      uuid: DRM_UUIDS['Widevine']
    },
    'PlayReady': {
      name: 'PlayReady',
      vendor: 'Microsoft',
      platforms: ['Windows', 'Xbox', 'Edge', 'Smart TVs'],
      description: 'Microsoft PlayReady is commonly used on Windows devices, Xbox consoles, and various smart TV platforms.',
      uuid: DRM_UUIDS['PlayReady']
    },
    'FairPlay': {
      name: 'FairPlay',
      vendor: 'Apple',
      platforms: ['iOS', 'iPadOS', 'macOS', 'tvOS', 'Safari'],
      description: 'Apple FairPlay Streaming (FPS) is used exclusively on Apple devices and Safari browser.',
      uuid: DRM_UUIDS['FairPlay']
    },
    'Clearkey': {
      name: 'Clearkey',
      vendor: 'W3C',
      platforms: ['All browsers with EME support'],
      description: 'Clear Key is a simple unencrypted key system for testing and development purposes.',
      uuid: DRM_UUIDS['Clearkey']
    }
  };

  return drmInfo[systemName] || {
    name: systemName,
    vendor: 'Unknown',
    platforms: [],
    description: `Unknown DRM system: ${systemName}`
  };
}

/**
 * Check if DRM setup provides good platform coverage
 */
export function analyzePlatformCoverage(systems: string[]): {
  coverage: number; // 0-100
  missingPlatforms: string[];
  recommendations: string[];
} {
  const hasFairPlay = systems.includes('FairPlay');
  const hasWidevine = systems.includes('Widevine');
  const hasPlayReady = systems.includes('PlayReady');

  let coverage = 0;
  const missingPlatforms: string[] = [];
  const recommendations: string[] = [];

  // Calculate coverage
  if (hasFairPlay) coverage += 30; // Covers iOS/macOS (30% market)
  if (hasWidevine) coverage += 50; // Covers Android/Chrome (50% market)
  if (hasPlayReady) coverage += 20; // Covers Windows/Xbox (20% market)

  // Identify missing platforms
  if (!hasFairPlay) {
    missingPlatforms.push('iOS', 'macOS', 'Safari');
    recommendations.push('Add FairPlay for Apple device support');
  }

  if (!hasWidevine) {
    missingPlatforms.push('Android', 'Chrome');
    recommendations.push('Add Widevine for Android and Chrome browser support');
  }

  if (!hasPlayReady) {
    missingPlatforms.push('Windows', 'Xbox');
    recommendations.push('Add PlayReady for Windows and Xbox support');
  }

  if (systems.length === 0) {
    recommendations.push('Content is not encrypted');
  } else if (coverage >= 90) {
    recommendations.push('Excellent platform coverage with multi-DRM setup');
  }

  return {
    coverage,
    missingPlatforms,
    recommendations
  };
}
