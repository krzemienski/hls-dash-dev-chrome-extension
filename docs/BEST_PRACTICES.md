# Best Practices Guide

Comprehensive best practices for using, developing, and maintaining the HLS + DASH Manifest Viewer.

## Table of Contents

1. [User Best Practices](#user-best-practices)
2. [Developer Best Practices](#developer-best-practices)
3. [Testing Best Practices](#testing-best-practices)
4. [Performance Best Practices](#performance-best-practices)
5. [Security Best Practices](#security-best-practices)
6. [Documentation Best Practices](#documentation-best-practices)

## User Best Practices

### Analyzing Manifests Effectively

**Start with Validation:**
1. Load manifest
2. Check Validation Report first
3. Address any errors before deep analysis
4. Review warnings for potential issues

**Why:**
- Errors may indicate parsing problems
- Warnings highlight real issues
- Start with health check before details

**Example Workflow:**
```
1. Load manifest
2. Validation shows: "2 warnings"
3. Read warnings: "Only 2 video variants"
4. Decision: Add more variants for better ABR
5. Check ABR Ladder to see gaps
6. Export report for team
```

### Understanding Analysis Results

**ABR Ladder Interpretation:**
```
Small gaps (green):     Good - smooth quality transitions
Medium gaps (yellow):   Acceptable - noticeable changes
Large gaps (red):       Poor - jarring quality jumps

Recommendations:
- Add intermediate variant to fill large gaps
- Ensure lowest variant <500 Kbps for 2G/3G
- Include 4-6 variants total for optimal experience
```

**Codec Analysis:**
```
H.264 (avc1):          Universal compatibility, good compression
H.265 (hvc1):          Better compression, newer devices
AV1 (av01):            Best compression, limited compatibility
VP9 (vp9):             Good compression, web-focused

Recommendation: H.264 for compatibility + AV1 for efficiency
```

**Performance Metrics:**
```
Efficiency Score:
  90-100: Excellent bitrate ladder
  70-89:  Good structure
  50-69:  Needs improvement
  <50:    Poor - restructure recommended

Quality Consistency:
  90-100: Complete metadata
  70-89:  Minor gaps
  50-69:  Missing important data
  <50:    Significant metadata issues
```

### Saving and Organizing Results

**Export Workflow:**
```
1. Analyze manifest in Structured View
2. Review all sections
3. Export as JSON (complete data backup)
4. Export as CSV (for spreadsheet analysis)
5. Export as Text (for documentation)
6. Save all three formats
```

**File Naming Convention:**
```
manifest-[description]-[date]-[format].json
manifest-prod-stream-2024-12-03.json
manifest-test-4k-2024-12-03.csv
manifest-live-event-2024-12-03.txt
```

**Organization:**
```
my-manifests/
├── production/
│   ├── manifest-prod-2024-12-03.json
│   └── manifest-prod-2024-12-01.json
├── staging/
│   └── manifest-staging-2024-12-03.json
├── test/
│   └── manifest-test-2024-12-03.json
└── reports/
    └── analysis-2024-12-03.txt
```

### Using Timeline Simulation

**Network Profile Selection:**
```
Stable:      Test specific quality level, verify bitrate
Varying:     Realistic mobile scenario, test ABR switching
Degrading:   User moving away from router, test downgrade
Improving:   User approaching router, test upgrade
```

**Interpreting Results:**
```
Quality Switches:
  0-5:    Excellent - stable streaming
  6-15:   Good - reasonable adaptation
  16-30:  Fair - frequent switching
  >30:    Poor - too sensitive, user may notice

Rebuffering:
  0s:     Perfect
  <5s:    Acceptable
  5-15s:  Poor UX
  >15s:   Unacceptable - adjust bitrate ladder
```

**Best Practices:**
1. Test with "Varying" profile first (most realistic)
2. Try different bandwidth levels
3. Compare results across manifests
4. Export simulation results for documentation

## Developer Best Practices

### Code Organization

**File Placement:**
```
Pure functions:          src/lib/utils/
Parsers:                 src/lib/parsers/
React components:        src/components/[context]/
Type definitions:        src/types/
State management:        src/store/
Tests:                   tests/[matching-structure]/
```

**Example:**
```
Feature: Resolution analysis
Files:
  - src/lib/utils/resolution-analyzer.ts (logic)
  - tests/utils/resolution-analyzer.test.ts (tests)
  - src/components/viewer/ResolutionAnalysis.tsx (UI)
```

### Component Design

**Single Responsibility:**
```typescript
// ✅ Good: Does one thing
export function VariantCard({ variant }: Props) {
  return <div>{variant.bitrate}</div>;
}

// ❌ Bad: Does too many things
export function VariantCardWithAnalysisAndExport({ variant }: Props) {
  // Displays variant
  // Analyzes variant
  // Exports variant
  // Updates global state
  // Makes API calls
  // ... too much!
}
```

**Props vs State:**
```typescript
// ✅ Props for data from parent
interface Props {
  variant: Variant;        // Data from parent
  onSelect: () => void;    // Callback to parent
}

// ✅ Local state for UI-only
function Component({ variant }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);  // UI state
  const [hovered, setHovered] = useState(false);        // UI state

  // Global state for shared data
  const manifest = useManifestStore(s => s.manifest);   // Global state

  return <div />;
}
```

**Composition Over Inheritance:**
```typescript
// ✅ Good: Composition
function AnalysisPanel({ manifest }: Props) {
  return (
    <Panel>
      <Header title="Analysis" />
      <Content>
        <Stats data={manifest} />
        <Chart data={manifest} />
      </Content>
    </Panel>
  );
}

// ❌ Avoid: Inheritance
class AnalysisPanel extends BasePanel {
  // Harder to understand, test, and maintain
}
```

### Type Safety

**Strict Types:**
```typescript
// ✅ Explicit types for clarity
function parseVariant(data: unknown): Variant {
  // Type guard
  if (!isValidVariantData(data)) {
    throw new TypeError('Invalid variant data');
  }

  return {
    id: data.id,
    bitrate: data.bitrate,
    resolution: data.resolution ? {
      width: data.resolution.width,
      height: data.resolution.height
    } : undefined,
    codecs: data.codecs,
    url: data.url,
    type: data.type
  };
}

// ❌ Avoid any
function parseVariant(data: any): any {
  return data;  // No type safety!
}
```

**Type Guards:**
```typescript
// Create custom type guards
function isHLSManifest(manifest: ParsedManifest): manifest is HLSManifest {
  return manifest.format === 'hls';
}

// Use in code
if (isHLSManifest(manifest)) {
  // TypeScript knows it's HLSManifest here
  const hlsVersion = manifest.hlsVersion;  // Only on HLS
}
```

### Error Handling

**Layered Error Handling:**
```typescript
// Layer 1: Utility function
export async function fetchManifest(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new ManifestFetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof ManifestFetchError) {
      throw error;  // Re-throw custom errors
    }

    // Wrap unknown errors
    throw new ManifestFetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown'}`
    );
  }
}

// Layer 2: Component
function LoadButton() {
  const handleClick = async () => {
    try {
      const content = await fetchManifest(url);
      const manifest = parseManifest(content, url);
      setManifest(manifest);
    } catch (error) {
      if (error instanceof ManifestFetchError) {
        // Show user-friendly message
        setError(error.message);
      } else {
        // Unexpected error
        setError('An unexpected error occurred');
        console.error('Unexpected:', error);
      }
    }
  };

  return <button onClick={handleClick}>Load</button>;
}

// Layer 3: Error Boundary
<ErrorBoundary>
  <LoadButton />
</ErrorBoundary>
```

### State Management

**Zustand Best Practices:**
```typescript
// ✅ Atomic actions
const setManifest = useManifestStore(s => s.setManifest);
const setLoading = useManifestStore(s => s.setLoading);

// Call separately for clarity
setLoading(true);
setManifest(newManifest);
setLoading(false);

// ✅ Or create compound action
const loadManifest = useManifestStore(s => s.loadManifest);

// In store definition:
loadManifest: async (url) => {
  set({ loading: true, error: null });
  try {
    const manifest = await fetchAndParse(url);
    set({ manifest, loading: false });
  } catch (error) {
    set({ error: error.message, loading: false });
  }
}
```

**Selector Optimization:**
```typescript
// ✅ Best: Atomic selector
const manifest = useManifestStore(s => s.manifest);

// ⚠️ Okay: Object selector (creates new object every render)
const { manifest, loading } = useManifestStore(s => ({
  manifest: s.manifest,
  loading: s.loading
}));

// ✅ Better: Memoize object selector
const data = useManifestStore(
  s => ({ manifest: s.manifest, loading: s.loading }),
  shallow  // Shallow comparison
);

// ❌ Worst: Subscribe to everything
const store = useManifestStore();  // Re-renders on ANY state change
```

## Testing Best Practices

### Test Structure

**Descriptive Test Names:**
```typescript
// ✅ Good: Describes what's being tested
describe('URL resolution', () => {
  it('should resolve path-relative URLs to absolute', () => {});
  it('should resolve domain-relative URLs correctly', () => {});
  it('should return absolute URLs unchanged', () => {});
  it('should handle URLs with query parameters', () => {});
});

// ❌ Bad: Vague or unclear
describe('URL stuff', () => {
  it('works', () => {});
  it('test 1', () => {});
  it('doesnt break', () => {});
});
```

**Test Independence:**
```typescript
// ✅ Each test stands alone
describe('calculator', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should subtract two numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });
  // Tests don't depend on each other
});

