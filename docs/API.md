# API Documentation

## Core Libraries

### Parsers

#### `parseManifest(content: string, url: string): ParsedManifest`

Unified parser that auto-detects format and parses manifest.

**Parameters:**
- `content` - Raw manifest content (HLS or DASH)
- `url` - Base URL for resolving relative URLs

**Returns:** `ParsedManifest` object

**Example:**
```typescript
import { parseManifest } from './lib/parsers';

const content = await fetch('https://example.com/manifest.m3u8').then(r => r.text());
const parsed = parseManifest(content, 'https://example.com/manifest.m3u8');

console.log(parsed.format); // 'hls' or 'dash'
console.log(parsed.variants.length); // Number of variants
```

#### `parseHLS(content: string, baseUrl: string): ParsedManifest`

Parse HLS (M3U8) manifest specifically.

#### `parseDASH(content: string, baseUrl: string): ParsedManifest`

Parse DASH (MPD) manifest specifically.

#### `detectManifestFormat(content: string): ManifestFormat`

Auto-detect manifest format from content.

**Returns:** `'hls'` or `'dash'`

### URL Utilities

#### `isRelativeUrl(url: string): boolean`

Check if URL is relative (path-relative or domain-relative).

**Example:**
```typescript
isRelativeUrl('playlist.m3u8'); // true
isRelativeUrl('/path/playlist.m3u8'); // true
isRelativeUrl('https://example.com/playlist.m3u8'); // false
isRelativeUrl('//cdn.example.com/playlist.m3u8'); // false
```

#### `resolveManifestUrl(uriReference: string, baseUrl: string): string`

Resolve relative URL to absolute URL.

**Example:**
```typescript
resolveManifestUrl(
  'variant.m3u8',
  'https://example.com/path/master.m3u8'
); // 'https://example.com/path/variant.m3u8'
```

#### `analyzeManifestUrl(url: string): UrlAnalysis`

Analyze URL structure and parameters.

**Returns:**
```typescript
{
  domain: string;
  path: string;
  hasAuth: boolean;
  authParams: string[];
  hasTimestamp: boolean;
  cdn: string | null;
  protocol: string;
  queryParams: Map<string, string>;
}
```

#### `detectCDN(url: string): string | null`

Detect CDN provider from URL.

**Supported CDNs:**
- CloudFront
- Akamai
- Fastly
- Cloudflare
- Google Cloud CDN
- Azure CDN
- Limelight
- Level3
- Verizon EdgeCast
- KeyCDN

### ABR Analysis

#### `calculateBitrateGaps(variants: Variant[]): number[]`

Calculate bitrate differences between consecutive variants.

#### `analyzeBitrateLadder(variants: Variant[]): BitrateAnalysis`

Comprehensive ABR ladder analysis.

**Returns:**
```typescript
{
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
```

#### `getRecommendedVariant(variants: Variant[], bandwidthBps: number): Variant | null`

Get recommended variant for given bandwidth.

Uses 85% safety margin.

### Playback Simulation

#### `generateBandwidthProfile(type, baseBandwidth, durationSeconds): BandwidthProfile[]`

Generate bandwidth profile for simulation.

**Profile Types:**
- `'stable'` - Constant bandwidth
- `'varying'` - Random fluctuations
- `'degrading'` - Linear degradation
- `'improving'` - Linear improvement

#### `simulatePlayback(variants, bandwidthProfile, targetDuration): SimulationResult`

Simulate ABR playback.

**Returns:**
```typescript
{
  segments: PlaybackSegment[];
  switches: QualitySwitch[];
  totalSwitches: number;
  rebufferingTime: number;
  averageQuality: number;
}
```

### Codec Analysis

#### `parseCodec(codecString: string): CodecParsed`

Parse codec string.

**Returns:**
```typescript
{
  codec: string;      // 'H.264', 'AAC-LC', etc.
  profile?: string;   // 'High', 'Main', etc.
  level?: string;     // '3.1', '4.0', etc.
}
```

**Supported Codecs:**
- H.264 (avc1)
- H.265 (hvc1/hev1)
- VP9
- AV1
- AAC (mp4a.40.2, mp4a.40.5, mp4a.40.29)
- Dolby Digital (ac-3)
- Dolby Digital Plus (ec-3)
- Opus
- WebVTT (wvtt)
- TTML (stpp)

#### `getCodecInfo(codecString: string): CodecInfo`

Get detailed codec information.

#### `analyzeCodecs(codecs: string[]): CodecAnalysis`

Analyze list of codecs.

**Returns:**
```typescript
{
  videoCodecs: string[];
  audioCodecs: string[];
  subtitleCodecs: string[];
  hasModernCodecs: boolean; // AV1, VP9, Opus
  hasHDR: boolean;
}
```

### Validation

#### `validateManifest(manifest: ParsedManifest): ValidationIssue[]`

Validate manifest and return issues.

