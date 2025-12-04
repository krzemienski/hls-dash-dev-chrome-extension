# Comprehensive Functional Test Plan - 100+ Test Cases

**v1.1.0 Chrome Extension Validation**
**Validation Method:** Chrome DevTools MCP + Manual Inspection
**Total Test Cases:** 127
**Approach:** Systematic end-to-end testing with immediate bug fixing

---

## Test Execution Strategy

**For Each Test:**
1. Execute test steps using Chrome DevTools MCP
2. Verify expected behavior
3. Take screenshot as evidence
4. If FAIL → Debug → Fix → Rebuild → Retest
5. Document result in Serena MCP
6. Move to next test only after PASS

**Tools:**
- Chrome DevTools MCP for automation
- Chrome browser for visual verification
- Screenshots for evidence
- Serena MCP for result storage

---

## Test Suite 1: URL Interception (10 Tests)

### Test 1.1: Basic .m3u8 Interception
**URL:** `https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8`
**Steps:**
1. Navigate to URL in Chrome
2. Verify redirect occurs
3. Check address bar shows chrome-extension:// URL
4. Verify viewer loads

**Expected:**
- Automatic redirect to viewer
- Hash contains original URL (encoded)
- Spec mode displays
- No console errors

**Screenshot:** Address bar + viewer + console

---

### Test 1.2: Basic .mpd Interception
**URL:** `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd`
**Steps:** Same as 1.1 for DASH
**Expected:** Same redirect behavior

---

### Test 1.3: .m3u8 with Query Parameters
**URL:** `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8?foo=bar&test=123`
**Expected:** Query params preserved in hash

---

### Test 1.4: .mpd with Query Parameters
**URL:** `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd?test=param`
**Expected:** Query params preserved

---

### Test 1.5: HTTP (not HTTPS) .m3u8
**URL:** `http://playertest.longtailvideo.com/adaptive/captions/playlist.m3u8`
**Expected:** Still intercepts (regex matches http or https)

---

### Test 1.6: .m3u8 in Middle of URL Path
**URL:** `https://example.com/path/master.m3u8/segments/`
**Expected:** Still intercepts (regex matches *.m3u8*)

---

### Test 1.7: Interception Doesn't Affect XHR/Fetch
**Steps:**
1. Open any website
2. Check if site's XHR requests for .m3u8 still work
**Expected:** XHR not intercepted (only main_frame)

---

### Test 1.8: Direct Link Click Interception
**Steps:**
1. Create HTML page with link: `<a href="stream.m3u8">Stream</a>`
2. Click link
**Expected:** Intercepts and opens viewer

---

### Test 1.9: Multiple Redirects Don't Loop
**Steps:**
1. Navigate to .m3u8
2. Check doesn't create redirect loop
**Expected:** Single redirect, no infinite loop

---

### Test 1.10: Interception Can Be Disabled
**Steps:**
1. Disable extension
2. Navigate to .m3u8
**Expected:** Normal browser behavior (download or error)

---

## Test Suite 2: Entry Point Detection (8 Tests)

### Test 2.1: Interception Sets Correct Entry Point
**Steps:**
1. Navigate to .m3u8 via address bar
2. Check console log
**Expected:** `[v1.1.0] Entry point: interception, Default mode: spec`

---

### Test 2.2: Popup Sets Correct Entry Point
**Steps:**
1. Click extension icon
2. Click detected manifest
**Expected:** Console shows `Entry point: manual, Default mode: analysis`

---

### Test 2.3: DevTools Panel Sets Manual Entry
**Steps:**
1. Open DevTools → Manifests tab
2. Click "Analyze" on detected manifest
**Expected:** Entry point: manual

---

### Test 2.4: Context Menu Sets Manual Entry
**Steps:**
1. Right-click .m3u8 link
2. Click "Analyze with HLS+DASH Viewer"
**Expected:** Entry point: manual

---

### Test 2.5: Direct Viewer URL is Manual
**Steps:**
1. Open viewer.html directly with hash
**Expected:** Entry point: manual (no referrer)

---

### Test 2.6: Entry Point Persists Across Mode Toggle
**Steps:**
1. Intercept URL (entry: interception)
2. Toggle to Analysis
3. Check entry point unchanged
**Expected:** Entry point stays 'interception'

---

### Test 2.7: Referrer Detection Works
**Steps:**
1. From popup → viewer
2. Check document.referrer
**Expected:** Contains 'popup.html'

---

