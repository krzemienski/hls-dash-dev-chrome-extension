# Implementation Phases: HLS + DASH Manifest Viewer Pro

**Project Type**: Chrome Extension (Manifest V3)
**Stack**: Vite + React + TypeScript + Tailwind v4
**Parsing Libraries**: @videojs/m3u8-parser + @videojs/mpd-parser
**Estimated Total**: ~65 hours (~65 minutes human time)
**Reference Codebases**: abr-manifest-viewer-chrome (MV2), hls-manifest-viewer (Electron)

---

## Phase 1: Infrastructure & Project Setup
**Type**: Infrastructure
**Estimated**: 2-3 hours
**Files**: package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, public/manifest.json

**Tasks**:
- [ ] Initialize npm project with TypeScript
- [ ] Install dependencies: React, Vite, Tailwind v4, @videojs/m3u8-parser, @videojs/mpd-parser, Zustand, Prism.js
- [ ] Configure Vite for Chrome extension build (multiple entry points: service-worker, popup, viewer, devtools)
- [ ] Set up Tailwind CSS v4 configuration
- [ ] Create public/manifest.json with Manifest V3 structure
- [ ] Configure TypeScript with strict mode and Chrome types (@types/chrome)
- [ ] Create basic directory structure: src/{background,content,popup,viewer,devtools,lib,components,types}
- [ ] Set up build scripts: dev, build, watch
- [ ] Create .gitignore for node_modules, dist, build artifacts
- [ ] Test build pipeline

**Verification Criteria**:
- [ ] `npm install` completes without errors
- [ ] `npm run build` produces dist/ directory with manifest.json, service-worker.js, popup.html, viewer.html
- [ ] manifest.json is valid Manifest V3 format
- [ ] Can load unpacked extension in chrome://extensions
- [ ] Extension icon appears in Chrome toolbar
- [ ] No console errors on extension load
- [ ] Build output is < 5MB

**Exit Criteria**: Extension loads successfully in Chrome with no errors, development workflow established

---

## Phase 2: Service Worker & Message Infrastructure
**Type**: Infrastructure
**Estimated**: 3-4 hours
**Files**: src/background/service-worker.ts, src/lib/messages.ts, src/lib/storage.ts

**Tasks**:
- [ ] Implement service worker with ES modules
- [ ] Set up message passing protocols (viewer ↔ service worker, popup ↔ service worker)
- [ ] Create typed message interfaces (TypeScript)
- [ ] Implement manifest fetching with fetch API (replace XMLHttpRequest from reference)
- [ ] Add error handling for 404, CORS, SSL errors (from background.js lines 99-103)
- [ ] Implement chrome.storage wrapper for ignore list persistence
- [ ] Add service worker lifecycle logging
- [ ] Handle service worker wake-up and sleep properly

**Verification Criteria**:
- [ ] Service worker registers and stays active when needed
- [ ] Can send message from popup to service worker and get response
- [ ] fetch() successfully retrieves test M3U8 manifest
- [ ] fetch() successfully retrieves test MPD manifest
- [ ] Errors (404, CORS) are caught and reported correctly
- [ ] chrome.storage.local persists data across service worker restarts
- [ ] Service worker terminates when idle (check in Task Manager after 30s)

**Exit Criteria**: Service worker handles messages reliably, fetches manifests with proper error handling

---

## Phase 3: declarativeNetRequest & Manifest Interception
**Type**: Integration
**Estimated**: 3-4 hours
**Files**: public/rules.json, src/background/service-worker.ts (update), src/lib/settings.ts

**Tasks**:
- [ ] Create declarativeNetRequest rules.json for .m3u8 and .mpd URLs
- [ ] Implement redirect rules to viewer page (replacing webRequest blocking from reference)
- [ ] Add dynamic rule management in service worker (for user-added patterns)
- [ ] Implement settings toggle for auto-intercept (disabled by default per architecture decision)
- [ ] Add ignore list checking (adapt from background.js lines 50-52)
- [ ] Create safelist for known problematic sites (adapt urlsWeBreak from background.js lines 12-15)
- [ ] Test redirect flow with query parameter passing

**Verification Criteria**:
- [ ] Navigate to https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8 → redirects to viewer
- [ ] Navigate to https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd → redirects to viewer
- [ ] URL is correctly passed as query parameter to viewer
- [ ] Can disable auto-intercept in settings
- [ ] Safelist prevents interception on demo.theoplayer.com
- [ ] Can add custom URLs to ignore list
- [ ] Ignore list persists across browser restarts

