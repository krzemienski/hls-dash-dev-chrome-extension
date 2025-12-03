# Architecture: HLS + DASH Manifest Viewer Pro

**Version**: 1.0.0
**Platform**: Chrome Extension (Manifest V3)
**Build**: Vite + React + TypeScript
**Last Updated**: 2025-12-02

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                                                                   │
│  ┌────────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Toolbar Popup    │  │   DevTools Panel │  │ Viewer Page  │ │
│  │   (popup.html)     │  │   (panel.html)   │  │(viewer.html) │ │
│  │                    │  │                  │  │              │ │
│  │  - Manual Input    │  │  - Network Cap   │  │ - Raw View   │ │
│  │  - History List    │  │  - Request Detail│  │ - Structured │ │
│  │  - Settings        │  │  - Manifest List │  │ - Timeline   │ │
│  │  - Detected Count  │  │                  │  │ - Simulation │ │
│  └─────────┬──────────┘  └────────┬─────────┘  └──────┬───────┘ │
│            │                      │                    │         │
│            └──────────────────────┼────────────────────┘         │
│                                   │                              │
│                        ┌──────────▼──────────┐                   │
│                        │   Service Worker    │                   │
│                        │  (background.js)    │                   │
│                        │                     │                   │
│                        │  - Message Router   │                   │
│                        │  - Manifest Fetcher │                   │
│                        │  - State Manager    │                   │
│                        └──────────┬──────────┘                   │
│                                   │                              │
│                        ┌──────────▼──────────┐                   │
│                        │  chrome.storage     │                   │
│                        │                     │                   │
│                        │  - History          │                   │
│                        │  - Settings         │                   │
│                        │  - Ignore List      │                   │
│                        │  - Detected Count   │                   │
│                        └─────────────────────┘                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           Content Script (injected on all pages)             │ │
│  │                                                              │ │
│  │  - Parse DOM for manifest links                             │ │
│  │  - Send count to service worker                             │ │
│  │  - Context menu integration                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         declarativeNetRequest Rules                          │ │
│  │                                                              │ │
│  │  - Redirect .m3u8 URLs → viewer.html?url=...                │ │
│  │  - Redirect .mpd URLs → viewer.html?url=...                 │ │
│  │  - Conditionally enabled via settings                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                                   │
                        External Streaming Servers
                                   │
                   ┌────────────────┼────────────────┐
                   │                │                │
              .m3u8 files      .mpd files      Segments
```

---

## Component Architecture

### Extension Pages (Separate Execution Contexts)

#### 1. Service Worker (background)
**File**: `src/background/service-worker.ts`
**Lifecycle**: Event-driven, terminates when idle
**Capabilities**: Network requests, storage, messaging, alarms

**Responsibilities:**
- Route messages between extension pages
- Fetch manifest content via fetch API
- Manage chrome.storage operations
- Update badge count
- Handle declarativeNetRequest dynamic rules
- Maintain ignore list

**APIs Used:**
- `chrome.runtime.onMessage` - Message routing
- `chrome.storage.local` - Persistent state
- `chrome.action.setBadgeText` - Display manifest count
- `chrome.declarativeNetRequest` - Dynamic rule management
- `fetch()` - Manifest content retrieval

#### 2. Popup (action.default_popup)
**File**: `src/popup/popup.html` → `Popup.tsx`
**Lifecycle**: Opens when icon clicked, closes when focus lost
**Size**: 350px × 500px

**Responsibilities:**
- Display manifest history
- Provide manual URL input
- Show detected manifests on current page
- Settings panel
- Quick actions (open in viewer, clear history)

**State:**
- Manifest history (from chrome.storage)
- Current page detected manifests (from content script)
- Settings (from chrome.storage)

#### 3. Viewer Page (web_accessible_resource)
**File**: `src/viewer/viewer.html` → `Viewer.tsx`
**Lifecycle**: Opens in full tab when manifest detected/selected
**Access**: Via chrome-extension://[id]/viewer.html?url=[manifest]

**Responsibilities:**
- Display manifest in multiple views (Raw, Structured, Timeline, Simulation)
- Parse manifest with library parsers
- Render syntax-highlighted raw text
- Show ABR variant information
- Provide comparison tools
- Export functionality

**State:**
- Current manifest (raw + parsed)
- Selected variants (for comparison)
- Current view tab
- Simulation parameters

#### 4. DevTools Panel (devtools_page)
**Files**: `src/devtools/devtools.ts` → creates panel → `panel.html` → `DevToolsPanel.tsx`
**Lifecycle**: Opens with DevTools, persists while DevTools open
**Integration**: `chrome.devtools.panels.create()`

**Responsibilities:**
- Capture manifest requests from network tab
- Display request/response details
- Provide "View in Full Viewer" action
- Filter and search captured manifests
- Export captured data

**State:**
- Captured manifest requests
- Selected request
- Filter criteria

#### 5. Content Script (injected)
**File**: `src/content/content-script.ts`
**Lifecycle**: Injected on all pages at document_idle
**Isolation**: Separate context from page scripts

**Responsibilities:**
- Parse page DOM for manifest links (a[href], link[href], source[src])
- Count manifests found
- Send count to service worker (for badge)
- Add context menu handler

**Performance Constraints:**
- Must execute in < 50ms
- Use debounced MutationObserver for SPAs
- Minimal memory footprint

---

## Data Flow Diagrams

### Flow 1: Auto-Interception (declarativeNetRequest)

```
User navigates to: https://example.com/stream.m3u8
                    ↓
