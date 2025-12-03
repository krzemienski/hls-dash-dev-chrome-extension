# HLS + DASH Manifest Viewer Chrome Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Chrome Extension (Manifest V3) that detects, parses, and visualizes HLS (M3U8) and DASH (MPD) streaming manifests with ABR analysis, variant comparison, playback simulation, and comprehensive export tools.

**Architecture:** Multi-context extension with Service Worker (background), Popup (toolbar), Viewer (full-page), DevTools Panel, and Content Script (page detection). Uses declarativeNetRequest for URL interception, @videojs parsing libraries for manifest processing, React + TypeScript for UI, and chrome.storage for state persistence.

**Tech Stack:** Vite, React 18, TypeScript 5.7, Tailwind CSS v4, @videojs/m3u8-parser, @videojs/mpd-parser, Zustand, Prism.js, Chrome Extension Manifest V3

**Reference Analysis:** Complete analysis in docs/ANALYSIS.md (14 files from 2 reference repos analyzed)

**Testing Strategy:** TDD for pure functions (parsers, utilities), manual Chrome browser verification for extension APIs, production testing only (no mocks)

---

## PHASE 1: Project Infrastructure Setup

### Task 1.1: Initialize Project Structure

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.json`

**Step 1: Initialize npm project**

```bash
cd /Users/nick/Desktop/hls-dash-dev-chrome-extension
npm init -y
```

Expected output: `package.json` created

**Step 2: Create .gitignore**

```bash
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.DS_Store
*.log
.vite/
.turbo/
coverage/
.env
.env.local
EOF
```

**Step 3: Install core dependencies**

```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install -D vite@^6.0.0 @vitejs/plugin-react@^4.3.4
npm install -D typescript@^5.7.2 @types/react@^18.3.1 @types/react-dom@^18.3.1 @types/chrome@^0.0.280
```

Expected: Dependencies installed, package.json updated

**Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["chrome", "vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 5: Commit infrastructure**

```bash
git add package.json package-lock.json .gitignore tsconfig.json
git commit -m "feat: initialize project with npm, TypeScript, and Vite"
```

---

### Task 1.2: Configure Vite Build for Chrome Extension

**Files:**
- Create: `vite.config.ts`
- Create: `tsconfig.node.json`

**Step 1: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Service worker (background)
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),

        // Content script
        'content-script': resolve(__dirname, 'src/content/content-script.ts'),

        // HTML pages
        popup: resolve(__dirname, 'src/popup/popup.html'),
        viewer: resolve(__dirname, 'src/viewer/viewer.html'),
        devtools: resolve(__dirname, 'src/devtools/devtools.html'),
        panel: resolve(__dirname, 'src/devtools/panel.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js';
          }
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  publicDir: 'public',
});
```

**Step 3: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vite build --watch",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

**Step 4: Commit Vite configuration**

```bash
git add vite.config.ts tsconfig.node.json package.json
git commit -m "feat: configure Vite for Chrome extension multi-entry build"
```

---

### Task 1.3: Create Directory Structure

**Step 1: Create all directories**

```bash
mkdir -p src/{background,content,popup,viewer,devtools,lib/{parsers,utils,export,simulation,validation},components,types,styles}
mkdir -p public/icons
mkdir -p tests/{parsers,utils,components}
```

**Step 2: Verify structure**

```bash
tree -L 3 src/
```

Expected: Directory tree showing all folders

**Step 3: Commit structure**

```bash
git add src/ public/ tests/
git commit -m "feat: create project directory structure"
```

---

### Task 1.4: Create Manifest V3 Configuration

**Files:**
- Create: `public/manifest.json`
- Create: `public/rules.json`

**Step 1: Create public/manifest.json**

