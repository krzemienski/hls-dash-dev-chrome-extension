# Performance Optimization Guide

Comprehensive guide to performance optimization in the HLS + DASH Manifest Viewer.

## Table of Contents

1. [Performance Overview](#performance-overview)
2. [Bundle Optimization](#bundle-optimization)
3. [Runtime Performance](#runtime-performance)
4. [Memory Management](#memory-management)
5. [Rendering Optimization](#rendering-optimization)
6. [Network Optimization](#network-optimization)
7. [Profiling and Monitoring](#profiling-and-monitoring)

## Performance Overview

### Current Performance Metrics

**Bundle Sizes (gzipped):**
- Service Worker: 2.85 KB
- Content Script: 1.10 KB
- Popup: 8.26 KB
- DevTools Panel: 2.67 KB
- Viewer Page: 245 KB
- Shared Code: 143 KB
- CSS: 35 KB
- **Total:** ~438 KB

**Load Times (on fast connection):**
- Extension install: <1s
- Popup open: <100ms
- Viewer load: <500ms
- Manifest parse (typical): <100ms
- Manifest parse (large): <1s

**Memory Usage:**
- Idle: 10-30 MB
- Popup open: 30-50 MB
- Viewer with manifest: 50-200 MB
- Large manifest: 200-400 MB

**CPU Usage:**
- Idle: <1%
- Parsing: 5-15% (brief spike)
- Rendering: 3-8%
- Timeline simulation: 10-20%

### Performance Goals

**Target Metrics:**
- [ ] Bundle < 500 KB total
- [ ] Popup opens < 100ms
- [ ] Viewer loads < 500ms
- [ ] Parse time < 200ms for typical manifests
- [ ] Memory < 300 MB for large manifests
- [ ] 60fps UI rendering
- [ ] First Contentful Paint < 1s

**Current Status:**
- ✅ Bundle: 438 KB (goal: <500 KB)
- ✅ Popup: ~100ms
- ✅ Viewer: ~500ms
- ✅ Parse: <100ms typical
- ⚠️ Memory: Can exceed 300 MB for very large manifests
- ✅ Rendering: 60fps
- ✅ FCP: <1s

## Bundle Optimization

### Code Splitting

**Current Strategy:**
```typescript
// Vite automatically splits:
// 1. Vendor chunk (React, ReactDOM)
// 2. Shared utilities
// 3. Page-specific code
```

**Optimization Opportunities:**

**1. Lazy Loading (Future):**
```typescript
// Heavy components loaded on demand
const AdvancedAnalysis = lazy(() =>
  import('./components/viewer/AdvancedAnalysis')
);

function StructuredView() {
  return (
    <Suspense fallback={<Skeleton />}>
      <AdvancedAnalysis />
    </Suspense>
  );
}
```

**Benefits:**
- Reduces initial bundle
- Loads on-demand
- Better caching

**2. Route-Based Splitting:**
```typescript
// Split by view mode
const RawView = lazy(() => import('./components/viewer/RawView'));
const StructuredView = lazy(() => import('./components/viewer/StructuredView'));
const TimelineView = lazy(() => import('./components/viewer/TimelineView'));

// Load based on selectedView
{selectedView === 'raw' && (
  <Suspense fallback={<Skeleton />}>
    <RawView manifest={manifest} />
  </Suspense>
)}
```

**Impact:**
- Raw View: ~5 KB
- Structured View: ~150 KB
- Timeline View: ~20 KB
- Only load what's needed

### Tree Shaking

**Ensuring Effective Tree Shaking:**

**✅ Good (side-effect free):**
```typescript
// utils.ts
export function utility1() { }
export function utility2() { }

// component.ts
import { utility1 } from './utils';  // utility2 not included in bundle
```

**❌ Bad (side effects):**
```typescript
// utils.ts
console.log('Module loaded');  // Side effect!
export function utility1() { }

// Now entire module always included
```

**Best Practices:**
```typescript
// Mark side-effect free in package.json
{
  "sideEffects": false
}

// Or specify files with side effects
{
  "sideEffects": ["*.css", "src/globals.ts"]
}
```

### Dependency Optimization

**Current Dependencies:**
```json
{
  "dependencies": {
    "m3u8-parser": "^7.2.0",      // 30 KB
    "mpd-parser": "^1.3.1",        // 25 KB
    "prismjs": "^1.30.0",          // 20 KB (with langs)
    "react": "^18.3.1",            // 45 KB
    "react-dom": "^18.3.1",        // 135 KB
    "zustand": "^5.0.9"            // 3 KB
  }
}
```

**Optimization Strategies:**

**1. Import Only What's Needed:**
```typescript
// ❌ Imports everything
import Prism from 'prismjs';
import 'prismjs/components/';  // All languages!

// ✅ Import specific languages
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';  // Only XML/HTML
```

**2. Consider Alternatives:**
```typescript
// Current: Prism.js (20 KB)
// Alternative: highlight.js (12 KB, smaller)
// Alternative: shiki (16 KB, better highlighting)

// Trade-offs to consider:
// - Bundle size
// - Feature set
// - Maintenance
```

**3. Remove Unused:**
```bash
# Analyze bundle
npx vite-bundle-visualizer

# Look for:
// - Duplicate dependencies
// - Unused imports
// - Large libraries barely used
```

### Minification

**Current Settings:**
```typescript
// vite.config.ts (default)
build: {
  minify: 'terser',  // Best compression
  // Alternatives: 'esbuild' (faster, larger)
}
```

**Terser Options (Future):**
```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // Remove console.log in production
      passes: 2            // More aggressive compression
    },
    mangle: {
      toplevel: true       // Mangle top-level names
    }
  }
}
```

**Impact:**
- 10-15% smaller bundles
- Slightly slower build
- Worth it for production

## Runtime Performance

### React Performance

**Component Optimization:**

**1. Memoization:**
```typescript
// ✅ Memoize expensive calculations
const analysis = useMemo(() => {
  console.log('Calculating...');
  return analyzeBitrateLadder(variants);
}, [variants]);  // Only recalculates when variants change

// ✅ Memoize components
const MemoizedVariantCard = memo(VariantCard, (prev, next) => {
  return prev.variant.id === next.variant.id &&
         prev.selected === next.selected;
});
```

**2. Callback Stability:**
```typescript
// ❌ Creates new function every render
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Stable reference
const onClick = useCallback(() => handleClick(id), [id]);
<button onClick={onClick}>Click</button>
```

**3. Avoid Unnecessary Re-renders:**
```typescript
// ✅ Select only what's needed from store
const loading = useManifestStore(s => s.loading);

// ❌ Subscribes to entire store
const store = useManifestStore();
```

**4. Conditional Rendering:**
```typescript
// ✅ Early return
if (!manifest) {
  return null;  // Don't render anything
}

// ✅ Lazy rendering
{showExpensiveComponent && <ExpensiveComponent />}
```

### State Management Performance

**Zustand Optimization:**

**Selectors:**
```typescript
// ✅ Atomic selectors (best)
const manifest = useManifestStore(s => s.manifest);
const loading = useManifestStore(s => s.loading);

// ⚠️ Object selector (okay)
const { manifest, loading } = useManifestStore(s => ({
  manifest: s.manifest,
  loading: s.loading
}));

// ❌ Whole store (causes unnecessary re-renders)
const store = useManifestStore();
```

**Avoid Derived State:**
```typescript
// ❌ Don't store derived data
const videoCount = useManifestStore(s => s.videoVariantCount);

// ✅ Calculate from base state
const videoCount = manifest.variants.filter(v => v.type === 'video').length;

// ✅ Or memo if expensive
const videoCount = useMemo(() =>
  manifest.variants.filter(v => v.type === 'video').length,
  [manifest.variants]
);
```

### Algorithm Optimization

**Efficient Sorting:**
```typescript
// ✅ Sort once, reuse
const sortedVariants = useMemo(() =>
  [...variants].sort((a, b) => a.bitrate - b.bitrate),
  [variants]
);

// ❌ Don't sort in render
return variants.sort(...).map(...);  // Sorts every render!
```

**Efficient Filtering:**
```typescript
// ✅ Combine filters
const filtered = useMemo(() =>
  variants.filter(v =>
    v.type === filterType &&
    v.bitrate >= minBitrate &&
    v.bitrate <= maxBitrate
  ),
  [variants, filterType, minBitrate, maxBitrate]
);

// ❌ Multiple passes
const byType = variants.filter(v => v.type === filterType);
const byMin = byType.filter(v => v.bitrate >= minBitrate);
const byMax = byMin.filter(v => v.bitrate <= maxBitrate);
```

**Efficient Lookups:**
```typescript
// ✅ Use Map for O(1) lookup
const variantMap = useMemo(() =>
  new Map(variants.map(v => [v.id, v])),
  [variants]
);

const variant = variantMap.get(id);  // O(1)

// ❌ Array find is O(n)
const variant = variants.find(v => v.id === id);  // Slower for large arrays
```

## Memory Management

### Preventing Memory Leaks

**Event Listeners:**
```typescript
// ✅ Always cleanup
useEffect(() => {
  const handleMessage = (msg) => { /* ... */ };

  chrome.runtime.onMessage.addListener(handleMessage);

  return () => {
    chrome.runtime.onMessage.removeListener(handleMessage);
  };
}, []);
```

**Observers:**
```typescript
// ✅ Disconnect on unmount
useEffect(() => {
  const observer = new MutationObserver(callback);
  observer.observe(element, options);

  return () => {
    observer.disconnect();  // Critical!
  };
}, []);
```

**Timers:**
```typescript
// ✅ Clear timers
useEffect(() => {
  const interval = setInterval(poll, 2000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

### Memory Optimization

**Large Data Structures:**

**Pagination:**
```typescript
// ✅ Show subset by default
const [showAll, setShowAll] = useState(false);
const displaySegments = showAll ? segments : segments.slice(0, 10);

// Benefits:
// - Renders only 10 items initially
// - Faster initial render
// - Less memory for DOM nodes
```

**Virtual Scrolling (Future):**
```typescript
// For 1000+ items
<VirtualList
  items={allSegments}
  height={600}
  itemHeight={50}
  renderItem={(segment) => <SegmentCard segment={segment} />}
/>

// Benefits:
// - Only renders visible items
// - Constant memory regardless of list size
// - Smooth scrolling
```

**Cleanup:**
```typescript
// ✅ Clear old data
const clearManifest = useManifestStore(s => s.clearManifest);

// When done with manifest
clearManifest();  // Frees memory
```

**Service Worker Memory:**
```typescript
// ✅ Clear per-tab data when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  detectedManifestsMap.delete(tabId);
});

// Prevents memory accumulation
```

## Rendering Optimization

### React Rendering

**Reconciliation:**
```typescript
// ✅ Use stable keys
{variants.map(v => (
  <VariantCard key={v.id} variant={v} />
))}

// ❌ Never use index as key (if items can reorder)
{variants.map((v, i) => (
  <VariantCard key={i} variant={v} />  // Re-renders all on reorder!
))}
```

**Batch Updates:**
```typescript
// ✅ React 18 auto-batches
setLoading(true);
setError(null);
setData(newData);
// All batched into single render

// No need for:
ReactDOM.unstable_batchedUpdates(() => {
  // ...
});  // Deprecated in React 18
```

**Avoid Layout Thrashing:**
```typescript
// ❌ Read-write-read-write (causes multiple layouts)
element.style.width = '100px';
const height = element.offsetHeight;  // Forces layout
element.style.height = '200px';
const width = element.offsetWidth;  // Forces layout again

// ✅ Batch reads, batch writes
const height = element.offsetHeight;
const width = element.offsetWidth;
element.style.width = '100px';
element.style.height = '200px';
```

### CSS Performance

**Efficient Selectors:**
```css
/* ✅ Class selectors (fast) */
.variant-card { }

/* ✅ ID selectors (fastest) */
#unique-element { }

/* ⚠️ Descendant selectors (slower) */
.parent .child .grandchild { }

/* ❌ Universal selector (slowest) */
* { }
```

**Tailwind Optimization:**
```typescript
// ✅ Tailwind utilities (optimized)
<div className="p-4 bg-white rounded">

// ❌ Inline styles (not optimized)
<div style={{ padding: '16px', background: 'white', borderRadius: '4px' }}>
```

**Reduce Paint Area:**
```typescript
// ✅ Localize changes
<div className="will-change-transform">
  {/* Animated content */}
</div>

// ✅ Use transform instead of position
transform: translateX(100px)  // GPU-accelerated
left: 100px  // Causes repaint
```

### List Rendering

**Windowing (Future):**
```typescript
// For 1000+ items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={segments.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <SegmentCard segment={segments[index]} />
    </div>
  )}
</FixedSizeList>
```

**Benefits:**
- Renders only visible items (~20)
- Constant memory
- Smooth scrolling
- Works for millions of items

**Pagination (Current):**
```typescript
// Show subset by default
const displayItems = showAll ? allItems : allItems.slice(0, 10);

// Benefits:
- Simple implementation
- No dependencies
- Good enough for <1000 items
```

## Network Optimization

### Manifest Fetching

**Caching (Future):**
```typescript
// Cache parsed manifests
const cache = new Map<string, ParsedManifest>();

function getCachedManifest(url: string): ParsedManifest | null {
  const cached = cache.get(url);

  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < 5 * 60 * 1000) {  // 5 minutes
      return cached.manifest;
    }
  }

  return null;
}
```

**Benefits:**
- Faster re-loads
- Reduced bandwidth
- Better UX

**HTTP/2 Benefits:**
- Multiple requests in parallel
- Header compression
- Server push (not used currently)

**Prefetching (Future):**
```typescript
// Prefetch likely next manifest
if (manifest.variants[0]) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = manifest.variants[0].url;
  document.head.appendChild(link);
}
```

## Profiling and Monitoring

### Chrome DevTools Profiling

**Performance Tab:**
```
1. F12 → Performance tab
2. Click Record (red circle)
3. Interact with UI (load manifest, switch views, etc.)
4. Stop recording
5. Analyze results
```

**What to Look For:**
- Long tasks (>50ms) - break these up
- Layout thrashing - batch DOM reads/writes
- Excessive renders - memoize components
- Memory spikes - check for leaks

**Flame Graph:**
- Width = time spent
- Stack depth = call hierarchy
- Look for wide bars (time hogs)

**React Profiler:**
```typescript
// Wrap expensive components
import { Profiler } from 'react';