**Issue Severities:**
- `'error'` - Critical problems
- `'warning'` - Potential issues
- `'info'` - Suggestions

**Categories:**
- `'variants'`
- `'codecs'`
- `'metadata'`
- `'abr-ladder'`

#### `getValidationSummary(issues: ValidationIssue[]): ValidationSummary`

Get validation summary.

### Export

#### `exportToJSON(manifest: ParsedManifest): string`

Export manifest to formatted JSON.

#### `exportToCSV(manifest: ParsedManifest): string`

Export variants to CSV format.

#### `exportToText(manifest: ParsedManifest): string`

Export to human-readable text report.

### Storage

#### `getHistory(): Promise<ManifestHistoryItem[]>`

Get manifest history.

#### `addToHistory(item: ManifestHistoryItem): Promise<void>`

Add manifest to history (auto-deduplicates, max 50 items).

#### `clearHistory(): Promise<void>`

Clear all history.

#### `getSettings(): Promise<ExtensionSettings>`

Get extension settings.

#### `updateSettings(settings: Partial<ExtensionSettings>): Promise<void>`

Update extension settings.

### Manifest Detection

#### `scanDOMForManifests(): string[]`

Scan page DOM for manifest URLs.

Searches:
- `<a>` elements with `.m3u8` or `.mpd` hrefs
- `<video>` and `<source>` elements

#### `isManifestUrl(url: string): boolean`

Check if URL points to a manifest.

#### `getFormatFromUrl(url: string): ManifestFormat | null`

Determine format from URL extension.

### Clipboard Utilities

#### `copyVariantUrls(variants: Variant[]): void`

Copy all variant URLs to clipboard (newline-separated).

#### `copySegmentUrls(segments: Segment[]): void`

Copy all segment URLs to clipboard.

#### `copyAsM3U(variants: Variant[], title?: string): void`

Copy variants as M3U playlist.

#### `copyAsCurlCommands(urls: string[]): void`

Copy URLs as cURL download commands.

### Download Helpers

#### `generateDownloadScript(urls, format): string`

Generate download script (bash or PowerShell).

#### `generateFFmpegConcat(urls): string`

Generate FFmpeg concat file.

#### `generateCompleteWorkflow(segmentUrls, outputFilename): string`

Generate complete download + merge workflow.

## Type Definitions

### ParsedManifest

```typescript
interface ParsedManifest {
  format: ManifestFormat; // 'hls' | 'dash'
  raw: string;
  url: string;
  variants: Variant[];
  metadata: ManifestMetadata;
  segments?: Segment[];
}
```

### Variant

```typescript
interface Variant {
  id: string;
  bitrate: number; // bits per second
  resolution?: Resolution;
  codecs: string[];
  frameRate?: number;
  url: string;
  type: VariantType; // 'video' | 'audio' | 'subtitle'
}
```

### ManifestMetadata

```typescript
interface ManifestMetadata {
  version?: string;
  duration?: number; // seconds
  targetDuration?: number; // HLS target duration
  minBufferTime?: number; // DASH min buffer time
  type: ManifestType; // 'VOD' | 'LIVE' | 'EVENT'
  encrypted: boolean;
  profiles?: string[]; // DASH profiles
}
```

### Segment

```typescript
interface Segment {
  id: string;
  duration: number;
  url: string;
  byteRange?: ByteRange;
  sequence: number;
}
```

## Message Protocol

### Extension Messages

All messages follow the `ExtensionMessage` union type:

```typescript
type ExtensionMessage =
  | FetchManifestMessage
  | UpdateIgnoreListMessage
  | GetDetectedManifestsMessage
  | UpdateSettingsMessage
  | ClearHistoryMessage;
```

### Fetch Manifest

```typescript
{
  action: 'fetch-manifest',
  url: string
}
```

**Response:**
```typescript
{
  success: boolean,
  data?: string, // Raw manifest content
  error?: string
}
```

### Get Detected Manifests

```typescript
{
  action: 'get-detected',
  tabId: number
}
```

**Response:**
```typescript
{
  success: boolean,
  data?: DetectedManifest[],
  error?: string
}
```

### Update Settings

```typescript
{
  action: 'update-settings',
  settings: Partial<ExtensionSettings>
}
```

## State Management

### Manifest Store (Zustand)

```typescript
interface ManifestState {
  manifest: ParsedManifest | null;
  loading: boolean;
  error: string | null;
  selectedView: 'raw' | 'structured' | 'timeline';
  selectedVariantId: string | null;

  // Actions
  setManifest: (manifest: ParsedManifest) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedView: (view) => void;
  setSelectedVariant: (variantId: string | null) => void;
  clearManifest: () => void;
}
```

**Usage:**
```typescript
import { useManifestStore } from './store/manifest-store';

function MyComponent() {
  const manifest = useManifestStore((state) => state.manifest);
  const setManifest = useManifestStore((state) => state.setManifest);

  // Use manifest...
}
```

### Toast Store