```json
{
  "manifest_version": 3,
  "name": "HLS + DASH Manifest Viewer Pro",
  "version": "1.0.0",
  "description": "View and analyze HLS (M3U8) and DASH (MPD) streaming manifests with ABR visualization, variant comparison, and playback simulation.",

  "permissions": [
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess",
    "storage",
    "tabs",
    "contextMenus"
  ],

  "host_permissions": [
    "*://*/*.m3u8*",
    "*://*/*.mpd*"
  ],

  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-script.js"],
      "run_at": "document_idle"
    }
  ],

  "devtools_page": "devtools.html",

  "web_accessible_resources": [
    {
      "resources": ["viewer.html"],
      "matches": ["<all_urls>"]
    }
  ],

  "declarative_net_request": {
    "rule_resources": [
      {
        "id": "manifest_rules",
        "enabled": true,
        "path": "rules.json"
      }
    ]
  },

  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Step 2: Create public/rules.json (empty for now)**

```json
[]
```

**Step 3: Commit manifest**

```bash
git add public/manifest.json public/rules.json
git commit -m "feat: add Chrome Extension Manifest V3 configuration"
```

---

### Task 1.5: Install Parsing and UI Libraries

**Step 1: Install parsing libraries**

```bash
npm install @videojs/m3u8-parser@^7.2.0 @videojs/mpd-parser@^1.3.1
npm install -D @types/videojs__m3u8-parser @types/videojs__mpd-parser
```

**Step 2: Install UI libraries**

```bash
npm install zustand@^5.0.2 prismjs@^1.29.0
npm install -D @types/prismjs@^1.26.0
```

**Step 3: Install Tailwind CSS v4**

```bash
npm install -D tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0
```

**Step 4: Commit dependencies**

```bash
git add package.json package-lock.json
git commit -m "feat: install parsing, UI, and styling libraries"
```

---

### Task 1.6: Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.ts`
- Create: `src/styles/globals.css`

**Step 1: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

**Step 2: Create src/styles/globals.css**

```css
@import "tailwindcss";

/* Custom extension styles */
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Prism.js theme overrides will go here */
```

**Step 3: Update vite.config.ts**

Add to plugins array:
```typescript
import tailwindcss from '@tailwindcss/vite';

plugins: [react(), tailwindcss()],
```

**Step 4: Commit Tailwind config**

```bash
git add tailwind.config.ts src/styles/globals.css vite.config.ts
git commit -m "feat: configure Tailwind CSS v4"
```

---

### Task 1.7: Create Placeholder HTML Pages

**Files:**
- Create: `src/popup/popup.html`
- Create: `src/viewer/viewer.html`
- Create: `src/devtools/devtools.html`
- Create: `src/devtools/panel.html`

**Step 1: Create src/popup/popup.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HLS + DASH Manifest Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./popup.tsx"></script>
  </body>
</html>
```

**Step 2: Create src/viewer/viewer.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manifest Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./viewer.tsx"></script>
  </body>
</html>
```

**Step 3: Create src/devtools/devtools.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>DevTools</title>
  </head>
  <body>
    <script type="module" src="./devtools.ts"></script>
  </body>
</html>
```

**Step 4: Create src/devtools/panel.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manifest Panel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./panel.tsx"></script>
  </body>
</html>
```

**Step 5: Commit HTML files**

```bash
git add src/popup/popup.html src/viewer/viewer.html src/devtools/devtools.html src/devtools/panel.html
git commit -m "feat: create HTML entry points for extension pages"
```

---

### Task 1.8: Create Minimal React Entry Points

**Files:**
- Create: `src/popup/popup.tsx`
- Create: `src/viewer/viewer.tsx`
- Create: `src/devtools/panel.tsx`
- Create: `src/devtools/devtools.ts`

**Step 1: Create src/popup/popup.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function Popup() {
  return (
    <div className="w-[350px] h-[500px] p-4">
      <h1 className="text-xl font-bold">HLS + DASH Viewer</h1>
      <p className="text-sm text-gray-600">Popup loaded successfully</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
```

**Step 2: Create src/viewer/viewer.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function Viewer() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Manifest Viewer</h1>
      <p>Viewer loaded successfully</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Viewer />
  </React.StrictMode>
);
```

**Step 3: Create src/devtools/panel.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function DevToolsPanel() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">Manifest Panel</h1>
      <p className="text-sm">DevTools panel loaded</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DevToolsPanel />
  </React.StrictMode>
);
```

**Step 4: Create src/devtools/devtools.ts**

```typescript
// Register the DevTools panel
chrome.devtools.panels.create(
  'Manifests',
  '', // No icon yet
  'panel.html',
  (panel) => {
    console.log('Manifest viewer panel created');
  }
);
```

**Step 5: Commit React entry points**

```bash
git add src/popup/popup.tsx src/viewer/viewer.tsx src/devtools/panel.tsx src/devtools/devtools.ts
git commit -m "feat: create minimal React entry points for all extension pages"
```

---

### Task 1.9: Create Placeholder Service Worker and Content Script

**Files:**
- Create: `src/background/service-worker.ts`
- Create: `src/content/content-script.ts`

**Step 1: Create src/background/service-worker.ts**

```typescript
// Service worker for Chrome Extension Manifest V3
console.log('Service worker loaded');

// Keep service worker alive
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

// Message handler placeholder
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  sendResponse({ success: true });
  return true; // Required for async response
});
```

**Step 2: Create src/content/content-script.ts**

```typescript
// Content script injected on all pages
console.log('Content script loaded on:', window.location.href);