// ❌ Tests depend on each other
describe('calculator', () => {
  let result;

  it('should add', () => {
    result = add(2, 3);
    expect(result).toBe(5);
  });

  it('should use previous result', () => {
    expect(result).toBe(5);  // Depends on previous test!
  });
});
```

**Clear Assertions:**
```typescript
// ✅ Specific assertions
expect(result.variants).toHaveLength(3);
expect(result.variants[0].bitrate).toBe(1000000);
expect(result.format).toBe('hls');

// ❌ Vague assertions
expect(result).toBeTruthy();  // What specifically?
expect(result.variants.length > 0).toBe(true);  // How many?
```

### Test Data

**Use Realistic Data:**
```typescript
// ✅ Real-world HLS content
const testManifest = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=2227464,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=960x540
gear4/prog_index.m3u8`;

// ❌ Oversimplified
const testManifest = '#EXTM3U\nurl';  // Too simple, misses edge cases
```

**Test Fixtures for Complex Data:**
```typescript
// Store in tests/fixtures/
const bipbopMaster = readFileSync(
  resolve(__dirname, '../fixtures/bipbop-master.m3u8'),
  'utf-8'
);

// Reuse across tests
describe('HLS parsing', () => {
  it('should parse bipbop', () => {
    const result = parseHLS(bipbopMaster, url);
    expect(result.variants).toHaveLength(3);
  });
});
```

