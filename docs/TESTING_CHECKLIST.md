# Chrome Extension Testing Checklist

## Prerequisites

- [ ] Extension built: `npm run build`
- [ ] Chrome browser with Developer mode enabled
- [ ] Extension loaded from `dist/` folder

## Installation Testing

### Load Extension

1. [ ] Open `chrome://extensions`
2. [ ] Enable "Developer mode" (top right)
3. [ ] Click "Load unpacked"
4. [ ] Select `dist/` folder
5. [ ] Verify: Extension appears in list
6. [ ] Verify: No errors in extension card
7. [ ] Verify: Icon appears in toolbar

### Inspect Service Worker

1. [ ] Click "Service worker" link in extension card
2. [ ] Verify: Console shows "Service worker loaded"
3. [ ] Verify: No errors in console
4. [ ] Keep console open for monitoring

## Popup Testing

### Basic Functionality

1. [ ] Click extension icon in toolbar
2. [ ] Verify: Popup opens (400x600px)
3. [ ] Verify: Shows "HLS + DASH Viewer" header
4. [ ] Verify: Three tabs visible: Detected, History, Settings
5. [ ] Verify: "Open Full Viewer" button at bottom

### Detected Tab

1. [ ] Navigate to test page: `https://developer.apple.com/streaming/examples/`
2. [ ] Open popup
3. [ ] Verify: Detected tab shows "No manifests detected"
4. [ ] Navigate to page with manifest link
5. [ ] Verify: Manifests appear in detected list
6. [ ] Click manifest card
7. [ ] Verify: Opens viewer in new tab

### History Tab

1. [ ] Load a manifest via viewer
2. [ ] Open popup → History tab
3. [ ] Verify: Recently viewed manifest appears
4. [ ] Verify: Shows format badge, timestamp, variant count
5. [ ] Click history item
6. [ ] Verify: Opens in viewer
7. [ ] Click "Clear All"
8. [ ] Confirm dialog
9. [ ] Verify: History cleared

### Settings Tab

1. [ ] Open popup → Settings tab
2. [ ] Toggle "Auto-detect manifests"
3. [ ] Change Theme (Light/Dark/Auto)
4. [ ] Change Default View
5. [ ] Click "Save Settings"
6. [ ] Verify: Shows "✓ Saved" confirmation
7. [ ] Reload extension
8. [ ] Verify: Settings persisted

## Viewer Testing

### URL Input

1. [ ] Click "Open Full Viewer" from popup
2. [ ] Verify: URL input field visible
3. [ ] Paste HLS URL: `https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8`
4. [ ] Click "Load"
5. [ ] Verify: Loading indicator appears
6. [ ] Verify: Manifest loads successfully
7. [ ] Verify: Header shows "HLS Manifest Viewer"

### Raw View

1. [ ] Click "Raw" tab
2. [ ] Verify: Syntax-highlighted manifest displayed
3. [ ] Verify: Line numbers visible
4. [ ] Verify: Statistics shown (lines, characters, format)
5. [ ] Click "Copy" button
6. [ ] Verify: Content copied to clipboard
7. [ ] Paste elsewhere to confirm

### Structured View

1. [ ] Click "Structured" tab
2. [ ] Verify following sections appear:

**Validation Report:**
- [ ] Shows health status or issues
- [ ] Color-coded (green=healthy, yellow=warnings, red=errors)

**Statistics Dashboard:**
- [ ] Total variants count
- [ ] Bitrate range
- [ ] Average bitrate
- [ ] Max resolution
- [ ] Data usage estimates

**URL Analysis:**
- [ ] Domain and path shown
- [ ] CDN detected (if applicable)
- [ ] Query parameters listed

**Metadata:**
- [ ] Format, Type, Duration
- [ ] Version, Target Duration
- [ ] Encryption status

**ABR Ladder:**
- [ ] Visual bitrate bars
- [ ] Gap warnings (if applicable)
- [ ] Recommendations

**Bitrate Chart:**
- [ ] Color-coded distribution
- [ ] Percentage indicators
- [ ] Range/median/average stats

**Codec Information:**
- [ ] All codecs listed
- [ ] Detailed descriptions
- [ ] Profile and level info
- [ ] Modern codec detection

**Bandwidth Calculator:**
- [ ] Slider works
- [ ] Preset buttons (2G, 3G, 4G, WiFi, Fast)
- [ ] Shows recommended quality
- [ ] Lists playable variants

**Performance Metrics:**
- [ ] Startup/switching latency
- [ ] Buffer requirement
- [ ] Efficiency score (0-100)
- [ ] Quality consistency score
- [ ] Recommendations

**Variants:**
- [ ] All variants listed
- [ ] Grouped by type (video/audio/subtitle)
- [ ] Click variant to select
- [ ] Click "Details" button
- [ ] Verify modal opens with full info
- [ ] Close modal

**Segments (if present):**
- [ ] Segment count and stats
- [ ] Expandable segment list
- [ ] Copy URLs / Copy as cURL buttons work
- [ ] Show All toggle (if >10 segments)