[declarativeNetRequest Rule #1 matches]
  - Condition: regexFilter = "^https?://.*\\.m3u8"
  - ResourceType: main_frame
                    ↓
[Action: redirect]
  - Target: chrome-extension://[id]/viewer.html?url=https%3A%2F%2Fexample.com%2Fstream.m3u8
                    ↓
[Viewer Page Loads]
  - Parse query param: url = https://example.com/stream.m3u8
  - Display manifest URL at top
  - Send message to service worker: {action: 'fetch-manifest', url: '...'}
                    ↓
[Service Worker Receives Message]
  - Check ignore list (chrome.storage)
  - If not ignored → fetch(url)
  - Return manifest text or error
                    ↓
[Viewer Processes Response]
  - Detect format: startsWith('<') ? 'dash' : 'hls'
  - Parse with appropriate library
  - Render in multiple views
  - Save to history (chrome.storage)
```

### Flow 2: Content Script Detection

```
User browses: https://streaming-site.com/videos
                    ↓
[Content Script Executes] (document_idle)
  - Query all <a href> containing .m3u8 or .mpd
  - Query all <link href> and <source src>
  - Extract manifest URLs: ['stream1.m3u8', 'stream2.mpd']
                    ↓
[Send to Service Worker]
  - Message: {action: 'update-detected', manifests: [...], tabId: 123}
                    ↓
[Service Worker Updates Badge]
  - chrome.action.setBadgeText({text: '2', tabId: 123})
  - Store detected manifests for this tab
                    ↓
[User Clicks Extension Icon]
  - Popup opens
  - Queries service worker for detected manifests
  - Displays list with "View" buttons
                    ↓
[User Clicks "View"]
  - Open chrome-extension://[id]/viewer.html?url=[selected]
  - (Same flow as auto-interception from here)
```

### Flow 3: DevTools Network Capture

```
User opens DevTools on streaming site
                    ↓
[DevTools Page Executes] (devtools.ts)
  - chrome.devtools.panels.create('Manifests', ...)
  - Creates panel.html
                    ↓
[Panel Loads] (DevToolsPanel.tsx)
  - Register listener: chrome.devtools.network.onRequestFinished
                    ↓
[Streaming Site Loads Manifest]
  - Request: GET https://example.com/master.m3u8
                    ↓
[Network Listener Fires]
  - Filter: request.request.url.endsWith('.m3u8') || .endsWith('.mpd')
  - OR: response.content.mimeType contains 'mpegurl' or 'dash+xml'
  - Extract: URL, headers, timing, size
  - getContent() to retrieve manifest body
                    ↓
[Panel Displays Captured Request]
  - Add to list with timestamp
  - Show in table: URL, Status, Size, Time
                    ↓
[User Selects Request]
  - Show details: headers, timing waterfall
  - "View Full Manifest" button → Open in viewer page
```

### Flow 4: Manual Input

```
User clicks extension icon
                    ↓
[Popup Opens]
  - Input field: "Enter Manifest URL"
  - Paste: https://example.com/playlist.m3u8
  - Click "Go" button
                    ↓
[Popup Validates URL]
  - Check format: .m3u8 or .mpd extension
  - Check protocol: http/https
  - Show error if invalid
                    ↓
[If Valid: Open Viewer]
  - chrome.tabs.create({url: `chrome-extension://[id]/viewer.html?url=${encoded}`})
                    ↓
[Viewer Flow]
  - (Same as auto-interception)
```

---

## State Management

### chrome.storage.local Schema

```typescript
interface ExtensionStorage {
  // Manifest viewing history
  history: ManifestHistoryItem[];  // Max 100 items

  // User settings
  settings: {
    autoInterceptEnabled: boolean;     // Default: false
    theme: 'light' | 'dark' | 'auto';  // Default: 'auto'
    defaultView: 'raw' | 'structured' | 'timeline';  // Default: 'raw'
    syntaxTheme: string;               // Default: 'prism'
    ignoredUrls: string[];             // User-added ignore patterns
    safelist: string[];                // Never intercept these sites
  };

  // Per-tab detected manifests
  detectedManifests: {
    [tabId: number]: DetectedManifest[];
  };

  // Favorites/starred manifests
  favorites: string[];  // Manifest URLs
}

interface ManifestHistoryItem {
  url: string;
  format: 'hls' | 'dash';
  timestamp: number;
  variantCount: number;
  duration?: number;
  title?: string;  // Extracted from manifest or site
}

interface DetectedManifest {
  url: string;
  format: 'hls' | 'dash';
  source: 'link' | 'xhr' | 'video-src';  // How it was detected
  pageUrl: string;
}
```

### Zustand Store (In-Memory State)

```typescript
// src/stores/manifestStore.ts
interface ManifestStore {
  // Current manifest data
  currentManifest: {
    raw: string;
    parsed: HLSManifest | DASHManifest;
    url: string;
    format: 'hls' | 'dash';
  } | null;

  // Comparison mode
  selectedVariants: string[];  // Variant IDs for comparison
  comparisonMode: boolean;

  // Simulation state
  simulationParams: {
    bandwidth: number;  // bps
    algorithm: 'throughput' | 'buffer' | 'hybrid';
    playing: boolean;
    currentTime: number;
  };

  // UI state
  activeTab: 'raw' | 'structured' | 'timeline' | 'simulation' | 'export';
  loading: boolean;
  error: string | null;

  // Actions
  setManifest: (manifest: ParsedManifest) => void;
  toggleVariant: (variantId: string) => void;
  updateSimulation: (params: Partial<SimulationParams>) => void;
  setActiveTab: (tab: TabType) => void;
}
```

### Message Passing Protocols

**Message Types:**
```typescript
// Service Worker ← Viewer/Popup/DevTools
type ExtensionMessage =
  | { action: 'fetch-manifest'; url: string }
  | { action: 'update-ignore-list'; url: string; ignore: boolean }
  | { action: 'get-detected'; tabId: number }
  | { action: 'update-settings'; settings: Partial<Settings> }
  | { action: 'clear-history' };

// Service Worker → Viewer/Popup/DevTools
type ExtensionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Example Usage:
chrome.runtime.sendMessage(
  { action: 'fetch-manifest', url: 'https://example.com/stream.m3u8' },
  (response: ExtensionResponse<string>) => {
    if (response.success) {
      const manifest = response.data;
      // Process manifest
    } else {
      // Handle error
      showError(response.error);
    }
  }
);
```

**Content Script → Service Worker:**
```typescript
chrome.runtime.sendMessage({
  action: 'update-detected',
  tabId: chrome.devtools?.inspectedWindow?.tabId,
  manifests: [
    { url: 'stream.m3u8', format: 'hls', source: 'link', pageUrl: location.href }
  ]
});
```

**Service Worker → Badge Update:**
```typescript
chrome.action.setBadgeText({ text: String(count), tabId: tabId });
chrome.action.setBadgeBackgroundColor({ color: '#3B82F6' });  // Blue
```

---

## Parsing Architecture

### Format Detection

```typescript
// src/lib/parsers/unified-parser.ts

export function detectFormat(content: string): 'hls' | 'dash' {
  const trimmed = content.trimStart();

  // DASH manifests are XML
  if (trimmed.startsWith('<')) {
    return 'dash';
  }

  // HLS manifests start with #EXTM3U
  if (trimmed.startsWith('#EXTM3U')) {
    return 'hls';
  }

  // Fallback: check for XML tags anywhere
  if (trimmed.includes('<MPD') || trimmed.includes('<?xml')) {
    return 'dash';
  }

  // Default to HLS
  return 'hls';
}
```

### Parser Abstraction

```typescript
// src/lib/parsers/types.ts

export interface ParsedManifest {
  format: 'hls' | 'dash';
  raw: string;
  url: string;
  variants: Variant[];
  metadata: ManifestMetadata;
  segments?: Segment[];  // For media playlists
}

export interface Variant {
  id: string;
  bitrate: number;  // bps
  resolution?: { width: number; height: number };
  codecs: string[];
  frameRate?: number;
  url: string;
  type: 'video' | 'audio' | 'subtitle';
}

export interface ManifestMetadata {
  version?: string;
  duration?: number;  // seconds
  targetDuration?: number;  // HLS
  minBufferTime?: number;  // DASH
  type: 'VOD' | 'LIVE' | 'EVENT';
  encrypted: boolean;
  profiles?: string[];  // DASH
}
```

### HLS Parser Implementation

```typescript
// src/lib/parsers/hls-parser.ts

import { Parser } from 'm3u8-parser';
import { resolveManifestUrl } from '../utils/url-resolver';

export function parseHLS(content: string, baseUrl: string): ParsedManifest {
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const manifest = parser.manifest;

  // Extract variants from master playlist
  const variants: Variant[] = (manifest.playlists || []).map((playlist, index) => ({
    id: `variant-${index}`,
    bitrate: playlist.attributes?.BANDWIDTH || 0,
    resolution: playlist.attributes?.RESOLUTION,
    codecs: playlist.attributes?.CODECS?.split(',') || [],
    frameRate: playlist.attributes?.['FRAME-RATE'],
    url: resolveManifestUrl(playlist.uri, baseUrl),
    type: determineTrackType(playlist)
  }));

  // Extract metadata
  const metadata: ManifestMetadata = {
    version: manifest.version,
    targetDuration: manifest.targetDuration,
    type: manifest.endList ? 'VOD' : 'LIVE',
    encrypted: !!manifest.segments?.some(s => s.key)
  };

  // Extract segments (for media playlists)
  const segments = manifest.segments?.map((seg, i) => ({
    id: `segment-${i}`,
    duration: seg.duration,
    url: resolveManifestUrl(seg.uri, baseUrl),
    byteRange: seg.byteRange,
    sequence: i + (manifest.mediaSequence || 0)
  }));

  return {
    format: 'hls',
    raw: content,
    url: baseUrl,
    variants,
    metadata,
    segments
  };
}
```

### DASH Parser Implementation

```typescript
// src/lib/parsers/dash-parser.ts

import { parse } from 'mpd-parser';
import { resolveManifestUrl } from '../utils/url-resolver';

export function parseDASH(content: string, baseUrl: string): ParsedManifest {
  const parsed = parse(content, { manifestUri: baseUrl });

  // Extract variants from AdaptationSets
  const variants: Variant[] = parsed.playlists?.map((playlist, index) => ({
    id: `variant-${index}`,
    bitrate: playlist.attributes?.bandwidth || 0,
    resolution: playlist.attributes?.resolution,
    codecs: [playlist.attributes?.codecs || ''].filter(Boolean),
    frameRate: playlist.attributes?.frameRate,
    url: resolveManifestUrl(playlist.uri, baseUrl),
    type: determineAdaptationSetType(playlist.attributes)
  })) || [];

  // Extract metadata from MPD attributes
  const metadata: ManifestMetadata = {
    duration: parsed.duration,
    minBufferTime: parsed.minBufferTime,
    type: parsed.type === 'static' ? 'VOD' : 'LIVE',
    encrypted: !!parsed.contentProtection,
    profiles: parsed.profiles?.split(',')
  };

  return {
    format: 'dash',
    raw: content,
    url: baseUrl,
    variants,
    metadata
  };
}
```

---

## URI Resolution Architecture

Adapted from abr-manifest-viewer-chrome/viewer/js/main.js lines 88-108:

```typescript
// src/lib/utils/url-resolver.ts

export class ManifestUrlResolver {
  constructor(private baseUrl: string) {}

  /**
   * Detect if URL is relative
   * Handles: "playlist.m3u8", "/path/playlist.m3u8"
   * Does NOT match: "https://...", "//cdn.example.com/...", "http://..."
   */
  isRelativeUrl(url: string): boolean {
    return !/^(?:[a-z]+:)?\/\//i.test(url);
  }

  /**
   * Get base URL with path: https://example.com/path/to/
   */
  getBaseUrlWithPath(): string {
    const url = new URL(this.baseUrl);
    const pathParts = url.pathname.split('/');
    pathParts.pop();  // Remove filename
    return `${url.origin}${pathParts.join('/')}/`;
  }

  /**
   * Get base URL without path: https://example.com
   */
  getBaseUrlWithoutPath(): string {
    const url = new URL(this.baseUrl);
    return url.origin;
  }

  /**
   * Resolve relative URL to absolute
   * Examples:
   *   - "stream.m3u8" → "https://example.com/path/stream.m3u8"
   *   - "/path/stream.m3u8" → "https://example.com/path/stream.m3u8"
   *   - "https://other.com/stream.m3u8" → "https://other.com/stream.m3u8"
   */
  resolve(uriReference: string): string {
    if (!this.isRelativeUrl(uriReference)) {
      return uriReference;  // Already absolute
    }

    if (uriReference.startsWith('/')) {
      // Domain-relative: /path/file → https://example.com/path/file
      return `${this.getBaseUrlWithoutPath()}${uriReference}`;
    } else {
      // Path-relative: file → https://example.com/path/to/file
      return `${this.getBaseUrlWithPath()}${uriReference}`;
    }
  }

  /**
   * Resolve multiple URLs (for batch processing)
   */
  resolveMany(uris: string[]): string[] {
    return uris.map(uri => this.resolve(uri));
  }
}

// Convenience function
export function resolveManifestUrl(uri: string, baseUrl: string): string {
  const resolver = new ManifestUrlResolver(baseUrl);
  return resolver.resolve(uri);
}
```

---

## declarativeNetRequest Rules Architecture

### Static Rules (public/rules.json)

```json
[
  {
    "id": 1,
    "priority": 1,
    "action": {
      "type": "redirect",
      "redirect": {
        "regexSubstitution": "chrome-extension://__MSG_@@extension_id__/viewer.html?url=\\0"
      }
    },
    "condition": {
      "regexFilter": "^https?://[^?#]+\\.m3u8(\\?[^#]*)?(#.*)?$",
      "resourceTypes": ["main_frame"],
      "excludedInitiatorDomains": [
        "demo.theoplayer.com",
        "video-dev.github.io",
        "reference.dashif.org"
      ]
    }
  },
  {
    "id": 2,
    "priority": 1,
    "action": {
      "type": "redirect",
      "redirect": {
        "regexSubstitution": "chrome-extension://__MSG_@@extension_id__/viewer.html?url=\\0"
      }
    },
    "condition": {
      "regexFilter": "^https?://[^?#]+\\.mpd(\\?[^#]*)?(#.*)?$",
      "resourceTypes": ["main_frame"],
      "excludedInitiatorDomains": [
        "demo.theoplayer.com",
        "reference.dashif.org"
      ]
    }
  }
]
```

**Key Features:**
- `regexSubstitution` with `\\0` captures full URL
- `main_frame` only (prevents breaking video players)
- `excludedInitiatorDomains` implements safelist
- Separate rules for HLS and DASH

**Limitations:**
- Cannot dynamically check ignore list (static rules)
- Cannot access request headers or cookies
- Limited to pattern matching

### Dynamic Rules (Programmatic)

```typescript
// Service worker adds/removes rules based on settings

async function updateInterceptionRules(enabled: boolean) {
  if (!enabled) {
    // Disable all redirect rules
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ['manifest_rules']
    });
  } else {
    // Enable redirect rules
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['manifest_rules']
    });
  }
}

