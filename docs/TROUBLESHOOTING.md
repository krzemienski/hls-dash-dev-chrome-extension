# Troubleshooting Guide

Comprehensive solutions for common issues with the HLS + DASH Manifest Viewer.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Manifest Loading Problems](#manifest-loading-problems)
3. [Detection Issues](#detection-issues)
4. [UI Problems](#ui-problems)
5. [Performance Issues](#performance-issues)
6. [Extension Errors](#extension-errors)
7. [Browser Compatibility](#browser-compatibility)
8. [Development Issues](#development-issues)

## Installation Issues

### Extension Won't Load

**Symptom:** Error when loading unpacked extension

**Causes & Solutions:**

**1. Invalid manifest.json:**
```bash
# Verify JSON is valid
cat dist/manifest.json | jq .

# Common errors:
# - Missing comma
# - Trailing comma
# - Wrong quotes
# - Invalid structure
```

**Fix:** Rebuild extension
```bash
npm run build
# Check for build errors
```

**2. Missing files:**
```bash
# Check all required files exist
ls dist/service-worker.js
ls dist/content-script.js
ls dist/manifest.json
ls dist/src/popup/popup.html
ls dist/src/viewer/viewer.html
```

**Fix:** Clean rebuild
```bash
rm -rf dist/
npm run build
```

**3. Permission errors:**
- manifest.json has invalid permission
- Check Chrome version supports Manifest V3
- Minimum Chrome 88+

**Fix:** Update Chrome to latest version

### Extension Loads But Icon Missing

**Symptom:** Extension in list but no toolbar icon

**Causes:**
1. Icons missing from dist/icons/
2. Icon paths wrong in manifest.json
3. Icon files corrupted

**Solutions:**

**Check icons exist:**
```bash
ls -la dist/icons/
# Should see icon16.png, icon48.png, icon128.png
```

**Verify manifest paths:**
```json
{
  "icons": {
    "16": "icons/icon16.png",  // Relative to dist/
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Rebuild icons:**
- Replace placeholder PNGs with actual icons
- Ensure valid PNG format
- Correct dimensions

**Pin to toolbar:**
- Click puzzle icon in toolbar
- Find extension
- Click pin icon

## Manifest Loading Problems

### Cannot Fetch Manifest

**Symptom:** "Failed to fetch manifest" error

**Causes & Solutions:**

**1. CORS Restriction:**
```
Error: Network error. Possible causes: CORS restriction, invalid SSL certificate, or DNS failure.
```

**Why it happens:**
- Server blocks cross-origin requests
- Extension tries to fetch like a browser
- Some CDNs/servers reject programmatic access

**Solutions:**
```bash
# Option 1: Direct download
# Click manifest URL in browser
# Save file locally
# Drag file into viewer (future feature)

# Option 2: Use browser DevTools
# Network tab → Find manifest request
# Copy → Copy response
# Paste into a file
# Load via file upload (future feature)

# Option 3: Add CORS header on server
# If you control the server:
Access-Control-Allow-Origin: *
```

**2. 404 Not Found:**
```
Error: Manifest not found (404). Please check the URL.
```

**Check:**
- URL is correct (copy-paste carefully)
- Manifest file exists at that location
- No typos in URL
- Try opening URL directly in browser

**3. Authentication Required:**
```
Error: HTTP 401: Unauthorized
or
HTTP 403: Forbidden
```

**Causes:**
- Manifest requires authentication token
- Token expired
- IP-restricted content

**Solutions:**
- Check if URL has token parameter
- Try refreshing URL from source
- Verify token hasn't expired
- Check if VPN needed

**4. SSL Certificate Issues:**
```
Error: Network error... invalid SSL certificate
```

**Causes:**
- Self-signed certificate
- Expired certificate
- Certificate name mismatch

**Solutions:**
- Visit URL in browser first (accept certificate)
- Use HTTPS URL, not HTTP
- Contact content provider

**5. DNS Failure:**
```
Error: Network error... DNS failure
```

**Check:**
- Internet connection working
- Can ping domain
- DNS server responding
- Try different network

### Manifest Parses Incorrectly

**Symptom:** Variants show wrong data or missing

**Debugging:**

**1. Check Raw View:**
- Load manifest
- Switch to Raw view
- Verify content looks correct
- Check for unusual formatting

**2. Check Format Detection:**
```bash
# In browser console (viewer page)
import { detectManifestFormat } from './lib/parsers/format-detector';
const format = detectManifestFormat(manifestContent);
console.log('Detected format:', format);
```

**3. Check Parser Output:**
- Look for console errors
- Check if variants array empty
- Verify metadata extracted

**Common Issues:**

**HLS:**
- #EXTM3U missing or malformed
- #EXT-X-STREAM-INF tags incorrect
- Relative URLs not resolving
- Unsupported HLS version

**DASH:**
- MPD XML malformed
- Missing required elements
- Namespace issues
- Unsupported DASH profile

**Solutions:**
- Validate manifest against spec
- Use online validators
- Check with other players
- Report bug with sample manifest

## Detection Issues

### No Manifests Detected

**Symptom:** Popup shows "No manifests detected on this page"

**Causes & Solutions:**

**1. Page has no manifests:**
- Verify page actually has streaming content
- Check page source for .m3u8 or .mpd URLs
- Some players hide manifest URLs

**2. Dynamic loading:**
- Manifests loaded after page load
- SPA (Single Page App) loads content dynamically
- Observer should catch this, but may have delay

**Wait longer:**
- Refresh popup after 5-10 seconds
- Click around page to trigger loading
- Check DevTools panel instead (polls every 2s)

**3. Non-standard extensions:**
- Some servers use custom extensions
- Example: .m3u8 might be .txt
- Detection based on extension only

**Manual load:**
- Copy URL from Network tab
- Use "Open Full Viewer"
- Paste URL manually

**4. Content script not running:**
```bash
# Check extension is enabled
chrome://extensions

# Check content script loaded
# Open browser console on page
# Should see: "Content script loaded on: [url]"
```

**Reload:**
- Reload extension
- Reload page
- Check for errors

**5. Permissions issue:**
- Check manifest.json has content_scripts
- matches: ["<all_urls>"]
- Verify extension has permissions

### Manifests Detected But Won't Open

**Symptom:** Click manifest in popup, nothing happens

**Check:**
1. Browser console for errors
2. Extension service worker console
3. Popup console (right-click popup → Inspect)

**Common causes:**
- chrome.tabs.create permission missing
- Popup script error
- Invalid manifest URL

**Solution:**
- Reload extension
- Check permissions
- Look for JavaScript errors

## UI Problems

### Popup Won't Open

**Symptom:** Click extension icon, no popup

**Check Service Worker:**
1. chrome://extensions
2. Find extension
3. Click "service worker" link
4. Look for errors

**Common errors:**
- Import error in popup code
- React rendering error
- Missing assets

**Solutions:**
```bash
# Rebuild
npm run build

# Check popup.html exists
ls dist/src/popup/popup.html

# Check manifest path
grep "default_popup" dist/manifest.json
# Should be: "src/popup/popup.html"
```

### Popup Content Not Displaying

**Symptom:** Popup opens but shows blank

**Debug:**
1. Right-click popup → Inspect
2. Open Console tab
3. Look for React errors

**Common issues:**
- State not loading
- Chrome API not available
- Component render error

**Fix:**
- Check ErrorBoundary working
- Verify no console errors
- Reload extension

### Viewer Page Blank

**Symptom:** Viewer opens but shows nothing

**Check Console:**
1. Open viewer
2. F12 for DevTools
3. Check Console tab
4. Look for errors

**Common causes:**
- React failed to mount
- State initialization error
- Missing assets (404s)

**Solutions:**
- Check Network tab for 404s
- Verify all assets loaded
- Check manifest.json paths
- Rebuild extension

**Verify in Network tab:**
- globals-*.css loaded
- globals-*.js loaded
- viewer-*.js loaded
- All status 200

### Components Not Rendering

**Symptom:** Some sections missing in Structured View

**Possible reasons:**
1. Data missing from manifest
2. Conditional rendering hiding component
3. Component error (caught by parent)

**Check:**
```typescript
// Example: SegmentList only shows if segments exist
{manifest.segments && <SegmentList segments={manifest.segments} />}

// If manifest.segments is undefined, component won't render
// This is expected behavior
```

**Verify:**
- Switch to Raw view
- Check if data present in raw manifest
- If data missing, parser issue
- If data present, rendering issue

### Styles Not Applied

**Symptom:** UI looks unstyled or broken

**Check:**
1. Network tab: globals-*.css loaded?
2. Console: CSS parsing errors?
3. Tailwind config: content paths correct?

**Solutions:**
```bash
# Rebuild CSS
rm -rf dist/
npm run build

# Verify Tailwind included
cat dist/assets/globals-*.css | head -20
# Should see Tailwind utility classes
```

## Performance Issues

### Slow Loading

**Symptom:** Manifest takes >10 seconds to load

**Causes:**

**1. Large manifest:**
- 100+ variants
- 1000+ segments
- Complex metadata

**Measurement:**
```javascript
// In browser console
console.time('parse');
const parsed = parseManifest(content, url);
console.timeEnd('parse');
```

**Solutions:**
- Expected for very large manifests
- Consider pagination for segments
- Parser is already optimized

**2. Slow network:**
- Remote manifest fetch
- Large file size
- Poor connection

**Check:**
```bash
# Test fetch time
curl -w "@curl-format.txt" -o /dev/null -s "manifest-url"

# curl-format.txt:
time_total: %{time_total}s
```

**Solution:**
- Cache manifest locally
- Use faster network
- Check CDN performance

### UI Lag

**Symptom:** Scrolling stutters, buttons slow to respond

**Causes:**

**1. Too many variants rendering:**
- 100+ variant cards
- Each card has complex rendering

**Solution:**
- Use search/filter to reduce visible items
- Future: Virtual scrolling

**2. Heavy computation:**
- ABR analysis on large dataset
- Simulation with long duration

**Check DevTools Performance:**
1. F12 → Performance tab
2. Start recording
3. Interact with UI
4. Stop recording
5. Analyze flame graph

**Optimization:**
```typescript
// Use memo for expensive calculations
const analysis = useMemo(() =>
  analyzeBitrateLadder(variants),
  [variants]
);
```

**3. Too many components:**
- Structured View has 15+ sections
- Each doing calculations

**Solution:**
- Lazy load heavy components (future)
- Use Intersection Observer to render on scroll

### High Memory Usage

**Symptom:** Browser using excessive memory

**Check:**
```bash
# Chrome Task Manager
# Shift + Esc (Windows/Linux)
# Window → Task Manager (Mac)

# Look for extension process
# Normal: 50-200 MB
# High: >500 MB
```

**Causes:**
1. Large manifest stored in memory
2. Many manifests in history
3. Memory leak

**Solutions:**
```typescript
// Clear manifest when done
const clearManifest = useManifestStore(s => s.clearManifest);
clearManifest();

// Clear history
await clearHistory();

// Reload extension
chrome://extensions → Reload
```

## Extension Errors

### Service Worker Crashes

**Symptom:** "Service worker (Inactive)" in chrome://extensions

**Causes:**
- Uncaught error in service worker
- Exceeded execution time
- Memory limit reached

**Check Logs:**
1. chrome://extensions
2. Click "service worker" link
3. Check console for errors
4. Look at stack trace

**Common Errors:**

**Import Error:**
```
Error: Cannot find module './lib/some-module'
```
**Fix:** Check import paths, rebuild

**Message Handler Error:**
```
Error in message handler: ...
```
**Fix:** Check message-router.ts, add try-catch

**Storage Error:**
```
Error: chrome.storage is undefined
```
**Fix:** Add chrome API guards

**Solutions:**
- Fix error in code
- Rebuild: `npm run build`
- Reload extension
- Check error doesn't recur

### Content Script Not Running

**Symptom:** Console message missing, detection not working

**Check:**
1. Open page
2. Open browser console
3. Should see: "Content script loaded on: [url]"

**If missing:**

**Verify manifest:**
```json
{
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content-script.js"],
    "run_at": "document_idle"
  }]
}
```

**Check file exists:**
```bash
ls dist/content-script.js
# Should exist and be ~1KB
```

**Reload page:**
- Content scripts only inject on page load
- Refresh page after loading extension

### DevTools Panel Not Appearing

**Symptom:** No "Manifests" tab in DevTools

**Check:**
1. DevTools is open
2. Scroll through tabs (might be last)
3. Click >> menu to see hidden tabs

**Verify manifest:**
```json
{
  "devtools_page": "src/devtools/devtools.html"
}
```

**Check files:**
```bash
ls dist/src/devtools/devtools.html
ls dist/src/devtools/panel.html
```

**Solutions:**
- Reload DevTools (close and reopen)
- Reload extension
- Check for errors in devtools script

## Detection Issues

### False Positives

**Symptom:** Non-manifest URLs detected

**Cause:**
- Detection based on file extension only
- Some sites use .m3u8 for non-manifest files
- Or .mpd for other purposes

**Solution:**
- Ignore specific URLs in settings (future)
- Manual verification
- Parser will fail on invalid content

### Missed Detections

**Symptom:** Manifest exists but not detected

**Reasons:**

**1. Dynamically loaded:**
- Manifest URL generated by JavaScript
- Not in DOM at page load time
- Loaded via XHR/Fetch

**Current limitation:**
- DOM-based detection only
- XHR interception planned for future

**Workaround:**
- Use browser DevTools → Network tab
- Find manifest request
- Copy URL
- Use "Open Full Viewer" and paste URL

**2. Embedded in video player:**
- URL only in player's internal state
- Not exposed to DOM
- Player-specific

**Workaround:**
- Check page source
- Look for manifest URL in inline scripts
- Extract manually

**3. Different extension:**
- Not .m3u8 or .mpd
- Custom extensions
- Query parameters hide extension

**Examples:**
- manifest?format=hls
- stream.txt (actually HLS)
- playlist (no extension)

**Solution:**
- Detect by content, not extension (future)
- Manual URL entry

## UI Problems

### Buttons Don't Respond

**Symptom:** Click button, nothing happens

**Check Console:**
- F12 → Console
- Click button
- Look for errors

**Common causes:**
1. Event handler error
2. State not updating
3. Chrome API failing

**Debug:**
```typescript
// Add logging
const handleClick = () => {
  console.log('Button clicked');
  try {
    doSomething();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**Solutions:**
- Check for JavaScript errors
- Verify chrome APIs available
- Reload extension

### Modal Won't Close

**Symptom:** Detail modal stuck open

**Causes:**
- Click handler not firing
- Backdrop click not detected
- State not updating

**Force close:**
- Press Escape key
- Reload page
- Click outside multiple times

**Fix:**
- Check onClick handlers
- Verify state updates
- Add Escape key handler

### View Switching Not Working

**Symptom:** Click Raw/Structured/Timeline, nothing changes

**Check:**
```typescript
// In browser console
import { useManifestStore } from './store/manifest-store';

const selectedView = useManifestStore.getState().selectedView;
console.log('Current view:', selectedView);

// Try setting
useManifestStore.getState().setSelectedView('raw');
```

**If view changes in console but not UI:**
- React component not subscribing correctly
- Re-render not happening
- Check component code

**Solution:**
- Reload page
- Clear cache: Cmd/Ctrl + Shift + R
- Report bug with steps to reproduce

### Search Not Finding Results

**Symptom:** Know variant exists but search shows nothing

**Check:**
1. Search is case-insensitive
2. Filters not blocking results
3. Spelling correct

**Common mistakes:**
```typescript
// Search "avc1" - finds codecs
// Search "h264" - might not find "avc1"

// Use partial strings
// Search "1920" - finds 1920x1080 variants
```

**Clear all filters:**
- Click "Clear All" button
- Verify filters reset
- Try search again

## Performance Issues

### High CPU Usage

**Symptom:** Fan running loud, CPU at 100%

**Causes:**

**1. Continuous simulation:**
- Timeline view updates every interval
- Bandwidth profile generation

**Solution:**
- Switch away from Timeline view
- Select shorter duration
- Use Stable profile

**2. Large manifest:**
- Rendering 1000+ segments
- Complex calculations

**Solutions:**
- Use "Show All" toggle (show 10 by default)
- Apply filters to reduce visible items
- Export and analyze offline

**3. Polling loop:**
- DevTools panel polls every 2s
- Can add up over time

**Solution:**
- Close DevTools when not needed
- Switch to different panel

**Monitoring:**
```bash
# Chrome Task Manager: Shift + Esc
# Find extension processes
# Check CPU %
```

### Slow Rendering

**Symptom:** Page feels sluggish

**Profile Performance:**
1. F12 → Performance tab
2. Click Record
3. Interact with UI (scroll, click, etc.)
4. Stop recording
5. Analyze results

**Look for:**
- Long tasks (>50ms)
- Layout thrashing
- Repeated calculations

**Solutions:**
- Use React.memo for expensive components
- Debounce search input
- Virtual scrolling for large lists

### Memory Leaks

**Symptom:** Memory grows over time, doesn't release

**Check:**
1. F12 → Memory tab
2. Take heap snapshot
3. Load/unload manifests
4. Take another snapshot
5. Compare

**Common causes:**
- Event listeners not cleaned up
- References kept to old manifests
- Observers not disconnected

**Fix:**
```typescript
// Cleanup in useEffect
useEffect(() => {
  const observer = new MutationObserver(callback);
  // ...

  return () => {
    observer.disconnect(); // ← Important!
  };
}, []);
```

## Extension Errors

### "Manifest version 2 is deprecated"

**Error:**
```
Manifest version 2 is deprecated, and support will be removed in 2024.
```

**This Extension:**
- Uses Manifest V3 ✓
- Should not see this error

**If you see it:**
- Wrong extension loaded
- Old version still installed
- Check manifest_version in dist/manifest.json

**Solution:**
```bash
# Verify Manifest V3
cat dist/manifest.json | grep manifest_version
# Should output: "manifest_version": 3
```

### "Extensions must be from Chrome Web Store"

**This is not an error for development:**
- Only affects non-store extensions in normal mode
- Developer mode allows unpacked extensions

**For distribution:**
- Publish to Chrome Web Store
- Or use enterprise deployment
- Users need Developer mode for unpacked

### "Storage quota exceeded"

**Symptom:**
```
Error: QUOTA_BYTES quota exceeded
```

**Causes:**
- Too much data in chrome.storage
- History too large
- Large manifests stored

**Limits:**
- chrome.storage.local: 10 MB total
- chrome.storage.sync: 100 KB total

**Solutions:**
```typescript
// Clear history
await clearHistory();

// Reduce history limit
const MAX_HISTORY = 20; // Instead of 50

// Don't store raw manifest content
// Only store metadata
```

### "This page has been blocked by Chrome"

**For Extensions:**
- Cannot access chrome:// pages
- Cannot access chrome://extensions
- Cannot access some Google pages

**Expected behavior:**
- Content script won't inject on these pages
- This is by design for security

## Browser Compatibility

### Works in Chrome, Not in Edge

**Issue:** Edge is Chromium-based but may have differences

**Check:**
1. Edge version (need Edge 88+)
2. Manifest V3 support in Edge
3. Extension compatibility

**Solution:**
- Use Chrome for development
- Test in Edge before claiming support
- Document browser requirements

### Doesn't Work in Firefox

**Expected:**
- This is a Chrome extension
- Uses Chrome-specific APIs
- Different manifest format needed for Firefox

**Firefox Support:**
- Would require separate build
- Different manifest.json
- Different APIs in some cases
- Not currently supported

## Development Issues

### TypeScript Errors

**Build fails with TypeScript errors:**

**Common errors:**

**1. "is declared but never used":**
```typescript
// Error
function foo(unusedParam: string) { }

// Fix
function foo(_unusedParam: string) { }
// or remove parameter
```

**2. "Property does not exist":**
```typescript
// Error
const value = manifest.unknownProperty;

// Fix: Check types
import type { ParsedManifest } from './types';
// Use only known properties
```

**3. "Cannot find module":**
```
Error: Cannot find module './some-file'
```

**Fix:**
- Check file exists
- Check import path correct
- Check file extension (.ts vs .tsx)
- Rebuild: `npm run build`

### Vite Build Errors

**"Failed to resolve import":**
```
Error: Failed to resolve import "./component"
```

**Solutions:**
- Add file extension: `"./component.tsx"`
- Check file exists
- Check tsconfig paths

**"Transform failed":**
```
Error: Transform failed with 1 error
```

**Common causes:**
- Syntax error in source
- Unsupported syntax
- Plugin error

**Solution:**
- Check error details
- Fix syntax
- Update Vite if old version

### Test Failures

**Tests fail unexpectedly:**

**1. Import errors in tests:**
```
Error: Cannot find module
```

**Fix:**
- Check import paths in test
- Ensure file exists
- Check tsconfig includes test files

**2. Mock issues:**
```typescript
// If testing code using chrome APIs
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  }
} as any;
```

**3. Timeout:**
```
Error: Timeout 5000ms exceeded
```

**Fix:**
- Increase timeout
- Check for infinite loops
- Mock async operations

### Git Issues

**Merge conflicts:**

**Common conflict files:**
- package-lock.json
- dist/ (if committed - shouldn't be)

**Resolution:**
```bash
# For package-lock.json
npm install
git add package-lock.json

# For dist/ (delete it)
git rm -r dist/
echo "dist/" >> .gitignore
git add .gitignore
```

## Browser Compatibility

### Chrome Versions

**Minimum: Chrome 88**
- Manifest V3 support

**Recommended: Chrome 120+**
- Latest features
- Best performance
- All APIs available

**Check Version:**
```
chrome://version
```

**Update Chrome:**
- chrome://settings/help
- Auto-updates to latest

### OS Compatibility

**Tested On:**
- macOS 12+ ✓
- Windows 10+ ✓
- Linux (Ubuntu 20.04+) ✓

**Not Tested:**
- ChromeOS (should work)
- Older OS versions

### Known Limitations

**Cannot Test:**
- Chrome on iOS (different browser engine)
- Safari (different extension system)
- Firefox (different APIs)

## Debugging Tools

### Chrome DevTools

**Inspect Extension:**

**Popup:**
- Right-click popup → Inspect
- Opens DevTools for popup context

**Service Worker:**
- chrome://extensions → Service worker
- Opens console for background context

**Content Script:**
- Open page with content script
- Browser console shows content script logs
- Separate from page's own console

**Viewer/Panel:**
- Regular page DevTools
- F12 or right-click → Inspect

### Logging Best Practices

**Development:**
```typescript
console.log('✅ Success:', data);
console.warn('⚠️  Warning:', issue);
console.error('❌ Error:', error);
console.debug('🐛 Debug:', details);
```

**Production:**
```typescript
// Remove or comment out debug logs
// Keep error logs
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

### Network Debugging

**Manifest Fetch Issues:**

**Check Request:**
1. F12 → Network tab
2. Load manifest
3. Find request
4. Check:
   - Status code
   - Headers
   - Response
   - Timing

**Common issues:**
- CORS: See preflight (OPTIONS) request fail
- 404: Wrong URL
- 403: Authentication needed
- Timeout: Slow server

**Debugging Tools:**
```bash
# Test fetch outside extension
curl -v "manifest-url"

# Check headers
curl -I "manifest-url"

# Test with browser-like headers
curl -H "User-Agent: Mozilla/5.0..." "manifest-url"
```

## Getting Help

### Self-Help Resources

**Documentation:**
1. README.md - Overview and quick start
2. USER_GUIDE.md - Feature explanations
3. API.md - API reference
4. FEATURES.md - Complete feature list
5. ARCHITECTURE.md - Technical details
6. This file - Troubleshooting

**Testing:**
- TESTING_CHECKLIST.md - Manual testing steps
- Run automated tests: `npm test`
- Check Playwright results

**Example Manifests:**
- tests/fixtures/bipbop-master.m3u8 (HLS)
- tests/fixtures/sample-dash.mpd (DASH)
- Use Apple test streams
- Use DASH-IF test content

### Reporting Issues

**Before Reporting:**
1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Test with latest version
4. Try in incognito mode (rule out other extensions)

**Include in Report:**

**System Information:**
```
- Chrome version: chrome://version
- OS: macOS 14.1 / Windows 11 / Ubuntu 22.04
- Extension version: (from chrome://extensions)
```

**Steps to Reproduce:**
```
1. Load extension
2. Navigate to [url]
3. Click [button]
4. Observe [problem]
```

**Expected vs Actual:**
```
Expected: Manifest loads successfully
Actual: Error: "CORS blocked"
```

**Console Errors:**
```
Paste any errors from:
- Browser console
- Service worker console
- Popup console
```

**Manifest URL (if relevant):**
- Include if problem is manifest-specific
- Or share raw manifest content
- Or use Apple test stream to reproduce

### Contact

**GitHub Issues:**
- https://github.com/krzemienski/hls-dash-dev-chrome-extension/issues
- Best for bugs and feature requests
- Public discussion
- Searchable

**Pull Requests:**
- Fixes welcome!
- Follow contribution guidelines
- Include tests
- Update documentation

## Common Error Messages

### "Failed to fetch manifest"

**Full message:**
```
Failed to fetch manifest: Network error. Possible causes: CORS restriction, invalid SSL certificate, or DNS failure. Try clicking the manifest URL to download directly.
```

**Meaning:**
- Fetch API call failed
- Could be network, CORS, SSL, or DNS

**Solutions:**
1. Check URL accessible in browser
2. Look for CORS error in console
3. Verify SSL certificate valid
4. Check internet connection
5. Try different manifest URL

### "Manifest content is empty"

**Meaning:**
- Fetch succeeded but returned empty response
- Or response was whitespace only

**Causes:**
- Server returned 200 but no content
- Manifest file actually empty
- Encoding issue

**Solutions:**
- Verify URL in browser
- Check server logs
- Try different URL

### "Unsupported manifest format"

**Meaning:**
- Not detected as HLS or DASH
- Content doesn't match expected format

**Causes:**
- Malformed manifest
- Unsupported format
- Text file instead of manifest

**Debug:**
- Check Raw view
- Verify starts with #EXTM3U (HLS) or <MPD (DASH)
- Validate against spec

### "Cannot read properties of undefined"

**Full error:**
```
TypeError: Cannot read properties of undefined (reading 'someProperty')
```

**Meaning:**
- Trying to access property on undefined/null value
- Data structure different than expected

**Debug:**
```typescript
// Add null checks
if (variant.resolution) {
  const width = variant.resolution.width;
}

// Or use optional chaining
const width = variant.resolution?.width;
```

**Solution:**
- Add proper null checks
- Verify data structure
- Update types if needed

## Emergency Procedures

### Extension Completely Broken

**Quick Recovery:**
```bash
# 1. Remove extension
# chrome://extensions → Remove

# 2. Fresh install of last working version
git checkout v1.0.0
npm install
npm run build

# 3. Load dist/ folder
# chrome://extensions → Load unpacked

# 4. Verify it works

# 5. Identify what broke in newer version
```

### Data Loss

**If history/settings lost:**

**Causes:**
- Chrome storage cleared
- Extension reinstalled
- Storage quota exceeded

**Prevention:**
```typescript
// Future: Export settings
function exportSettings() {
  const settings = await getSettings();
  const json = JSON.stringify(settings, null, 2);
  // Download as file
}

// Import settings
function importSettings(file) {
  const settings = JSON.parse(await file.text());
  await updateSettings(settings);
}
```

**Current workaround:**
- Settings are defaults
- History is lost (no backup currently)
- Can rebuild history by viewing manifests again

### Complete Reset

**Nuclear option:**

```bash
# 1. Remove extension completely
# chrome://extensions → Remove

# 2. Clear all extension data
# chrome://settings/content/all → find extension → Clear

# 3. Rebuild from source
cd hls-dash-dev-chrome-extension
rm -rf node_modules dist
npm install
npm run build

# 4. Fresh load
# chrome://extensions → Load unpacked → dist/

# 5. Reconfigure settings
```

This should resolve any persistent issues by starting completely fresh.

## Prevention

### Best Practices

**Regular Updates:**
```bash
# Weekly
git pull
npm install
npm run build
# Test in Chrome
```

**Backup Data:**
- Export important manifests as JSON
- Save manifest URLs externally
- Screenshot important findings

**Test Before Important Use:**
- Verify extension working
- Test with known-good manifest
- Check all features functional

**Monitor Console:**
- Watch for warnings
- Check deprecation notices
- Update when prompted

### Staying Up-to-Date

**Watch For:**
- Chrome extension blog posts
- Manifest V3 updates
- API deprecations
- Security advisories

**Subscribe:**
- GitHub repository (watch for releases)
- Chrome developer blog
- Extension API updates

**Plan Ahead:**
- Review roadmap
- Prepare for breaking changes
- Test beta Chrome versions
- Contribute to development

With this troubleshooting guide, most issues can be resolved quickly and efficiently.