### Mocking

**Mock External Dependencies:**
```typescript
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  text: async () => manifestContent
});

// Test code that uses fetch
const result = await fetchManifest(url);

expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
expect(result).toBe(manifestContent);

// Restore
vi.restoreAllMocks();
```

**When to Mock:**
- ✅ External APIs (fetch, chrome APIs)
- ✅ Non-deterministic functions (Date.now, Math.random)
- ✅ Slow operations (network, file I/O)
- ❌ Internal functions (test the real implementation)

### Test Coverage

**Focus on Critical Paths:**
```typescript
// High priority: Parsers (100% coverage)
// - Manifest parsing is core functionality
// - Must handle all edge cases
// - Errors here affect everything

// Medium priority: Utilities (90% coverage)
// - Business logic must be correct
// - Edge cases matter
// - Complex algorithms need verification

// Low priority: Components (70% via manual testing)
// - Visual verification more valuable
// - Harder to test in isolation
// - Playwright covers integration
```

**Coverage Goals:**
- Parsers: 100%
- Analysis utilities: 95%
- Export functions: 100%
- Validation: 90%
- Components: 70% (manual)
- Overall: 85%+

## Performance Best Practices

### React Performance

**Avoid Unnecessary Renders:**
```typescript
// ✅ Memoize expensive components
const MemoizedVariantCard = memo(VariantCard, (prev, next) => {
  // Only re-render if these change
  return prev.variant.id === next.variant.id &&
         prev.selected === next.selected;
});

// ✅ Use keys properly
{variants.map(v => (
  <VariantCard key={v.id} variant={v} />  // Stable key
))}

// ❌ Don't use index as key (if items can reorder)
{variants.map((v, i) => (
  <VariantCard key={i} variant={v} />  // Breaks on reorder!
))}
```

