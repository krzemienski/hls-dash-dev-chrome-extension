# Developer Guide

Complete onboarding guide for developers joining the HLS + DASH Manifest Viewer project.

## Welcome!

This guide will get you from zero to productive contributor in minimal time.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Project Structure](#project-structure)
3. [Development Tools](#development-tools)
4. [Common Tasks](#common-tasks)
5. [Debugging Techniques](#debugging-techniques)
6. [Best Practices](#best-practices)

## Environment Setup

### Required Software

**1. Node.js and npm:**
```bash
# Check versions
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher

# Install if needed:
# Download from https://nodejs.org
# Or use nvm:
nvm install 18
nvm use 18
```

**2. Git:**
```bash
git --version  # Any recent version works

# Configure (first time)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**3. Chrome Browser:**
```bash
# Check version
chrome://version

# Need Chrome 88+ for Manifest V3
# Recommend Chrome 120+ for best compatibility
```

**4. Code Editor:**

**VS Code (Recommended):**
- Download from https://code.visualstudio.com

**Recommended Extensions:**
- ES Lint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Chrome Debugger
- Error Lens

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n"
}
```

### Project Setup

**1. Clone Repository:**
```bash
# If contributing, fork first on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/hls-dash-dev-chrome-extension.git
cd hls-dash-dev-chrome-extension

# Add upstream
git remote add upstream https://github.com/krzemienski/hls-dash-dev-chrome-extension.git

# Verify remotes
git remote -v
# Should show origin (your fork) and upstream (main repo)
```

**2. Install Dependencies:**
```bash
npm install

# This installs:
# - React and ReactDOM
# - Vite build tool
# - TypeScript compiler
# - Tailwind CSS
# - Parsing libraries (m3u8-parser, mpd-parser)
# - Zustand state management
# - Vitest testing framework
# - Type definitions
```

**3. Build Extension:**
```bash
npm run build

# Output should show:
# - TypeScript compilation
# - Vite bundling
# - File sizes
# - Build time

# Check dist/ folder created
ls dist/
```

**4. Load in Chrome:**
```
1. Open chrome://extensions
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select dist/ folder
5. Extension appears in list
6. Click extension icon to test popup
```

**5. Verify Everything Works:**
```bash
# Run tests
npm test

# Should see:
# Test Files  16 passed
# Tests  124 passed
```

**6. Open in Editor:**
```bash
# Open in VS Code
code .

# Or your preferred editor
```

## Project Structure

### Directory Layout

```
hls-dash-dev-chrome-extension/
├── docs/                    # Documentation
│   ├── README.md
│   ├── API.md
│   ├── FEATURES.md
│   ├── USER_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── TROUBLESHOOTING.md
│   ├── TESTING_CHECKLIST.md
│   └── plans/              # Implementation plans
├── public/                  # Static assets
│   ├── manifest.json       # Extension manifest
│   ├── rules.json          # declarativeNetRequest rules
│   └── icons/              # Extension icons
├── src/                     # Source code
│   ├── background/         # Service worker
│   │   └── service-worker.ts
│   ├── content/            # Content script
│   │   └── content-script.ts
│   ├── popup/              # Popup UI
│   │   └── popup.tsx
│   ├── viewer/             # Viewer page
│   │   └── viewer.tsx
│   ├── devtools/           # DevTools panel
│   │   ├── devtools.ts
│   │   └── panel.tsx
│   ├── components/         # React components
│   │   ├── viewer/        # Viewer components
│   │   ├── popup/         # Popup components
│   │   └── common/        # Shared components
│   ├── lib/               # Business logic
│   │   ├── parsers/       # Manifest parsers
│   │   ├── utils/         # Utility functions
│   │   ├── export/        # Export utilities
│   │   ├── simulation/    # Simulation logic
│   │   ├── validation/    # Validation logic
│   │   └── fetchers/      # Network utilities
│   ├── store/             # State management
│   │   └── manifest-store.ts
│   ├── types/             # TypeScript types
│   │   ├── manifest.ts
│   │   ├── messages.ts
│   │   └── mpd-parser.d.ts
│   └── styles/            # Global styles
│       └── globals.css
├── tests/                  # Test files
│   ├── parsers/
│   ├── utils/
│   ├── export/
│   ├── fetchers/
│   ├── simulation/
│   ├── validation/
│   └── fixtures/          # Test data
├── dist/                   # Build output (gitignored)
├── node_modules/          # Dependencies (gitignored)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Build config
├── vitest.config.ts       # Test config
├── tailwind.config.ts     # Styling config
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

### Key Files to Know

**Configuration:**
- `package.json` - Dependencies, scripts, metadata
- `tsconfig.json` - TypeScript compiler settings
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - CSS utility configuration
- `public/manifest.json` - Extension manifest (permissions, etc.)

**Entry Points:**
- `src/background/service-worker.ts` - Background script
- `src/content/content-script.ts` - Injected into pages
- `src/popup/popup.tsx` - Popup UI root
- `src/viewer/viewer.tsx` - Viewer page root
- `src/devtools/devtools.ts` - DevTools registration
- `src/devtools/panel.tsx` - DevTools panel root

**Core Logic:**
- `src/lib/parsers/` - Manifest parsing (core functionality)
- `src/lib/utils/` - Analysis and utility functions
- `src/store/` - Global state management
- `src/types/` - TypeScript type definitions

## Development Tools

### Package Scripts

```bash
# Development (watch mode)
npm run dev
# Builds and watches for changes
# Rebuild on file save
# Must manually reload extension in Chrome

# Production build
npm run build
# TypeScript type check + Vite build
# Optimized for production
# Output to dist/

# Run tests
npm test
# Launches Vitest in watch mode
# Re-runs tests on file changes

# Run tests once
npm test -- --run
# Single run, no watch
# Use in CI/CD

# Test UI
npm test -- --ui
# Opens browser with test results
# Visual test runner

# Specific test
npm test url-resolver
# Runs only matching tests

# Coverage
npm test -- --coverage
# Generates coverage report
# Shows % of code tested
```

### Chrome DevTools Usage

**Service Worker Console:**
```
chrome://extensions
→ Find extension
→ Click "service worker"
→ Console opens
```

**Logs:**
- Extension install/update events
- Message handling
- Storage operations
- Errors and warnings

**Popup Console:**
```
1. Open popup (click extension icon)
2. Right-click popup
3. Select "Inspect"
4. Console tab opens
```

**Useful for:**
- Debugging popup rendering
- State inspection
- Event handler errors

**Content Script Console:**
```
1. Open page with content script
2. F12 (regular browser DevTools)
3. Console tab
4. Filter by "content-script"
```

**Viewer/Panel DevTools:**
- Regular F12 DevTools
- Full Chrome DevTools available
- React DevTools compatible

### Browser Extensions for Development

**React DevTools:**
- Install React DevTools extension
- Inspect component tree
- View props and state
- Profile performance

**Redux DevTools:**
- Works with Zustand
- Time-travel debugging
- Action history
- State diffing

## Common Tasks

### Adding a New Utility Function

**Step-by-step:**

**1. Create test file:**
```bash
# Create test first (TDD)
touch tests/utils/my-utility.test.ts
```

```typescript
// tests/utils/my-utility.test.ts
import { describe, it, expect } from 'vitest';
import { myUtility } from '../../src/lib/utils/my-utility';

describe('myUtility', () => {
  it('should do the thing', () => {
    const result = myUtility('input');
    expect(result).toBe('expected');
  });
});
```

**2. Run test (should fail):**
```bash
npm test my-utility
# Error: Cannot find module
```

**3. Create utility file:**
```bash
touch src/lib/utils/my-utility.ts
```

```typescript
// src/lib/utils/my-utility.ts

/**
 * Description of what this utility does
 *
 * @param input - Description of parameter
 * @returns Description of return value
 */
export function myUtility(input: string): string {
  // Implementation
  return input.toUpperCase();
}
```

**4. Run test (should pass):**
```bash
npm test my-utility
# ✓ should do the thing
```

**5. Commit:**
```bash
git add tests/utils/my-utility.test.ts src/lib/utils/my-utility.ts
git commit -m "feat: add myUtility function"
```

### Adding a New Component

**Step-by-step:**

**1. Create component file:**
```bash
touch src/components/viewer/MyComponent.tsx
```

**2. Write component:**
```typescript
// src/components/viewer/MyComponent.tsx
import type { ParsedManifest } from '../../types/manifest';

interface MyComponentProps {
  manifest: ParsedManifest;
}

export function MyComponent({ manifest }: MyComponentProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">
        My Analysis
      </h2>
      <p>Content here</p>
    </div>
  );
}
```

**3. Add to parent component:**
```typescript
// src/components/viewer/StructuredView.tsx

// Import
import { MyComponent } from './MyComponent';

// Add to render
export function StructuredView({ manifest }: Props) {
  return (
    <div>
      {/* ... existing components */}
      <MyComponent manifest={manifest} />
    </div>
  );
}
```

**4. Build and test:**
```bash
npm run build
# Reload extension
# Open viewer
# Verify component appears
```

**5. Commit:**
```bash
git add src/components/viewer/MyComponent.tsx src/components/viewer/StructuredView.tsx
git commit -m "feat: add MyComponent analysis panel"
```

### Fixing a Bug

**Process:**

**1. Reproduce:**
- Find minimal steps to trigger bug
- Note expected vs actual behavior
- Check console for errors

**2. Locate Code:**
```bash
# Search for relevant code
grep -r "error message" src/

# Or use git blame
git blame src/file.ts

# Find when code was added
git log --follow src/file.ts
```

**3. Write Test:**
```typescript
// tests/utils/buggy-function.test.ts
it('should handle edge case correctly', () => {
  // Test that currently fails
  const result = buggyFunction(edgeCase);
  expect(result).toBe(correctBehavior);
});
```

**4. Run test (verify it fails):**
```bash
npm test buggy-function
# Test should fail, confirming bug
```

**5. Fix code:**
```typescript
// src/lib/utils/buggy-function.ts

export function buggyFunction(input: string): string {
  // Add null check
  if (!input) return '';

  // Fixed logic
  return input.trim();
}
```

**6. Run test (verify it passes):**
```bash
npm test buggy-function
# Test should pass now
```

**7. Manual test:**
```bash
npm run build
# Load in Chrome
# Reproduce original bug scenario
# Verify fix works
```

**8. Commit:**
```bash
git add tests/utils/buggy-function.test.ts src/lib/utils/buggy-function.ts
git commit -m "fix: handle null input in buggyFunction

Previously would crash with null input.
Now returns empty string.

Fixes #123"
```

### Adding Tests

**For existing code without tests:**

**1. Identify untested function:**
```bash
# Check coverage
npm test -- --coverage

# Look for files with <100% coverage
```

**2. Create test file:**
```typescript
// tests/path/to/function.test.ts
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../../src/path/to/function';

describe('functionToTest', () => {
  it('should handle normal case', () => {
    expect(functionToTest('normal')).toBe('expected');
  });

  it('should handle edge case', () => {
    expect(functionToTest('')).toBe('');
  });

  it('should throw on invalid input', () => {
    expect(() => functionToTest(null as any)).toThrow();
  });
});
```

**3. Run and verify:**
```bash
npm test function.test
```

**4. Commit:**
```bash
git add tests/path/to/function.test.ts
git commit -m "test: add tests for functionToTest"
```

## Debugging Techniques

### Finding the Right File

**By Feature:**
```bash
# Searching for manifest parsing
grep -r "parseManifest" src/
# → src/lib/parsers/index.ts

# Searching for variant display
grep -r "VariantList" src/
# → src/components/viewer/VariantList.tsx
```

**By Error Message:**
```bash
# Error in console: "Failed to load manifest"
grep -r "Failed to load manifest" src/
# → src/lib/fetchers/manifest-fetcher.ts
```

**By Functionality:**
- Parsing: `src/lib/parsers/`
- Analysis: `src/lib/utils/`
- UI: `src/components/`
- State: `src/store/`
- Types: `src/types/`

### Debugging Service Worker

**Console Access:**
1. chrome://extensions
2. Find extension
3. Click "service worker" (or "Inspect views: service worker")
4. Console opens

**Useful Commands:**
```javascript
// Check storage
chrome.storage.local.get(null, (data) => console.log(data));

// Test message handler
chrome.runtime.sendMessage({
  action: 'fetch-manifest',
  url: 'https://test-url.com/manifest.m3u8'
}, (response) => console.log(response));

// Check detected manifests
// (internal function, would need to expose)
```

**Common Issues:**
- Service worker crashes on errors
- Click "service worker" again to restart
- Check console for error before crash

### Debugging Content Script

**Console Access:**
1. Open page where content script runs
2. F12 (DevTools)
3. Console tab
4. Content script logs appear here

**Verify Running:**
```javascript
// Should see on every page:
"Content script loaded on: https://..."
```

**Test Detection:**
```javascript
// In page console
// Can't directly access content script
// But can verify it's detecting

// Create test element
document.body.innerHTML += '<a href="https://test.com/manifest.m3u8">Test</a>';

// Wait 2 seconds, check popup
// Should show detected manifest
```

### Debugging React Components

**React DevTools:**
1. Install React DevTools extension
2. Open page (viewer)
3. DevTools → Components tab
4. Inspect component tree

**Useful for:**
- Viewing props
- Checking state
- Finding which component has issue
- Profiling render performance

**Console Debugging:**
```typescript
// Add to component
console.log('Component rendering with:', { manifest, loading, error });

useEffect(() => {
  console.log('Effect running with:', dependencies);
}, [dependencies]);
```

**Breakpoints:**
```typescript
// In Chrome DevTools Sources tab
// Find component file
// Click line number to add breakpoint
// Reload page
// Debugger pauses at breakpoint
```

### Debugging State

**Zustand DevTools:**
```typescript
// In browser console (viewer page)
useManifestStore.getState()
// Shows current state

useManifestStore.subscribe(console.log)
// Logs on every state change
```

**Check State:**
```javascript
// Get current manifest
const manifest = useManifestStore.getState().manifest;
console.log(manifest);

// Get current view
const view = useManifestStore.getState().selectedView;
console.log('Current view:', view);

// Change state manually
useManifestStore.getState().setSelectedView('raw');
```

### Network Debugging

**Manifest Fetch:**
1. Open viewer
2. F12 → Network tab
3. Enter manifest URL
4. Click Load
5. Watch for request

**Check:**
- Request made?
- Status code (200 OK vs 404/403/etc.)
- Response headers
- Response content
- Timing

**Simulate Errors:**
```javascript
// In service worker console
// Override fetch to simulate errors
const originalFetch = fetch;
fetch = async (url) => {
  if (url.includes('test-error')) {
    throw new Error('Simulated network error');
  }
  return originalFetch(url);
};
```

## Best Practices

### TypeScript Tips

**Use Type Inference:**
```typescript
// ✅ Let TypeScript infer
const bitrate = 1000000;  // Inferred as number

// ❌ Unnecessary annotation
const bitrate: number = 1000000;
```

**Avoid `any`:**
```typescript
// ❌ Loses type safety
function parse(content: any): any { }

// ✅ Use proper types
function parse(content: string): ParsedManifest { }

// ✅ Or unknown if truly unknown
function parse(content: unknown): ParsedManifest {
  if (typeof content !== 'string') {
    throw new Error('Expected string');
  }
  // Now TypeScript knows content is string
}
```

**Type Guards:**
```typescript
// Custom type guard
function isHLSManifest(manifest: ParsedManifest): manifest is HLSManifest {
  return manifest.format === 'hls';
}

// Usage
if (isHLSManifest(manifest)) {
  // TypeScript knows it's HLSManifest here
  const version = manifest.hlsSpecificProperty;
}
```

### React Patterns

**Hooks Best Practices:**
```typescript
// ✅ Call hooks at top level
function MyComponent() {
  const [state, setState] = useState(initial);
  const value = useMemo(() => expensive(), [dep]);

  // ... rest of component
}

// ❌ Conditional hooks
function MyComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(initial);  // Wrong!
  }
}
```

**Avoid Unnecessary Re-renders:**
```typescript
// ✅ Memoize expensive calculations
const analysis = useMemo(() =>
  analyzeBitrateLadder(variants),
  [variants]  // Only recalculate when variants change
);

// ✅ Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ Memoize components
const MemoizedCard = memo(VariantCard);
```

**Conditional Rendering:**
```typescript
// ✅ Early return for null
if (!manifest) {
  return null;
}

// ✅ Logical AND for optional sections
{manifest.segments && <SegmentList segments={manifest.segments} />}

// ✅ Ternary for either/or
{loading ? <Spinner /> : <Content />}
```

### Performance Tips

**Avoid in Render:**
```typescript
// ❌ Creates new function every render
<button onClick={() => handleClick(id)}>

// ✅ Use useCallback
const onClick = useCallback(() => handleClick(id), [id]);
<button onClick={onClick}>

// ✅ Or if no dependencies
<button onClick={handleClick}>  // Pass function reference
```

**List Rendering:**
```typescript
// ✅ Always use keys
{items.map(item => (
  <ItemCard key={item.id} item={item} />
))}

// ❌ Never use index as key (if items can reorder)
{items.map((item, index) => (
  <ItemCard key={index} item={item} />  // Bad if items can move
))}
```

**State Updates:**
```typescript
// ✅ Batch related updates (React 18+ automatic)
setLoading(true);
setError(null);
setData(newData);
// React batches these automatically

// ✅ Use functional updates for dependent state
setCount(prevCount => prevCount + 1);
```

### CSS/Styling Tips

**Tailwind Utilities:**
```typescript
// ✅ Use Tailwind utilities
<div className="p-4 bg-white rounded-lg border border-gray-200">

// ❌ Avoid inline styles
<div style={{ padding: '16px', background: 'white' }}>

// ✅ Conditional classes
<div className={`base-class ${condition ? 'active' : 'inactive'}`}>

// ✅ Multiple conditional classes
<div className={`
  base-class
  ${condition1 ? 'class-1' : 'class-2'}
  ${condition2 && 'class-3'}
`}>
```

**Responsive Design:**
```typescript
// ✅ Use Tailwind breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
```

## Debugging Techniques

### Console Debugging

**Structured Logging:**
```typescript
// ✅ Use prefixes for clarity
console.log('🔍 [Parser] Starting parse...');
console.log('✅ [Parser] Found', variants.length, 'variants');
console.error('❌ [Parser] Error:', error);

// ✅ Log objects with labels
console.log('Manifest:', manifest);
console.table(variants);  // Table format for arrays

// ✅ Grouping related logs
console.group('Parsing Manifest');
console.log('URL:', url);
console.log('Format:', format);
console.groupEnd();
```

**Conditional Logging:**
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Debug info:', details);
}
```

### Source Maps

**Enabled by default in development:**
- Error stack traces show original source
- Can set breakpoints in .tsx files
- Variables have original names

**In Production:**
- Minified code
- Source maps not included (smaller bundle)
- Harder to debug (use development build)

### Testing Patterns

**Arrange-Act-Assert:**
```typescript
it('should parse HLS manifest', () => {
  // Arrange: Setup test data
  const content = '#EXTM3U\n#EXT-X-VERSION:3';
  const url = 'https://example.com/manifest.m3u8';

  // Act: Execute function
  const result = parseHLS(content, url);

  // Assert: Verify results
  expect(result.format).toBe('hls');
  expect(result.variants).toBeDefined();
});
```

**Test Isolation:**
```typescript
// ✅ Each test independent
describe('calculator', () => {
  it('should add', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should subtract', () => {
    expect(subtract(5, 3)).toBe(2);
  });
  // Neither test depends on the other
});
```

**Mock External Dependencies:**
```typescript
import { vi } from 'vitest';

it('should fetch manifest', async () => {
  // Mock fetch
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '#EXTM3U\n...'
  });

  const result = await fetchManifest('url');

  expect(fetch).toHaveBeenCalledWith('url', expect.any(Object));
  expect(result).toBeDefined();
});
```

## Advanced Topics

### Custom Hooks

**Creating:**
```typescript
// src/hooks/useManifestLoader.ts
export function useManifestLoader() {
  const setManifest = useManifestStore(s => s.setManifest);
  const setLoading = useManifestStore(s => s.setLoading);
  const setError = useManifestStore(s => s.setError);

  const loadManifest = useCallback(async (url: string) => {
    setLoading(true);
    try {
      const content = await fetchManifestContent(url);
      const parsed = parseManifest(content, url);
      setManifest(parsed);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [setManifest, setLoading, setError]);

  return { loadManifest };
}
```

**Using:**
```typescript
function MyComponent() {
  const { loadManifest } = useManifestLoader();

  const handleClick = () => {
    loadManifest('https://...');
  };

  return <button onClick={handleClick}>Load</button>;
}
```

### Performance Optimization

**Profile First:**
```bash
# React DevTools Profiler
# 1. Open viewer
# 2. React DevTools → Profiler tab
# 3. Click record
# 4. Interact with UI
# 5. Stop recording
# 6. Analyze flame graph
```

**Common Optimizations:**

**1. Memoization:**
```typescript
// Expensive calculation
const analysis = useMemo(() =>
  heavyAnalysis(variants),
  [variants]
);
```

**2. Code Splitting (future):**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

**3. Virtual Scrolling (future):**
```typescript
// For 1000+ item lists
<VirtualList
  items={largeArray}
  height={600}
  itemHeight={50}
  renderItem={(item) => <Card {...item} />}
/>
```

### Chrome Extension Specifics

**Manifest V3 Rules:**
- No remote code loading
- Service workers only (no background pages)
- declarativeNetRequest (not webRequest)
- Promises preferred over callbacks

**API Best Practices:**
```typescript
// ✅ Check API exists
if (chrome?.storage) {
  await chrome.storage.local.set({ key: value });
}

// ✅ Use promises
const data = await chrome.storage.local.get('key');

// ❌ Avoid callbacks (when promise available)
chrome.storage.local.get('key', (data) => {  // Old style
  // ...
});
```

**Message Passing:**
```typescript
// ✅ Always return true for async
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleAsync(msg).then(sendResponse);
  return true;  // Required for async!
});

// ✅ Use promises in sender
const response = await chrome.runtime.sendMessage({ action: 'do-thing' });
```

## Code Review Checklist

**Before Requesting Review:**

**Self-Review:**
- [ ] Read through all changed files
- [ ] Remove debug console.logs
- [ ] Remove commented-out code
- [ ] Check for TODOs (resolve or create issues)
- [ ] Verify no merge conflict markers

**Testing:**
- [ ] All tests pass: `npm test`
- [ ] Type check passes: `npm run build`
- [ ] Manual testing done
- [ ] No console errors in browser
- [ ] Tested in incognito (rule out conflicts)

**Documentation:**
- [ ] README updated if needed
- [ ] API docs updated if API changed
- [ ] Code comments added where needed
- [ ] CHANGELOG entry (for version releases)

**Git:**
- [ ] Commit messages descriptive
- [ ] No WIP commits
- [ ] Branch up-to-date with main
- [ ] No merge commits (rebase instead)

## Common Pitfalls

### 1. Forgetting to Rebuild

**Issue:**
```bash
# Change code
# Test in Chrome
# Change doesn't appear!
```

**Fix:**
```bash
# Must rebuild after changes
npm run build

# Or use watch mode
npm run dev
# Rebuilds automatically
```

### 2. Not Reloading Extension

**Issue:**
```bash
# Rebuild done
# Test in Chrome
# Still seeing old code!
```

**Fix:**
```
1. chrome://extensions
2. Click reload icon on extension
3. Or Cmd+R on extension card
4. Reload page if testing content script
```

### 3. Testing in Wrong Context

**Issue:**
- Test popup code in viewer
- Test viewer code in popup
- Wrong state or APIs

**Fix:**
- Know which context you're in
- Service worker console for background
- Popup inspect for popup
- Regular DevTools for viewer

### 4. Importing from dist/

**Issue:**
```typescript
// ❌ Wrong
import { something } from '../../../dist/file.js';
```

**Fix:**
```typescript
// ✅ Always import from src/
import { something } from '../lib/utils/file';
```

### 5. Committing dist/

**Issue:**
```bash
git add .
# Commits dist/ folder (shouldn't be in repo)
```

**Fix:**
```bash
# dist/ should be in .gitignore
echo "dist/" >> .gitignore

# Remove from git if accidentally committed
git rm -r --cached dist/
```

## Resources

### Documentation

**Project Docs:**
- README.md - Project overview
- API.md - Function reference
- ARCHITECTURE.md - System design
- FEATURES.md - Feature list
- This file - Developer guide

**External Docs:**
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/migrating/)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/)

