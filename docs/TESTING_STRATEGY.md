# Testing Strategy

Comprehensive testing strategy and methodology for the HLS + DASH Manifest Viewer.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Test Coverage Strategy](#test-coverage-strategy)
4. [Testing Tools](#testing-tools)
5. [Writing Effective Tests](#writing-effective-tests)
6. [CI/CD Testing](#cicd-testing)
7. [Manual Testing](#manual-testing)

## Testing Philosophy

### Core Principles

**1. Test-Driven Development (TDD):**
```
Write Test → See it Fail → Write Code → See it Pass → Refactor
```

**Benefits:**
- Forces thinking about API design
- Ensures test actually tests something (saw it fail)
- Creates living documentation
- Prevents regressions

**When to Use TDD:**
- ✅ Pure functions (utilities, parsers)
- ✅ Business logic
- ✅ Complex algorithms
- ⚠️ UI components (harder, less valuable)
- ❌ Exploratory code (spike first, test later)

**2. Test Pyramid:**
```
        /\
       /E2E\      ← Few (expensive, slow)
      /------\
     /  Int   \   ← Some (moderate cost)
    /----------\
   /   Unit     \ ← Many (cheap, fast)
  /--------------\
```

**Our Distribution:**
- Unit Tests: 124 (base of pyramid)
- Integration Tests: Playwright (some)
- E2E Tests: Manual checklist (few)

**3. Confidence Over Coverage:**
- 100% coverage doesn't mean bug-free
- Test critical paths thoroughly
- Test edge cases
- Focus on user-facing behavior

**4. Fast Feedback:**
- Tests run in <500ms total
- No network calls in unit tests
- Parallel execution
- Clear error messages

## Test Types

### 1. Unit Tests (124 tests)

**What:** Test individual functions in isolation

**Location:** `tests/utils/`, `tests/parsers/`, etc.

**Example:**
```typescript
// tests/utils/url-resolver.test.ts
describe('resolveManifestUrl', () => {
  it('should resolve relative URLs', () => {
    const result = resolveManifestUrl(
      'variant.m3u8',
      'https://example.com/master.m3u8'
    );

    expect(result).toBe('https://example.com/variant.m3u8');
  });
});
```

**Characteristics:**
- Fast (<1ms per test)
- No external dependencies
- Predictable
- Easy to debug

**What to Test:**
- URL resolution (9 tests)
- Format detection (5 tests)
- HLS parsing (3 tests)
- DASH parsing (5 tests)
- ABR analysis (7 tests)
- Codec analysis (8 tests)
- Export functions (5 tests)
- Validation logic (5 tests)
- All utility functions (78 tests total)

### 2. Integration Tests (Playwright)

**What:** Test components working together

**Location:** `/tmp/playwright-test-*.js`

**Example:**
```javascript
// Test viewer loading real manifest
await page.goto('http://localhost:8888/viewer.html');
await page.fill('input[placeholder*="manifest"]', MANIFEST_URL);
await page.click('button:has-text("Load")');
await page.waitForTimeout(3000);

const headerText = await page.textContent('h1');
expect(headerText).toContain('HLS Manifest Viewer');
```

**Characteristics:**
- Slower (~10s per test)
- Uses real browser
- Tests actual user flows
- Catches integration bugs

**What to Test:**
- Manifest loading flow
- View switching
- Export functionality
- Error handling
- UI rendering

### 3. Manual Tests

**What:** Human verification of features

**Location:** `docs/TESTING_CHECKLIST.md`

**When to Use:**
- Extension-specific features (popup, devtools)
- Complex UI interactions
- Visual regression
- Browser compatibility

**Checklist Includes:**
- Extension installation
- Popup functionality
- DevTools panel
- Context menus
- All viewer features
- Settings persistence

### 4. Performance Tests (Future)

**What:** Measure and verify performance

**Example:**
```typescript
it('should parse large manifest in <1s', () => {
  const largeManifest = generateLargeManifest(100);  // 100 variants

  const start = performance.now();
  const result = parseManifest(largeManifest, url);
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(1000);
  expect(result.variants).toHaveLength(100);
});
```

**Metrics:**
- Parse time
- Render time
- Memory usage
- Bundle size

## Test Coverage Strategy

### Coverage by Layer

**Parsers: 100% Coverage**
- Critical path - must be reliable
- All edge cases tested
- Both HLS and DASH
- Format detection

**Test Coverage:**
- ✅ HLS parsing (3 tests)
- ✅ DASH parsing (5 tests)
- ✅ Format detection (5 tests)
- ✅ Unified parser (3 tests)
- ✅ URL resolution (9 tests)

**Utilities: 95% Coverage**
- Business logic must be correct
- Edge cases matter
- Complex algorithms tested

**Test Coverage:**
- ✅ ABR analysis (7 tests)
- ✅ Codec analyzer (8 tests)
- ✅ URL analyzer (10 tests)
- ✅ Resolution analyzer (17 tests)
- ✅ Frame rate analyzer (9 tests)
- ✅ Protocol analyzer (14 tests)
- ✅ DRM detector (12 tests)
- ✅ Manifest diff (4 tests)

**Export: 100% Coverage**
- Data integrity critical
- Format compliance required

**Test Coverage:**
- ✅ JSON export (2 tests)
- ✅ CSV export (2 tests)
- ✅ Text export (1 test)

**Validation: 90% Coverage**
- Quality checks must be accurate
- Edge cases tested

**Test Coverage:**
- ✅ Manifest validation (5 tests)

**Components: Manual Testing**
- Unit testing React components complex
- Requires mocking chrome APIs
- Manual testing more reliable
- Playwright for integration

**Coverage Strategy:**
- Visual regression via screenshots
- Manual checklist verification
- Playwright for critical flows

### What NOT to Test

**Skip Testing:**
- ❌ Third-party libraries (trust them)
- ❌ Chrome APIs (Google tests these)
- ❌ React internals (React team tests)
- ❌ TypeScript compiler (Microsoft tests)

**Don't Test Implementation:**
```typescript
// ❌ Bad: Testing internal state
expect(component.state.internalCounter).toBe(5);

// ✅ Good: Testing behavior
expect(component).toHaveText('Count: 5');
```

## Testing Tools

### Vitest

**Why Vitest:**
- Fast (native ES modules)
- Vite integration (same config)
- Jest-compatible API
- TypeScript support
- Watch mode
- Coverage reporting

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,         // No imports needed
    environment: 'node',   // Fast (no DOM simulation)
  }
});
```

**Commands:**
```bash
npm test                    # Watch mode
npm test -- --run          # Single run
npm test -- --coverage     # With coverage
npm test -- --ui           # Browser UI
npm test my-test           # Specific test
```

### Playwright

**Why Playwright:**
- Real browser testing
- Cross-browser support
- Screenshot testing
- Network interception
- Video recording

**Usage:**
```bash
# Via skill
cd /path/to/playwright-skill
node run.js /tmp/test-script.js
```

**Test Structure:**
```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:8888/viewer.html');
  await page.screenshot({ path: '/tmp/screenshot.png' });

  await browser.close();
})();
```

### Chrome DevTools

**For Manual Testing:**
- Performance profiling
- Memory leak detection
- Network analysis
- React component inspection

**Integration with Tests:**
```javascript
// Enable in Playwright
const context = await browser.newContext({
  devtools: true  // Opens DevTools automatically
});
```

## Writing Effective Tests

### Test Structure

**AAA Pattern:**
```typescript
it('should do something', () => {
  // Arrange: Set up test data
  const input = createTestData();

  // Act: Execute the function
  const result = functionUnderTest(input);

  // Assert: Verify the outcome
  expect(result).toBe(expected);
});
```

**GIVEN-WHEN-THEN:**
```typescript
describe('URL resolver', () => {
  it('should resolve relative paths', () => {
    // GIVEN a base URL and relative path
    const baseUrl = 'https://example.com/path/master.m3u8';
    const relativePath = 'variant.m3u8';

    // WHEN resolving the URL
    const result = resolveManifestUrl(relativePath, baseUrl);

    // THEN should return absolute URL
    expect(result).toBe('https://example.com/path/variant.m3u8');
  });
});
```

### Good Test Characteristics

**F.I.R.S.T. Principles:**

**Fast:**
```typescript
// ✅ Fast test (<1ms)
expect(add(1, 2)).toBe(3);

