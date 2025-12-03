// src/lib/utils/download-helpers.ts

/**
 * Download a file from URL
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw new Error(`Failed to download ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate download script for batch downloading
 */
export function generateDownloadScript(
  urls: string[],
  format: 'bash' | 'powershell' = 'bash'
): string {
  if (format === 'bash') {
    const lines = [
      '#!/bin/bash',
      '# Generated manifest download script',
      '',
      'mkdir -p downloads',
      'cd downloads',
      ''
    ];

    urls.forEach((url, index) => {
      const filename = `segment_${index.toString().padStart(4, '0')}.ts`;
      lines.push(`curl -o "${filename}" "${url}"`);
    });

    lines.push('');
    lines.push('echo "Download complete: ${urls.length} files"');

    return lines.join('\n');
  } else {
    // PowerShell
    const lines = [
      '# Generated manifest download script',
      '',
      'New-Item -ItemType Directory -Force -Path downloads | Out-Null',
      'Set-Location downloads',
      ''
    ];

    urls.forEach((url, index) => {
      const filename = `segment_${index.toString().padStart(4, '0')}.ts`;
      lines.push(`Invoke-WebRequest -Uri "${url}" -OutFile "${filename}"`);
    });

    lines.push('');
    lines.push(`Write-Host "Download complete: ${urls.length} files"`);

    return lines.join('\n');
  }
}

/**
 * Generate FFmpeg concat file for merging segments
 */
export function generateFFmpegConcat(urls: string[]): string {
  const lines = ['# FFmpeg concat demuxer file', ''];

  urls.forEach((_url, index) => {
    const filename = `segment_${index.toString().padStart(4, '0')}.ts`;
    lines.push(`file '${filename}'`);
  });

  return lines.join('\n');
}

/**
 * Generate complete download and merge workflow
 */
export function generateCompleteWorkflow(
  segmentUrls: string[],
  outputFilename: string = 'output.mp4'
): string {
  const script = [
    '#!/bin/bash',
    '# Complete download and merge workflow',
    '',
    'echo "Starting download of ' + segmentUrls.length + ' segments..."',
    '',
    'mkdir -p temp_segments',
    'cd temp_segments',
    ''
  ];

  // Download commands
  segmentUrls.forEach((url, index) => {
    const filename = `segment_${index.toString().padStart(4, '0')}.ts`;
    script.push(`curl -# -o "${filename}" "${url}"`);
  });

  script.push('');
  script.push('cd ..');
  script.push('');
  script.push('# Create concat file');
  script.push('cat > concat_list.txt << EOF');

  segmentUrls.forEach((_, index) => {
    const filename = `segment_${index.toString().padStart(4, '0')}.ts`;
    script.push(`file 'temp_segments/${filename}'`);
  });

  script.push('EOF');
  script.push('');
  script.push('# Merge with FFmpeg');
  script.push(`ffmpeg -f concat -safe 0 -i concat_list.txt -c copy ${outputFilename}`);
  script.push('');
  script.push('# Cleanup');
  script.push('rm -rf temp_segments concat_list.txt');
  script.push('');
  script.push(`echo "Complete! Output: ${outputFilename}"`);

  return script.join('\n');
}