// Placeholder - will implement manifest detection later
```

**Step 3: Commit scripts**

```bash
git add src/background/service-worker.ts src/content/content-script.ts
git commit -m "feat: create placeholder service worker and content script"
```

---

### Task 1.10: Create Temporary Icons and Test Build

**Step 1: Create placeholder icons**

```bash
# Create simple colored squares as placeholder icons (will replace in Phase 23)
# Using ImageMagick or similar - for now, just create empty files for build test
touch public/icons/icon16.png public/icons/icon48.png public/icons/icon128.png
```

**Step 2: Run build**

```bash
npm run build
```

Expected output: `dist/` directory created with:
- service-worker.js
- content-script.js
- popup.html
- viewer.html
- devtools.html
- panel.html
- manifest.json (copied from public/)
- rules.json (copied from public/)
- assets/ folder

**Step 3: Verify manifest.json**

```bash
cat dist/manifest.json | jq .
```

Expected: Valid JSON, manifest_version = 3

**Step 4: Load in Chrome and verify**

Manual steps:
1. Open chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `/Users/nick/Desktop/hls-dash-dev-chrome-extension/dist`
5. Verify: Extension appears in list
6. Verify: Icon appears in toolbar
7. Click icon → popup should open showing "Popup loaded successfully"
8. Open DevTools → "Manifests" tab should appear
9. Check console → no errors

**Step 5: Commit if build succeeds**

```bash
git add public/icons/
git commit -m "feat: add placeholder icons and verify build pipeline"
```

**PHASE 1 VERIFICATION COMPLETE:**
- ✅ npm install works
- ✅ npm run build produces dist/
- ✅ Extension loads in Chrome
- ✅ No console errors
- ✅ All entry points compile

---

## PHASE 2: TypeScript Type Definitions

### Task 2.1: Define Core Message Types

**Files:**
- Create: `src/types/messages.ts`

**Step 1: Write message type definitions**

```typescript
// src/types/messages.ts

export type ExtensionMessage =
  | FetchManifestMessage
  | UpdateIgnoreListMessage
  | GetDetectedManifestsMessage
  | UpdateSettingsMessage
  | ClearHistoryMessage;

export interface FetchManifestMessage {
  action: 'fetch-manifest';
  url: string;
}

export interface UpdateIgnoreListMessage {
  action: 'update-ignore-list';
  url: string;
  ignore: boolean;
}

export interface GetDetectedManifestsMessage {
  action: 'get-detected';
  tabId: number;
}

export interface UpdateSettingsMessage {
  action: 'update-settings';
  settings: Partial<ExtensionSettings>;
}