async function addIgnorePattern(pattern: string) {
  // Get current dynamic rules
  const rules = await chrome.declarativeNetRequest.getDynamicRules();

  // Add new "allow" rule (higher priority than redirect)
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: Date.now(),  // Unique ID
      priority: 2,  // Higher than redirect rules
      action: { type: 'allow' },
      condition: {
        urlFilter: pattern,
        resourceTypes: ['main_frame']
      }
    }]
  });
}
```

---

## React Component Architecture

### Component Hierarchy

```
App (root)
├── ErrorBoundary
│   └── Router
│       ├── Popup
│       │   ├── ManifestHistory
│       │   │   └── HistoryItem
│       │   ├── DetectedManifests
│       │   │   └── ManifestItem
│       │   ├── ManualInput
│       │   └── Settings
│       │       ├── ThemeSelector
│       │       ├── IgnoreListManager
│       │       └── SafelistEditor
│       │
│       ├── Viewer
│       │   ├── ManifestHeader
│       │   │   └── ManifestUrl (clickable)
│       │   ├── TabNavigation
│       │   └── TabContent
│       │       ├── RawView
│       │       │   ├── LoadingSpinner
│       │       │   └── SyntaxHighlighter (Prism)
│       │       ├── StructuredView
│       │       │   ├── VariantTable
│       │       │   ├── BandwidthChart
│       │       │   └── MetadataPanel
│       │       ├── TimelineView
│       │       │   ├── SegmentTimeline
│       │       │   └── TimelineControls
│       │       ├── SimulationView
│       │       │   ├── PlaybackSimulator
│       │       │   └── BufferVisualization
│       │       └── ExportView
│       │           └── ExportPanel
│       │
│       └── DevToolsPanel
│           ├── NetworkCapture
│           │   └── RequestItem
│           ├── RequestDetails
│           └── FilterControls
```

### Shared Component Library

**Core Components:**
- `<LoadingSpinner />` - Consistent loading states
- `<ErrorDisplay />` - User-friendly error messages
- `<CopyButton />` - Copy to clipboard functionality
- `<DownloadButton />` - Trigger file downloads
- `<SearchBar />` - Manifest content search
- `<Tooltip />` - Hover tooltips for metadata
- `<Badge />` - Format badges (HLS/DASH)
- `<Card />` - Container for sections
- `<Table />` - Sortable data tables
- `<Chart />` - Visualization components

---

## Build Architecture (Vite Configuration)

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Service worker (no HTML entry)
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),

        // HTML entry points
        popup: resolve(__dirname, 'src/popup/popup.html'),
        viewer: resolve(__dirname, 'src/viewer/viewer.html'),
        devtools: resolve(__dirname, 'src/devtools/devtools.html'),
        panel: resolve(__dirname, 'src/devtools/panel.html'),

        // Content script (no HTML entry)
        'content-script': resolve(__dirname, 'src/content/content-script.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Service worker and content script at root
          if (chunkInfo.name === 'service-worker' || chunkInfo.name === 'content-script') {
            return '[name].js';
          }
          // Everything else in organized folders
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Ensure manifest.json is copied
    copyPublicDir: true
  },

  // Define for service worker compatibility
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
```

