# Code Examples and Usage Patterns

Practical examples for using the HLS + DASH Manifest Viewer extension and its APIs.

## Table of Contents

1. [Basic Usage Examples](#basic-usage-examples)
2. [Parser Examples](#parser-examples)
3. [Analysis Examples](#analysis-examples)
4. [Export Examples](#export-examples)
5. [Component Examples](#component-examples)
6. [Extension API Examples](#extension-api-examples)
7. [Testing Examples](#testing-examples)

## Basic Usage Examples

### Loading a Manifest

**From Popup:**
```typescript
// User clicks manifest in detected list
// → Opens viewer with URL in hash
// → Viewer auto-loads from hash

// In popup.tsx:
const handleManifestClick = (url: string) => {
  const viewerUrl = chrome.runtime.getURL('src/viewer/viewer.html') +
    '#' + encodeURIComponent(url);
  chrome.tabs.create({ url: viewerUrl });
};
```

**From Viewer URL Input:**
```typescript
// In UrlInput.tsx:
const handleLoad = async () => {
  setLoading(true);

  try {
    // Fetch via service worker
    const response = await chrome.runtime.sendMessage({
      action: 'fetch-manifest',
      url: url.trim()
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    // Parse manifest
    const parsed = parseManifest(response.data, url.trim());

    // Update state
    setManifest(parsed);

    // Save to history
    await addToHistory({
      url,
      format: parsed.format,
      timestamp: Date.now(),
      variantCount: parsed.variants.length
    });
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

**Programmatically (for testing):**
```typescript
// In browser console (viewer page)
const url = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';

// If in extension context
const response = await chrome.runtime.sendMessage({
  action: 'fetch-manifest',
  url
});

// If standalone mode
const response = await fetch(url);
const content = await response.text();

// Parse
import { parseManifest } from './lib/parsers';
const manifest = parseManifest(content, url);

console.log('Format:', manifest.format);
console.log('Variants:', manifest.variants.length);
```

## Parser Examples

### HLS Parsing

**Parse Master Playlist:**
```typescript
import { parseHLS } from './lib/parsers/hls-parser';

const hlsContent = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=2227464,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=960x540,FRAME-RATE=60.000
gear4/prog_index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=8400000,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=60.000
gear5/prog_index.m3u8`;

const baseUrl = 'https://example.com/master.m3u8';

const parsed = parseHLS(hlsContent, baseUrl);

console.log('Format:', parsed.format); // 'hls'
console.log('Variants:', parsed.variants.length); // 2
console.log('First variant:', {
  bitrate: parsed.variants[0].bitrate,    // 2227464
  resolution: parsed.variants[0].resolution, // { width: 960, height: 540 }
  codecs: parsed.variants[0].codecs,      // ['avc1.640020', 'mp4a.40.2']
  frameRate: parsed.variants[0].frameRate, // 60
  url: parsed.variants[0].url             // 'https://example.com/gear4/prog_index.m3u8'
});
```

**Parse Media Playlist:**
```typescript
const mediaPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:9.9,
segment0.ts
#EXTINF:9.9,
segment1.ts
#EXT-X-ENDLIST`;

const parsed = parseHLS(mediaPlaylist, 'https://example.com/playlist.m3u8');

console.log('Segments:', parsed.segments?.length); // 2
console.log('Target duration:', parsed.metadata.targetDuration); // 10
console.log('Type:', parsed.metadata.type); // 'VOD' (has EXT-X-ENDLIST)
```

### DASH Parsing

**Parse MPD:**
```typescript
import { parseDASH } from './lib/parsers/dash-parser';

const mpdContent = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"
     type="static"
     mediaPresentationDuration="PT634.566S"
     minBufferTime="PT2.00S">
  <Period>
    <AdaptationSet mimeType="video/mp4" codecs="avc1.4d401f"
                   width="854" height="480">
      <Representation id="0" bandwidth="1000000">
        <BaseURL>video/1000k/</BaseURL>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>`;

const parsed = parseDASH(mpdContent, 'https://example.com/manifest.mpd');

console.log('Format:', parsed.format); // 'dash'
console.log('Duration:', parsed.metadata.duration); // 634.566
console.log('Min buffer:', parsed.metadata.minBufferTime); // 2.0
console.log('Type:', parsed.metadata.type); // 'VOD'
console.log('Variants:', parsed.variants.length);
```

### Format Detection

**Auto-Detect Format:**
```typescript
import { detectManifestFormat } from './lib/parsers/format-detector';

// HLS
const hlsFormat = detectManifestFormat('#EXTM3U\n#EXT-X-VERSION:3');
console.log(hlsFormat); // 'hls'

// DASH
const dashFormat = detectManifestFormat('<?xml version="1.0"?>\n<MPD>');
console.log(dashFormat); // 'dash'

// With whitespace
const withSpaces = detectManifestFormat('  \n\n#EXTM3U\n');
console.log(withSpaces); // 'hls'
```

### Unified Parser (Recommended)

**Parse Any Format:**
```typescript
import { parseManifest } from './lib/parsers';

// Automatically detects format and parses
const manifest1 = parseManifest(hlsContent, hlsUrl);
console.log(manifest1.format); // 'hls'

const manifest2 = parseManifest(dashContent, dashUrl);
console.log(manifest2.format); // 'dash'

// Throws on invalid content
try {
  parseManifest('', url);
} catch (error) {
  console.error(error.message); // "Manifest content is empty"
}
```

## Analysis Examples

### ABR Analysis

**Analyze Bitrate Ladder:**
```typescript
import { analyzeBitrateLadder } from './lib/utils/abr-analysis';

const analysis = analyzeBitrateLadder(manifest.variants);

console.log('Quality:', {
  totalVariants: analysis.totalVariants,      // 5
  lowestBitrate: analysis.lowestBitrate,      // 500000 (500 Kbps)
  highestBitrate: analysis.highestBitrate,    // 8000000 (8 Mbps)
  averageGap: analysis.averageGap,            // Average gap between variants
  largeGaps: analysis.largeGaps.length,       // Count of large gaps
  recommendations: analysis.recommendations    // Array of suggestions
});

// Check for gaps
analysis.largeGaps.forEach(gap => {
  console.log(`Gap from ${gap.fromBitrate} to ${gap.toBitrate}: ${gap.gap} bps`);
});
```

**Get Recommended Variant:**
```typescript
import { getRecommendedVariant } from './lib/utils/abr-analysis';

// For 5 Mbps connection
const recommended = getRecommendedVariant(manifest.variants, 5000000);

console.log('Recommended:', {
  bitrate: recommended?.bitrate,        // ~4250000 (85% of 5 Mbps)
  resolution: recommended?.resolution,  // Best quality that fits
  url: recommended?.url
});

// For different connection speeds
const mobile = getRecommendedVariant(manifest.variants, 1000000);  // 3G
const wifi = getRecommendedVariant(manifest.variants, 10000000);   // Fast WiFi

console.log('3G quality:', mobile?.bitrate);
console.log('WiFi quality:', wifi?.bitrate);
```

### Codec Analysis

**Parse Codec String:**
```typescript
import { parseCodec, getCodecInfo } from './lib/utils/codec-analyzer';

// H.264
const h264 = parseCodec('avc1.64001f');
console.log(h264);
// { codec: 'H.264', profile: 'High', level: '3.1' }

// AAC
const aac = parseCodec('mp4a.40.2');
console.log(aac);
// { codec: 'AAC-LC', profile: 'Low Complexity', level: undefined }

// Get detailed info
const info = getCodecInfo('avc1.64001f');
console.log(info);
// {
//   name: 'H.264',
//   description: 'Advanced Video Coding (AVC) - Widely supported...',
//   isVideo: true,
//   isAudio: false,
//   isSubtitle: false
// }
```

**Analyze All Codecs:**
```typescript
import { analyzeCodecs } from './lib/utils/codec-analyzer';

const codecs = ['avc1.64001f', 'mp4a.40.2', 'wvtt'];

const analysis = analyzeCodecs(codecs);
console.log(analysis);
// {
//   videoCodecs: ['avc1.64001f'],
//   audioCodecs: ['mp4a.40.2'],
//   subtitleCodecs: ['wvtt'],
//   hasModernCodecs: false,  // No AV1/VP9
//   hasHDR: false
// }

// With modern codecs
const modern = analyzeCodecs(['av01.0.05M.08', 'opus']);
console.log(modern.hasModernCodecs); // true
```

### Resolution Analysis

**Analyze Resolution:**
```typescript
import { analyzeResolution } from './lib/utils/resolution-analyzer';

const quality = analyzeResolution({ width: 1920, height: 1080 });

console.log(quality);
// {
//   label: '1080p Full HD',
//   category: '1080p',
//   pixels: 2073600,
//   aspectRatio: '16:9',
//   isWidescreen: true,
//   pixelDensityScore: 25  // 0-100, relative to 4K
// }
```

**Get Device Recommendation:**
```typescript
import { getRecommendedResolution } from './lib/utils/resolution-analyzer';

const mobile = getRecommendedResolution(manifest.variants, 'mobile');
console.log('Mobile:', mobile?.resolution); // ~640x360

const desktop = getRecommendedResolution(manifest.variants, 'desktop');
console.log('Desktop:', desktop?.resolution); // ~1920x1080
```

**Calculate Compression Efficiency:**
```typescript
import { calculateBitratePerPixel } from './lib/utils/resolution-analyzer';

const bpp = calculateBitratePerPixel(variant);
console.log(`${bpp.toFixed(3)} bits per pixel`);

// Lower is better (more efficient compression)
// Typical range: 0.05 - 0.3
```

### DRM Detection

**Detect DRM Systems:**
```typescript
import { detectDRM, analyzeDRMSystems } from './lib/utils/drm-detector';

// HLS with FairPlay
const hlsDRM = detectDRM(hlsContent, 'hls');
console.log(hlsDRM);
// {
//   isEncrypted: true,
//   systems: ['FairPlay'],
//   keyFormats: ['SAMPLE-AES'],
//   hasMultipleSystems: false
// }

// DASH with multi-DRM
const dashDRM = detectDRM(dashContent, 'dash');
console.log(dashDRM);
// {
//   isEncrypted: true,
//   systems: ['Widevine', 'PlayReady'],
//   keyFormats: ['CENC'],
//   hasMultipleSystems: true
// }

// Get system details
const systems = analyzeDRMSystems(dashDRM.systems);
systems.forEach(sys => {
  console.log(`${sys.name} by ${sys.vendor}`);
  console.log(`Platforms: ${sys.platforms.join(', ')}`);
  console.log(`UUID: ${sys.uuid}`);
});
```

**Check Platform Coverage:**
```typescript
import { analyzePlatformCoverage } from './lib/utils/drm-detector';

const coverage = analyzePlatformCoverage(['Widevine', 'FairPlay']);
console.log(coverage);
// {
//   coverage: 80,  // 80% of market
//   missingPlatforms: ['Windows', 'Xbox'],  // No PlayReady
//   recommendations: ['Add PlayReady for Windows and Xbox support']
// }
```

### Validation

**Validate Manifest:**
```typescript
import { validateManifest, getValidationSummary } from './lib/validation/manifest-validator';

const issues = validateManifest(manifest);

console.log(`Found ${issues.length} issues`);

issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.category}: ${issue.message}`);
});

// Get summary
const summary = getValidationSummary(issues);
console.log(summary);
// {
//   errors: 0,
//   warnings: 2,
//   info: 1,
//   healthy: true  // No errors
// }
```

## Export Examples

### Export to JSON

**Simple Export:**
```typescript
import { exportToJSON } from './lib/export/exporters';

const json = exportToJSON(manifest);

// Download
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `manifest-${Date.now()}.json`;
a.click();
URL.revokeObjectURL(url);

// Or copy to clipboard
navigator.clipboard.writeText(json);
```

**Verify Export:**
```typescript
const exported = exportToJSON(manifest);
const parsed = JSON.parse(exported);

// Should match original
console.log(parsed.format === manifest.format); // true
console.log(parsed.variants.length === manifest.variants.length); // true
```

### Export to CSV

**Generate Spreadsheet:**
```typescript
import { exportToCSV } from './lib/export/exporters';

const csv = exportToCSV(manifest);

console.log(csv);
// ID,Type,Bitrate,Resolution,Frame Rate,Codecs,URL
// variant-0,video,2000000,1920x1080,30,"avc1.64001f, mp4a.40.2",https://...
// variant-1,audio,128000,,,"mp4a.40.2",https://...

// Download
const blob = new Blob([csv], { type: 'text/csv' });
// ... (same download process as JSON)
```

**Parse CSV (for analysis):**
```typescript
const lines = csv.split('\n');
const headers = lines[0].split(',');
const data = lines.slice(1).map(line => {
  const values = line.split(',');
  return headers.reduce((obj, header, i) => {
    obj[header] = values[i];
    return obj;
  }, {});
});

console.log('Parsed CSV:', data);
```

### Export to Text Report

**Human-Readable Report:**
```typescript
import { exportToText } from './lib/export/exporters';

const report = exportToText(manifest);

console.log(report);
// HLS Manifest Analysis
// ==================================================
//
// URL: https://example.com/master.m3u8
// Format: HLS
// Type: VOD
// Duration: 634.57s
// Encrypted: No
//
// Video Variants (3)
// --------------------------------------------------
//   1. 2.23 Mbps
//      Resolution: 960x540
//      Frame Rate: 60 fps
//      Codecs: avc1.640020, mp4a.40.2
//      URL: https://example.com/gear4/prog_index.m3u8
// ...
```

## Simulation Examples

### Generate Bandwidth Profile

**Stable Bandwidth:**
```typescript
import { generateBandwidthProfile } from './lib/simulation/playback-simulator';

const stable = generateBandwidthProfile('stable', 2000000, 60);

console.log(stable);
// [
//   { time: 0, bandwidth: 2000000 },
//   { time: 5, bandwidth: 2000000 },
//   { time: 10, bandwidth: 2000000 },
//   ...
// ]
```

**Varying Bandwidth:**
```typescript
const varying = generateBandwidthProfile('varying', 2000000, 60);

// Random variations between 1M and 3M (50-150% of base)
console.log(varying.map(p => p.bandwidth));
// [2100000, 1800000, 2500000, 1400000, ...]
```

**Degrading Network:**
```typescript
const degrading = generateBandwidthProfile('degrading', 3000000, 60);

// Linear degradation from 3M to 900K (30%)
console.log(degrading[0].bandwidth);  // 3000000
console.log(degrading[degrading.length - 1].bandwidth);  // ~900000
```

### Simulate Playback

**Run Simulation:**
```typescript
import { simulatePlayback } from './lib/simulation/playback-simulator';

const profile = generateBandwidthProfile('varying', 2000000, 60);

const result = simulatePlayback(
  manifest.variants,
  profile,
  10  // 10s target duration
);

console.log('Simulation results:', {
  totalSwitches: result.totalSwitches,       // Number of quality changes
  rebufferingTime: result.rebufferingTime,   // Total seconds rebuffering
  averageQuality: result.averageQuality,     // Average bitrate achieved
  segments: result.segments.length           // Number of simulated segments
});

// Analyze switches
result.switches.forEach(sw => {
  console.log(`${sw.time}s: ${sw.reason} - ${sw.toVariant.bitrate} bps`);
});
// 0s: startup - 1500000 bps
// 10s: downgrade - 1000000 bps
// 25s: upgrade - 2000000 bps
```

## Component Examples

### Using Zustand Store

**Read State:**
```typescript
import { useManifestStore } from './store/manifest-store';

function MyComponent() {
  // Subscribe to specific state
  const manifest = useManifestStore(state => state.manifest);
  const loading = useManifestStore(state => state.loading);
  const error = useManifestStore(state => state.error);

  // Or multiple at once
  const { selectedView, selectedVariantId } = useManifestStore(state => ({
    selectedView: state.selectedView,
    selectedVariantId: state.selectedVariantId
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!manifest) return <div>No manifest</div>;

  return <div>{manifest.format} manifest with {manifest.variants.length} variants</div>;
}
```

**Update State:**
```typescript
function LoadButton() {
  const setLoading = useManifestStore(state => state.setLoading);
  const setManifest = useManifestStore(state => state.setManifest);
  const setError = useManifestStore(state => state.setError);

  const handleLoad = async () => {
    setLoading(true);
    setError(null);

    try {
      const parsed = await loadAndParseManifest(url);
      setManifest(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleLoad}>Load Manifest</button>;
}
```

### Creating Analysis Component

**Template:**
```typescript
import type { ParsedManifest } from '../../types/manifest';

interface MyAnalysisProps {
  manifest: ParsedManifest;
}

export function MyAnalysis({ manifest }: MyAnalysisProps) {
  // Early return if no data
  if (!manifest.variants || manifest.variants.length === 0) {
    return null;
  }

  // Perform analysis
  const videoVariants = manifest.variants.filter(v => v.type === 'video');

  const analysis = useMemo(() => {
    // Expensive calculation
    return complexAnalysis(videoVariants);
  }, [videoVariants]);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">
        My Analysis
      </h2>

      {/* Display results */}
      <div className="space-y-3">
        {analysis.results.map((result, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded">
            {result.label}: {result.value}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
          <h3 className="text-sm font-semibold text-blue-900">
            Recommendations
          </h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Extension API Examples

### Sending Messages

**From Popup to Service Worker:**
```typescript
// In popup
const response = await chrome.runtime.sendMessage({
  action: 'get-detected',
  tabId: currentTab.id
});

if (response.success) {
  setManifests(response.data);
}
```

**From Content Script to Service Worker:**
```typescript
// In content script
chrome.runtime.sendMessage({
  action: 'manifests-detected',
  manifests: detectedManifests,
  tabId: tabId
});
```

**From Viewer to Service Worker:**
```typescript
// In viewer
const response = await chrome.runtime.sendMessage({
  action: 'fetch-manifest',
  url: manifestUrl
});

if (response.success) {
  const manifest = parseManifest(response.data, manifestUrl);
  setManifest(manifest);
}
```

### Storage Operations

**Save to History:**
```typescript
import { addToHistory } from './lib/utils/storage';

await addToHistory({
  url: manifest.url,
  format: manifest.format,
  timestamp: Date.now(),
  variantCount: manifest.variants.length,
  duration: manifest.metadata.duration,
  title: 'My Manifest'  // Optional
});
```

**Get History:**
```typescript
import { getHistory } from './lib/utils/storage';

const history = await getHistory();

console.log(`${history.length} manifests in history`);

history.forEach(item => {
  console.log(`${new Date(item.timestamp).toLocaleDateString()}: ${item.url}`);
});
```

**Manage Settings:**
```typescript
import { getSettings, updateSettings } from './lib/utils/storage';

// Get current settings
const settings = await getSettings();
console.log('Theme:', settings.theme);

// Update settings
await updateSettings({
  theme: 'dark',
  defaultView: 'structured',
  autoInterceptEnabled: true
});

// Settings persist across browser sessions
```

## Testing Examples

### Unit Test Example

**Testing a Utility:**
```typescript
import { describe, it, expect } from 'vitest';
import { myUtility } from '../src/lib/utils/my-utility';

describe('myUtility', () => {
  it('should handle normal case', () => {
    const result = myUtility('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge case', () => {
    const result = myUtility('');
    expect(result).toBe('');
  });

  it('should throw on invalid input', () => {
    expect(() => myUtility(null as any)).toThrow('Invalid input');
  });
});
```

**Testing a Parser:**
```typescript
import { describe, it, expect } from 'vitest';
import { parseHLS } from '../src/lib/parsers/hls-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('parseHLS', () => {
  const testManifest = readFileSync(
    resolve(__dirname, 'fixtures/test-manifest.m3u8'),
    'utf-8'
  );

  it('should parse variants correctly', () => {
    const result = parseHLS(testManifest, 'https://example.com/master.m3u8');

    expect(result.format).toBe('hls');
    expect(result.variants).toHaveLength(3);
    expect(result.variants[0].bitrate).toBe(1000000);
  });
});
```

### Playwright Test Example

**Testing UI:**
```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to viewer
  await page.goto('http://localhost:8888/src/viewer/viewer.html');

  // Load manifest
  await page.fill('input[placeholder*="manifest"]', TEST_URL);
  await page.click('button:has-text("Load")');

  // Wait and verify
  await page.waitForTimeout(3000);
  const header = await page.textContent('h1');

  if (header.includes('HLS') || header.includes('DASH')) {
    console.log('✅ Manifest loaded successfully');

    // Take screenshot
    await page.screenshot({
      path: '/tmp/test-success.png',
      fullPage: true
    });
  } else {
    console.log('❌ Manifest failed to load');
  }

  await browser.close();
})();
```

## Advanced Examples

### Custom Analysis Function

**Create Custom Analyzer:**
```typescript
import type { ParsedManifest } from './types/manifest';

interface CustomAnalysis {
  metric1: number;
  metric2: string;
  insights: string[];
}

export function myCustomAnalysis(manifest: ParsedManifest): CustomAnalysis {
  const videoVariants = manifest.variants.filter(v => v.type === 'video');

  // Calculate custom metrics
  const metric1 = videoVariants.reduce((sum, v) => sum + v.bitrate, 0) / videoVariants.length;

  const metric2 = videoVariants.length > 5 ? 'Excellent' : 'Good';

  const insights = [];
  if (videoVariants.length < 3) {
    insights.push('Consider adding more variants');
  }

  return { metric1, metric2, insights };
}

// Usage
const analysis = myCustomAnalysis(manifest);
console.log('Average bitrate:', analysis.metric1);
console.log('Quality:', analysis.metric2);
```

### Custom Component with Analysis

**Full Example:**
```typescript
import { useMemo } from 'react';
import type { ParsedManifest } from '../../types/manifest';

interface CustomAnalysisPanelProps {
  manifest: ParsedManifest;
}

export function CustomAnalysisPanel({ manifest }: CustomAnalysisPanelProps) {
  // Memoize expensive calculation
  const analysis = useMemo(() => {
    return performComplexAnalysis(manifest);
  }, [manifest]);

  // Early return if no data
  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Custom Analysis
      </h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-xs text-blue-600">METRIC 1</div>
          <div className="text-2xl font-bold text-blue-900">
            {analysis.metric1.toFixed(2)}
          </div>
        </div>
        {/* More metrics... */}
      </div>

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="text-sm font-semibold text-yellow-900">
            Insights
          </h3>
          <ul className="text-sm text-yellow-800 mt-2">
            {analysis.insights.map((insight, i) => (
              <li key={i}>• {insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function performComplexAnalysis(manifest: ParsedManifest) {
  // Your analysis logic here
  return {
    metric1: calculateMetric1(manifest),
    metric2: calculateMetric2(manifest),
    insights: generateInsights(manifest)
  };
}
```

## Best Practices Examples

### Error Handling

**Fetch with Error Handling:**
```typescript
async function loadManifestSafely(url: string): Promise<ParsedManifest | null> {
  try {
    // Fetch
    const response = await chrome.runtime.sendMessage({
      action: 'fetch-manifest',
      url
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch');
    }

    // Parse
    const manifest = parseManifest(response.data, url);

    return manifest;
  } catch (error) {
    // Log for debugging
    console.error('Failed to load manifest:', error);

    // Show user-friendly message
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        showError('CORS blocked. Try downloading the manifest file directly.');
      } else if (error.message.includes('404')) {
        showError('Manifest not found. Please check the URL.');
      } else {
        showError(`Failed to load manifest: ${error.message}`);
      }
    }

    return null;
  }
}
```

### Type-Safe Component Props

**Well-Typed Component:**
```typescript
import type { Variant, ParsedManifest } from '../../types/manifest';

// Strict prop types
interface VariantCardProps {
  variant: Variant;
  selected: boolean;
  onSelect: (variantId: string) => void;
  onShowDetails: (variant: Variant) => void;
}

export function VariantCard({
  variant,
  selected,
  onSelect,
  onShowDetails
}: VariantCardProps) {
  // TypeScript ensures:
  // - variant has all Variant properties
  // - selected is boolean
  // - onSelect takes string parameter
  // - onShowDetails takes Variant parameter

  return (
    <div onClick={() => onSelect(variant.id)}>
      {variant.bitrate} bps
      <button onClick={(e) => {
        e.stopPropagation();  // Don't trigger parent onClick
        onShowDetails(variant);
      }}>
        Details
      </button>
    </div>
  );
}
```

### Performance Optimization

**Memoization Example:**
```typescript
import { useMemo, useCallback } from 'react';

function VariantList({ variants }: Props) {
  // Memoize expensive calculation
  const sortedVariants = useMemo(() => {
    return [...variants].sort((a, b) => a.bitrate - b.bitrate);
  }, [variants]);

  // Memoize callbacks
  const handleSelect = useCallback((id: string) => {
    setSelectedVariant(id);
  }, [setSelectedVariant]);

  // Memoize filtered list
  const videoVariants = useMemo(() => {
    return sortedVariants.filter(v => v.type === 'video');
  }, [sortedVariants]);

  return (
    <div>
      {videoVariants.map(v => (
        <VariantCard
          key={v.id}
          variant={v}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

## Real-World Examples

### Example 1: Debugging Live Stream

**Scenario:** Live stream has buffering issues

**Steps:**
1. Get manifest URL from Network tab
2. Load in extension
3. Check ABR Ladder → Are there large gaps?
4. Check Performance Metrics → What's the efficiency score?
5. Use Bandwidth Calculator → What quality for typical users?
6. Check Timeline Simulation → Does it rebuffer?
7. Check Validation → Any warnings?

**Example Analysis:**
```typescript
const manifest = await loadManifest(liveStreamUrl);

// Check ladder
const analysis = analyzeBitrateLadder(manifest.variants);
if (analysis.largeGaps.length > 0) {
  console.log('⚠️ Found large gaps in bitrate ladder:');
  analysis.largeGaps.forEach(gap => {
    console.log(`  ${gap.fromBitrate} → ${gap.toBitrate}: ${gap.gap} bps gap`);
  });
}

// Simulate typical mobile user
const profile = generateBandwidthProfile('varying', 2000000, 60);
const simulation = simulatePlayback(manifest.variants, profile, 10);

console.log(`Quality switches: ${simulation.totalSwitches}`);
console.log(`Rebuffering: ${simulation.rebufferingTime}s`);

if (simulation.totalSwitches > 20) {
  console.log('⚠️ Too many quality switches - bitrate ladder too sensitive');
}
```

### Example 2: Validating VOD Content

**Scenario:** Verify VOD manifest before publishing

**Checklist using extension:**
```typescript
const manifest = await loadManifest(vodUrl);

// 1. Check variant count
if (manifest.variants.length < 4) {
  console.warn('⚠️ Only', manifest.variants.length, 'variants. Recommended: 4-6');
}

// 2. Validate
const issues = validateManifest(manifest);
const errors = issues.filter(i => i.severity === 'error');

if (errors.length > 0) {
  console.error('❌ Validation errors:', errors);
}

// 3. Check codecs
const codecAnalysis = analyzeCodecs(
  manifest.variants.flatMap(v => v.codecs)
);

if (!codecAnalysis.hasModernCodecs) {
  console.log('💡 Consider adding AV1/VP9 for better compression');
}

// 4. Export report
const report = exportToText(manifest);
// Save for documentation
```

### Example 3: Comparing Manifest Versions

**Scenario:** Manifest updated, verify changes

**Steps:**
```typescript
import { diffManifests } from './lib/utils/manifest-diff';

// Load both versions
const oldManifest = await loadManifest(oldUrl);
const newManifest = await loadManifest(newUrl);

// Compare
const diff = diffManifests(oldManifest, newManifest);

console.log('Changes detected:', {
  added: diff.variantsAdded.length,
  removed: diff.variantsRemoved.length,
  changed: diff.variantsChanged.length,
  metadataChanged: diff.metadataChanged
});

// Analyze changes
if (diff.variantsAdded.length > 0) {
  console.log('✅ New variants added:');
  diff.variantsAdded.forEach(v => {
    console.log(`  - ${v.bitrate} bps (${v.resolution?.width}x${v.resolution?.height})`);
  });
}

if (diff.variantsRemoved.length > 0) {
  console.log('⚠️ Variants removed:');
  diff.variantsRemoved.forEach(v => {
    console.log(`  - ${v.bitrate} bps`);
  });
}
```

## Integration Examples

### Integrating with External Tools

**Export for Excel Analysis:**
```typescript
// Generate CSV
const csv = exportToCSV(manifest);

// Download for Excel
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'manifest-analysis.csv';
a.click();

// Now open in Excel, create pivot tables, charts, etc.
```

**Generate FFmpeg Workflow:**
```typescript
import { generateCompleteWorkflow } from './lib/utils/download-helpers';

const segmentUrls = manifest.segments?.map(s => s.url) || [];

const script = generateCompleteWorkflow(segmentUrls, 'output.mp4');

// Save as download_and_merge.sh
const blob = new Blob([script], { type: 'text/plain' });
// Download...

// Then run:
// chmod +x download_and_merge.sh
// ./download_and_merge.sh
// → Downloads all segments and merges to output.mp4
```

**API Integration (fetch from external service):**
```typescript
// Example: Load manifest from your CMS API
async function loadFromCMS(contentId: string) {
  const response = await fetch(`https://api.example.com/content/${contentId}/manifest`);
  const data = await response.json();

  const manifestUrl = data.manifestUrl;

  // Load in extension
  const manifest = await loadManifest(manifestUrl);

  return {
    contentId,
    contentTitle: data.title,
    manifest,
    analysis: analyzeBitrateLadder(manifest.variants)
  };
}
```

## Troubleshooting Examples

### Debugging Parse Failures

**Step-by-step debugging:**
```typescript
// 1. Check format detection
const format = detectManifestFormat(content);
console.log('Detected format:', format);  // 'hls' or 'dash'?

// 2. Try parsing
try {
  const manifest = parseManifest(content, url);
  console.log('✅ Parse succeeded');
  console.log('Variants:', manifest.variants.length);
} catch (error) {
  console.error('❌ Parse failed:', error.message);

  // 3. Check content
  console.log('First 200 chars:', content.substring(0, 200));

  // 4. Validate format
  if (format === 'hls') {
    if (!content.includes('#EXTM3U')) {
      console.error('Missing #EXTM3U header');
    }
  }
}
```

### Debugging Component Rendering

**Check Component Mount:**
```typescript
function MyComponent({ manifest }: Props) {
  useEffect(() => {
    console.log('Component mounted with:', manifest);

    return () => {
      console.log('Component unmounting');
    };
  }, [manifest]);

  // Check props
  console.log('Rendering with:', {
    hasManifest: !!manifest,
    variantCount: manifest?.variants.length,
    format: manifest?.format
  });

  if (!manifest) {
    console.log('No manifest, returning null');
    return null;
  }

  return <div>Content</div>;
}
```

### Debugging State Updates

**Check Zustand Updates:**
```typescript
// Subscribe to all state changes
useManifestStore.subscribe((state, prevState) => {
  console.log('State changed:', {
    prev: prevState,
    current: state
  });
});

// Or specific slice
useManifestStore.subscribe(
  state => state.manifest,
  (manifest, prevManifest) => {
    console.log('Manifest changed:', { prev: prevManifest, current: manifest });
  }
);
```

## Performance Examples

### Profiling Component Render

**Using React Profiler:**
```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number
) {
  console.log(`${id} ${phase}:`, {
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`
  });
}

<Profiler id="VariantList" onRender={onRenderCallback}>
  <VariantList variants={variants} />
</Profiler>
```

### Measuring Operations

**Performance Timing:**
```typescript
// Mark and measure
performance.mark('parse-start');

const manifest = parseManifest(content, url);

performance.mark('parse-end');
performance.measure('parse-time', 'parse-start', 'parse-end');

const measure = performance.getEntriesByName('parse-time')[0];
console.log(`Parsing took ${measure.duration.toFixed(2)}ms`);

// Clear marks
performance.clearMarks();
performance.clearMeasures();
```

### Memory Profiling

**Check Memory Usage:**
```typescript
// In browser console
console.log('Memory:', {
  used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
  total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
  limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
});

// Monitor over time
setInterval(() => {
  const used = performance.memory.usedJSHeapSize / 1048576;
  console.log(`Memory: ${used.toFixed(2)} MB`);
}, 5000);
```

These examples provide practical, copy-paste-ready code for using and extending the HLS + DASH Manifest Viewer.