**Memoize Calculations:**
```typescript
// ✅ Calculate once
const sortedVariants = useMemo(() => {
  console.log('Sorting...');
  return [...variants].sort((a, b) => a.bitrate - b.bitrate);
}, [variants]);

// ❌ Calculates every render
const sortedVariants = [...variants].sort(...);  // Sorts every time!
```

**Stable Callbacks:**
```typescript
// ✅ Stable reference
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, [setSelected]);

// ❌ New function every render
const handleClick = (id: string) => {
  setSelected(id);
};
```

### Bundle Size

**Import Only What's Needed:**
```typescript
// ✅ Specific imports
import { parseHLS } from './lib/parsers/hls-parser';

// ❌ Import everything
import * as parsers from './lib/parsers';  // Bundles all parsers
```

**Lazy Load Heavy Components:**
```typescript
// ✅ Load on demand (future)
const HeavyAnalysis = lazy(() => import('./components/HeavyAnalysis'));

<Suspense fallback={<Skeleton />}>
  <HeavyAnalysis />
</Suspense>

// Only loaded when rendered
// Reduces initial bundle
```

### Memory Management

**Clean Up Resources:**
```typescript
// ✅ Always cleanup
useEffect(() => {
  const observer = new MutationObserver(callback);
  observer.observe(element, options);

  return () => {
    observer.disconnect();  // Critical!
  };
}, []);

// ✅ Clear timers
useEffect(() => {
  const timer = setInterval(poll, 2000);

  return () => {
    clearInterval(timer);
  };
}, []);

// ✅ Remove listeners
useEffect(() => {
  const handler = (msg) => handleMessage(msg);
  chrome.runtime.onMessage.addListener(handler);

  return () => {
    chrome.runtime.onMessage.removeListener(handler);
  };
}, []);
```

**Avoid Memory Leaks:**
```typescript
// ❌ Leak: References kept
const cache = [];
function addToCache(item) {
  cache.push(item);  // Never cleared!
}

// ✅ Limit cache size
const cache = [];
const MAX_CACHE = 50;

function addToCache(item) {
  cache.push(item);

  if (cache.length > MAX_CACHE) {
    cache.shift();  // Remove oldest
  }
}

// ✅ Or use Map with size limit
const cache = new Map();
function addToCache(key, value) {
  cache.set(key, value);

  if (cache.size > MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}
```

## Security Best Practices

### Input Validation

**Always Validate User Input:**
```typescript
// ✅ Validate URL before use
function loadManifest(userInput: string) {
  // 1. Check not empty
  if (!userInput || !userInput.trim()) {
    throw new Error('URL required');
  }

  // 2. Validate URL format
  let url: URL;
  try {
    url = new URL(userInput.trim());
  } catch {
    throw new Error('Invalid URL format');
  }

  // 3. Check protocol
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP(S) URLs allowed');
  }

  // 4. Now safe to use
  return fetch(url.toString());
}
```

**Sanitize Display:**
```typescript
// ✅ React auto-escapes
<div>{userInput}</div>

// ✅ Use textContent
element.textContent = userInput;

// ❌ Never use innerHTML with user input
element.innerHTML = userInput;  // XSS risk!
```

### Chrome API Security

**Check API Exists:**
```typescript
// ✅ Guard for extension context
if (typeof chrome !== 'undefined' && chrome.storage) {
  await chrome.storage.local.set({ key: value });
}

// Prevents crashes in:
// - Testing environment
// - Standalone mode
// - If API changes
```

**Validate Messages:**
```typescript
// ✅ Type-safe message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message structure
  if (!message || typeof message.action !== 'string') {
    sendResponse({ success: false, error: 'Invalid message' });
    return;
  }

  // Handle known actions only
  if (KNOWN_ACTIONS.includes(message.action)) {
    handleMessage(message).then(sendResponse);
  } else {
    sendResponse({ success: false, error: 'Unknown action' });
  }

  return true;  // Async response
});
```

### Data Privacy