**Download Manager (if segments):**
- [ ] Script type toggle (Bash/PowerShell)
- [ ] FFmpeg toggle
- [ ] "Download Script" creates file
- [ ] "Copy to Clipboard" works
- [ ] "Download FFmpeg Concat File" works

### Timeline View

1. [ ] Click "Timeline" tab
2. [ ] Verify: Playback Simulation controls visible
3. [ ] Change bandwidth (select different preset)
4. [ ] Verify: Simulation updates
5. [ ] Change network profile (Stable/Varying/Degrading/Improving)
6. [ ] Verify: Timeline updates
7. [ ] Verify: Quality switches shown
8. [ ] Verify: Stats update (switches, rebuffering, avg quality)

### Export Functionality

1. [ ] Click "Export ▼" button in header
2. [ ] Verify: Dropdown menu appears
3. [ ] Click "Export as JSON"
4. [ ] Verify: JSON file downloads
5. [ ] Open file, verify valid JSON
6. [ ] Click "Export as CSV"
7. [ ] Verify: CSV file downloads
8. [ ] Open in Excel/spreadsheet
9. [ ] Click "Export as Text Report"
10. [ ] Verify: TXT file downloads
11. [ ] Open and verify formatting

### Quick Actions FAB

1. [ ] Verify: Blue ⚡ button in bottom-right
2. [ ] Click FAB button
3. [ ] Verify: 5 actions appear with animation
4. [ ] Test "Copy Manifest URL"
5. [ ] Verify: URL copied
6. [ ] Test "Copy All Variant URLs"
7. [ ] Verify: All URLs copied (newline-separated)
8. [ ] Test "Quick Export JSON"
9. [ ] Verify: JSON downloads
10. [ ] Test "Copy Raw Manifest"
11. [ ] Verify: Raw content copied
12. [ ] Click FAB again
13. [ ] Verify: Menu closes with rotation animation

## DevTools Panel Testing

### Panel Appearance

1. [ ] Open Chrome DevTools (F12)
2. [ ] Verify: "Manifests" tab appears
3. [ ] Click "Manifests" tab
4. [ ] Verify: Panel loads without errors

### Detection

1. [ ] With DevTools open, navigate to page with manifests
2. [ ] Verify: Manifests appear automatically
3. [ ] Verify: Shows format badge (HLS/DASH)
4. [ ] Verify: Shows source type
5. [ ] Verify: Shows full URL
6. [ ] Verify: Shows page URL

### Actions

1. [ ] Click "Copy" button on manifest
2. [ ] Verify: URL copied to clipboard
3. [ ] Click "Analyze" button
4. [ ] Verify: Opens viewer in new tab
5. [ ] Verify: Manifest loads automatically

## Content Script Testing

### DOM Detection

1. [ ] Create test HTML file:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Page</h1>
  <a href="https://example.com/test.m3u8">HLS Link</a>
  <a href="https://example.com/test.mpd">DASH Link</a>
  <video src="https://example.com/video.m3u8"></video>
</body>
</html>
```

2. [ ] Open test page
3. [ ] Open extension popup
4. [ ] Verify: 3 manifests detected
5. [ ] Verify: Shows correct format for each
6. [ ] Verify: Shows correct source (link, video-src)

### Dynamic Detection

1. [ ] Open test page
2. [ ] Open browser console
3. [ ] Run: `document.body.innerHTML += '<a href="https://new.com/manifest.m3u8">New</a>'`
4. [ ] Wait 2 seconds
5. [ ] Open popup
6. [ ] Verify: New manifest detected

## Context Menu Testing

1. [ ] Navigate to page with manifest links
2. [ ] Right-click on `.m3u8` or `.mpd` link
3. [ ] Verify: "Analyze with HLS+DASH Viewer" appears
4. [ ] Click menu item
5. [ ] Verify: Opens viewer with manifest loaded

## Cross-Format Testing

### HLS Testing

Test URLs:
- Apple bipbop: `https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8`
- Apple advanced: `https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8`

1. [ ] Load HLS master playlist
2. [ ] Verify: Detects as HLS
3. [ ] Verify: Extracts variants correctly
4. [ ] Verify: Shows resolution, bitrate, codecs
5. [ ] Verify: No segments (master playlist)

### DASH Testing

Test URLs:
- Test DASH: `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd`

1. [ ] Load DASH MPD
2. [ ] Verify: Detects as DASH
3. [ ] Verify: Extracts representations
4. [ ] Verify: Shows video and audio variants separately
5. [ ] Verify: Parses duration, minBufferTime
6. [ ] Verify: Type detected (VOD/LIVE)

## Error Handling Testing

### Invalid URL

1. [ ] Enter invalid URL: `https://invalid-url-404.com/manifest.m3u8`
2. [ ] Click Load
3. [ ] Verify: Shows error message
4. [ ] Verify: No crash

### CORS Error

1. [ ] Enter URL that blocks CORS
2. [ ] Click Load
3. [ ] Verify: Shows helpful CORS error message
4. [ ] Verify: Suggests downloading directly