<Profiler id="StructuredView" onRender={logRenderTime}>
  <StructuredView manifest={manifest} />
</Profiler>

function logRenderTime(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} ${phase} render: ${actualDuration}ms`);
}
```

**Memory Tab:**
```
1. F12 → Memory tab
2. Take heap snapshot
3. Interact with UI
4. Take another snapshot
5. Compare snapshots
```

**Look For:**
- Detached DOM nodes (memory leak)
- Retained objects (should be GC'd)
- Growing arrays (accumulating data)

### Performance API

**Measure Operations:**
```typescript
// Mark and measure
performance.mark('parse-start');
const manifest = parseManifest(content, url);
performance.mark('parse-end');

performance.measure('parse-duration', 'parse-start', 'parse-end');

const measure = performance.getEntriesByName('parse-duration')[0];
console.log(`Parse took ${measure.duration}ms`);
```

**Navigation Timing:**
```typescript
// Page load metrics
window.addEventListener('load', () => {
  const timing = performance.getEntriesByType('navigation')[0];
  console.log('DOM loaded:', timing.domContentLoadedEventEnd);
  console.log('Page loaded:', timing.loadEventEnd);
});
```

### Lighthouse Audit

**For Viewer Page:**
```bash
# Run Lighthouse
# DevTools → Lighthouse tab
# Select categories: Performance, Accessibility, Best Practices
# Generate report
```

**Metrics to Check:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+

## Optimization Techniques

### Debouncing

**Search Input:**
```typescript
// ✅ Debounce to reduce updates
import { useMemo } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const searchTerm = useDebounce(inputValue, 300);
// Only updates after 300ms of no typing
```

### Throttling

**Scroll Events:**
```typescript
// ✅ Throttle to limit frequency
function throttle(func: Function, delay: number) {
  let lastCall = 0;

  return (...args: any[]) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  // Expensive operation
}, 100);  // At most every 100ms

window.addEventListener('scroll', handleScroll);
```

### Intersection Observer

**Lazy Loading Images (Future):**
```typescript
function LazyImage({ src, alt }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : undefined}
      alt={alt}
    />
  );
}
```

**Lazy Component Rendering:**
```typescript
// Render components when scrolled into view
function LazySection({ children }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : <Skeleton />}
    </div>
  );
}
```

## Browser-Specific Optimizations

### Chrome Extension Performance

**Service Worker:**
```typescript
// ✅ Keep service worker alive efficiently
// Don't use setInterval (wastes resources)

// ✅ Use alarms API for periodic tasks
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    performCleanup();
  }
});
```

**Message Passing:**
```typescript
// ✅ Use promises (cleaner, faster)
const response = await chrome.runtime.sendMessage({ action: 'fetch' });

// ❌ Avoid callbacks (old style)
chrome.runtime.sendMessage({ action: 'fetch' }, (response) => {
  // Callback hell
});
```

**Storage:**
```typescript
// ✅ Batch storage operations
const updates = {
  history: newHistory,
  settings: newSettings
};

await chrome.storage.local.set(updates);

// ❌ Multiple set calls
await chrome.storage.local.set({ history: newHistory });
await chrome.storage.local.set({ settings: newSettings });
```

## Performance Monitoring

### Metrics to Track

**Bundle Sizes:**
```bash
# After each build
du -h dist/assets/*.js

# Track over time
echo "$(date),$(du -sk dist/ | cut -f1)" >> metrics.csv
```

**Test Performance:**
```bash
# Time test execution
time npm test -- --run

# Individual test timing
npm test -- --reporter=verbose
```

**Build Performance:**
```bash
# Measure build time
time npm run build

# Vite build report
npm run build -- --report
```

### Performance Budgets

**Set Limits:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        utils: ['./src/lib/utils']
      }
    }
  },
  chunkSizeWarningLimit: 500  // Warn if chunk >500 KB
}
```

**Monitor:**
- Viewer bundle: <250 KB
- Shared chunk: <150 KB
- Individual chunks: <50 KB

**Alert if exceeded:**
- Investigate why bundle grew
- Remove unused code
- Split into smaller chunks

## Future Optimizations

### Planned Improvements

**1. Web Workers:**
```typescript
// Parse in worker thread
const worker = new Worker('/parser-worker.js');