**Don't Log Sensitive Data:**
```typescript
// ✅ Log safely
console.log('Loading manifest from:', new URL(url).origin);

// ❌ May expose tokens
console.log('Loading:', url);  // Could have auth tokens!

// ✅ Sanitize before logging
function sanitizeUrl(url: string): string {
  const parsed = new URL(url);

  // Remove sensitive params
  ['token', 'key', 'auth', 'signature'].forEach(param => {
    if (parsed.searchParams.has(param)) {
      parsed.searchParams.set(param, '[REDACTED]');
    }
  });

  return parsed.toString();
}

console.log('Loading:', sanitizeUrl(url));
```

## Documentation Best Practices

### Code Comments

**When to Comment:**
```typescript
// ✅ Explain why (not obvious)
// Use 85% safety margin to prevent quality thrashing
const targetBitrate = bandwidth * 0.85;

// ✅ Document complex logic
/**
 * Parse ISO 8601 duration to seconds
 * PT1H30M5S → 5405 seconds
 */
function parseDuration(iso: string): number {
  // ...
}

// ❌ State the obvious
// Set bitrate to 1000000
const bitrate = 1000000;  // This is clear from code

// ❌ Outdated comments
// TODO: Fix this later  // When? Why?
// This is a hack  // Fix it or explain why needed
```

**JSDoc for Public APIs:**
```typescript
/**
 * Parse manifest content and extract variants
 *
 * Automatically detects format (HLS or DASH) and parses accordingly.
 * Resolves relative URLs to absolute based on manifest URL.
 *
 * @param content - Raw manifest content
 * @param url - Manifest URL (for resolving relative URLs)
 * @returns Parsed manifest with variants and metadata
 * @throws Error if content is empty or invalid format
 *
 * @example
 * const manifest = parseManifest(hlsContent, 'https://example.com/master.m3u8');
 * console.log(manifest.variants.length);
 */
export function parseManifest(content: string, url: string): ParsedManifest {
  // ...
}
```

### README Structure

**Good README Has:**
1. **Project name and description** (one sentence)
2. **Key features** (bullet points, 5-10 items)
3. **Screenshot** (shows it in action)
4. **Quick start** (get running in 5 minutes)
5. **Installation** (step-by-step)
6. **Usage** (basic examples)
7. **Documentation** (links to guides)
8. **Contributing** (how to help)
9. **License**

**Example Structure:**
```markdown
# Project Name

One sentence description.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install
npm run build
```

## Usage

```typescript
import { main } from './lib';
const result = main();
```

## Documentation

See [docs/](docs/) for:
- User Guide
- API Reference
- Architecture

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

ISC
```

## Debugging Best Practices

### Console Debugging

**Structured Logging:**
```typescript
// ✅ Use prefixes for filtering
console.log('[Parser] Starting parse...');
console.log('[Parser] Found', variants.length, 'variants');
console.error('[Parser] Error:', error);

// Can filter in console: -[Parser]

// ✅ Group related logs
console.group('Parsing Manifest');
console.log('URL:', url);
console.log('Format:', format);
console.log('Size:', content.length, 'bytes');
console.groupEnd();

// ✅ Use appropriate log levels
console.log('Info');      // General info
console.warn('Warning');  // Potential issues
console.error('Error');   // Actual errors
console.debug('Debug');   // Detailed debugging (filtered by default)
```

**Conditional Logging:**
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Debug info:', details);
}

// Or use debug utility
function debug(...args: any[]) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}
```

### Chrome DevTools Usage

**Network Debugging:**
```
1. F12 → Network tab
2. Load manifest
3. Find manifest request
4. Check:
   - Status (200 vs 404/403)
   - Headers (CORS, Content-Type)
   - Response (actual content)
   - Timing (slow network?)
```

**Performance Profiling:**
```
1. F12 → Performance tab
2. Start recording
3. Load manifest
4. Stop recording
5. Analyze:
   - Long tasks (>50ms)
   - Layout thrashing
   - Memory allocations
   - Network timing
```

**Memory Debugging:**
```
1. F12 → Memory tab
2. Take heap snapshot
3. Load manifest
4. Take another snapshot
5. Compare → Find leaks:
   - Detached DOM nodes
   - Retained listeners
   - Large arrays
```

## Maintenance Best Practices

### Version Control

**Commit Guidelines:**
```bash
# ✅ Small, focused commits
git commit -m "feat: add resolution analyzer"
git commit -m "test: add tests for resolution analyzer"
git commit -m "docs: document resolution analysis"

# ❌ Large, mixed commits
git commit -m "add everything"  // What everything?
git commit -am "."  // No information!
```

