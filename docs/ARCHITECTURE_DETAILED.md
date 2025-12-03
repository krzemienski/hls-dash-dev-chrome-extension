# Architecture Documentation

Detailed architecture and design decisions for the HLS + DASH Manifest Viewer Chrome Extension.

## Table of Contents

1. [Overview](#overview)
2. [Extension Architecture](#extension-architecture)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Data Flow](#data-flow)
6. [Build System](#build-system)
7. [Testing Architecture](#testing-architecture)
8. [Security Architecture](#security-architecture)

## Overview

The HLS + DASH Manifest Viewer is a Chrome Extension (Manifest V3) built with React, TypeScript, and Vite. It follows a multi-context architecture with separate bundles for different extension contexts.

**Core Design Principles:**
1. **Separation of Concerns** - Each context handles specific responsibilities
2. **Type Safety** - Full TypeScript coverage with strict mode
3. **Test-Driven Development** - 124 tests covering critical paths
4. **Progressive Enhancement** - Works standalone for testing
5. **Performance First** - Code splitting and lazy loading

## Extension Architecture

### Multi-Context Design

```
┌─────────────────────────────────────────────────────┐
│              Chrome Extension V3                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Service    │◄────►│   Content    │            │
│  │   Worker     │      │   Script     │            │
│  │ (Background) │      │  (Injected)  │            │
│  └──────────────┘      └──────────────┘            │
│         ▲                      │                    │
│         │                      ▼                    │
│         │              ┌──────────────┐            │
│         │              │   Web Page   │            │
│         │              │     DOM      │            │
│         │              └──────────────┘            │
│         │                                          │
│         ├──────────────────┬───────────────┐      │
│         ▼                  ▼               ▼      │
│  ┌──────────────┐   ┌──────────────┐ ┌─────────┐│
│  │    Popup     │   │    Viewer    │ │DevTools ││
│  │  (400x600)   │   │  (Full Page) │ │ Panel   ││
│  └──────────────┘   └──────────────┘ └─────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
```

### Context Responsibilities

#### 1. Service Worker (Background)
**File:** `src/background/service-worker.ts`
**Purpose:** Central message hub and data coordinator

**Responsibilities:**
- Message routing from all contexts
- Manifest fetching (uses Fetch API)
- Storage management (chrome.storage.local)
- Detected manifests tracking (per-tab)
- Context menu creation
- Tab lifecycle management

**Message Handlers:**
- `fetch-manifest` - Fetch and return manifest content
- `get-detected` - Return detected manifests for tab
- `update-ignore-list` - Modify ignored URLs
- `update-settings` - Save user preferences
- `clear-history` - Clear manifest history
- `manifests-detected` - Store detected manifests from content script

**Lifecycle:**
- Starts on extension install/update/browser start
- Remains active while extension is enabled
- Handles onInstalled event for setup
- Manages tab cleanup on tab close

#### 2. Content Script (Injected)
**File:** `src/content/content-script.ts`
**Purpose:** Detect manifests on web pages

**Responsibilities:**
- Scan DOM for manifest URLs (.m3u8, .mpd)
- Monitor DOM changes (MutationObserver)
- Track detected manifests per page
- Send detection events to service worker
- Respond to manifest queries from popup/devtools

**Detection Strategy:**
```javascript
// Scans:
1. All <a> elements with manifest extensions
2. <video> and <source> elements
3. Dynamically added elements (via MutationObserver)

// Tracks:
{
  url: string,
  format: 'hls' | 'dash',
  source: 'link' | 'xhr' | 'video-src',
  pageUrl: string
}
```

**Injection:**
- Runs on all URLs (`<all_urls>`)
- document_idle timing (after DOM ready)
- Isolated world (cannot access page JS)

#### 3. Popup (Toolbar Icon)
**File:** `src/popup/popup.tsx`
**Dimensions:** 400px × 600px
**Purpose:** Quick access to detected manifests

**Features:**
- **Detected Tab:**
  - Shows manifests from current tab
  - Click to open in viewer
  - Live updates as manifests detected

- **History Tab:**
  - Recently viewed manifests
  - Timestamp and metadata
  - Click to reopen
  - Clear history option

- **Settings Tab:**
  - Auto-detect toggle
  - Theme preference (light/dark/auto)
  - Default view mode
  - Save/load from storage

**State:**
- Local React state (not shared)
- Fetches from service worker on mount
- Updates on tab switch

#### 4. Viewer (Full Page)
**File:** `src/viewer/viewer.tsx`
**Purpose:** Comprehensive manifest analysis

**View Modes:**
1. **Raw** - Syntax-highlighted source
2. **Structured** - 15+ analysis sections
3. **Timeline** - Playback simulation

**State Management:**
- Zustand global store
- Persistent across viewer sessions
- Cleared on page unload

**URL Hash Parameter:**
- Manifest URL passed via hash (#)
- Auto-loads on page load
- Enables deep linking

#### 5. DevTools Panel
**File:** `src/devtools/panel.tsx`
**Purpose:** Developer-focused manifest monitoring

**Features:**
- Real-time manifest detection
- Polls service worker every 2s
- Shows all detected manifests for inspected tab
- Copy and analyze buttons
- Integrated with Chrome DevTools

**Integration:**
- Registered via `devtools.html`
- Access to `chrome.devtools.inspectedWindow.tabId`
- Separate panel in DevTools

## Component Architecture

### Component Hierarchy

```
Viewer (Root)
├── ErrorBoundary
├── ToastContainer
├── ViewerHeader
│   ├── View tabs (Raw/Structured/Timeline)
│   └── ExportMenu
├── UrlInput
└── Content (based on selectedView)
    ├── RawView
    │   └── Prism syntax highlighter
    ├── StructuredView
    │   ├── ValidationReport
    │   ├── StatsDashboard
    │   ├── UrlInfoPanel
    │   ├── ProtocolInfoPanel
    │   ├── DRMInfoPanel
    │   ├── Metadata Section
    │   ├── ABRLadder
    │   ├── BitrateChart
    │   ├── CodecInfoPanel
    │   ├── BandwidthCalculator
    │   ├── PerformanceMetrics
    │   ├── VariantComparison
    │   ├── ResolutionAnalysis
    │   ├── FrameRateAnalysis
    │   ├── VariantList
    │   │   ├── VariantCard (multiple)
    │   │   └── VariantDetailModal
    │   ├── SegmentList (if present)
    │   └── DownloadManager (if segments)
    └── TimelineView
        ├── Playback controls
        ├── Simulation stats
        ├── Timeline visualization
        └── Quality switch events
```

### Component Design Patterns

**Container/Presentational:**
- Container components handle state and logic
- Presentational components receive props and render
- Example: VariantList (container) → VariantCard (presentational)

**Compound Components:**
- Related components grouped together
- Shared context when needed
- Example: ExportMenu with dropdown items

**Render Props:**
- Not heavily used (prefer hooks)
- Used for flexible rendering

**Higher-Order Components:**
- ErrorBoundary wraps root components
- Provides error recovery

## State Management

### Zustand Store Architecture

**manifest-store.ts:**
```typescript
interface ManifestState {
  // Data
  manifest: ParsedManifest | null;

  // UI State
  loading: boolean;
  error: string | null;
  selectedView: 'raw' | 'structured' | 'timeline';
  selectedVariantId: string | null;

  // Actions (setters)
  setManifest: (manifest: ParsedManifest) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedView: (view) => void;
  setSelectedVariant: (variantId: string | null) => void;
  clearManifest: () => void;
}
```

**Why Zustand:**
- Minimal boilerplate
- No Provider wrapper needed
- Selector-based subscriptions
- DevTools support
- Small bundle size (3KB)

**Store Usage:**
```typescript
// Subscribe to specific slice
const manifest = useManifestStore((state) => state.manifest);

// Multiple selectors in one component
const { loading, error } = useManifestStore((state) => ({
  loading: state.loading,
  error: state.error
}));

// Actions
const setManifest = useManifestStore((state) => state.setManifest);
```

### Local Component State

**When to use useState:**
- UI-only state (dropdowns, modals)
- Component-specific data
- Temporary values
- Not shared across components

**Examples:**
- Modal open/close state
- Form input values
- Active tab selection
- Expanded sections

### Chrome Storage

**Persistent Data:**
```typescript
// History (chrome.storage.local)
interface ManifestHistoryItem {
  url: string;
  format: ManifestFormat;
  timestamp: number;
  variantCount: number;
  duration?: number;
  title?: string;
}

// Settings (chrome.storage.local)
interface ExtensionSettings {
  autoInterceptEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'raw' | 'structured' | 'timeline';
  syntaxTheme: string;
  ignoredUrls: string[];
  safelist: string[];
}
```

**Storage Utilities:**
- `getHistory()` - Retrieve history array
- `addToHistory(item)` - Add with deduplication
- `clearHistory()` - Remove all
- `getSettings()` - Get with defaults
- `updateSettings(partial)` - Merge and save

**Limits:**
- History: 50 items max
- Auto-cleanup of oldest items
- Settings: ~1KB typical size

## Data Flow

### Manifest Loading Flow

```
User Action (Popup/Viewer)
    │
    ▼
chrome.runtime.sendMessage({
  action: 'fetch-manifest',
  url: '...'
})
    │
    ▼
Service Worker
  │
  ├─► Fetch manifest from URL
  │     │
  │     ├─► Success: Return content
  │     └─► Error: Return error message
  │
  ▼
Response to sender
    │
    ▼
Viewer/Popup
  │
  ├─► Parse manifest (detectFormat → parseHLS/parseDASH)
  │
  ├─► Update Zustand store
  │
  ├─► Add to history (chrome.storage.local)
  │
  └─► Re-render components
```

### Detection Flow

```
Page Load
    │
    ▼
Content Script Injected
    │
    ├─► scanDOMForManifests()
    │     │
    │     ├─► Query all <a> elements
    │     ├─► Query <video> elements
    │     └─► Return manifest URLs
    │
    ├─► Store detected manifests
    │
    └─► chrome.runtime.sendMessage({
          action: 'manifests-detected',
          manifests: [...],
          tabId: ...
        })
              │
              ▼
        Service Worker
              │
              └─► Store in detectedManifestsMap
                    │
                    ▼
        Available for popup/devtools queries
```

### Message Routing

**Central Router:**
```typescript
// message-router.ts
export async function handleMessage(
  message: ExtensionMessage,
  sender: MessageSender
): Promise<ExtensionResponse>
```

**Message Types:**
```typescript
type ExtensionMessage =
  | FetchManifestMessage      // Fetch manifest content
  | UpdateIgnoreListMessage   // Modify ignored URLs
  | GetDetectedManifestsMessage // Query detected manifests
  | UpdateSettingsMessage     // Save preferences
  | ClearHistoryMessage;      // Clear history
```

**Response Format:**
```typescript
interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Build System

### Vite Configuration

**Multi-Entry Build:**
```typescript
rollupOptions: {
  input: {
    'service-worker': 'src/background/service-worker.ts',
    'content-script': 'src/content/content-script.ts',
    popup: 'src/popup/popup.html',
    viewer: 'src/viewer/viewer.html',
    devtools: 'src/devtools/devtools.html',
    panel: 'src/devtools/panel.html'
  }
}
```

**Output Structure:**
```
dist/
├── manifest.json (copied from public/)
├── rules.json (copied from public/)
├── icons/ (copied from public/)
├── service-worker.js (standalone)
├── content-script.js (standalone)
├── assets/
│   ├── globals-*.js (shared React/Zustand)
│   ├── storage-*.js (shared storage utils)
│   ├── ErrorBoundary-*.js (shared component)
│   ├── viewer-*.js (viewer-specific)
│   ├── popup-*.js (popup-specific)
│   ├── panel-*.js (panel-specific)
│   └── globals-*.css (Tailwind output)
└── src/
    ├── viewer/viewer.html
    ├── popup/popup.html
    └── devtools/
        ├── devtools.html
        └── panel.html
```

**Entry File Naming:**
```typescript
entryFileNames: (chunkInfo) => {
  // Service worker and content script: root level
  if (chunkInfo.name === 'service-worker') return 'service-worker.js';
  if (chunkInfo.name === 'content-script') return 'content-script.js';

  // Everything else: hashed assets
  return 'assets/[name]-[hash].js';
}
```

### TypeScript Configuration

**Compiler Options:**
```json
{
  "target": "ES2020",
  "module": "ESNext",
  "moduleResolution": "bundler",
  "jsx": "react-jsx",
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "types": ["chrome", "vite/client"]
}
```

**Why These Settings:**
- ES2020: Modern features, good browser support
- Strict mode: Maximum type safety
- react-jsx: New JSX transform (no React import needed)
- bundler resolution: Vite-optimized
- Chrome types: Extension API access

### Tailwind CSS Integration

**Configuration:**
```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  // ... theme extensions
}
```

**Build Process:**
1. Tailwind scans all source files
2. Generates utility classes used
3. Vite plugin processes @import "tailwindcss"
4. Outputs to assets/globals-*.css
5. Single CSS file for all contexts

**Optimization:**
- Only used classes included
- Automatic purging
- ~35KB gzipped output

## Component Architecture

### Atomic Design Methodology

**Atoms (Smallest):**
- Skeleton components
- Toast notifications
- Buttons (implicit via Tailwind)

**Molecules:**
- VariantCard
- SegmentCard (in SegmentList)
- Statistic cards
- Filter controls

**Organisms:**
- VariantList (list of VariantCards)
- SegmentList
- ExportMenu
- QuickActions
- ValidationReport

**Templates:**
- RawView
- StructuredView
- TimelineView

**Pages:**
- Viewer (composes templates)
- Popup (composes tabs)
- DevToolsPanel

### Component Communication

**Props Down:**
```typescript
// Parent passes data to children
<VariantList variants={manifest.variants} />
```

**Events Up:**
```typescript
// Children notify parents via callbacks
<VariantCard onSelect={() => handleSelect(id)} />
```

**Global State (Zustand):**
```typescript
// Any component can access
const manifest = useManifestStore(state => state.manifest);
const setManifest = useManifestStore(state => state.setManifest);
```

### Component Patterns

**Container Component Pattern:**
```typescript
// Container: Logic and state
export function VariantList({ variants }: Props) {
  const selectedId = useManifestStore(s => s.selectedVariantId);
  const setSelected = useManifestStore(s => s.setSelectedVariant);

  return variants.map(v =>
    <VariantCard
      variant={v}
      selected={v.id === selectedId}
      onSelect={() => setSelected(v.id)}
    />
  );
}

// Presentational: Pure rendering
function VariantCard({ variant, selected, onSelect }: Props) {
  return (
    <div onClick={onSelect} className={selected ? 'selected' : ''}>
      {variant.bitrate}
    </div>
  );
}
```

**Composition Pattern:**
```typescript
// Parent composes children
export function StructuredView({ manifest }: Props) {
  return (
    <>
      <ValidationReport manifest={manifest} />
      <StatsDashboard manifest={manifest} />
      <ABRLadder manifest={manifest} />
      {/* ... 12 more sections */}
    </>
  );
}
```

**Conditional Rendering:**
```typescript
// Only render if data available
{manifest.segments && (
  <SegmentList segments={manifest.segments} />
)}

{videoVariants.length > 0 && (
  <VideoVariantsSection variants={videoVariants} />
)}
```

## State Management

### Store Design

**Single Store Strategy:**
- One Zustand store for manifest data
- Keeps related state together
- Easier to reason about
- No prop drilling

**State Slices:**
```typescript
// Data slice
manifest: ParsedManifest | null

// UI slice
loading: boolean
error: string | null
selectedView: 'raw' | 'structured' | 'timeline'
selectedVariantId: string | null

// Actions slice
setManifest: (manifest) => void
setLoading: (loading) => void
// ... more actions
```

**Selector Best Practices:**
```typescript
// ✅ Good: Select only what you need
const loading = useManifestStore(state => state.loading);

// ❌ Avoid: Select entire store
const store = useManifestStore();

// ✅ Better: Combine related selectors
const { loading, error } = useManifestStore(state => ({
  loading: state.loading,
  error: state.error
}));
```

### Storage Architecture

**Multi-Layer Storage:**

```
┌─────────────────────────────────────┐
│     In-Memory (Service Worker)      │
│  detectedManifestsMap: Map<tabId,  │
│                        manifests[]> │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Chrome Storage (Persistent)       │
│  - history: ManifestHistoryItem[]   │
│  - settings: ExtensionSettings      │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│    IndexedDB (Future)               │
│  - Large manifests                  │
│  - Cached parse results             │
└─────────────────────────────────────┘
```

**Why This Design:**
- In-memory: Fast access, auto-cleanup
- Chrome storage: Persists across sessions
- IndexedDB: Future for large data

### State Synchronization

**Between Contexts:**
- Service worker is source of truth for detected manifests
- Popup/DevTools query service worker
- Viewer has independent state (Zustand)
- No direct communication between popup and viewer

**Storage Events:**
```typescript
// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.settings) {
    // Update UI based on new settings
  }
});
```

## Data Flow

### Fetch Flow (Detailed)

```
┌──────────────────────────────────────────────────────┐
│ 1. User enters URL in Viewer                         │
│    - UrlInput.tsx handles form submission            │
│    - Validates URL format                            │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 2. Check Extension Context                           │
│    if (chrome?.runtime) {                            │
│      // Use service worker                           │
│    } else {                                          │
│      // Direct fetch (testing mode)                  │
│    }                                                 │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 3. Service Worker Fetch                              │
│    - fetchManifestContent(url)                       │
│    - Uses Fetch API with headers                     │
│    - Accept: application/vnd.apple.mpegurl, ...      │
│    - Handles CORS, 404, network errors               │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 4. Return to Viewer                                  │
│    response: {                                       │
│      success: true,                                  │
│      data: manifestContent                           │
│    }                                                 │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 5. Format Detection                                  │
│    - detectManifestFormat(content)                   │
│    - Checks for #EXTM3U (HLS) or <MPD (DASH)        │
│    - Returns 'hls' or 'dash'                         │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 6. Parse Manifest                                    │
│    - parseManifest(content, url)                     │
│    - Routes to parseHLS() or parseDASH()             │
│    - Returns ParsedManifest object                   │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 7. Store in Zustand                                  │
│    - setManifest(parsed)                             │
│    - Triggers re-render of all subscribers           │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 8. Save to History                                   │
│    - addToHistory({                                  │
│        url, format, timestamp,                       │
│        variantCount, duration                        │
│      })                                              │
│    - chrome.storage.local.set(...)                   │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 9. Components Re-render                              │
│    - All components subscribed to manifest           │
│    - ViewerHeader shows manifest info                │
│    - Content view displays based on selectedView     │
│    - QuickActions FAB appears                        │
└──────────────────────────────────────────────────────┘
```

### Detection Flow (Detailed)

```
┌──────────────────────────────────────────────────────┐
│ 1. Page Loads                                        │
│    - Content script injected                         │
│    - Runs at document_idle                           │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 2. Initial Scan                                      │
│    - scanDOMForManifests()                           │
│    - document.querySelectorAll('a[href]')            │
│    - document.querySelectorAll('video[src]')         │
│    - Filter for .m3u8 and .mpd extensions           │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 3. Process Found URLs                                │
│    - getFormatFromUrl(url) → 'hls' | 'dash'        │
│    - Check if already detected                       │
│    - Create DetectedManifest object                  │
│    - Add to local array                              │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 4. Notify Service Worker                            │
│    chrome.runtime.sendMessage({                      │
│      action: 'manifests-detected',                   │
│      manifests: [...],                               │
│      tabId: chrome.devtools?.inspectedWindow?.tabId │
│    })                                                │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 5. Service Worker Storage                           │
│    - addDetectedManifest(tabId, manifest)            │
│    - Store in detectedManifestsMap                   │
│    - Deduplicate by URL                              │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 6. Setup DOM Observer                                │
│    const observer = new MutationObserver(() => {     │
│      detectManifestsOnPage();                        │
│    });                                               │
│    observer.observe(document.body, {                 │
│      childList: true, subtree: true                  │
│    });                                               │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│ 7. Available for Queries                             │
│    - Popup requests: get-detected action             │
│    - DevTools polls every 2s                         │
│    - Returns current detection state                 │
└──────────────────────────────────────────────────────┘
```

## Build System (Detailed)

### Development Workflow

```bash
# Development (Watch Mode)
npm run dev
  │
  ├─► Vite build --watch
  │     │
  │     ├─► TypeScript compilation
  │     ├─► React transformation
  │     ├─► Tailwind processing
  │     └─► Output to dist/
  │
  └─► Rebuilds on file changes
```

### Production Build

```bash
npm run build
  │
  ├─► TypeScript compiler (tsc)
  │     │
  │     └─► Type checking only (noEmit: true)
  │
  └─► Vite build
        │
        ├─► Rollup bundling
        ├─► Minification
        ├─► Code splitting
        ├─► Asset optimization
        └─► Output to dist/
```

### Asset Pipeline

**JavaScript:**
```
Source (.ts/.tsx)
  │
  ├─► TypeScript → JavaScript (ES2020)
  ├─► JSX → React.createElement calls
  ├─► Import resolution
  ├─► Tree shaking
  ├─► Minification
  └─► Output with content hash
```

**CSS:**
```
Source (globals.css with @import "tailwindcss")
  │
  ├─► Tailwind processes directives
  ├─► Scans source for class names
  ├─► Generates utility classes
  ├─► PostCSS processing
  ├─► Minification
  └─► Output with content hash
```

**Static Assets:**
```
public/
  │
  ├─► manifest.json → dist/manifest.json
  ├─► rules.json → dist/rules.json
  └─► icons/ → dist/icons/
```

### Code Splitting Strategy

**Automatic Splits:**
1. **Vendor chunk**: React, ReactDOM, Zustand
2. **Shared utilities**: Parsers, utils
3. **View-specific**: Each view mode
4. **Lazy loaded**: Modals, heavy components (future)

**Manual Splits (Future):**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

## Testing Architecture

### Test Structure

```
tests/
├── parsers/          # Parser unit tests
│   ├── format-detector.test.ts
│   ├── hls-parser.test.ts
│   ├── dash-parser.test.ts
│   └── unified-parser.test.ts
├── utils/            # Utility function tests
│   ├── url-resolver.test.ts
│   ├── abr-analysis.test.ts
│   ├── codec-analyzer.test.ts
│   ├── resolution-analyzer.test.ts
│   ├── framerate-analyzer.test.ts
│   ├── streaming-protocol.test.ts
│   ├── drm-detector.test.ts
│   ├── url-analyzer.test.ts
│   └── manifest-diff.test.ts
├── export/           # Export function tests
│   └── exporters.test.ts
├── fetchers/         # Network fetcher tests
│   └── manifest-fetcher.test.ts
├── simulation/       # Simulation tests
│   └── playback-simulator.test.ts
├── validation/       # Validation tests
│   └── manifest-validator.test.ts
└── fixtures/         # Test data
    ├── bipbop-master.m3u8
    └── sample-dash.mpd
```

### Test Categories

**1. Parser Tests (16 tests)**
- Format detection
- HLS parsing
- DASH parsing
- URL resolution
- Unified parser

**2. Utility Tests (78 tests)**
- ABR analysis
- Codec detection
- URL analysis
- Resolution analysis
- Frame rate analysis
- Protocol detection
- DRM detection
- Manifest diffing

**3. Feature Tests (20 tests)**
- Export functionality
- Playback simulation
- Manifest validation
- Fetcher error handling

### Testing Strategy

**TDD Approach:**
1. Write failing test
2. Run test (verify failure)
3. Implement feature
4. Run test (verify pass)
5. Commit

**Test Coverage Goals:**
- Parsers: 100% (critical path)
- Utilities: 95%
- Export: 100%
- UI Components: Manual testing

**Why Not Test Components:**
- React component testing complex in extension context
- Requires mocking chrome APIs
- Manual testing more reliable for UI
- Playwright tests cover integration

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Not jsdom - no DOM needed
  }
});
```

**Why Node Environment:**
- Parser tests don't need DOM
- Faster execution
- No browser simulation overhead
- Pure function testing

## Security Architecture

### Content Security Policy

**Manifest V3 CSP:**
```json
{
  "manifest_version": 3,
  // Implicit CSP:
  // - No inline scripts
  // - No eval()
  // - No remote code loading
}
```

**Compliance:**
- All code in bundled files
- No innerHTML with user content
- No dynamic script injection
- Sanitized text content only

### XSS Prevention

**Input Sanitization:**
```typescript
// ✅ Safe: Text content only
<div>{manifest.url}</div>

// ✅ Safe: React auto-escapes
<span>{userInput}</span>

// ❌ Avoided: innerHTML
// element.innerHTML = userContent; // Never used
```

**URL Handling:**
```typescript
// Validate URLs before use
try {
  new URL(userInput); // Throws if invalid
} catch {
  // Handle error
}
```

### Permission Model

**Minimum Permissions:**
```json
{
  "permissions": [
    "declarativeNetRequest",        // URL pattern matching
    "declarativeNetRequestWithHostAccess", // Host permissions
    "storage",                      // Chrome storage API
    "tabs",                         // Tab management
    "contextMenus"                  // Right-click menu
  ],
  "host_permissions": [
    "*://*/*.m3u8*",                // HLS manifests
    "*://*/*.mpd*"                  // DASH manifests
  ]
}
```

**Why These Permissions:**
- **declarativeNetRequest**: Match manifest URL patterns (future network intercept)
- **storage**: Save history and settings
- **tabs**: Open viewer tabs, get current tab
- **contextMenus**: Right-click "Analyze" option
- **host_permissions**: Fetch any manifest URL

**NOT Requested:**
- `<all_urls>` - Too broad
- `webRequest` - Deprecated in V3
- `cookies` - Not needed
- `history` - Not needed
- `bookmarks` - Not needed

### Data Privacy

**No External Requests:**
- All manifest fetches go directly to source
- No intermediary servers
- No analytics
- No tracking

**Local Processing:**
- All parsing happens in browser
- No data sent to external APIs
- No cloud storage
- User data never leaves device

**Temporary Storage:**
- In-memory: Cleared on tab close
- Chrome storage: User can clear
- No permanent storage of manifest content
- Only metadata in history

### Secure Coding Practices

**Type Safety:**
- Strict TypeScript mode
- No `any` types (except limited cases)
- Proper null checking
- Type guards for chrome APIs

**Error Handling:**
```typescript
// ✅ Always try-catch async operations
try {
  const data = await fetchManifest(url);
} catch (error) {
  // Handle specific error types
  if (error instanceof ManifestFetchError) {
    // Show user-friendly message
  }
}
```

**Input Validation:**
```typescript
// ✅ Validate before processing
if (!url || !url.trim()) {
  throw new Error('URL required');
}

// ✅ Sanitize for display
const safeUrl = url.trim();
```

## Performance Architecture

### Optimization Strategies

**1. Code Splitting:**
- Automatic via Vite/Rollup
- Shared dependencies extracted
- View-specific code separated
- Lazy loading (future)

**2. Memoization:**
```typescript
// Expensive calculations cached
const analysis = useMemo(() =>
  analyzeBitrateLadder(variants),
  [variants]
);

// Stable callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

**3. Conditional Rendering:**
```typescript
// Only render when needed
{manifest && <ExpensiveComponent manifest={manifest} />}

// Progressive disclosure
{showDetails && <DetailedView />}
```

**4. Virtual Scrolling (Future):**
```typescript
// For large lists (1000+ items)
<VirtualList
  items={segments}
  height={600}
  itemHeight={50}
  renderItem={(segment) => <SegmentCard {...segment} />}
/>
```

### Bundle Optimization

**Tree Shaking:**
- Vite removes unused code
- Import only what's needed
- Dead code elimination

**Minification:**
- Terser for JavaScript
- cssnano for CSS
- Removes whitespace, comments
- Mangles variable names

**Compression:**
- Gzip compression enabled
- ~70% size reduction
- Served pre-compressed

### Runtime Performance

**React Performance:**
```typescript
// ✅ Avoid unnecessary re-renders
const MemoizedComponent = memo(ExpensiveComponent);

// ✅ Bail out early
if (!manifest) return null;

// ✅ Use keys properly
variants.map(v => <VariantCard key={v.id} variant={v} />)
```

**DOM Updates:**
- Batch updates via React
- Virtual DOM diffing
- Minimal actual DOM changes

**Memory Management:**
- Clear old manifests
- Cleanup event listeners
- Remove observers on unmount

## Extension Lifecycle

### Installation

```
Install Extension
  │
  ▼
chrome.runtime.onInstalled fires
  │
  ├─► Service worker starts
  ├─► Create context menus
  ├─► Initialize storage (if first install)
  └─► Log install reason (install/update)
```

### Runtime

```
Extension Active
  │
  ├─► Service Worker (always running)
  │     ├─► Listen for messages
  │     ├─► Manage storage
  │     └─► Track detected manifests
  │
  ├─► Content Scripts (on matching pages)
  │     ├─► Scan DOM
  │     ├─► Monitor changes
  │     └─► Report detections
  │
  └─► UI Contexts (on demand)
        ├─► Popup (when icon clicked)
        ├─► Viewer (when tab opened)
        └─► DevTools (when panel opened)
```

### Update

```
Extension Updated
  │
  ▼
chrome.runtime.onInstalled fires (reason: 'update')
  │
  ├─► Service worker restarts
  ├─► Existing tabs keep old content scripts
  ├─► New tabs get new content scripts
  └─► Reload required for full update
```

### Uninstall

```
Uninstall Extension
  │
  ├─► Service worker stopped
  ├─► Content scripts removed
  ├─► Storage cleared (optional)
  ├─► Context menus removed
  └─► All tabs revert to normal
```

## Error Recovery Architecture

### Error Boundary Strategy

**Component Tree Protection:**
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Caught Errors:**
- React component errors
- Render errors
- Lifecycle errors

**Not Caught:**
- Event handler errors (use try-catch)
- Async errors (use .catch())
- Service worker errors (separate context)

### Graceful Degradation

**Missing Chrome APIs:**
```typescript
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Extension context
} else {
  // Standalone/testing mode
  // Fallback to direct fetch
}
```

**Parser Failures:**
```typescript
try {
  const parsed = parseManifest(content, url);
} catch (error) {
  // Show error in UI
  // Don't crash entire app
  // Offer retry option
}
```

**Network Failures:**
```typescript
// Specific error messages
if (response.status === 404) {
  throw new ManifestFetchError('Manifest not found');
}

if (error instanceof TypeError) {
  throw new ManifestFetchError('Network error - check CORS');
}
```

## Future Architecture Considerations

### Scalability

**Planned Improvements:**
1. IndexedDB for large manifests
2. Worker threads for parsing
3. Virtual scrolling for huge lists
4. Paginated API responses

### Extensibility

**Plugin System (Future):**
```typescript
interface ManifestPlugin {
  name: string;
  analyze: (manifest: ParsedManifest) => Analysis;
  render: (analysis: Analysis) => ReactElement;
}

// Register custom analyzers
registerPlugin(customAnalyzer);
```

### Performance Monitoring

**Planned Metrics:**
- Parse time tracking
- Render performance
- Memory usage
- Network timing

This architecture supports a scalable, maintainable, and performant Chrome extension while maintaining security and user privacy.