// ❌ Slow test (avoid in unit tests)
await fetch('https://api.example.com/data');  // Network call
```

**Independent:**
```typescript
// ✅ Each test stands alone
it('test 1', () => {
  const result = func(input1);
  expect(result).toBe(expected1);
});

it('test 2', () => {
  const result = func(input2);
  expect(result).toBe(expected2);
});
// Neither depends on the other

// ❌ Dependent tests
let sharedState;
it('test 1', () => {
  sharedState = func(input);  // Sets state for test 2
});

it('test 2', () => {
  expect(sharedState).toBe(...);  // Depends on test 1!
});
```

**Repeatable:**
```typescript
// ✅ Same result every time
expect(parseCodec('avc1.64001f')).toEqual({
  codec: 'H.264',
  profile: 'High'
});

// ❌ Non-deterministic
expect(Math.random()).toBe(0.5);  // Fails randomly
expect(Date.now()).toBe(1234567890);  // Time-dependent
```

**Self-Validating:**
```typescript
// ✅ Clear pass/fail
expect(result).toBe(expected);  // Unambiguous

// ❌ Requires manual inspection
console.log(result);  // Is this right?
```

**Timely:**
- Write tests when writing code (TDD)
- Don't defer test writing
- Hard to test after the fact

### Test Naming

**Good Names:**
```typescript
// ✅ Describes what's being tested
it('should parse HLS master playlist with 3 variants', () => {});
it('should throw error when manifest is empty', () => {});
it('should resolve domain-relative URLs correctly', () => {});