**Commit Messages:**
```
Format: <type>(<scope>): <subject>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation
  test:     Tests
  refactor: Code restructuring
  perf:     Performance improvement
  chore:    Maintenance

Examples:
  feat(parser): add HLS version 10 support
  fix(popup): handle empty manifest list
  docs(api): update parser documentation
  test(utils): add edge case tests for URL resolver
```

**Branch Strategy:**
```bash
# Feature branches
git checkout -b feature/network-interception
git checkout -b feature/dark-mode

# Bug fix branches
git checkout -b fix/parse-error

# Hotfix branches
git checkout -b hotfix/critical-bug

# Merge to main when complete
git checkout main
git merge feature/network-interception
```

### Dependency Management

**Update Strategy:**
```bash
# Check for updates weekly
npm outdated

# Review each update
npm view package-name versions
npm view package-name changelog

# Update one at a time
npm install package-name@latest

# Test thoroughly
npm test
npm run build
# Manual testing

# Commit if successful
git commit -am "chore(deps): update package-name to vX.Y.Z"
```

**Security Updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Or manually
npm install vulnerable-package@latest

# Verify fix
npm audit
```

### Documentation Maintenance

**Keep Docs in Sync:**
```
Code Change → Update Docs in Same PR

Example:
- Add new function → Update API.md
- Add new feature → Update FEATURES.md and USER_GUIDE.md
- Change behavior → Update relevant docs
- Deprecate API → Add deprecation notice
```

**Documentation Checklist:**
- [ ] API docs updated
- [ ] User guide updated (if user-facing)
- [ ] Examples added (if new pattern)
- [ ] Changelog entry (for releases)
- [ ] README updated (if major change)

## Code Review Best Practices

### For Authors

**Before Requesting Review:**
```
1. Self-review all changes
2. Remove debug code (console.logs, comments)
3. Run all tests
4. Build succeeds
5. Manual testing done
6. Documentation updated
7. Commit messages clear
8. No unrelated changes
```

**PR Description:**
```markdown
## What
Brief description of changes

## Why
Reason for change / problem being solved

## How
Approach taken

## Testing
- [ ] Unit tests added
- [ ] Manual testing done
- [ ] All tests pass

## Screenshots
(if UI changes)
```

### For Reviewers

**What to Check:**
1. **Functionality** - Does it work? Solve the problem?
2. **Tests** - Are there tests? Do they pass?
3. **Code Quality** - Readable? Maintainable?
4. **Performance** - Any performance impact?
5. **Security** - Any security concerns?
6. **Documentation** - Docs updated?

**Review Comments:**
```
✅ Good comments:
- "Consider using useMemo here for performance"
- "This could throw if variant is null - add check?"
- "Great test coverage!"

❌ Bad comments:
- "This is wrong" (explain why)
- "Just rewrite this" (suggest how)
- Nitpicking style (use linter instead)
```

## Deployment Best Practices

### Pre-Release Checklist

**Before Every Release:**
```
1. All tests pass:        npm test
2. Build succeeds:        npm run build
3. Manual testing:        Follow TESTING_CHECKLIST.md
4. Version bumped:        package.json + manifest.json
5. CHANGELOG updated:     Add release notes
6. Documentation current: All docs up-to-date
7. No console errors:     Verify in browser
8. Performance checked:   No regressions
```

**Version Numbering:**
```
Breaking changes:  v2.0.0 (major)
New features:      v1.1.0 (minor)
Bug fixes:         v1.0.1 (patch)

Examples:
  1.0.0 → 1.1.0:  Added network interception (new feature)
  1.1.0 → 1.1.1:  Fixed parse bug (bug fix)
  1.1.1 → 2.0.0:  Removed old API (breaking change)
```

### Release Process

**Steps:**
```bash
# 1. Update version
npm version minor  # or major/patch
# Updates package.json and creates git tag

# 2. Update manifest
# Edit public/manifest.json version manually

# 3. Update CHANGELOG
# Add entry for new version

# 4. Commit
git commit -am "chore: prepare release v1.1.0"

# 5. Build
npm run build

# 6. Test
# Full manual test checklist

# 7. Tag
git tag v1.1.0

# 8. Push
git push origin main --tags

