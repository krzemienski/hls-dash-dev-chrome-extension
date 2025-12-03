// src/components/viewer/DownloadManager.tsx
import { useState } from 'react';
import type { ParsedManifest } from '../../types/manifest';
import {
  generateDownloadScript,
  generateFFmpegConcat,
  generateCompleteWorkflow
} from '../../lib/utils/download-helpers';

interface DownloadManagerProps {
  manifest: ParsedManifest;
}

export function DownloadManager({ manifest }: DownloadManagerProps) {
  const [scriptType, setScriptType] = useState<'bash' | 'powershell'>('bash');
  const [includeFFmpeg, setIncludeFFmpeg] = useState(true);

  if (!manifest.segments || manifest.segments.length === 0) {
    return null;
  }

  const segmentUrls = manifest.segments.map(s => s.url);

  const handleGenerateScript = () => {
    let content: string;
    let filename: string;

    if (includeFFmpeg) {
      content = generateCompleteWorkflow(segmentUrls, 'output.mp4');
      filename = 'download_and_merge.sh';
    } else {
      content = generateDownloadScript(segmentUrls, scriptType);
      filename = scriptType === 'bash' ? 'download.sh' : 'download.ps1';
    }

    // Download the script
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    let content: string;

    if (includeFFmpeg) {
      content = generateCompleteWorkflow(segmentUrls, 'output.mp4');
    } else {
      content = generateDownloadScript(segmentUrls, scriptType);
    }

    navigator.clipboard.writeText(content);
  };

  const handleGenerateConcatFile = () => {
    const content = generateFFmpegConcat(segmentUrls);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'concat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Download Manager
      </h2>

      <div className="space-y-4">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            Generate scripts to download all {segmentUrls.length} segments
            {includeFFmpeg && ' and merge them with FFmpeg'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Script Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setScriptType('bash')}
                className={`flex-1 px-4 py-2 rounded ${
                  scriptType === 'bash'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bash (Mac/Linux)
              </button>
              <button
                onClick={() => setScriptType('powershell')}
                className={`flex-1 px-4 py-2 rounded ${
                  scriptType === 'powershell'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                PowerShell (Windows)
              </button>
            </div>
          </div>

          {/* Include FFmpeg */}
          {scriptType === 'bash' && (
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Include FFmpeg merge
                </div>
                <div className="text-xs text-gray-500">
                  Automatically merge segments after download
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFFmpeg}
                  onChange={(e) => setIncludeFFmpeg(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleGenerateScript}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Download Script
          </button>

          <button
            onClick={handleCopyScript}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Copy to Clipboard
          </button>

          {scriptType === 'bash' && (
            <button
              onClick={handleGenerateConcatFile}
              className="col-span-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Download FFmpeg Concat File Only
            </button>
          )}
        </div>

        {/* Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Requires: curl (bash) or PowerShell 3.0+ (Windows)</div>
          {includeFFmpeg && (
            <div>• Requires: FFmpeg installed and in PATH</div>
          )}
          <div>• Run script from terminal: chmod +x download.sh && ./download.sh</div>
        </div>
      </div>
    </div>
  );
}
