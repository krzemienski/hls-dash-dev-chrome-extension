// Playlist Type Badge Component
// Displays playlist classification (Master/Media for HLS, Static/Dynamic for DASH)

import type { ManifestFormat } from '../../types/manifest';
import type { ValidationResult } from '../../types/validation';

interface Props {
  validation: ValidationResult;
  format: ManifestFormat;
}

export function PlaylistTypeBadge({ validation, format }: Props) {
  const { playlistType, version } = validation;

  const typeLabels: Record<string, string> = {
    'master': 'Master Playlist',
    'media': 'Media Playlist',
    'mpd-static': 'Static MPD (VOD)',
    'mpd-dynamic': 'Dynamic MPD (Live)'
  };

  const typeDescriptions: Record<string, string> = {
    'master': 'Contains variant streams for adaptive bitrate selection',
    'media': 'Contains media segments for playback',
    'mpd-static': 'Video On Demand - all content available immediately',
    'mpd-dynamic': 'Live streaming - content delivered over time'
  };

  const label = typeLabels[playlistType] || playlistType;
  const description = typeDescriptions[playlistType] || '';

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">📋 Playlist Classification</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        {/* Type */}
        <div className="font-semibold text-blue-900 mb-1">{label}</div>

        {/* Description */}
        {description && (
          <div className="text-sm text-blue-700 mb-2">{description}</div>
        )}

        {/* Version/Profile */}
        {version && (
          <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
            {format === 'hls' ? 'Version' : 'Profile'}: {version}
          </div>
        )}
      </div>
    </div>
  );
}
