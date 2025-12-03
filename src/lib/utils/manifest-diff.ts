// src/lib/utils/manifest-diff.ts
import type { ParsedManifest, Variant } from '../../types/manifest';

export interface ManifestDiff {
  variantsAdded: Variant[];
  variantsRemoved: Variant[];
  variantsChanged: Variant[];
  metadataChanged: boolean;
  hasChanges: boolean;
}

/**
 * Compare two manifests and return differences
 */
export function diffManifests(
  manifest1: ParsedManifest,
  manifest2: ParsedManifest
): ManifestDiff {
  const variantsAdded: Variant[] = [];
  const variantsRemoved: Variant[] = [];
  const variantsChanged: Variant[] = [];

  // Create maps for efficient lookup
  const variants1Map = new Map(manifest1.variants.map(v => [v.id, v]));
  const variants2Map = new Map(manifest2.variants.map(v => [v.id, v]));

  // Find added variants (in manifest2 but not in manifest1)
  manifest2.variants.forEach(v2 => {
    if (!variants1Map.has(v2.id)) {
      variantsAdded.push(v2);
    }
  });

  // Find removed variants (in manifest1 but not in manifest2)
  manifest1.variants.forEach(v1 => {
    if (!variants2Map.has(v1.id)) {
      variantsRemoved.push(v1);
    }
  });

  // Find changed variants (same ID but different properties)
  manifest1.variants.forEach(v1 => {
    const v2 = variants2Map.get(v1.id);
    if (v2 && hasVariantChanged(v1, v2)) {
      variantsChanged.push(v2);
    }
  });

  // Check metadata changes
  const metadataChanged =
    manifest1.metadata.type !== manifest2.metadata.type ||
    manifest1.metadata.duration !== manifest2.metadata.duration ||
    manifest1.metadata.encrypted !== manifest2.metadata.encrypted;

  const hasChanges =
    variantsAdded.length > 0 ||
    variantsRemoved.length > 0 ||
    variantsChanged.length > 0 ||
    metadataChanged;

  return {
    variantsAdded,
    variantsRemoved,
    variantsChanged,
    metadataChanged,
    hasChanges
  };
}

/**
 * Check if variant properties have changed
 */
function hasVariantChanged(v1: Variant, v2: Variant): boolean {
  if (v1.bitrate !== v2.bitrate) return true;
  if (v1.url !== v2.url) return true;
  if (v1.type !== v2.type) return true;

  // Check resolution
  const r1 = v1.resolution;
  const r2 = v2.resolution;
  if (r1 && r2) {
    if (r1.width !== r2.width || r1.height !== r2.height) return true;
  } else if (r1 !== r2) {
    return true; // One has resolution, other doesn't
  }

  // Check codecs
  if (v1.codecs.length !== v2.codecs.length) return true;
  if (!v1.codecs.every((c, i) => c === v2.codecs[i])) return true;

  return false;
}