**Build Output Structure:**
```
dist/
├── manifest.json (copied from public/)
├── service-worker.js (bundled)
├── content-script.js (bundled)
├── popup.html
├── viewer.html
├── devtools.html
├── panel.html
├── rules.json (declarativeNetRequest)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── assets/
    ├── popup-[hash].js
    ├── viewer-[hash].js
    ├── panel-[hash].js
    ├── devtools-[hash].js
    └── styles-[hash].css
```

---

## Security Architecture

### Content Security Policy

```json
// In manifest.json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

**Constraints:**
- No inline scripts (all code in .js files)
- No eval() or Function()
- No external script sources

**Impact on Prism.js:**
- Must load from bundled file (not CDN)
- Custom language definitions must be in separate files

### Permissions Justification

**Required Permissions:**
1. `declarativeNetRequest` - Intercept manifest URLs for auto-viewing
2. `declarativeNetRequestWithHostAccess` - Access to host rules for manifest patterns
3. `storage` - Persist history, settings, ignore list
4. `tabs` - Open viewer page, get current tab info
5. `contextMenus` - "View Manifest" right-click option

**Host Permissions:**
1. `*://*/*.m3u8*` - Access HLS manifests
2. `*://*/*.mpd*` - Access DASH manifests

**Sensitive Data Handling:**
- Manifest URLs stored locally (chrome.storage.local)
- No data sent to external servers
- No analytics or tracking
- All processing happens locally in browser