### Test 2.8: State Updates Correctly
**Steps:**
1. Load manifest
2. Check Zustand store
**Expected:** entryPoint field set correctly

---

## Test Suite 3: Spec Validator Mode UI (15 Tests)

### Test 3.1: Two-Panel Layout Displays
**Expected:**
- Left panel: 70% width
- Right panel: 30% width
- Both panels visible

**Screenshot:** Full Spec mode layout

---

### Test 3.2: Line Numbers Display
**Expected:**
- Line numbers column on left
- Numbers 1, 2, 3, ... N
- Right-aligned
- Gray background

**Screenshot:** Line numbers column

---

### Test 3.3: Raw Manifest Text Displays
**Expected:**
- Manifest content visible
- Monospace font
- Proper formatting
- Scrollable

---

### Test 3.4: Error Line Highlighting
**Use:** Invalid manifest with errors
**Expected:**
- Error lines have red background
- Border-left-4 border-red-500
- ❌ icon on right

**Screenshot:** Red highlighted line

---

### Test 3.5: Warning Line Highlighting
**Use:** Manifest with warnings
**Expected:**
- Yellow background
- ⚠️ icon

**Screenshot:** Yellow highlighted line

---

### Test 3.6: Compliance Badge - Compliant
**Use:** Valid manifest
**Expected:**
- Green badge "✅ SPEC COMPLIANT"
- "No errors found" text

**Screenshot:** Green compliance badge

---

### Test 3.7: Compliance Badge - Non-Compliant
**Use:** Invalid manifest
**Expected:**
- Red badge "❌ NON-COMPLIANT"
- Error count shown

**Screenshot:** Red non-compliant badge

---

### Test 3.8: Playlist Type Badge Displays
**Expected:**
- Blue badge with type
- "Master Playlist" or "Media Playlist" (HLS)
- OR "Static MPD (VOD)" or "Dynamic MPD (Live)" (DASH)
- Description text

**Screenshot:** Playlist type badge

---

### Test 3.9: Features Detected List
**Expected:**
- "🔍 Features Detected" header
- List of features with checkmarks
- Version numbers if applicable

**Screenshot:** Features list

---

### Test 3.10: Error Issue Display
**Use:** Manifest with errors
**Expected:**
- "❌ Errors (N)" section
- Red card for each error
- Line number shown
- Error message
- Suggestion
- Spec reference link

**Screenshot:** Error issue card

---

### Test 3.11: Warning Issue Display
**Expected:** Yellow cards for warnings

---

### Test 3.12: Spec Reference Links Clickable
**Steps:**
1. Click spec reference link
2. Opens in new tab
**Expected:** Links to RFC 8216 or ISO spec

---

### Test 3.13: Copy Button Works
**Steps:**
1. Click "Copy" button
2. Paste clipboard
**Expected:** Full manifest text copied

---

### Test 3.14: Scroll Works in Both Panels
**Expected:** Independent scrolling

---

### Test 3.15: Line Counter Accurate
**Expected:** Footer shows "N lines | X characters"

---

## Test Suite 4: HLS Validation Accuracy (25 Tests)

### Test 4.1: Valid HLS Master - No Errors
**URL:** Apple bipbop
**Expected:** compliant: true, errors: []

---

### Test 4.2: Detect Missing #EXTM3U
**Create manifest without #EXTM3U**
**Expected:** Error code: EXTM3U_FIRST_LINE

---

### Test 4.3: Detect Missing BANDWIDTH
**Create:**
```
#EXTM3U
#EXT-X-STREAM-INF:CODECS="avc1"
stream.m3u8
```
**Expected:** Error: STREAM_INF_BANDWIDTH_REQUIRED

---

### Test 4.4: Detect Invalid BANDWIDTH (Zero)
**Create:** `BANDWIDTH=0`
**Expected:** Error: BANDWIDTH_POSITIVE

---

### Test 4.5: Detect Floating EXTINF Without Version 3
**Create:**
```
#EXTM3U
#EXT-X-VERSION:1
#EXTINF:9.009,
segment.ts
```
**Expected:** Error: VERSION_FEATURE_MISMATCH (float needs v3+)

---

### Test 4.6: Accept Floating EXTINF With Version 3
**Create:** Same but with VERSION:3
**Expected:** No error

---

### Test 4.7: Detect Invalid H.264 Codec String
**Create:** `CODECS="avc1.invalid"`
**Expected:** Error: INVALID_H264_CODEC

---

### Test 4.8: Accept Valid H.264 Codec
**Create:** `CODECS="avc1.4d401e"`
**Expected:** No error