worker.postMessage({ content, url });

worker.onmessage = ({ data }) => {
  setManifest(data.manifest);
};
```

**Benefits:**
- Non-blocking parsing
- Better for large manifests
- Keeps UI responsive

**2. IndexedDB Caching:**
```typescript
// Cache parsed manifests
await db.manifests.put({
  url,
  manifest,
  timestamp: Date.now()
});

// Retrieve from cache
const cached = await db.manifests.get(url);
```

**Benefits:**
- Persistent cache
- Faster loads
- Offline support

**3. Incremental Parsing:**
```typescript
// Parse manifest incrementally
async function* parseIncremental(content: string) {
  yield { stage: 'metadata', data: metadata };
  yield { stage: 'variants', data: variants };
  yield { stage: 'segments', data: segments };
}

// Show results progressively
for await (const result of parseIncremental(content)) {
  updateUI(result);
}
```

**Benefits:**
- Faster perceived performance
- Progressive enhancement
- Better UX for large manifests

## Best Practices Summary

**Code:**
- ✅ Use TypeScript for type safety
- ✅ Memo expensive calculations
- ✅ Callback for stable references
- ✅ Early returns for null checks
- ✅ Lazy load heavy components

**State:**
- ✅ Atomic selectors from Zustand
- ✅ Don't store derived state
- ✅ Batch storage operations
- ✅ Clear old data

**Rendering:**
- ✅ Use keys properly
- ✅ Memo components when appropriate
- ✅ Conditional rendering
- ✅ Pagination for long lists
- ✅ Intersection Observer for lazy loading

**Network:**
- ✅ Cache when appropriate
- ✅ Batch requests
- ✅ Use HTTP/2
- ✅ Prefetch likely next resources

**Memory:**
- ✅ Cleanup event listeners
- ✅ Disconnect observers
- ✅ Clear timers
- ✅ Remove old data

**Monitoring:**
- ✅ Profile regularly
- ✅ Set performance budgets
- ✅ Track metrics over time
- ✅ Fix regressions quickly

With these optimizations, the extension maintains excellent performance even with large manifests and complex analysis.