**Exit Criteria**: Auto-interception works reliably with user control and safelist protection

---

## Phase 4: Core Manifest Parsing
**Type**: API
**Estimated**: 4-5 hours
**Files**: src/lib/parsers/hls-parser.ts, src/lib/parsers/dash-parser.ts, src/lib/parsers/unified-parser.ts, src/lib/parsers/types.ts

**Tasks**:
- [ ] Install and integrate @videojs/m3u8-parser library
- [ ] Install and integrate @videojs/mpd-parser library
- [ ] Create HLS parser wrapper with TypeScript types
- [ ] Create DASH parser wrapper with TypeScript types
- [ ] Implement unified parser with auto-format detection (adapt from main.js lines 62-65)
- [ ] Extract variant/bitrate data from parsed manifests
- [ ] Implement URI resolution utility (adapt from main.js lines 88-108)
- [ ] Add parsing error handling
- [ ] Create comprehensive TypeScript interfaces for parsed data
- [ ] Write parser unit tests with real manifest samples

**Verification Criteria**:
- [ ] Can parse Apple's Bipbop HLS test stream without errors
- [ ] Can parse DASH-IF reference MPD without errors
- [ ] Auto-detection correctly identifies M3U8 vs MPD format
- [ ] Variant data extracted shows bitrate, resolution, codecs
- [ ] Relative URLs are resolved to absolute URLs correctly
- [ ] Parser handles malformed manifests gracefully (errors, not crashes)
- [ ] TypeScript types ensure type safety throughout

**Exit Criteria**: Both HLS and DASH manifests parse correctly into structured, typed data

---

## Phase 5: Basic Viewer Page
**Type**: UI
**Estimated**: 5-6 hours
**Files**: src/viewer/Viewer.tsx, src/viewer/viewer.html, src/components/ManifestDisplay.tsx, src/components/LoadingSpinner.tsx

**Tasks**:
- [ ] Create viewer.html entry point with React root
- [ ] Build Viewer.tsx main component
- [ ] Implement ManifestDisplay with Prism.js syntax highlighting
- [ ] Add custom Prism CSS for HLS/DASH tokens (adapt from prism.hls.css)
- [ ] Parse URL query parameter to get manifest URL
- [ ] Request manifest from service worker
- [ ] Display clickable manifest URL at top (from index.html line 12)
- [ ] Show loading spinner during fetch (adapt from main.css loader)
- [ ] Handle manifest fetch errors with user-friendly messages
- [ ] Make URLs in manifest clickable (adapt ManifestParser.overrideLinks from main.js lines 175-183)