```typescript
interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

**Usage:**
```typescript
import { useToastStore } from './components/common/Toast';

function MyComponent() {
  const addToast = useToastStore((state) => state.addToast);

  const handleCopy = () => {
    navigator.clipboard.writeText('...');
    addToast({
      message: 'Copied to clipboard',
      type: 'success',
      duration: 2000
    });
  };
}
```

## Extension Points

### Adding New Parsers

1. Create parser in `src/lib/parsers/`
2. Implement parser function: `(content: string, url: string) => ParsedManifest`
3. Add to `src/lib/parsers/index.ts`
4. Update `detectManifestFormat` if needed
5. Write tests in `tests/parsers/`

### Adding New Export Formats

1. Create exporter in `src/lib/export/exporters.ts`
2. Implement: `(manifest: ParsedManifest) => string`
3. Add to ExportMenu component
4. Write tests in `tests/export/`

### Adding New Validators

1. Add validation logic to `src/lib/validation/manifest-validator.ts`
2. Return `ValidationIssue` objects
3. Test in `tests/validation/`

### Adding New Components

**Viewer Components:** `src/components/viewer/`
**Popup Components:** `src/components/popup/`
**Shared Components:** `src/components/common/`

## Testing API

### Running Tests

```bash
npm test                       # All tests
npm test -- --run             # Single run (no watch)
npm test url-resolver         # Specific test file
npm test -- --coverage        # With coverage
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Mocking Chrome APIs

```typescript
import { vi } from 'vitest';

global.chrome = {
  runtime: {
    sendMessage: vi.fn()
  }
} as any;
```

## Build System

### Vite Configuration

Multi-entry build with separate bundles:
- `service-worker.ts` → `service-worker.js`
- `content-script.ts` → `content-script.js`
- `popup.tsx` → `popup.html` + JS
- `viewer.tsx` → `viewer.html` + JS
- `panel.tsx` → `panel.html` + JS

### TypeScript Configuration

- Strict mode enabled
- React JSX transform
- Chrome APIs available via `@types/chrome`
- Module resolution: bundler

## Performance Considerations

### Code Splitting

Vite automatically splits:
- Shared code → `globals-*.js` (~143 KB)
- Page-specific code → separate chunks
- Shared utilities → extracted chunks

### Bundle Sizes (Production)

- Service Worker: ~2.85 KB
- Content Script: ~1.10 KB
- Popup: ~8.20 KB
- DevTools Panel: ~2.67 KB
- Viewer: ~206 KB (includes all analysis features)
- Shared: ~143 KB
- CSS: ~34 KB

### Optimization Tips

1. **Lazy Loading** - Load heavy components only when needed
2. **Code Splitting** - Vite handles automatically
3. **Tree Shaking** - Remove unused code
4. **Minimize Dependencies** - Only import what's needed

## Security Notes

### CORS Handling

Manifest fetches use service worker with appropriate permissions:

```json
{
  "host_permissions": [
    "*://*/*.m3u8*",
    "*://*/*.mpd*"
  ]
}
```

### Authentication

URLs with auth tokens are detected and warnings shown:
- Token parameters identified automatically
- Users warned about expiration
- Tokens not stored persistently

### Content Security Policy

Extension follows Manifest V3 CSP:
- No inline scripts
- No eval()
- All code in bundled files

## Chrome Extension APIs Used

### Background (Service Worker)

- `chrome.runtime.onMessage` - Message handling
- `chrome.runtime.onInstalled` - Setup on install
- `chrome.contextMenus` - Right-click menu
- `chrome.tabs` - Tab management
- `chrome.storage.local` - Persistent storage

### Content Script

- `chrome.runtime.sendMessage` - Send to background
- DOM APIs - Manifest detection
- `MutationObserver` - Dynamic detection

### DevTools

- `chrome.devtools.panels.create` - Create panel
- `chrome.devtools.inspectedWindow.tabId` - Get tab ID

### Popup/Viewer

- `chrome.runtime.sendMessage` - Request data
- `chrome.tabs.query` - Get current tab
- `chrome.tabs.create` - Open viewer
- `chrome.storage.local` - Settings/history

## Extension Manifest

```json
{
  "manifest_version": 3,
  "permissions": [
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess",
    "storage",
    "tabs",
    "contextMenus"
  ],
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  }
}
```

## Development Workflow

### Local Development

```bash
npm run dev  # Watch mode

# In another terminal:
# Load dist/ in chrome://extensions
# Reload extension after changes
```

### Testing Workflow

```bash
# 1. Write failing test
npm test my-feature -- --run

# 2. Implement feature

# 3. Verify test passes
npm test my-feature -- --run

# 4. Commit
git add . && git commit -m "feat: add my feature"
```

### Adding Features

1. Write tests (TDD approach)
2. Implement feature
3. Update types if needed
4. Document in README/API docs
5. Test manually in Chrome
6. Commit with descriptive message