### Example Code

**Similar Extensions:**
- Check `docs/ANALYSIS.md` for reference implementations
- Study how they solve similar problems
- Adapt patterns to our architecture

**Open Source Extensions:**
- Browse Chrome Web Store source code
- Study popular extensions
- Learn best practices

### Community

**Get Help:**
- GitHub Discussions
- Issues with "question" label
- Comments on relevant PRs

**Stay Updated:**
- Watch repository for updates
- Follow issues for discussions
- Subscribe to releases

## Onboarding Checklist

**Week 1:**
- [ ] Environment setup complete
- [ ] Can build and load extension
- [ ] All tests pass on your machine
- [ ] Read README, ARCHITECTURE, and this guide
- [ ] Explored codebase
- [ ] Made first small change
- [ ] Ran tests and build

**Week 2:**
- [ ] Fixed a small bug
- [ ] Added a test
- [ ] Created first PR
- [ ] Responded to review feedback

**Week 3:**
- [ ] Implemented small feature
- [ ] Wrote comprehensive tests
- [ ] Updated documentation
- [ ] PR merged!

**Month 1:**
- [ ] Comfortable with codebase
- [ ] Know where to find things
- [ ] Can debug effectively
- [ ] Contributing regularly

Welcome to the team! Don't hesitate to ask questions and suggest improvements to this guide.