**Verification Criteria**:
- [ ] Viewer page loads and displays "Loading..." spinner
- [ ] Fetched manifest appears with syntax highlighting
- [ ] HLS tags (#EXTINF, #EXT-X-STREAM-INF, etc.) are colorized correctly
- [ ] DASH/XML tags are highlighted appropriately
- [ ] Clicking URL in manifest navigates to nested playlist
- [ ] Manifest URL at top is clickable and works
- [ ] Error states display helpful messages (404, CORS, etc.)
- [ ] Page is responsive and scrollable for long manifests

**Exit Criteria**: Can view any HLS or DASH manifest with proper formatting and clickable URLs

---

## Phase 6: ABR Variant Visualization
**Type**: UI
**Estimated**: 6-7 hours
**Files**: src/components/VariantTable.tsx, src/components/BandwidthChart.tsx, src/lib/utils/variant-formatter.ts

**Tasks**:
- [ ] Create VariantTable component with sortable columns
- [ ] Parse variant metadata: bitrate, resolution, codecs, frame rate
- [ ] Display variants in table format with proper formatting (bitrate in Mbps, resolution as WxH)
- [ ] Add sortable columns (click header to sort)
- [ ] Implement BandwidthChart visual component (ladder/bar chart)
- [ ] Add codec compatibility indicators (VP9, AV1, H.264, H.265, AAC, etc.)
- [ ] Handle both HLS variants and DASH AdaptationSets
- [ ] Add variant filtering (by resolution, bitrate range)
- [ ] Show audio-only and subtitle variants separately
- [ ] Add "Copy Variant URL" button for each variant

**Verification Criteria**:
- [ ] All variants from test manifest are displayed
- [ ] Sorting by bitrate works (ascending/descending)
- [ ] Sorting by resolution works correctly (720p vs 1080p vs 4K)
- [ ] Bandwidth chart visualizes bitrate ladder accurately
- [ ] Codec information is complete and accurate
- [ ] Can distinguish video/audio/subtitle variants
- [ ] Filtering by resolution narrows displayed variants
- [ ] Copy button copies correct variant URL to clipboard

**Exit Criteria**: Complete ABR variant information is displayed in multiple formats (table, chart)

---

## Phase 7: Popup UI
**Type**: UI
**Estimated**: 4-5 hours
**Files**: src/popup/Popup.tsx, src/popup/popup.html, src/components/ManifestHistory.tsx, src/components/ManualInput.tsx, src/components/Settings.tsx

**Tasks**:
- [ ] Create popup.html entry point
- [ ] Build Popup.tsx main React component
- [ ] Implement ManifestHistory component (list of recently viewed manifests)
- [ ] Add ManualInput component with URL validation
- [ ] Create Settings panel (auto-intercept toggle, theme, clear history)
- [ ] Display detected manifests from content script (badge count)
- [ ] Add "Open in Viewer" action for each manifest
- [ ] Implement history persistence with chrome.storage.local
- [ ] Add quick preview hover tooltips for history items
- [ ] Style with Tailwind for modern, clean UI

**Verification Criteria**:
- [ ] Popup opens when clicking extension icon
- [ ] Recently viewed manifests appear in history list (most recent first)
- [ ] Can manually paste manifest URL and open in viewer
- [ ] Settings toggle for auto-intercept persists across browser restarts
- [ ] Clear history button removes all history items
- [ ] Popup shows count of manifests detected on current page
- [ ] Clicking manifest in history opens viewer page
- [ ] Popup dimensions are appropriate (350x500px)

**Exit Criteria**: Popup provides full access to extension features with clean, intuitive UI

---

## Phase 8: Content Script & Page Detection
**Type**: Integration
**Estimated**: 4-5 hours
**Files**: src/content/content-script.ts, src/background/service-worker.ts (update)

**Tasks**:
- [ ] Create content script that runs on all pages (document_idle)
- [ ] Implement DOM parsing for manifest links (a[href], link[href], source[src])
- [ ] Use regex to match .m3u8 and .mpd URLs in page content
- [ ] Send detected manifest count to service worker
- [ ] Update extension badge with count
- [ ] Add context menu "View Manifest" on links
- [ ] Implement right-click handler for manifest links
- [ ] Optimize performance (debounce DOM parsing)
- [ ] Handle single-page apps (mutation observer for dynamic content)

**Verification Criteria**:
- [ ] Navigate to https://developer.apple.com/streaming/examples/ → badge shows count > 0
- [ ] Badge count matches actual manifest links on page
- [ ] Right-click on manifest link → "View Manifest" appears in context menu
- [ ] Selecting "View Manifest" opens viewer with that URL
- [ ] Content script doesn't slow page load (< 50ms execution)
- [ ] Works on dynamically loaded content (SPA sites)
- [ ] Badge updates when navigating to new page

**Exit Criteria**: Content script detects manifests on real streaming sites and provides access via badge/context menu

---

## Phase 9: DevTools Panel Integration
**Type**: Integration
**Estimated**: 6-8 hours
**Files**: src/devtools/devtools.ts, src/devtools/panel.html, src/devtools/DevToolsPanel.tsx, src/components/NetworkCapture.tsx

**Tasks**:
- [ ] Create devtools.ts to register DevTools panel
- [ ] Set up panel.html entry point with React
- [ ] Build DevToolsPanel.tsx main component
- [ ] Implement chrome.devtools.network.onRequestFinished listener
- [ ] Filter network requests for .m3u8 and .mpd Content-Type or URLs
- [ ] Display list of captured manifests with timestamp
- [ ] Add "View Full Manifest" action for each captured request
- [ ] Show request headers and response headers
- [ ] Implement manifest content extraction from network response
- [ ] Add filter/search for manifest requests
- [ ] Persist captured manifests across DevTools close/reopen

**Verification Criteria**:
- [ ] DevTools panel appears in Chrome DevTools tabs
- [ ] Panel shows "Manifests" tab icon
- [ ] Navigate to streaming site → panel captures .m3u8 requests
- [ ] Navigate to DASH site → panel captures .mpd requests
- [ ] Clicking manifest in panel opens full viewer
- [ ] Request/response headers are displayed
- [ ] Captured manifests persist when closing/reopening DevTools
- [ ] Filter input narrows displayed requests

**Exit Criteria**: DevTools panel captures and displays manifest requests from network activity

---

## Phase 10: Variant Comparison Tool
**Type**: UI
**Estimated**: 5-6 hours
**Files**: src/components/ComparisonView.tsx, src/components/VariantSelector.tsx, src/lib/utils/differ.ts

**Tasks**:
- [ ] Create multi-select variant UI (checkboxes on variant table)
- [ ] Build ComparisonView component for side-by-side display
- [ ] Implement diff algorithm for highlighting differences
- [ ] Show comparison of: bitrate, resolution, codecs, segment count, duration
- [ ] Add "Export Comparison" button (JSON/CSV)
- [ ] Support comparing 2-4 variants simultaneously
- [ ] Visual diff highlighting (added/removed/changed)
- [ ] Add comparison summary statistics

**Verification Criteria**:
- [ ] Can select 2+ variants from variant table
- [ ] Comparison view shows selected variants side-by-side
- [ ] Differences are highlighted clearly
- [ ] Comparison includes all relevant metadata
- [ ] Export comparison as JSON produces valid output
- [ ] Export comparison as CSV opens correctly in Excel/Google Sheets
- [ ] Can compare variants from different manifests
- [ ] UI handles 4 variants without layout breaking

**Exit Criteria**: Users can compare multiple variants with clear diff visualization and export capability

---

## Phase 11: Playback Simulation
**Type**: UI
**Estimated**: 7-8 hours
**Files**: src/components/PlaybackSimulator.tsx, src/lib/simulation/abr-algorithm.ts, src/lib/simulation/bandwidth-simulator.ts

**Tasks**:
- [ ] Create PlaybackSimulator component UI
- [ ] Implement bandwidth selector (user controls simulated connection)
- [ ] Build simplified ABR algorithm (throughput-based switching)
- [ ] Calculate which variant would be selected at each timestamp
- [ ] Visualize ABR switch points on timeline
- [ ] Show segment download timeline
- [ ] Display buffer state simulation
- [ ] Add playback controls (play/pause/seek simulation)
- [ ] Export simulation results (which segments/variants downloaded)
- [ ] Add presets (4G, WiFi, fiber, custom bandwidth)

**Verification Criteria**:
- [ ] Selecting "Slow 4G" preset switches to lower bitrate variants
- [ ] Selecting "Fiber" preset uses highest bitrate variants
- [ ] Timeline shows when ABR switches occur
- [ ] Segment download visualization is accurate
- [ ] Can export simulation results as JSON
- [ ] Simulation matches expected ABR behavior
- [ ] Custom bandwidth input (Mbps) updates simulation
- [ ] Seek to timestamp shows correct variant for that point

**Exit Criteria**: Playback simulation accurately represents ABR behavior under different network conditions

---

## Phase 12: Segment Timeline Visualization
**Type**: UI
**Estimated**: 5-6 hours
**Files**: src/components/SegmentTimeline.tsx, src/lib/utils/segment-parser.ts, src/components/TimelineControls.tsx

**Tasks**:
- [ ] Parse segment metadata from manifests (duration, byte ranges, sequence numbers)
- [ ] Create visual timeline component with zoom/pan
- [ ] Display segments as blocks on timeline (scaled by duration)
- [ ] Add segment detail tooltips (duration, URL, byte range, sequence)
- [ ] Implement discontinuity markers (for HLS #EXT-X-DISCONTINUITY)
- [ ] Show I-frame/key-frame indicators (from #EXT-X-I-FRAMES-ONLY)
- [ ] Add timeline controls (zoom in/out, reset view)
- [ ] Color-code segments by variant/quality
- [ ] Show segment numbers and timestamps
- [ ] Add "Jump to Segment" functionality

**Verification Criteria**:
- [ ] Timeline displays all segments from manifest
- [ ] Segment durations are visually accurate (longer segments are wider)
- [ ] Zoom in reveals segment details clearly
- [ ] Pan across timeline works smoothly
- [ ] Discontinuity markers appear at correct positions
- [ ] Tooltip shows accurate segment metadata
- [ ] I-frame indicators are distinct and correct
- [ ] Timeline handles manifests with 100+ segments without lag

**Exit Criteria**: Segment timeline provides comprehensive visual representation of manifest structure

---

## Phase 13: Export & Data Tools
**Type**: API
**Estimated**: 3-4 hours
**Files**: src/lib/export/json-exporter.ts, src/lib/export/csv-exporter.ts, src/components/ExportPanel.tsx

**Tasks**:
- [ ] Implement JSON export of parsed manifest data (full structure)
- [ ] Implement CSV export for variants (bitrate, resolution, codecs, URL)
- [ ] Implement CSV export for segments (sequence, duration, URL, byte range)
- [ ] Add "Copy to Clipboard" for raw manifest text
- [ ] Add "Copy Parsed Data" for JSON structure
- [ ] Create ExportPanel component with format selection
- [ ] Export with resolved URLs (absolute paths)
- [ ] Add filename generation (based on manifest URL and timestamp)
- [ ] Implement download trigger (chrome.downloads API or blob URL)

**Verification Criteria**:
- [ ] Export JSON produces valid, parseable JSON
- [ ] Exported JSON includes all parsed manifest data
- [ ] Export CSV (variants) opens correctly in spreadsheet software
- [ ] Export CSV (segments) includes all segment metadata
- [ ] Copy to clipboard works (can paste into text editor)
- [ ] Downloaded files have sensible names (e.g., "bipbop-master-20251202.json")
- [ ] Relative URLs are converted to absolute in exports
- [ ] All export formats work for both HLS and DASH

**Exit Criteria**: Users can export manifest data in multiple formats for external analysis

---

## Phase 14: Search & Filter
**Type**: UI
**Estimated**: 3-4 hours
**Files**: src/components/SearchBar.tsx, src/lib/utils/manifest-search.ts

**Tasks**:
- [ ] Create SearchBar component for manifest content
- [ ] Implement search highlighting in raw manifest view
- [ ] Add filter for specific HLS tags (#EXT-X-STREAM-INF, #EXTINF, etc.)
- [ ] Add filter for specific DASH elements (AdaptationSet, Representation, etc.)
- [ ] Implement "Find in Manifest" with regex support
- [ ] Add "Jump to Next Match" navigation
- [ ] Show match count (e.g., "5 of 23 matches")
- [ ] Highlight all matches in manifest display

**Verification Criteria**:
- [ ] Searching for "BANDWIDTH" highlights all occurrences
- [ ] Search is case-insensitive by default (with toggle for case-sensitive)
- [ ] Filter by tag type (e.g., show only #EXT-X-STREAM-INF lines)
- [ ] Regex search works (e.g., "BANDWIDTH=\d+" matches all bandwidth values)
- [ ] Navigation between matches works correctly
- [ ] Match count is accurate
- [ ] Search highlighting is visible and clear
- [ ] Search works for both HLS and DASH manifests

**Exit Criteria**: Users can search and filter manifest content efficiently

---

## Phase 15: Advanced Manifest Metadata
**Type**: UI
**Estimated**: 4-5 hours
**Files**: src/components/ManifestMetadata.tsx, src/components/ValidationReport.tsx, src/lib/validation/spec-validator.ts

**Tasks**:
- [ ] Extract and display manifest metadata (version, type, total duration)
- [ ] Parse and display HLS-specific tags (#EXT-X-VERSION, #EXT-X-TARGETDURATION)
- [ ] Parse and display DASH-specific attributes (profiles, minBufferTime, publishTime)
- [ ] Implement basic spec compliance validation
- [ ] Check for required tags/attributes
- [ ] Identify deprecated or non-standard elements
- [ ] Show warnings for potential issues
- [ ] Display codec profiles and levels
- [ ] Show encryption/DRM information if present
- [ ] Add manifest statistics (segment count, total size estimate)

**Verification Criteria**:
- [ ] Manifest metadata header shows correct version
- [ ] Total duration is calculated and displayed accurately
- [ ] Validation report identifies missing required tags
- [ ] Warnings appear for deprecated elements
- [ ] DRM/encryption info is displayed when present
- [ ] Statistics are accurate (segment count matches manual count)
- [ ] Works correctly for both HLS and DASH
- [ ] Validation errors are specific and actionable

**Exit Criteria**: Comprehensive manifest metadata and validation information is displayed

---

## Phase 16: Popup Enhancement & History Management
**Type**: UI
**Estimated**: 3-4 hours
**Files**: src/popup/Popup.tsx (update), src/components/ManifestHistory.tsx (update), src/lib/utils/history-manager.ts

**Tasks**:
- [ ] Add timestamp to history items
- [ ] Implement history item deletion (individual and bulk)
- [ ] Add manifest preview on hover (show first few lines)
- [ ] Group history by date (Today, Yesterday, Last 7 days, etc.)
- [ ] Add search filter for history items
- [ ] Show manifest type icon (HLS vs DASH badge)
- [ ] Implement history item starring/favorites
- [ ] Add "Open in New Tab" option
- [ ] Show history item metadata (variant count, duration)
- [ ] Add history export functionality

**Verification Criteria**:
- [ ] History shows timestamps for each manifest
- [ ] Can delete individual history items
- [ ] "Clear All History" removes all items
- [ ] Hover shows manifest preview
- [ ] History grouped by date correctly
- [ ] Search in history works (filters by URL or content)
- [ ] HLS/DASH badges display correctly
- [ ] Starred items appear at top
- [ ] History persists across browser restarts
- [ ] History export produces importable JSON

**Exit Criteria**: Popup provides robust history management and quick access to manifests

---

## Phase 17: DevTools Panel Enhancement
**Type**: UI
**Estimated**: 5-6 hours
**Files**: src/devtools/DevToolsPanel.tsx (update), src/components/DetailedInspector.tsx, src/components/RequestDetails.tsx

**Tasks**:
- [ ] Add detailed request/response inspection
- [ ] Show request headers, response headers, timing information
- [ ] Display response size and timing waterfall
- [ ] Implement manifest diff (compare current vs previous version for live streams)
- [ ] Add filter by request type (master playlist vs variant playlist vs segments)
- [ ] Show manifest update timeline for live streams
- [ ] Add "Copy as cURL" for manifest requests
- [ ] Implement manifest request replay
- [ ] Add export of all captured manifests
- [ ] Show warning for CORS issues or failed requests

**Verification Criteria**:
- [ ] Request details show all headers correctly
- [ ] Response timing is accurate
- [ ] Waterfall visualization works
- [ ] Live stream manifest diff shows changes over time
- [ ] Filtering by request type works correctly
- [ ] "Copy as cURL" produces valid cURL command
- [ ] Can replay manifest request
- [ ] Export includes all captured data
- [ ] CORS errors are clearly indicated

**Exit Criteria**: DevTools panel provides professional-grade network inspection for streaming manifests

---

## Phase 18: Viewer Tab Navigation & Multi-View
**Type**: UI
**Estimated**: 4-5 hours
**Files**: src/viewer/Viewer.tsx (update), src/components/TabNavigation.tsx, src/components/StructuredView.tsx

**Tasks**:
- [ ] Add tab navigation: Raw | Structured | Timeline | Simulation | Export
- [ ] Implement StructuredView with collapsible sections
- [ ] Show hierarchical manifest structure (master → variants → segments)
- [ ] Add tree view for DASH Periods/AdaptationSets/Representations
- [ ] Implement collapsible/expandable sections
- [ ] Add "Expand All" / "Collapse All" buttons
- [ ] Show metadata in structured format (not just raw text)
- [ ] Add icons for different element types
- [ ] Implement keyboard navigation (arrow keys, tab)

**Verification Criteria**:
- [ ] All tabs (Raw, Structured, Timeline, etc.) are clickable
- [ ] Raw tab shows syntax-highlighted manifest
- [ ] Structured tab shows hierarchical tree view
- [ ] Can expand/collapse sections in structured view
- [ ] Tree view correctly represents manifest hierarchy
- [ ] Timeline tab shows segment timeline
- [ ] Simulation tab shows playback simulator
- [ ] Export tab shows export options
- [ ] Tab state persists when switching between tabs

**Exit Criteria**: Viewer provides multiple views of manifest data for different analysis needs

---

## Phase 19: Advanced Simulation Features
**Type**: UI
**Estimated**: 5-6 hours
**Files**: src/components/PlaybackSimulator.tsx (update), src/lib/simulation/abr-algorithm.ts (update), src/components/BufferVisualization.tsx

**Tasks**:
- [ ] Add buffer state visualization
- [ ] Implement startup behavior simulation (cold start, ABR ramp-up)
- [ ] Add seek simulation (bitrate impact of seeks)
- [ ] Show stall detection (when buffer would empty)
- [ ] Implement multiple ABR algorithms (throughput-based, buffer-based, hybrid)
- [ ] Add algorithm comparison mode
- [ ] Show estimated data usage (total MB downloaded)
- [ ] Display quality of experience metrics (average bitrate, switch frequency)
- [ ] Add frame drop estimation
- [ ] Export simulation report with charts

**Verification Criteria**:
- [ ] Buffer visualization shows fill/drain accurately
- [ ] Cold start begins at lowest quality (expected behavior)
- [ ] Seek causes temporary quality drop (simulated rebuffering)
- [ ] Stall detection correctly identifies buffer starvation points
- [ ] Different ABR algorithms produce different results
- [ ] Data usage calculation is within 10% of actual
- [ ] QoE metrics are meaningful and accurate
- [ ] Simulation report export includes all metrics
- [ ] Visualization updates in real-time during simulation

**Exit Criteria**: Advanced simulation provides deep insights into streaming behavior and ABR performance

---

## Phase 20: Segment Analysis Tools
**Type**: UI
**Estimated**: 4-5 hours
**Files**: src/components/SegmentInspector.tsx, src/lib/utils/segment-analyzer.ts, src/components/SegmentDetails.tsx

**Tasks**:
- [ ] Create segment detail panel
- [ ] Show individual segment information (URL, duration, byte range, size estimate)
- [ ] Parse EXT-X-BYTERANGE for HLS segments
- [ ] Parse SegmentBase/SegmentList for DASH
- [ ] Display segment timeline with interactive selection
- [ ] Show segment availability window (for live streams)
- [ ] Calculate and display segment overlap/gaps
- [ ] Show segment encryption details (key URI, IV)
- [ ] Add segment URL copy functionality
- [ ] Display segment sequence numbers

**Verification Criteria**:
- [ ] Clicking segment on timeline shows details panel
- [ ] Segment duration is accurate
- [ ] Byte range information is correct (for range requests)
- [ ] Size estimates are reasonable
- [ ] Live stream availability window is calculated correctly
- [ ] Gaps between segments are identified
- [ ] Encryption information is displayed when present
- [ ] Segment URLs are copyable
- [ ] Sequence numbers match manifest

**Exit Criteria**: Segment-level analysis provides granular insight into manifest structure

---

## Phase 21: Settings & Customization
**Type**: UI
**Estimated**: 3-4 hours
**Files**: src/components/Settings.tsx (update), src/lib/settings-manager.ts, src/styles/themes.ts

**Tasks**:
- [ ] Implement theme selection (light, dark, auto)
- [ ] Add auto-intercept toggle with explanation
- [ ] Create ignore list management UI (add/remove URLs)
- [ ] Add safelist configuration (sites to never intercept)
- [ ] Implement syntax highlighting theme selector
- [ ] Add default view preference (Raw vs Structured vs Timeline)
- [ ] Create format detection override (force HLS or DASH parsing)
- [ ] Add export format preferences
- [ ] Implement settings import/export for backup
- [ ] Add "Reset to Defaults" button

**Verification Criteria**:
- [ ] Theme selection changes UI immediately
- [ ] Dark mode applies throughout extension (popup, viewer, devtools)
- [ ] Auto-intercept toggle enables/disables URL interception
- [ ] Can add URLs to ignore list via settings
- [ ] Safelist prevents interception even with auto-intercept enabled
- [ ] Syntax highlighting theme changes Prism colors
- [ ] Default view preference is respected when opening viewer
- [ ] Settings persist across browser restarts
- [ ] Settings export/import works correctly
- [ ] Reset to defaults restores all original settings

**Exit Criteria**: Settings provide full customization with sensible defaults

---

## Phase 22: Production Polish & Error Handling
**Type**: Testing
**Estimated**: 4-5 hours
**Files**: All components (error boundaries), src/lib/error-handler.ts, src/components/ErrorDisplay.tsx

**Tasks**:
- [ ] Add React Error Boundaries to all major components
- [ ] Implement global error handler for uncaught errors
- [ ] Add user-friendly error messages (no raw stack traces)
- [ ] Implement error reporting to console with context
- [ ] Add loading states to all async operations
- [ ] Implement skeleton loaders for better perceived performance
- [ ] Add empty states (no history, no detected manifests, etc.)
- [ ] Optimize bundle size (code splitting, lazy loading)
- [ ] Add performance monitoring (parsing time, render time)
- [ ] Test with real-world manifests (various streaming providers)

**Verification Criteria**:
- [ ] Parser errors show user-friendly message instead of crashing
- [ ] Network errors display actionable guidance ("Check URL", "CORS issue")
- [ ] All loading operations show spinner or skeleton
- [ ] Empty history shows helpful message ("No manifests viewed yet")
- [ ] Extension bundle size < 2MB
- [ ] Initial load time < 100ms
- [ ] Parsing large manifest (5000+ lines) < 500ms
- [ ] No memory leaks (test with 100+ manifest views)
- [ ] Works with Apple HLS example streams
- [ ] Works with DASH-IF reference streams

**Exit Criteria**: Extension handles all error cases gracefully with professional user experience

---

## Phase 23: Chrome Web Store Preparation
**Type**: Testing
**Estimated**: 3-4 hours
**Files**: docs/STORE_LISTING.md, screenshots/, icons/ (final versions), PRIVACY_POLICY.md

**Tasks**:
- [ ] Create production icons (16x16, 48x48, 128x128)
- [ ] Take screenshots for Chrome Web Store (1280x800, 640x400)
- [ ] Screenshot: Popup with history
- [ ] Screenshot: Viewer with HLS manifest
- [ ] Screenshot: DevTools panel with captures
- [ ] Screenshot: Variant comparison view
- [ ] Screenshot: Playback simulation
- [ ] Write store description (detailed, SEO-friendly)
- [ ] Create PRIVACY_POLICY.md (required for extensions)
- [ ] Test on multiple platforms (Windows, Mac, Linux)
- [ ] Verify all permissions are justified in description
- [ ] Create promotional tile (440x280)

**Verification Criteria**:
- [ ] Icons are crisp at all sizes
- [ ] Screenshots showcase all major features
- [ ] Store description is under 132 characters (short) and detailed (long)
- [ ] Privacy policy covers all data handling
- [ ] Extension works on Windows Chrome
- [ ] Extension works on Mac Chrome
- [ ] Extension works on Linux Chrome
- [ ] All permissions are explained in store listing
- [ ] Promotional tile follows design guidelines
- [ ] No store policy violations (checked against Chrome Web Store policies)

**Exit Criteria**: Extension is ready for Chrome Web Store submission

---

## Phase 24: Final Testing & Documentation
**Type**: Testing
**Estimated**: 4-5 hours
**Files**: README.md, docs/USER_GUIDE.md, docs/DEVELOPER_GUIDE.md, CHANGELOG.md

**Tasks**:
- [ ] Test with 20+ real-world streaming sites
- [ ] Verify all features work end-to-end
- [ ] Test edge cases (malformed manifests, huge files, special characters)
- [ ] Write comprehensive README with features, installation, usage
- [ ] Create USER_GUIDE with screenshots and tutorials
- [ ] Write DEVELOPER_GUIDE for contributors
- [ ] Document all manifest.json permissions and their purpose
- [ ] Create CHANGELOG for version tracking
- [ ] Add LICENSE file
- [ ] Test uninstall/reinstall flow

**Verification Criteria**:
- [ ] Tested with Netflix, YouTube, Twitch, Apple, Akamai test streams
- [ ] Malformed manifest shows error instead of crashing
- [ ] Manifest with 10,000+ lines parses and displays
- [ ] Special characters in URLs are handled correctly
- [ ] README has clear installation instructions
- [ ] USER_GUIDE covers all features with examples
- [ ] DEVELOPER_GUIDE enables contributors to understand codebase
- [ ] All permissions explained in documentation
- [ ] CHANGELOG follows standard format
- [ ] Uninstall cleans up all stored data

**Exit Criteria**: Extension is production-ready with complete documentation

---

## Summary

**Total Phases**: 24
**Estimated Duration**: ~95 hours (~95 minutes human time)
**Phases with Testing**: All phases include verification criteria
**Deployment Strategy**: Can deploy incrementally after Phase 6 (MVP), Phase 13 (Full V1), Phase 24 (Production)

**Phase Grouping:**
- **MVP (Phases 1-6)**: Core viewing functionality (~25 hours)
- **Extended V1 (Phases 7-13)**: Advanced features (~40 hours)
- **Production V1 (Phases 14-24)**: Polish and professional features (~30 hours)

**Testing Strategy**: Per-phase verification with real manifests, final comprehensive testing in Phase 24

**Context Management**: Phases sized for single-session implementation with clear verification checkpoints

---

## Notes

This plan is based on complete analysis of:
- abr-manifest-viewer-chrome (MV2 Chrome extension - 8 source files analyzed)
- hls-manifest-viewer (Electron app - 6 source files analyzed)
- Modern library research (hls.js, m3u8-parser, mpd-parser, shaka-player)
- Chrome Extension Manifest V3 migration requirements
- HLS and DASH specification fundamentals

**Key Architectural Decisions:**
- Use @videojs parsing libraries instead of manual parsing
- Hybrid detection (auto-intercept optional, content script, DevTools, manual)
- React + TypeScript + Tailwind for modern development experience
- Zustand for state management across extension pages
- declarativeNetRequest with dynamic rules for flexibility

**Reference Repo Adaptations:**
- URI resolution logic from abr-manifest-viewer-chrome (lines 88-108 of main.js)
- Format detection pattern (startsWith('<') for MPD)
- Ignore list and safelist patterns
- Playlist navigation concept from hls-manifest-viewer
- Loading states and error handling patterns

Ready to proceed with implementation starting Phase 1 after user review and approval of this plan.