---

### Test 4.9: Detect Missing EXTINF Before Segment
**Create:**
```
#EXTM3U
#EXT-X-TARGETDURATION:10
segment0.ts
```
**Expected:** Error: EXTINF_BEFORE_SEGMENT

---

### Test 4.10: Detect Mixed Playlist Types
**Create:** Has both #EXT-X-STREAM-INF and #EXTINF
**Expected:** Error: MIXED_PLAYLIST_TYPES

---

[Continue with 15 more HLS validation test cases...]

---

## Test Suite 5: DASH Validation Accuracy (25 Tests)

### Test 5.1: Valid DASH Static - No Errors
**URL:** Akamai BBB
**Expected:** compliant: true or warnings only

---

### Test 5.2: Detect Missing type Attribute
**Create:**
```xml
<MPD minBufferTime="PT2S">
  <Period>...</Period>
</MPD>
```
**Expected:** Error: MPD_TYPE_REQUIRED

---

### Test 5.3: Detect Invalid type Value
**Create:** `type="vod"` (should be "static")
**Expected:** Error: MPD_TYPE_INVALID

---

### Test 5.4: Detect Missing minBufferTime
**Expected:** Error: MIN_BUFFER_TIME_REQUIRED

---

### Test 5.5: Detect Invalid minBufferTime Format
**Create:** `minBufferTime="2s"` (should be PT2.0S)
**Expected:** Error: MIN_BUFFER_TIME_FORMAT

---

### Test 5.6: Accept Valid ISO 8601 Duration
**Create:** `minBufferTime="PT2.0S"`
**Expected:** No error

---

[Continue with 19 more DASH validation tests...]

---

## Test Suite 6: Mode Toggle (12 Tests)

### Test 6.1: Toggle Button Visible in Spec Mode
**Expected:** Purple button "→ Deep Analysis"

---

### Test 6.2: Toggle Button Visible in Analysis Mode
**Expected:** Purple button "← Spec Validator"

---

### Test 6.3: Click Toggle in Spec Mode
**Steps:**
1. In Spec mode
2. Click "→ Deep Analysis"
**Expected:**
- Switches to Analysis mode
- View tabs appear
- Export menu appears

---

### Test 6.4: Click Toggle in Analysis Mode
**Steps:**
1. In Analysis mode
2. Click "← Spec Validator"
**Expected:**
- Switches to Spec mode
- Two-panel layout
- Validation visible

---

### Test 6.5: Data Preserved During Toggle
**Steps:**
1. Load manifest
2. Toggle mode
**Expected:** Manifest data still present (no re-fetch)

---

[7 more mode toggle tests...]

---

## Test Suite 7: All 62 URLs in Spec Mode (62 Tests)

**For each of 33 HLS URLs:**
- Test 7.1 - 7.33: Load each URL
- Verify Spec mode displays
- Check validation runs
- Screenshot each
- Document any issues

**For each of 29 DASH URLs:**
- Test 7.34 - 7.62: Load each URL
- Same verification

---

## Test Suite 8: All 62 URLs in Analysis Mode (62 Tests)

**For each URL:**
- Test 8.1 - 8.62: Toggle to Analysis mode
- Verify all v1.0.0 features work
- Check ABR ladder
- Check codec analysis
- Verify export works
- No regressions

---

## Test Suite 9: Edge Cases (15 Tests)

### Test 9.1: Empty Manifest
### Test 9.2: Malformed XML (DASH)
### Test 9.3: Very Large Manifest (1000+ lines)
### Test 9.4: Single Variant
### Test 9.5: No Segments
### Test 9.6: 404 URL
### Test 9.7: CORS Blocked
### Test 9.8: Network Timeout
### Test 9.9: Invalid Characters
### Test 9.10: Unicode in Manifest
### Test 9.11: Multiple Periods (DASH)
### Test 9.12: Encrypted Content
### Test 9.13: 4K Content
### Test 9.14: 60fps Content
### Test 9.15: VR-360 Content

---

## TOTAL: 127 Test Cases

- Suite 1: Interception (10)
- Suite 2: Entry Point (8)
- Suite 3: Spec UI (15)
- Suite 4: HLS Validation (25)
- Suite 5: DASH Validation (25)
- Suite 6: Mode Toggle (12)
- Suite 7: URLs in Spec (62 - one per collected URL, abbreviated)
- Suite 8: URLs in Analysis (62 - abbreviated)
- Suite 9: Edge Cases (15)

**Execution begins with Suite 1...**