### Malformed Manifest

1. [ ] Create test with invalid manifest content
2. [ ] Verify: Parser handles gracefully
3. [ ] Verify: Shows error

## Performance Testing

### Large Manifest

1. [ ] Load manifest with 50+ variants
2. [ ] Verify: Loads within 5 seconds
3. [ ] Verify: UI remains responsive
4. [ ] Scroll through variant list
5. [ ] Verify: Smooth scrolling

### Many Segments

1. [ ] Load media playlist with 100+ segments
2. [ ] Verify: Shows first 10 by default
3. [ ] Click "Show All"
4. [ ] Verify: All segments appear
5. [ ] Verify: UI remains responsive

## Storage Testing

### History Persistence

1. [ ] Load 3 different manifests
2. [ ] Close all tabs
3. [ ] Reopen extension popup → History
4. [ ] Verify: All 3 manifests in history
5. [ ] Reload extension
6. [ ] Verify: History persists

### Settings Persistence

1. [ ] Change all settings
2. [ ] Save settings
3. [ ] Reload extension
4. [ ] Verify: Settings persisted
5. [ ] Change back to defaults
6. [ ] Save and verify

### History Limit

1. [ ] Load 51+ different manifests
2. [ ] Check history
3. [ ] Verify: Only 50 most recent kept

## UI/UX Testing

### Responsive Design

1. [ ] Resize browser window
2. [ ] Verify: Layout adapts
3. [ ] Test at 1920x1080, 1280x720, 1024x768
4. [ ] Verify: No horizontal scrolling on structured view

### Keyboard Navigation

1. [ ] Tab through URL input and Load button
2. [ ] Press Enter in URL input
3. [ ] Verify: Loads manifest
4. [ ] Test Escape to close modals

### Loading States

1. [ ] Load slow-loading manifest
2. [ ] Verify: Loading indicator shows
3. [ ] Verify: Button disabled during load
4. [ ] Verify: Clears after load

## Browser Compatibility

### Chrome Versions

Test on:
- [ ] Chrome 120+ (latest)
- [ ] Chrome 115+ (stable)

### Operating Systems

- [ ] macOS
- [ ] Windows
- [ ] Linux

## Security Testing

### XSS Prevention

1. [ ] Try manifest URL with script tag
2. [ ] Verify: Sanitized/escaped
3. [ ] Verify: No script execution

### Token Handling

1. [ ] Load URL with auth token
2. [ ] Verify: Warning shown
3. [ ] Verify: Token not logged to console
4. [ ] Verify: Not stored persistently

## Regression Testing

### After Each Update

- [ ] Run full test suite: `npm test`
- [ ] Verify: All 72+ tests pass
- [ ] Build extension: `npm run build`
- [ ] Reload extension in Chrome
- [ ] Quick smoke test:
  - Open popup
  - Load test manifest
  - Switch views
  - Export JSON

## Test Manifests

### HLS Manifests

- Apple bipbop: `https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8`
- Apple HEVC: `https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8`

### DASH Manifests

- Akamai BBB: `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd`
- DASH-IF: `https://dash.akamaized.net/dash264/TestCases/1a/netflix/exMPD_BIP_TC1.mpd`

## Known Limitations

- Extension popup size fixed at 400x600px (Chrome limitation)
- DevTools panel polls every 2 seconds (Chrome limitation)
- Content script only detects DOM-based manifests (XHR detection TODO)
- CORS may block some manifest fetches (by design, for security)

## Playwright Automated Tests

Already tested (see test results):
- ✅ Viewer initial load
- ✅ Manifest loading (HLS)
- ✅ View mode switching
- ✅ Export menu
- ✅ Quick actions FAB
- ✅ All major components render

Screenshots in `/tmp/test-*.png`:
- test-1-initial.png - Initial viewer state
- test-2-loaded.png - Manifest loaded
- test-3-raw-view.png - Raw view with syntax highlighting
- test-4-timeline-view.png - Timeline simulation
- test-5-structured-view.png - Structured analysis
- test-6-export-menu.png - Export dropdown
- test-7-quick-actions.png - Quick actions FAB

## Troubleshooting

### Extension Won't Load

- Check manifest.json is valid JSON
- Check all referenced files exist
- Check service worker console for errors

### Popup Won't Open

- Check popup.html path in manifest
- Check for JavaScript errors in popup
- Try unloading and reloading extension

### DevTools Panel Missing

- Check devtools.html path in manifest
- Reload DevTools
- Check devtools console for errors

### Content Script Not Detecting

- Check matches pattern in manifest
- Check browser console for content script errors
- Verify page has manifest URLs

## Success Criteria

Extension passes testing if:
- ✅ Loads without errors
- ✅ Popup opens and displays correctly
- ✅ Can load HLS manifests
- ✅ Can load DASH manifests
- ✅ All view modes work
- ✅ Export functionality works
- ✅ DevTools panel appears
- ✅ Content script detects manifests
- ✅ Settings persist
- ✅ History works
- ✅ No console errors in normal operation