export interface ClearHistoryMessage {
  action: 'clear-history';
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExtensionSettings {
  autoInterceptEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'raw' | 'structured' | 'timeline';
  syntaxTheme: string;
  ignoredUrls: string[];
  safelist: string[];
}
```

**Step 2: Commit types**

```bash
git add src/types/messages.ts
git commit -m "feat: define extension message and settings types"
```

---

### Task 2.2: Define Manifest Data Types

**Files:**
- Create: `src/types/manifest.ts`

**Step 1: Write manifest type definitions**

```typescript
// src/types/manifest.ts

export type ManifestFormat = 'hls' | 'dash';
export type ManifestType = 'VOD' | 'LIVE' | 'EVENT';
export type VariantType = 'video' | 'audio' | 'subtitle';

export interface ParsedManifest {
  format: ManifestFormat;
  raw: string;
  url: string;
  variants: Variant[];
  metadata: ManifestMetadata;
  segments?: Segment[];
}

export interface Variant {
  id: string;
  bitrate: number; // bits per second
  resolution?: Resolution;
  codecs: string[];
  frameRate?: number;
  url: string;
  type: VariantType;
}

export interface Resolution {
  width: number;
  height: number;
}

export interface ManifestMetadata {
  version?: string;
  duration?: number; // seconds
  targetDuration?: number; // HLS target duration
  minBufferTime?: number; // DASH min buffer time
  type: ManifestType;
  encrypted: boolean;
  profiles?: string[]; // DASH profiles
}

export interface Segment {
  id: string;
  duration: number;
  url: string;
  byteRange?: ByteRange;
  sequence: number;
}

export interface ByteRange {
  start: number;
  end: number;
}

export interface ManifestHistoryItem {
  url: string;
  format: ManifestFormat;
  timestamp: number;
  variantCount: number;
  duration?: number;
  title?: string;
}

export interface DetectedManifest {
  url: string;
  format: ManifestFormat;
  source: 'link' | 'xhr' | 'video-src';
  pageUrl: string;
}
```

**Step 2: Commit manifest types**

```bash
git add src/types/manifest.ts
git commit -m "feat: define manifest data types"
```

---

## PHASE 3: URL Resolution Utilities (TDD)

**Reference:** Adapted from abr-manifest-viewer-chrome/viewer/js/main.js lines 88-108

### Task 3.1: Write Tests for URL Resolution

**Files:**
- Create: `tests/utils/url-resolver.test.ts`

**Step 1: Install Vitest for testing**

```bash
npm install -D vitest@^2.1.0 @vitest/ui@^2.1.0
```

**Step 2: Add test script to package.json**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Step 3: Write failing test for isRelativeUrl**

```typescript
// tests/utils/url-resolver.test.ts
import { describe, it, expect } from 'vitest';
import { isRelativeUrl } from '../../src/lib/utils/url-resolver';

describe('isRelativeUrl', () => {
  it('should return true for relative paths', () => {
    expect(isRelativeUrl('playlist.m3u8')).toBe(true);
    expect(isRelativeUrl('path/to/playlist.m3u8')).toBe(true);
  });

  it('should return true for domain-relative paths', () => {
    expect(isRelativeUrl('/path/playlist.m3u8')).toBe(true);
  });

  it('should return false for absolute URLs', () => {
    expect(isRelativeUrl('https://example.com/playlist.m3u8')).toBe(false);
    expect(isRelativeUrl('http://example.com/playlist.m3u8')).toBe(false);
  });

  it('should return false for protocol-relative URLs', () => {
    expect(isRelativeUrl('//cdn.example.com/playlist.m3u8')).toBe(false);
  });
});
```

**Step 4: Run test to verify it fails**

```bash
npm test url-resolver
```

Expected: FAIL - "Cannot find module '../../src/lib/utils/url-resolver'"

**Step 5: Commit failing test**

```bash
git add tests/utils/url-resolver.test.ts package.json package-lock.json
git commit -m "test: add failing tests for URL resolution utilities"
```

---

### Task 3.2: Implement isRelativeUrl

**Files:**
- Create: `src/lib/utils/url-resolver.ts`

**Step 1: Write minimal implementation**

```typescript
// src/lib/utils/url-resolver.ts

/**
 * Detect if URL is relative (path-relative or domain-relative)
 *
 * Returns true for:
 *   - "playlist.m3u8" (path-relative)
 *   - "/path/playlist.m3u8" (domain-relative)
 *
 * Returns false for:
 *   - "https://example.com/playlist.m3u8" (absolute)
 *   - "//cdn.example.com/playlist.m3u8" (protocol-relative)
 *
 * Adapted from: abr-manifest-viewer-chrome/viewer/js/main.js:88-91
 */
export function isRelativeUrl(url: string): boolean {
  // Test for protocol (http://, https://) or protocol-relative (//)
  return !/^(?:[a-z]+:)?\/\//i.test(url);
}
```

**Step 2: Run test to verify it passes**

```bash
npm test url-resolver
```

Expected: PASS - All tests green

**Step 3: Commit implementation**

```bash
git add src/lib/utils/url-resolver.ts
git commit -m "feat: implement isRelativeUrl utility"
```

---

### Task 3.3: Write Tests for resolveManifestUrl

**Files:**
- Modify: `tests/utils/url-resolver.test.ts`

**Step 1: Add tests for resolveManifestUrl**

```typescript
// tests/utils/url-resolver.test.ts (add to existing file)
import { resolveManifestUrl } from '../../src/lib/utils/url-resolver';

describe('resolveManifestUrl', () => {
  const baseUrl = 'https://example.com/path/to/master.m3u8';

  it('should return absolute URLs unchanged', () => {
    expect(resolveManifestUrl('https://other.com/stream.m3u8', baseUrl))
      .toBe('https://other.com/stream.m3u8');
  });

  it('should resolve path-relative URLs', () => {
    expect(resolveManifestUrl('variant.m3u8', baseUrl))
      .toBe('https://example.com/path/to/variant.m3u8');
  });

  it('should resolve domain-relative URLs', () => {
    expect(resolveManifestUrl('/other/path/variant.m3u8', baseUrl))
      .toBe('https://example.com/other/path/variant.m3u8');
  });

  it('should handle query parameters in base URL', () => {
    const baseWithQuery = 'https://example.com/master.m3u8?token=abc';
    expect(resolveManifestUrl('variant.m3u8', baseWithQuery))
      .toBe('https://example.com/variant.m3u8');
  });

  it('should handle trailing slashes correctly', () => {
    const baseWithSlash = 'https://example.com/path/';
    expect(resolveManifestUrl('variant.m3u8', baseWithSlash))
      .toBe('https://example.com/path/variant.m3u8');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test url-resolver
```

Expected: FAIL - "resolveManifestUrl is not defined"

**Step 3: Commit failing tests**

```bash
git add tests/utils/url-resolver.test.ts
git commit -m "test: add failing tests for resolveManifestUrl"
```

---

### Task 3.4: Implement resolveManifestUrl

**Files:**
- Modify: `src/lib/utils/url-resolver.ts`

**Step 1: Implement URL resolution**

```typescript
// src/lib/utils/url-resolver.ts (add to existing file)

/**
 * Resolve relative URL to absolute URL based on manifest base URL
 *
 * Examples:
 *   Base: https://example.com/path/to/master.m3u8
 *
 *   "variant.m3u8" → "https://example.com/path/to/variant.m3u8"
 *   "/other/variant.m3u8" → "https://example.com/other/variant.m3u8"
 *   "https://cdn.com/variant.m3u8" → "https://cdn.com/variant.m3u8"
 *
 * Adapted from: abr-manifest-viewer-chrome/viewer/js/main.js:93-108
 */
export function resolveManifestUrl(uriReference: string, baseUrl: string): string {
  // Already absolute - return as-is
  if (!isRelativeUrl(uriReference)) {
    return uriReference;
  }

  try {
    const base = new URL(baseUrl);

    if (uriReference.startsWith('/')) {
      // Domain-relative: /path/file.m3u8
      return `${base.origin}${uriReference}`;
    } else {
      // Path-relative: file.m3u8
      // Use URL constructor's built-in resolution
      return new URL(uriReference, baseUrl).toString();
    }
  } catch (error) {
    console.error('Failed to resolve URL:', uriReference, 'with base:', baseUrl, error);
    return uriReference; // Return original on error
  }
}
```

**Step 2: Run tests to verify they pass**

```bash
npm test url-resolver
```

Expected: PASS - All 9 tests green

**Step 3: Commit implementation**

```bash
git add src/lib/utils/url-resolver.ts
git commit -m "feat: implement resolveManifestUrl with URL API"
```

---

## PHASE 4: Format Detection Utility (TDD)

**Reference:** Adapted from abr-manifest-viewer-chrome/viewer/js/main.js lines 62-65

### Task 4.1: Write Tests for Format Detection

**Files:**
- Create: `tests/parsers/format-detector.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/parsers/format-detector.test.ts
import { describe, it, expect } from 'vitest';
import { detectManifestFormat } from '../../src/lib/parsers/format-detector';

describe('detectManifestFormat', () => {
  it('should detect HLS from #EXTM3U header', () => {
    const m3u8 = '#EXTM3U\n#EXT-X-VERSION:3\n';
    expect(detectManifestFormat(m3u8)).toBe('hls');
  });

  it('should detect DASH from XML declaration', () => {
    const mpd = '<?xml version="1.0"?>\n<MPD>';
    expect(detectManifestFormat(mpd)).toBe('dash');
  });

  it('should detect DASH from MPD element', () => {
    const mpd = '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">';
    expect(detectManifestFormat(mpd)).toBe('dash');
  });

  it('should handle whitespace before content', () => {
    const m3u8WithSpaces = '  \n\n#EXTM3U\n';
    expect(detectManifestFormat(m3u8WithSpaces)).toBe('hls');
  });

  it('should default to HLS for ambiguous content', () => {
    const ambiguous = 'some random text';
    expect(detectManifestFormat(ambiguous)).toBe('hls');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test format-detector
```

Expected: FAIL - "Cannot find module"

**Step 3: Commit failing test**

```bash
git add tests/parsers/format-detector.test.ts
git commit -m "test: add failing tests for format detection"
```

---

### Task 4.2: Implement Format Detector

**Files:**
- Create: `src/lib/parsers/format-detector.ts`

**Step 1: Write implementation**

```typescript
// src/lib/parsers/format-detector.ts
import type { ManifestFormat } from '../../types/manifest';

/**
 * Auto-detect manifest format from content
 *
 * DASH manifests are XML (start with < or <?xml)
 * HLS manifests are text (start with #EXTM3U)
 *
 * Adapted from: abr-manifest-viewer-chrome/viewer/js/main.js:62-65
 */
export function detectManifestFormat(content: string): ManifestFormat {
  const trimmed = content.trimStart();

  // Check for XML/DASH indicators
  if (trimmed.startsWith('<')) {
    return 'dash';
  }

  // Check for HLS header
  if (trimmed.startsWith('#EXTM3U')) {
    return 'hls';
  }

  // Fallback: check for XML anywhere in first 100 chars
  const start = trimmed.substring(0, 100);
  if (start.includes('<MPD') || start.includes('<?xml')) {
    return 'dash';
  }

  // Default to HLS
  return 'hls';
}
```

**Step 2: Run tests to verify they pass**

```bash
npm test format-detector
```

Expected: PASS - All 5 tests green

**Step 3: Commit implementation**

```bash
git add src/lib/parsers/format-detector.ts
git commit -m "feat: implement manifest format auto-detection"
```

---

## PHASE 5: Service Worker Message Infrastructure

### Task 5.1: Create Message Router

**Files:**
- Modify: `src/background/service-worker.ts`
- Create: `src/lib/message-router.ts`

**Step 1: Create message router**

```typescript
// src/lib/message-router.ts
import type { ExtensionMessage, ExtensionResponse } from '../types/messages';

export async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<ExtensionResponse> {
  try {
    switch (message.action) {
      case 'fetch-manifest':
        return await handleFetchManifest(message.url);

      case 'update-ignore-list':
        return await handleUpdateIgnoreList(message.url, message.ignore);

      case 'get-detected':
        return await handleGetDetected(message.tabId);

      case 'update-settings':
        return await handleUpdateSettings(message.settings);

      case 'clear-history':
        return await handleClearHistory();

      default:
        return {
          success: false,
          error: `Unknown action: ${(message as any).action}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Placeholder handlers (will implement in next tasks)
async function handleFetchManifest(url: string): Promise<ExtensionResponse<string>> {
  return { success: false, error: 'Not implemented' };
}

async function handleUpdateIgnoreList(url: string, ignore: boolean): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}

async function handleGetDetected(tabId: number): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}

async function handleUpdateSettings(settings: any): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}

async function handleClearHistory(): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}
```

**Step 2: Update service-worker.ts to use router**

```typescript
// src/background/service-worker.ts
import { handleMessage } from '../lib/message-router';

console.log('Service worker loaded');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => sendResponse({
      success: false,
      error: error.message
    }));

  return true; // Required for async response
});
```

**Step 3: Test in browser**

Manual verification:
1. Rebuild: `npm run build`
2. Reload extension in chrome://extensions
3. Open console → should see "Service worker loaded"
4. No errors should appear

**Step 4: Commit message router**

```bash
git add src/lib/message-router.ts src/background/service-worker.ts
git commit -m "feat: implement service worker message router"
```

---

### Task 5.2: Implement Manifest Fetcher (TDD Where Possible)

**Files:**
- Create: `src/lib/fetchers/manifest-fetcher.ts`
- Create: `tests/fetchers/manifest-fetcher.test.ts`

**Step 1: Write tests for error handling**

```typescript
// tests/fetchers/manifest-fetcher.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchManifestContent, ManifestFetchError } from '../../src/lib/fetchers/manifest-fetcher';

describe('fetchManifestContent', () => {
  it('should throw ManifestFetchError for 404 responses', async () => {
    // Mock fetch to return 404
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchManifestContent('https://example.com/404.m3u8'))
      .rejects.toThrow(ManifestFetchError);
  });

  it('should include helpful message for SSL errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchManifestContent('https://badssl.com/manifest.m3u8'))
      .rejects.toThrow('Network error');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test manifest-fetcher
```

Expected: FAIL - Module not found

**Step 3: Implement fetcher**

```typescript
// src/lib/fetchers/manifest-fetcher.ts

export class ManifestFetchError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ManifestFetchError';
  }
}

/**
 * Fetch manifest content from URL
 * Adapted from: abr-manifest-viewer-chrome/background.js:92-111
 * Migration: XMLHttpRequest → fetch API (required for service workers)
 */
export async function fetchManifestContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/dash+xml, */*'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new ManifestFetchError(
          'Manifest not found (404). Please check the URL.',
          404
        );
      }
      throw new ManifestFetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof ManifestFetchError) {
      throw error;
    }

    // Network errors (CORS, SSL, DNS, etc.)
    if (error instanceof TypeError) {
      throw new ManifestFetchError(
        'Network error. Possible causes: CORS restriction, invalid SSL certificate, or DNS failure. Try clicking the manifest URL to download directly.'
      );
    }

    throw new ManifestFetchError(
      `Failed to fetch manifest: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test manifest-fetcher
```

Expected: PASS

**Step 5: Commit fetcher**

```bash
git add src/lib/fetchers/manifest-fetcher.ts tests/fetchers/manifest-fetcher.test.ts
git commit -m "feat: implement manifest fetcher with error handling"
```

---

### Task 5.3: Wire Fetcher to Message Router

**Files:**
- Modify: `src/lib/message-router.ts`

**Step 1: Update handleFetchManifest**

```typescript
// src/lib/message-router.ts
import { fetchManifestContent } from './fetchers/manifest-fetcher';

async function handleFetchManifest(url: string): Promise<ExtensionResponse<string>> {
  try {
    const content = await fetchManifestContent(url);
    return {
      success: true,
      data: content
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch manifest'
    };
  }
}
```

**Step 2: Test in browser**

Manual verification:
1. Rebuild: `npm run build`
2. Reload extension
3. Open popup
4. Open browser console
5. Run: `chrome.runtime.sendMessage({action: 'fetch-manifest', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'}, console.log)`
6. Expected: Response with success:true and data containing manifest content

**Step 3: Commit integration**

```bash
git add src/lib/message-router.ts
git commit -m "feat: wire manifest fetcher to message router"
```

---

## PHASE 6: HLS Parser Integration (TDD)

### Task 6.1: Write Tests for HLS Parser

**Files:**
- Create: `tests/parsers/hls-parser.test.ts`
- Create: `tests/fixtures/bipbop-master.m3u8` (test data)

**Step 1: Create test fixture**

```
# tests/fixtures/bipbop-master.m3u8
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=2227464,AVERAGE-BANDWIDTH=2218327,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=960x540,FRAME-RATE=60.000
gear4/prog_index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=8400000,AVERAGE-BANDWIDTH=8226330,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=60.000
gear5/prog_index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=6800000,AVERAGE-BANDWIDTH=6612904,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=60.000
gear6/prog_index.m3u8
```

**Step 2: Write failing tests**

```typescript
// tests/parsers/hls-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseHLS } from '../../src/lib/parsers/hls-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const bipbopMaster = readFileSync(
  resolve(__dirname, '../fixtures/bipbop-master.m3u8'),
  'utf-8'
);

describe('parseHLS', () => {
  it('should parse master playlist and extract variants', () => {
    const result = parseHLS(bipbopMaster, 'https://example.com/master.m3u8');

    expect(result.format).toBe('hls');
    expect(result.variants).toHaveLength(3);
    expect(result.variants[0].bitrate).toBe(2227464);
    expect(result.variants[0].resolution).toEqual({ width: 960, height: 540 });
  });

  it('should resolve relative variant URLs', () => {
    const result = parseHLS(bipbopMaster, 'https://example.com/path/master.m3u8');

    expect(result.variants[0].url).toBe('https://example.com/path/gear4/prog_index.m3u8');
  });

  it('should extract codec information', () => {
    const result = parseHLS(bipbopMaster, 'https://example.com/master.m3u8');

    expect(result.variants[0].codecs).toContain('avc1.640020');
    expect(result.variants[0].codecs).toContain('mp4a.40.2');
  });
});
```

**Step 3: Run test to verify it fails**

```bash
npm test hls-parser
```

Expected: FAIL - Module not found

**Step 4: Commit failing tests**

```bash
git add tests/parsers/hls-parser.test.ts tests/fixtures/bipbop-master.m3u8
git commit -m "test: add failing tests for HLS parser"
```

---

### Task 6.2: Implement HLS Parser

**Files:**
- Create: `src/lib/parsers/hls-parser.ts`

**Step 1: Implement parser**

```typescript
// src/lib/parsers/hls-parser.ts
import { Parser } from 'm3u8-parser';
import type { ParsedManifest, Variant, ManifestMetadata, VariantType } from '../../types/manifest';
import { resolveManifestUrl } from '../utils/url-resolver';

export function parseHLS(content: string, baseUrl: string): ParsedManifest {
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const manifest = parser.manifest;

  // Extract variants from playlists
  const variants: Variant[] = (manifest.playlists || []).map((playlist: any, index: number) => {
    const attrs = playlist.attributes || {};

    return {
      id: `variant-${index}`,
      bitrate: attrs.BANDWIDTH || attrs['AVERAGE-BANDWIDTH'] || 0,
      resolution: attrs.RESOLUTION ? {
        width: attrs.RESOLUTION.width,
        height: attrs.RESOLUTION.height
      } : undefined,
      codecs: attrs.CODECS ? attrs.CODECS.split(',').map((c: string) => c.trim()) : [],
      frameRate: attrs['FRAME-RATE'],
      url: resolveManifestUrl(playlist.uri, baseUrl),
      type: determineVariantType(attrs)
    };
  });

  // Extract metadata
  const metadata: ManifestMetadata = {
    version: manifest.version?.toString(),
    targetDuration: manifest.targetDuration,
    duration: manifest.duration,
    type: manifest.endList ? 'VOD' : (manifest.playlistType === 'EVENT' ? 'EVENT' : 'LIVE'),
    encrypted: manifest.segments?.some((s: any) => s.key) || false
  };

  // Extract segments (for media playlists)
  const segments = manifest.segments?.map((seg: any, i: number) => ({
    id: `segment-${i}`,
    duration: seg.duration,
    url: resolveManifestUrl(seg.uri, baseUrl),
    byteRange: seg.byterange ? {
      start: seg.byterange.offset,
      end: seg.byterange.offset + seg.byterange.length
    } : undefined,
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

function determineVariantType(attrs: any): VariantType {
  const codecs = attrs.CODECS || '';

  // Video codecs: avc1, hvc1, vp9, av01
  if (/avc1|hvc1|hev1|vp0?9|av01/i.test(codecs)) {
    return 'video';
  }

  // Audio codecs: mp4a, ac-3, ec-3, opus
  if (/mp4a|ac-3|ec-3|opus/i.test(codecs)) {
    return 'audio';
  }

  // Subtitle codecs: wvtt, stpp
  if (/wvtt|stpp/i.test(codecs)) {
    return 'subtitle';
  }

  // Default: assume video if has resolution
  return attrs.RESOLUTION ? 'video' : 'audio';
}
```

**Step 2: Run tests**

```bash
npm test hls-parser
```

Expected: PASS - All tests green

**Step 3: Commit HLS parser**

```bash
git add src/lib/parsers/hls-parser.ts
git commit -m "feat: implement HLS parser with @videojs/m3u8-parser"
```

---

## PLAN STRUCTURE NOTE

This plan contains **hundreds** of bite-sized tasks. For brevity in this demonstration, I've shown the pattern for the first 6 tasks covering:
- Infrastructure setup
- TypeScript types
- URL utilities (TDD)
- Format detection (TDD)
- Service worker messaging
- HLS parser (TDD)

**The complete plan would continue with:**
- Task 6.3-6.5: DASH parser (TDD)
- Task 7.1-7.8: Viewer page React components
- Task 8.1-8.5: Popup React components
- Task 9.1-9.7: Content script detection
- Task 10.1-10.6: DevTools panel
- Task 11.1-11.9: Variant comparison
- Task 12.1-12.8: Playback simulation
- ... through all 24 phases

**Each task follows the pattern:**
1. Write test (if testable)
2. Run test (verify failure)
3. Write code (exact, complete)
4. Run test/verify (passes/works)
5. Commit (specific message)

**Total estimated tasks:** ~150-200 bite-sized steps (2-5 minutes each)

---

## Next Steps for Engineer

**Before starting implementation:**

1. Read reference analysis: `cat docs/ANALYSIS.md`
2. Read architecture: `cat docs/ARCHITECTURE.md`
3. Read full plan: `cat docs/plans/2025-12-02-hls-dash-manifest-viewer-chrome-extension.md`
4. Understand we're using TDD where possible
5. Understand manual verification for Chrome APIs

**To execute:**

**Option 1 - Task-by-task with reviews:**
Use `superpowers:executing-plans` skill in NEW session

**Option 2 - Parallel agents:**
Use `superpowers:dispatching-parallel-agents` for independent tasks

**Option 3 - Continue this session:**
Implement tasks sequentially with commit after each

**Which approach do you prefer?**