// ❌ Vague names
it('works', () => {});
it('test 1', () => {});
it('should not break', () => {});
```

**Naming Pattern:**
```
should [expected behavior] when [condition]
should [expected behavior] for [input type]
should [expected behavior]
```

### Test Organization

**Group Related Tests:**
```typescript
describe('URL resolution', () => {
  describe('relative URLs', () => {
    it('should handle path-relative', () => {});
    it('should handle domain-relative', () => {});
  });

  describe('absolute URLs', () => {
    it('should return unchanged', () => {});
    it('should handle query parameters', () => {});
  });

  describe('error cases', () => {
    it('should handle invalid URLs', () => {});
    it('should handle malformed input', () => {});
  });
});
```

**Benefits:**
- Organized output
- Easy to find specific tests
- Clear structure
- Better test reports

## CI/CD Testing

### GitHub Actions (Future)

**Test Workflow:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --run

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

**Build Workflow:**
```yaml
# .github/workflows/build.yml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: extension-build
          path: dist/
```

**Playwright Workflow:**
```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: /tmp/*.png
```

### Test Gates

**PR Requirements:**
- ✅ All unit tests pass
- ✅ Build succeeds
- ✅ No TypeScript errors
- ✅ Coverage doesn't decrease
- ⚠️ Manual testing checklist completed

**Merge Requirements:**
- All PR requirements +
- Code review approved
- No merge conflicts
- Branch up-to-date with main

## Manual Testing

### When to Manual Test

**Always:**
- Before releasing
- After major refactoring
- When changing Chrome APIs
- After dependency updates

**Sometimes:**
- New features (in addition to automated tests)
- Bug fixes (to verify and prevent regression)
- UI changes (visual verification)

**Rarely:**
- Documentation-only changes
- Test-only changes
- Minor refactoring with good test coverage

### Manual Test Process

**1. Follow Checklist:**
- See `docs/TESTING_CHECKLIST.md`
- Check all items
- Note any failures
- Document unexpected behavior

**2. Exploratory Testing:**
- Try to break it
- Use in unexpected ways
- Test edge cases not in checklist
- Think like a user

**3. Browser Testing:**
- Test in Chrome (primary)
- Test in Edge (Chromium)
- Test in different OS if possible
- Test in incognito (rule out conflicts)

**4. Performance Testing:**
- Load large manifests
- Test with slow network
- Monitor memory usage
- Check CPU usage

## Regression Testing

### Preventing Regressions

**Automated:**
```bash
# All existing tests run on every PR
# Catches regressions automatically

npm test -- --run
# 124 tests must pass
```

**Manual:**
- Quick smoke test after each build
- Full checklist before release
- Test reported bugs specifically

**Strategies:**

**1. Bug → Test Pattern:**
```
Bug Reported
  ↓
Reproduce Bug
  ↓
Write Failing Test
  ↓
Fix Bug
  ↓
Test Passes
  ↓
Commit Test + Fix
  ↓
Regression Prevented
```

**2. Critical Path Testing:**
- Identify most-used features
- Test these every release
- Automate where possible

**Critical Paths:**
1. Load HLS manifest
2. Load DASH manifest
3. Switch between views
4. Export to JSON
5. Detect manifests on page

**3. Compatibility Testing:**
- Test on multiple Chrome versions
- Test on different OS
- Test with different screen sizes

## Test Data

### Test Fixtures

**Location:** `tests/fixtures/`

**Current Fixtures:**
```
fixtures/
├── bipbop-master.m3u8  # Apple HLS test stream
└── sample-dash.mpd      # DASH sample manifest
```

**Adding Fixtures:**
```bash
# Get real-world manifest
curl "https://example.com/manifest.m3u8" > tests/fixtures/example.m3u8

# Or create synthetic
cat > tests/fixtures/simple.m3u8 << 'EOF'
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=1280x720
playlist.m3u8
EOF
```

**Best Practices:**
- Use real-world examples
- Include edge cases
- Keep files small (<10 KB)
- Document what each tests

### Test Data Generators

**For Complex Scenarios:**
```typescript
// tests/helpers/manifest-generator.ts
export function generateHLSManifest(options: {
  variantCount: number;
  segmentCount?: number;
  encrypted?: boolean;
}): string {
  let manifest = '#EXTM3U\n#EXT-X-VERSION:6\n';

  for (let i = 0; i < options.variantCount; i++) {
    const bitrate = (i + 1) * 1000000;
    manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate}\nvariant${i}.m3u8\n`;
  }

  return manifest;
}

// Usage in tests
const largeManifest = generateHLSManifest({ variantCount: 100 });
const result = parseHLS(largeManifest, url);
expect(result.variants).toHaveLength(100);
```

## Testing Patterns

### Mocking

**When to Mock:**
- External APIs (fetch, chrome APIs)
- Complex dependencies
- Non-deterministic behavior
- Slow operations

**Example:**
```typescript
import { vi } from 'vitest';

describe('manifest fetcher', () => {
  it('should handle 404 errors', async () => {
    // Mock fetch to return 404
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchManifest('url')).rejects.toThrow('not found');
  });
});
```

**Mocking Chrome APIs:**
```typescript
global.chrome = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({ history: [] }),
      set: vi.fn().mockResolvedValue(undefined)
    }
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true })
  }
} as any;
```

### Snapshot Testing

**For Complex Objects:**
```typescript
it('should parse manifest to expected structure', () => {
  const result = parseHLS(hlsContent, url);

  // First run creates snapshot
  // Future runs compare against it
  expect(result).toMatchSnapshot();
});
```

**When to Use:**
- Large objects (ParsedManifest)
- Complex UI output
- Error messages
- Generated code

**When NOT to Use:**
- Timestamps (always different)
- IDs (randomized)
- Dynamic data

**Updating Snapshots:**
```bash
# When intentional change
npm test -- -u

# Review snapshot changes in git diff
# Commit updated snapshots
```

### Parameterized Tests

**For Multiple Inputs:**
```typescript
describe('codec parsing', () => {
  const testCases = [
    { input: 'avc1.64001f', expected: { codec: 'H.264', profile: 'High' } },
    { input: 'mp4a.40.2', expected: { codec: 'AAC-LC', profile: 'Low Complexity' } },
    { input: 'hvc1.1.6.L93', expected: { codec: 'H.265', profile: 'Main' } }
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should parse ${input} correctly`, () => {
      const result = parseCodec(input);
      expect(result).toMatchObject(expected);
    });
  });
});
```

## Debugging Tests

### Test Failures

**Read the Error:**
```
AssertionError: expected 'HLS' to be 'DASH'

Expected: "DASH"
Received: "HLS"
```

**Steps:**
1. Understand what's expected
2. Check why we got different value
3. Is test wrong or code wrong?
4. Fix and re-run

**Common Causes:**
- Test expectations wrong
- Test data incorrect
- Code has bug
- Edge case not handled

### Debugging Techniques

**1. Add Logging:**
```typescript
it('should parse correctly', () => {
  const result = parseManifest(content, url);

  console.log('Result:', result);  // Temporary debug
  console.log('Variants:', result.variants);

  expect(result.format).toBe('hls');
});
```

**2. Isolate the Test:**
```typescript
// Run only this test
it.only('should do something', () => {
  // Test code
});

// Run all except this
it.skip('should do something else', () => {
  // Skipped
});
```

**3. Simplify Test Data:**
```typescript
// ❌ Complex, hard to debug
const manifest = realWorldComplexManifest;

// ✅ Minimal, clear
const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1000000
variant.m3u8`;
```

**4. Use Debugger:**
```typescript
it('should parse', () => {
  debugger;  // Pause here
  const result = parseManifest(content, url);
  expect(result).toBeDefined();
});
```

Run test with debugger attached:
```bash
node --inspect-brk node_modules/.bin/vitest run my-test
```

## Test Maintenance

### Keeping Tests Healthy

**Regular Maintenance:**
- Update tests when requirements change
- Remove obsolete tests
- Refactor duplicated test code
- Keep test data current

**Test Smells:**

**1. Flaky Tests:**
```typescript
// ❌ Depends on timing
it('should update after delay', async () => {
  trigger();
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(value).toBe(updated);  // Might fail if slow
});

// ✅ Wait for condition
it('should update after delay', async () => {
  trigger();
  await waitFor(() => expect(value).toBe(updated));
});
```

**2. Brittle Tests:**
```typescript
// ❌ Breaks with minor changes
expect(output).toBe('Exact string with precise formatting');

// ✅ Test behavior, not format
expect(output).toContain('key information');
```

**3. Slow Tests:**
```typescript
// ❌ Unnecessary delays
await new Promise(resolve => setTimeout(resolve, 5000));

// ✅ Wait for specific condition
await waitForElement('.loaded');
```

### Test Refactoring

**Extract Common Setup:**
```typescript
// Before: Duplicated setup
describe('parser', () => {
  it('test 1', () => {
    const parser = new Parser();
    parser.configure({ ... });
    // Test 1
  });

  it('test 2', () => {
    const parser = new Parser();
    parser.configure({ ... });  // Duplicated!
    // Test 2
  });
});

// After: Shared setup
describe('parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
    parser.configure({ ... });
  });

  it('test 1', () => {
    // Use parser
  });

  it('test 2', () => {
    // Use parser
  });
});
```

**Test Helpers:**
```typescript
// tests/helpers/manifest-helpers.ts
export function createMockManifest(overrides?: Partial<ParsedManifest>): ParsedManifest {
  return {
    format: 'hls',
    raw: '#EXTM3U',
    url: 'https://example.com/manifest.m3u8',
    variants: [],
    metadata: { type: 'VOD', encrypted: false },
    ...overrides
  };
}

// Usage in tests
const manifest = createMockManifest({
  variants: [mockVariant1, mockVariant2]
});
```

## Coverage Analysis

### Reading Coverage Reports

```bash
npm test -- --coverage

# Output shows:
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
url-resolver.ts       |   100   |    100   |   100   |   100
format-detector.ts    |   95    |    90    |   100   |   95
```

**Metrics:**
- **Statements:** Lines executed
- **Branches:** if/else paths taken
- **Functions:** Functions called
- **Lines:** Physical lines covered

**Goals:**
- Critical code: 100%
- Utilities: 90%+
- Components: 70%+ (manual testing supplements)
- Overall: 85%+

### Improving Coverage

**Find Uncovered Code:**
```bash
npm test -- --coverage

# Look for files <90%
# Check coverage/index.html for details
```

**Add Tests:**
```typescript
// Found: url-resolver.ts line 45 not covered

// Check what's on line 45
// Add test for that case

it('should handle edge case from line 45', () => {
  const result = resolveUrl(edgeCaseInput, baseUrl);
  expect(result).toBe(expectedForEdgeCase);
});
```

**Don't Chase 100%:**
- Some code hard to test (browser-specific)
- Some code tested manually (UI)
- Diminishing returns after 90%
- Focus on critical paths

## Testing Best Practices

### Do's

**✅ Test Behavior:**
```typescript
// Test what function does, not how
it('should sort variants by bitrate', () => {
  const result = sortVariants(unsorted);

  expect(result[0].bitrate).toBe(1000000);
  expect(result[1].bitrate).toBe(2000000);
  // Don't test the sorting algorithm itself
});
```

**✅ Test Edge Cases:**
```typescript
it('should handle empty array', () => {
  expect(processVariants([])).toEqual([]);
});

it('should handle null', () => {
  expect(processVariants(null)).toEqual([]);
});

it('should handle single item', () => {
  expect(processVariants([item])).toHaveLength(1);
});
```

**✅ Test Error Cases:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parseManifest('', url)).toThrow();
  expect(() => parseManifest('invalid', url)).toThrow();
});
```

**✅ Use Descriptive Assertions:**
```typescript
// ✅ Clear what's being tested
expect(result.variants).toHaveLength(3);
expect(result.format).toBe('hls');

// ❌ Unclear assertion
expect(result).toBeTruthy();  // What specifically?
```

### Don'ts

**❌ Test Implementation:**
```typescript
// ❌ Don't test private functions
expect(component.privateMethod()).toBe(...);

// ✅ Test public API
expect(component.publicMethod()).toBe(...);
```

**❌ Multiple Assertions for Different Things:**
```typescript
// ❌ One test doing too much
it('should do everything', () => {
  expect(func1()).toBe(...);
  expect(func2()).toBe(...);
  expect(func3()).toBe(...);
});

// ✅ Separate tests
it('should do thing 1', () => {
  expect(func1()).toBe(...);
});

it('should do thing 2', () => {
  expect(func2()).toBe(...);
});
```

**❌ Slow Tests:**
```typescript
// ❌ Don't use real delays
await new Promise(resolve => setTimeout(resolve, 5000));

// ✅ Mock time
vi.useFakeTimers();
func();
vi.advanceTimersByTime(5000);
```

## Performance Testing

### Benchmarking

**Parse Performance:**
```typescript
// tests/performance/parse-benchmark.test.ts
import { describe, it } from 'vitest';

describe('Parse Performance', () => {
  it('should parse typical HLS in <100ms', () => {
    const content = readFileSync('fixtures/bipbop-master.m3u8', 'utf-8');

    const start = performance.now();
    const result = parseHLS(content, url);
    const duration = performance.now() - start;

    console.log(`Parse time: ${duration}ms`);
    expect(duration).toBeLessThan(100);
  });

  it('should parse large manifest in <1s', () => {
    const content = generateLargeManifest(1000);  // 1000 variants

    const start = performance.now();
    const result = parseHLS(content, url);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000);
  });
});
```

**Memory Benchmarks:**
```typescript
it('should not leak memory', () => {
  const memBefore = process.memoryUsage().heapUsed;

  // Parse 100 manifests
  for (let i = 0; i < 100; i++) {
    parseManifest(content, url);
  }

  // Force GC if available
  if (global.gc) global.gc();

  const memAfter = process.memoryUsage().heapUsed;
  const growth = memAfter - memBefore;

  // Should not grow significantly
  expect(growth).toBeLessThan(10 * 1024 * 1024);  // <10 MB
});
```

### Load Testing

**Large Manifests:**
```typescript
function generateLargeManifest(variantCount: number): string {
  let manifest = '#EXTM3U\n';

  for (let i = 0; i < variantCount; i++) {
    manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${(i + 1) * 100000}\n`;
    manifest += `variant${i}.m3u8\n`;
  }

  return manifest;
}

it('should handle 1000 variants', () => {
  const manifest = generateLargeManifest(1000);
  const result = parseManifest(manifest, url);

  expect(result.variants).toHaveLength(1000);
});
```

## Continuous Improvement

### Metrics to Track

**Test Metrics:**
- Total test count (trend: increasing)
- Test execution time (trend: stable or decreasing)
- Coverage percentage (trend: stable or increasing)
- Flaky test count (trend: zero)

**Performance Metrics:**
- Bundle size (trend: stable or decreasing)
- Parse time (trend: decreasing)
- Render time (trend: decreasing)
- Memory usage (trend: stable)

**Quality Metrics:**
- Bug count (trend: decreasing)
- Time to fix bugs (trend: decreasing)
- User-reported issues (trend: decreasing)
- Code review time (trend: stable)

### Regular Reviews

**Weekly:**
- Run full test suite
- Check for flaky tests
- Review test execution time
- Update failing tests

**Monthly:**
- Review coverage reports
- Identify untested code
- Add tests for gaps
- Refactor test code

**Quarterly:**
- Performance audit
- Bundle size review
- Dependency updates
- Remove obsolete tests

## Testing Checklist for Contributors

**Before Submitting PR:**
- [ ] All existing tests pass (`npm test`)
- [ ] New tests written for new code
- [ ] Tests follow naming conventions
- [ ] No skipped tests (it.skip)
- [ ] No focused tests (it.only)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing done for UI changes
- [ ] Performance impact assessed
- [ ] Documentation updated

**Reviewer Checklist:**
- [ ] Tests exist and are appropriate
- [ ] Tests actually test the feature
- [ ] Edge cases covered
- [ ] Error cases covered
- [ ] Test names descriptive
- [ ] No test smells
- [ ] Coverage not decreased

## Future Testing Enhancements

**Planned:**
1. Visual regression testing
2. Automated browser testing in CI
3. Performance benchmarking suite
4. Mutation testing
5. Fuzz testing for parsers
6. Contract testing for message passing
7. Load testing with large manifests
8. Accessibility testing (axe-core)

With this comprehensive testing strategy, we ensure the extension is reliable, performant, and maintainable.