### XSS Prevention

**Risk**: Manifests may contain user-controlled content

**Mitigation:**
```typescript
// When displaying manifest content
function renderManifest(content: string) {
  // Use textContent (safe)
  codeElement.textContent = content;

  // Prism highlighting (operates on text, outputs HTML)
  Prism.highlightElement(codeElement);

  // Link injection (sanitized)
  injectClickableLinks(codeElement, sanitizeUrl);
}

function sanitizeUrl(url: string): string {
  // Only allow http/https protocols
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'about:blank';  // Block javascript:, data:, etc.
    }
    return url;
  } catch {
    return 'about:blank';
  }
}
```

---

## Performance Architecture

### Optimization Strategies

**1. Code Splitting:**
```typescript
// Lazy load heavy components
const PlaybackSimulator = lazy(() => import('./components/PlaybackSimulator'));
const SegmentTimeline = lazy(() => import('./components/SegmentTimeline'));
const ComparisonView = lazy(() => import('./components/ComparisonView'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <PlaybackSimulator />
</Suspense>
```

**2. Parsing Performance:**
- Parse manifests in background (don't block UI)
- Use Web Worker for large manifests (5000+ lines)
- Cache parsed results (avoid re-parsing on tab switch)

**3. Service Worker Optimization:**
- Minimize wake-ups (batch storage operations)
- Use chrome.alarms for scheduled tasks (not setInterval)
- Clean up listeners when not needed

**4. Memory Management:**
- Limit history to 100 items
- Implement LRU cache for parsed manifests
- Clear detected manifests for closed tabs

**5. Rendering Performance:**
- Virtual scrolling for long manifests (react-window)
- Debounce search input (300ms)
- Memoize expensive calculations (React.memo, useMemo)

### Bundle Size Targets

- Total extension: < 2 MB
- Service worker: < 100 KB
- Popup bundle: < 200 KB
- Viewer bundle: < 500 KB
- DevTools bundle: < 300 KB
- Prism.js: ~50 KB (minified)
- Parser libraries: ~100 KB combined

**Optimization:**
- Tree-shake unused parser library code
- Compress with terser
- Use dynamic imports for rare features

---

## Testing Architecture

### Per-Phase Verification

Each phase has specific verification criteria (see IMPLEMENTATION_PHASES.md)

**Test Manifest Sources:**
- **HLS**: Apple Bipbop streams (https://devstreaming-cdn.apple.com/videos/streaming/examples/)
- **DASH**: DASH-IF reference streams (https://dash.akamaized.net/)
- **Live HLS**: Apple event streams
- **Live DASH**: Akamai test streams

### Production Testing Strategy

**Phase 24 includes testing with real sites:**
1. YouTube (DASH)
2. Twitch (HLS)
3. Apple TV+ (HLS)
4. Netflix (DASH) - if accessible
5. Akamai CDN demos
6. Cloudflare Stream
7. Mux Video
8. DASH-IF reference player
9. HLS.js demo player
10. THEOplayer demo

**Edge Cases to Test:**
- Malformed manifests (missing required tags)
- Huge manifests (10,000+ lines)
- Special characters in URLs (spaces, unicode, encoded)
- CORS-protected manifests
- Manifests behind authentication
- Encrypted content (DRM)
- Multi-period DASH
- Variant playlists with same bitrate
- Segments with byte ranges

---

## Deployment Architecture

### Development Workflow

```bash
# Development with hot reload
npm run dev

# Load unpacked extension
chrome://extensions → Load unpacked → select dist/

# Changes auto-rebuild
# Refresh extension to see updates
```

### Production Build

```bash
# Build for production
npm run build

# Output: dist/ directory

# Create ZIP for Chrome Web Store
cd dist && zip -r ../hls-dash-manifest-viewer-v1.0.0.zip . && cd ..
```

### Chrome Web Store Deployment

**Requirements:**
1. Developer account ($5 one-time fee)
2. Privacy policy (required for permissions)
3. Screenshots (1280×800 or 640×400)
4. Promotional tiles (440×280)
5. Detailed description
6. Category selection

**Submission Process:**
1. Upload ZIP file
2. Fill store listing details
3. Submit for review
4. Review time: 1-3 days typically
5. Address any review feedback
6. Publish once approved

---

## Service Worker Lifecycle Management

### Event-Driven Architecture

```typescript
// Service worker must be event-driven (no persistent state)

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(response => sendResponse({ success: true, data: response }))
    .catch(error => sendResponse({ success: false, error: error.message }));

  return true;  // Async response
});

// Listen for install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    initializeStorage();
  }
});

// Listen for tab updates (for badge updates)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateBadgeForTab(tabId);
  }
});
```

### State Persistence

**Problem**: Service worker terminates when idle (no in-memory state)

**Solution**: Use chrome.storage for all persistent state

```typescript
// Read state
const { history, settings } = await chrome.storage.local.get(['history', 'settings']);

// Write state
await chrome.storage.local.set({ history: updatedHistory });

// Listen for changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.settings) {
    handleSettingsChange(changes.settings.newValue);
  }
});
```

---

## Extension Communication Architecture

### Message Flow Matrix

| From → To | Method | Use Case |
|-----------|--------|----------|
| Viewer → Service Worker | `chrome.runtime.sendMessage` | Fetch manifest |
| Popup → Service Worker | `chrome.runtime.sendMessage` | Get history/settings |
| DevTools → Service Worker | `chrome.runtime.sendMessage` | Get detected manifests |
| Content Script → Service Worker | `chrome.runtime.sendMessage` | Update detected count |
| Service Worker → All Pages | `chrome.runtime.sendMessage` | Broadcast setting changes |
| Service Worker → Specific Tab | `chrome.tabs.sendMessage` | Send manifest to content script |

### Context Isolation

**Problem**: Popup, Viewer, DevTools are separate contexts (can't share variables)

**Solution**: Communication via messages + shared storage

```typescript
// All pages use same store hook
import { useManifestStore } from '@/stores/manifestStore';

// Store syncs with chrome.storage
useEffect(() => {
  // Load from storage on mount
  chrome.storage.local.get(['history', 'settings'], (items) => {
    setHistory(items.history || []);
    setSettings(items.settings || defaultSettings);
  });

  // Listen for external changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.history) setHistory(changes.history.newValue);
  });
}, []);
```

---

## Conclusion

This architecture provides:
- ✅ **Modern MV3 Compliance**: Service workers, declarativeNetRequest
- ✅ **Multiple Detection Methods**: Auto-intercept, content script, DevTools, manual
- ✅ **Comprehensive Features**: View, analyze, compare, simulate, export
- ✅ **Professional UX**: Popup, viewer, DevTools panel all styled consistently
- ✅ **Type Safety**: Full TypeScript with strict mode
- ✅ **Maintainability**: Clear component structure, library-based parsing
- ✅ **Performance**: Lazy loading, code splitting, efficient rendering
- ✅ **Security**: CSP compliance, XSS prevention, permission minimization

**Scales From:**
- Simple manifest viewing (Phase 6)
- To full streaming analysis suite (Phase 24)

**Built On:**
- Proven patterns from abr-manifest-viewer-chrome
- Modern libraries and tools
- Chrome Extension best practices
- React component architecture

Ready for phased implementation per IMPLEMENTATION_PHASES.md.