# 9. Create GitHub release
# 10. Submit to Chrome Web Store
```

## Common Pitfalls to Avoid

### Code Pitfalls

**1. Mutating State:**
```typescript
// ❌ Don't mutate
const variant = manifest.variants[0];
variant.bitrate = 2000000;  // Mutates original!

// ✅ Create new object
const updated = {
  ...variant,
  bitrate: 2000000
};
```

**2. Missing Dependencies:**
```typescript
// ❌ Missing dependency
useEffect(() => {
  doSomething(value);
}, []);  // Should include 'value'!

// ✅ Include all dependencies
useEffect(() => {
  doSomething(value);
}, [value]);
```

**3. Forgetting Cleanup:**
```typescript
// ❌ No cleanup
useEffect(() => {
  const timer = setInterval(poll, 1000);
  // Timer keeps running after unmount!
}, []);

// ✅ Clean up
useEffect(() => {
  const timer = setInterval(poll, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

### Testing Pitfalls

**1. Testing Implementation Details:**
```typescript
// ❌ Don't test internal state
expect(component.state.internalCounter).toBe(5);

// ✅ Test public behavior
expect(component).toHaveText('Count: 5');
```

**2. Brittle Tests:**
```typescript
// ❌ Breaks with minor changes
expect(output).toBe('Exact string with specific formatting');

// ✅ Test behavior
expect(output).toContain('key information');
expect(output).toMatch(/pattern/);
```

**3. Slow Tests:**
```typescript
// ❌ Real delays
await new Promise(resolve => setTimeout(resolve, 5000));  // 5s!

// ✅ Mock time
vi.useFakeTimers();
triggerEvent();
vi.advanceTimersByTime(5000);
vi.useRealTimers();
```

### Deployment Pitfalls

**1. Forgetting to Build:**
```bash
# ❌ Test old code
# Make changes
# Load extension
# Changes don't appear!

# ✅ Always rebuild
npm run build
# Then reload extension
```

**2. Committing dist/:**
```bash
# ❌ Don't commit build output
git add dist/  # Build artifacts shouldn't be in repo

# ✅ Gitignore dist/
echo "dist/" >> .gitignore

# ✅ Generate dist/ during deployment
```

**3. Not Testing in Clean State:**
```bash
# ❌ Test with cached data
# Extension already loaded
# Make changes, test
# Might use cached data!

# ✅ Test clean
# Uninstall extension
# Clear storage
# Reinstall
# Test from scratch
```

## Collaboration Best Practices

### Code Reviews

**Reviewing Code:**
```
1. Understand the goal
2. Check tests first (what should it do?)
3. Read code (does it do that?)
4. Look for edge cases
5. Check error handling
6. Verify performance impact
7. Suggest improvements kindly
```

**Receiving Reviews:**
```
1. Read all comments carefully
2. Don't take personally
3. Ask for clarification if unclear
4. Make requested changes
5. Reply to each comment
6. Thank reviewer
```

### Communication

**Effective Communication:**
```markdown
❌ Bad: "It doesn't work"
✅ Good: "When I load URL X, I get error Y. Expected behavior: Z"

❌ Bad: "This code is bad"
✅ Good: "This function could throw if X is null. Consider adding a check?"

❌ Bad: "Just use library X"
✅ Good: "Have you considered library X? It might simplify this code by..."
```

## Continuous Improvement

### Regular Reviews

**Monthly:**
- Review metrics (bundle size, test count, coverage)
- Update dependencies
- Check for security issues
- Review open issues

**Quarterly:**
- Architecture review
- Performance audit
- Documentation review
- Roadmap adjustment

**Annually:**
- Major version planning
- Technology stack review
- Deprecation decisions
- Long-term roadmap

### Learning from Issues

**When bugs found:**
```
1. Reproduce bug
2. Write failing test
3. Fix bug
4. Verify test passes
5. Ask: How did this slip through?
6. Add to test suite if missing coverage
7. Update documentation if needed
8. Consider prevention strategies
```

**Build Knowledge Base:**
```
Common Issues →
  Document in TROUBLESHOOTING.md

Useful Patterns →
  Add to EXAMPLES.md

Design Decisions →
  Add to ARCHITECTURE.md
```

Following these best practices ensures the project remains high-quality, maintainable, and welcoming to contributors.
