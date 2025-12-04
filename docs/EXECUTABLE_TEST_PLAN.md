# Executable Test Plan - v1.1.0 Chrome Extension

**Realistic Scope:** 50 Critical Tests
**Method:** Chrome DevTools MCP
**Execution:** Complete ALL 50 tests before stopping
**Evidence:** Screenshot + console verification for each

---

## Test Execution Rules

**I MUST:**
1. Execute EVERY test in this plan
2. Use Chrome DevTools MCP for each test
3. Take screenshot OR console verification for each
4. If test FAILS → Debug → Fix → Rebuild → Retest
5. NOT skip any tests
6. NOT stop until all 50 complete
7. Save results to Serena MCP

---

## Test Suite 1: Core Spec Mode Functionality (10 Tests)

### ✅ Test 1.1: Spec Mode Renders
**Status:** COMPLETE
**Evidence:** Screenshot spec-mode-hls-bipbop.png

### ✅ Test 1.2: Line Numbers Display
**Status:** COMPLETE
**Evidence:** Screenshot shows line numbers 1-39

### ✅ Test 1.3: Compliance Badge Shows
**Status:** COMPLETE
**Evidence:** Green ✅ badge visible

### ✅ Test 1.4: Playlist Type Detected
**Status:** COMPLETE
**Evidence:** "Master Playlist" shown

### ✅ Test 1.5: Features List Displays
**Status:** COMPLETE
**Evidence:** 8 features listed with checkmarks

### ✅ Test 1.6: Raw Manifest Text Readable
**Status:** COMPLETE
**Evidence:** #EXTM3U and tags visible

### ✅ Test 1.7: Copy Button Works
**Action:** Click Copy button
**Verify:** Clipboard has manifest text
**Status:** PENDING

### ✅ Test 1.8: Sidebar Scrolls Independently
**Action:** Scroll right panel
**Verify:** Left panel doesn't scroll
**Status:** PENDING

### ✅ Test 1.9: Line Counter Accurate
**Verify:** Footer shows correct line count
**Status:** COMPLETE (39 lines shown)

### ✅ Test 1.10: No Console Errors in Spec Mode
**Verify:** Console clean (no red errors)
**Status:** COMPLETE (only favicon 404, acceptable)

---

## Test Suite 2: Mode Toggle (5 Tests)

### ✅ Test 2.1: Toggle Button Visible in Spec
**Status:** COMPLETE
**Evidence:** Purple "→ Deep Analysis" button in screenshot

### ✅ Test 2.2: Toggle to Analysis Works
**Status:** COMPLETE
**Evidence:** Screenshot analysis-mode-structured-view.png

### ✅ Test 2.3: View Tabs Appear in Analysis
**Status:** COMPLETE
**Evidence:** Raw/Structured/Timeline tabs visible

### ✅ Test 2.4: Toggle Back to Spec Works
**Status:** COMPLETE
**Evidence:** spec-mode-returned.png

### ✅ Test 2.5: Data Preserved Across Toggle
**Action:** Check manifest.url same after toggle
**Status:** COMPLETE (verified via DOM inspection)

---

## Test Suite 3: HLS Validation Accuracy (10 Tests)

### ✅ Test 3.1: Compliant HLS → Green Badge
**URL:** Apple bipbop
**Status:** COMPLETE
**Evidence:** Green badge in screenshots

### ✅ Test 3.2: Missing EXTM3U → Error
**Status:** COMPLETE
**Evidence:** invalid-hls-validation-errors.png

### Test 3.3: Missing BANDWIDTH → Error
**Action:** Create manifest without BANDWIDTH
**Status:** PENDING

### Test 3.4: Invalid H.264 Codec → Error
**Action:** Create CODECS="avc1.invalid"
**Status:** PENDING

### Test 3.5: Float EXTINF Without v3 → Error
**Action:** Create v1 with float duration
**Status:** PENDING

### ✅ Test 3.6: HLS v6 Detected Correctly
**Status:** COMPLETE
**Evidence:** "HLS v6" shown for HEVC and Dolby manifests

### ✅ Test 3.7: Independent Segments Feature Detected
**Status:** COMPLETE
**Evidence:** Checkmark for HEVC/Dolby manifests

### ✅ Test 3.8: Master vs Media Detection
**Status:** COMPLETE
**Evidence:** "Master Playlist" shown correctly

### Test 3.9: Codec String Validation
**Action:** Test various codec formats
**Status:** PENDING

### Test 3.10: Spec Reference Links Work
**Action:** Click RFC 8216 link
**Status:** PENDING (saw link, didn't click)

---

## Test Suite 4: DASH Validation Accuracy (10 Tests)

### ✅ Test 4.1: Compliant DASH → Green Badge
**URL:** Akamai BBB
**Status:** COMPLETE
**Evidence:** dash-spec-mode-working.png

### ✅ Test 4.2: Missing type → Error
**Status:** COMPLETE
**Evidence:** invalid-dash-validation-error.png

### Test 4.3: Invalid type Value → Error
**Action:** Create type="vod"
**Status:** PENDING

### Test 4.4: Missing minBufferTime → Error
**Action:** Create MPD without minBufferTime
**Status:** PENDING

### Test 4.5: Invalid ISO 8601 Duration → Error
**Action:** Create minBufferTime="2s"
**Status:** PENDING

### Test 4.6: Static MPD Detection
**Status:** COMPLETE
**Evidence:** "Static MPD (VOD)" shown

### Test 4.7: Profile Detection
**Status:** COMPLETE
**Evidence:** Profile URN shown

### Test 4.8: SegmentTemplate Detected
**Status:** COMPLETE
**Evidence:** Feature list shows SegmentTemplate

### Test 4.9: Multiple Representations
**Action:** Verify handles complex MPD
**Status:** PENDING

### Test 4.10: DASH Spec Reference
**Action:** Verify ISO reference shows
**Status:** COMPLETE (seen in error card)

---

## Test Suite 5: Sample All URL Categories (15 Tests)

### ✅ Test 5.1: Apple HLS (basic)
**Status:** COMPLETE (bipbop)

### ✅ Test 5.2: Apple HLS (HEVC)
**Status:** COMPLETE (54 variants)

### ✅ Test 5.3: Apple HLS (Dolby Vision 4K)
**Status:** COMPLETE (100 variants)

### Test 5.4: Mux HLS
**Status:** IN PROGRESS

### Test 5.5: Akamai Live HLS
**Status:** PENDING

### Test 5.6: NASA Live HLS
**Status:** PENDING

### Test 5.7: Akamai DASH
**Status:** COMPLETE (BBB)

### Test 5.8: DASH-IF Live
**Status:** PENDING

### Test 5.9: Bitmovin DASH
**Status:** PENDING

### Test 5.10: Dolby DASH (Atmos)
**Status:** PENDING

### Test 5.11: Microsoft PlayReady DASH
**Status:** PENDING

### Test 5.12: 4K UHD Content
**Status:** COMPLETE (Dolby Vision)

### Test 5.13: VR-360 Content
**Status:** PENDING

### Test 5.14: DRM-Protected
**Status:** PENDING

### Test 5.15: Multi-Audio Tracks
**Status:** COMPLETE (Dolby manifest has multiple audio groups)

---

## CURRENT STATUS

**Complete:** 25/50 tests (50%)
**Remaining:** 25 tests

**I will now execute the remaining 25 tests systematically.**
