# Feature Documentation

Complete guide to all features in the HLS + DASH Manifest Viewer.

## Table of Contents

1. [Manifest Detection](#manifest-detection)
2. [Parsing Engine](#parsing-engine)
3. [Analysis Tools](#analysis-tools)
4. [Visualization Components](#visualization-components)
5. [Export Capabilities](#export-capabilities)
6. [Simulation Features](#simulation-features)
7. [Validation System](#validation-system)
8. [Advanced Analytics](#advanced-analytics)

## Manifest Detection

### Automatic Detection

The extension automatically scans web pages for HLS and DASH manifests using multiple detection methods:

**DOM Scanning:**
- Scans all `<a>` elements for `.m3u8` and `.mpd` hrefs
- Checks `<video>` and `<source>` elements for manifest URLs
- Monitors DOM changes using MutationObserver for SPA compatibility

**Detection Sources:**
- `link` - Found in page HTML as hyperlink
- `video-src` - Used by video element
- `xhr` - Network request (future feature)

**Real-time Monitoring:**
- Content script runs on all pages
- Scans on page load
- Re-scans when DOM changes
- Updates DevTools panel every 2 seconds

### Manual Detection

Users can manually load manifests by:
1. Pasting URL in viewer
2. Right-clicking manifest link → "Analyze with HLS+DASH Viewer"
3. Clicking detected manifest in popup or DevTools

## Parsing Engine

### Supported Formats

**HLS (HTTP Live Streaming):**
- Master playlists (#EXT-X-STREAM-INF)
- Media playlists (#EXTINF segments)
- All HLS versions (1-9+)
- Low Latency HLS (LL-HLS)

**DASH (Dynamic Adaptive Streaming over HTTP):**
- MPD manifests (static and dynamic)
- All DASH profiles
- Multi-period content
- Live and on-demand

### Parser Features

**URL Resolution:**
- Resolves relative URLs to absolute
- Handles path-relative (file.m3u8)
- Handles domain-relative (/path/file.m3u8)
- Handles query parameters

**Metadata Extraction:**
- Duration and target duration
- Min buffer time
- Playlist type (VOD/LIVE/EVENT)
- Version information
- Encryption detection

**Variant Extraction:**
- Bitrate (BANDWIDTH)
- Resolution (width x height)
- Frame rate
- Codecs (video, audio, subtitle)
- URLs for each variant

**Segment Extraction (Media Playlists):**
- Segment URLs
- Duration per segment
- Byte ranges
- Sequence numbers

## Analysis Tools

### ABR Ladder Analysis

**Visual Representation:**
- Horizontal bar chart showing relative bitrate levels
- Color-coded from low (red) to high (green)
- Identifies large gaps in bitrate ladder

**Gap Detection:**
- Calculates average gap between bitrates
- Flags gaps >1.5x average
- Recommends filling large gaps

**Quality Assessment:**
- Checks for minimum 3 variants
- Recommends 4-6 variants for optimal ABR
- Warns if lowest bitrate >500 Kbps

### Bitrate Distribution

**Visualization:**
- Bar chart showing bitrate comparison
- Percentage of maximum bitrate
- Color-coded quality levels

**Statistics:**
- Range (highest - lowest)
- Median bitrate
- Average bitrate across all variants

### Codec Analysis

**Supported Video Codecs:**
- H.264/AVC (avc1) - Profile and level detection
- H.265/HEVC (hvc1/hev1) - Next-gen compression
- VP9 (vp09) - Open alternative
- AV1 (av01) - Latest standard

**Supported Audio Codecs:**
- AAC-LC (mp4a.40.2) - Standard quality
- AAC-HE (mp4a.40.5) - High efficiency
- AAC-HEv2 (mp4a.40.29) - Enhanced efficiency
- Dolby Digital (ac-3)
- Dolby Digital Plus (ec-3)
- Opus - Modern open codec

**Supported Subtitle Codecs:**
- WebVTT (wvtt) - HTML5 standard
- TTML (stpp) - XML-based

**Codec Information Includes:**
- Full codec name
- Profile and level (for H.264/H.265)
- Description and use cases
- Platform compatibility
- Modern codec detection (AV1/VP9/Opus)
- HDR capability detection (10-bit)

### Resolution Analysis

**Quality Categorization:**
- 4K UHD (3840x2160)
- 2K QHD (2560x1440)
- 1080p Full HD (1920x1080)
- 720p HD (1280x720)
- 480p SD (854x480)
- 360p (640x360)

**Aspect Ratio Analysis:**
- Calculates aspect ratio (16:9, 4:3, etc.)
- Detects widescreen content
- Warns about mixed aspect ratios

**Pixel Density Scoring:**
- 0-100 score based on total pixels
- Relative to 4K maximum
- Higher score = better quality potential

**Device Recommendations:**
- Mobile: Recommends ~360p
- Tablet: Recommends ~720p
- Desktop: Recommends ~1080p
- TV: Recommends ~4K

**Compression Efficiency:**
- Calculates bits per pixel
- Identifies most efficient variants
- 0-100 efficiency score
- Lower bits/pixel = better compression

### Frame Rate Analysis

**Categorization:**
- Cinema (24fps) - Traditional film
- Standard (30fps) - TV broadcasts
- Enhanced (48fps) - High-quality cinema
- High/HFR (60fps) - Sports, action
- Ultra High (120fps) - Gaming, ultra-smooth

**Smoothness Scoring:**
- 0-100 score based on frame rate
- Higher fps = higher score
- Considers perceptual smoothness

**Consistency Checking:**
- Detects mixed frame rates
- Warns about potential switching issues
- Recommends standardization

**Bits per Frame:**
- Calculates bitrate / frame rate
- Shows compression per frame
- Higher = more detail per frame

### Performance Metrics

**Startup Latency:**
- Estimated time to first frame
- Based on segment duration
- Typically 1-2 segments

**Switching Latency:**
- Time for quality change
- Occurs at segment boundary
- Equal to segment duration

**Buffer Requirements:**
- Recommended buffer size
- 2-3x minimum buffer time
- Prevents rebuffering

**Efficiency Score (0-100):**
- Measures bitrate ladder quality
- Considers gap consistency (60% weight)
- Considers variant count (40% weight)
- Higher = better structured ladder

**Quality Consistency (0-100):**
- Checks metadata completeness
- Penalties for missing data:
  - Missing resolution: -20
  - Missing frame rate: -10
  - Missing codecs: -30
  - Inconsistent codecs: -15

### Bandwidth Calculator

**Interactive Testing:**
- Slider from 100 Kbps to 50 Mbps
- Network presets (2G, 3G, 4G, WiFi, Fast)
- Shows recommended variant in real-time

**Safety Margin:**
- Uses 85% of available bandwidth
- Leaves 15% headroom for fluctuations
- Prevents constant quality switching

**Variant Compatibility:**
- Shows all playable variants
- Highlights recommended choice
- Marks variants that are too high

### URL Analysis

**CDN Detection:**
Detects 10+ major CDNs:
- Amazon CloudFront
- Akamai
- Fastly
- Cloudflare
- Google Cloud CDN
- Azure CDN
- Limelight
- Level3
- Verizon EdgeCast
- KeyCDN

**Parameter Analysis:**
- Identifies authentication tokens
- Detects timestamp parameters
- Warns about expiring URLs
- Allows copying individual parameters

**Security Warnings:**
- Auth token expiration risk
- Timestamp validity limits
- CORS restriction potential

### Streaming Protocol Analysis

**HLS Feature Detection:**
- Version detection (1-9+)
- Independent segments
- I-frame playlists
- Byte range support
- Discontinuity markers
- Variable GOP
- Low Latency HLS
- Server control
- Content steering
- Session data

**DASH Feature Detection:**
- Profile detection (isoff-live, isoff-on-demand, isoff-main)
- Segment template vs list vs base
- Base URL usage
- Dynamic manifest support
- UTC timing
- Multi-period content
- Event streams (SCTE-35)

**Protocol Capabilities Matrix:**
- Live streaming support
- VOD support
- Low latency capability
- Dynamic manifest updates
- Variable GOP support
- Byte range requests
- I-frame trick play
- Multi-codec support

### DRM Detection & Analysis

**Supported DRM Systems:**

1. **Widevine (Google)**
   - Levels: L1, L2, L3
   - Platforms: Android, Chrome, Firefox, Edge, ChromeOS
   - UUID: edef8ba9-79d6-4ace-a3c8-27dcd51d21ed
   - Market share: ~50%

2. **PlayReady (Microsoft)**
   - Platforms: Windows, Xbox, Edge, Smart TVs
   - UUID: 9a04f079-9840-4286-ab92-e65be0885f95
   - Market share: ~20%

3. **FairPlay (Apple)**
   - Platforms: iOS, iPadOS, macOS, tvOS, Safari
   - UUID: 94ce86fb-07ff-4f43-adb8-93d2fa968ca2
   - Market share: ~30%

4. **ClearKey (W3C)**
   - Platform: All browsers with EME
   - UUID: e2719d58-a985-b3c9-781a-b030af78d30e
   - Use: Testing/development only

**Platform Coverage Analysis:**
- Calculates percentage of platforms covered
- Identifies missing platform support
- Recommends multi-DRM for maximum reach
- 90%+ coverage = excellent
- 60-89% = good
- <60% = needs improvement

**Detection Methods:**

HLS:
- Scans #EXT-X-KEY tags
- Checks METHOD parameter
- Identifies skd:// URIs (FairPlay)
- Detects DRM keywords in URIs

DASH:
- Scans ContentProtection elements
- Matches DRM system UUIDs
- Checks schemeIdUri attributes
- Detects CENC/CBCS encryption

## Visualization Components

### Statistics Dashboard

**Comprehensive Metrics:**
- Total variants (with V/A/S breakdown)
- Bitrate range (min → max)
- Average bitrate
- Maximum resolution
- Maximum frame rate
- Unique codec count
- Content duration
- Data usage estimates (low/high quality)
- Segment count and average duration

**Color-Coded Cards:**
- Gradient backgrounds
- Large numbers for quick scanning
- Contextual information below each metric

### Validation Report

**Issue Severity Levels:**

🔴 **Errors** (Critical):
- No variants found
- Invalid manifest structure
- Prevents playback

🟡 **Warnings** (Potential Problems):
- Too few variants (<3)
- Missing metadata
- Duplicate bitrates
- Missing codec information

🔵 **Info** (Suggestions):
- Large bitrate gaps
- DRM/encryption present
- Optimization opportunities

**Visual Indicators:**
- Color-coded by severity
- Icon per severity level
- Categorized by issue type
- Expandable details

### Variant List

**Grouping:**
- Separated by type (Video/Audio/Subtitle)
- Sorted by bitrate within groups
- Count shown in section header

**Card Information:**
- Bitrate (Mbps or Kbps)
- Resolution (width x height)
- Frame rate (if available)
- Codecs (comma-separated)
- Type badge
- Details button

**Interactions:**
- Click to select variant
- Click "Details" for modal
- Visual selection indicator (blue border)

### Variant Detail Modal

**Comprehensive Information:**
- Variant ID
- Type badge
- Bitrate (formatted + raw)
- Resolution + aspect ratio
- Frame rate
- Codecs list
- Full playlist URL
- Copy URL button

**Data Usage Estimates:**
- 1 minute of playback
- 10 minutes
- 1 hour
- Formatted in GB/MB/KB

### Segment List

**Display:**
- First 10 segments by default
- "Show All" toggle for full list
- Expandable cards per segment

**Statistics:**
- Total duration
- Average segment duration
- Minimum duration
- Maximum duration

**Segment Details (Expanded):**
- Sequence number
- Duration
- Full URL with copy button
- Byte range (if applicable)

**Bulk Actions:**
- Copy all URLs
- Copy as cURL commands

### ABR Ladder Visualization

**Visual Components:**
- Horizontal bars scaled by bitrate
- Resolution labels
- Frame rate indicators
- Color gradient (low to high quality)

**Analysis:**
- Identifies large gaps
- Shows average gap size
- Provides recommendations

**Summary Statistics:**
- Lowest bitrate
- Average gap
- Highest bitrate

### Bitrate Distribution Chart

**Visual:**
- Color-coded bars
- Percentage indicators
- Resolution labels

**Statistics:**
- Bitrate range
- Median bitrate
- Average bitrate

**Color Coding:**
- Red (lowest) → Green (highest)
- 8 color gradient
- Smooth transitions

### Timeline View

**Playback Simulation:**
- Interactive bandwidth selector
- Network profile chooser
- Real-time simulation updates

**Bandwidth Profiles:**
1. **Stable** - Constant bandwidth
2. **Varying** - Random fluctuations (50-150% of base)
3. **Degrading** - Linear drop (100% → 30%)
4. **Improving** - Linear increase (30% → 100%)

**Visualization:**
- Color-coded quality timeline
- Time markers (seconds)
- Bitrate labels on bars
- Buffer health indicators

**Quality Switch Events:**
- Startup (blue) - Initial selection
- Upgrade (green) - Quality increase
- Downgrade (orange) - Quality decrease
- Shows from → to bitrates

**Metrics:**
- Total quality switches
- Rebuffering time
- Average quality achieved
- Segment count

### Variant Comparison

**Side-by-Side Analysis:**
- Select up to 4 variants
- Tabular comparison
- Highlight best values

**Compared Properties:**
- Bitrate (👑 crown for highest)
- Resolution (👑 for highest pixels)
- Frame rate (👑 for highest)
- Codecs
- Data usage per hour (💰 for lowest)
- Bitrate difference from previous (+Mbps, +%)
- Playlist URLs

**Summary:**
- Bitrate range
- Quality steps
- Data usage multiplier

### Resolution Analysis

**Quality Distribution:**
- Count per quality level (4K/2K/1080p/720p/480p/360p/SD)
- Visual grid display
- Total pixel counts

**Device Recommendations:**
- 📱 Mobile: 360p
- 📱 Tablet: 720p
- 💻 Desktop: 1080p
- 📺 TV: 4K

Shows nearest available quality and bitrate.

**Compression Efficiency:**
- Bits per pixel calculation
- Efficiency score (0-100)
- Sorted by efficiency
- Color-coded bars

### Frame Rate Analysis

**Distribution:**
- List of all frame rates used
- Category labels (Cinema/Standard/High/etc.)
- Variant count per frame rate
- Smoothness score visualization

**Bits per Frame:**
- Calculation for each variant
- Shows compression efficiency per frame
- Higher = more detail possible

**Consistency Warnings:**
- Detects mixed frame rates
- Warns about switching issues

### Protocol Information

**HLS Details:**
- Version number
- Independent segments status
- Low latency support
- Byte range usage
- Variable GOP support

**DASH Details:**
- Profile list
- Segment addressing method
- Base URL presence
- Dynamic manifest support

**Capabilities Matrix:**
- Live streaming ✓/✗
- VOD ✓/✗
- Low latency ✓/✗
- Byte range requests ✓/✗
- I-frame trick play ✓/✗
- Multi-codec support ✓/✗

**Educational Information:**
- Protocol description
- Use cases
- Platform support

### DRM Information

**Encryption Detection:**
- Shows encrypted status
- Lists DRM systems
- Shows encryption methods

**DRM System Details:**
Each detected system shows:
- Name and vendor
- Platform list
- Description
- System UUID
- Security level (for Widevine)

**Platform Coverage:**
- Percentage score
- Missing platforms listed
- Coverage bar visualization
- Multi-DRM badge

**Recommendations:**
- Suggests adding missing DRM systems
- Optimal coverage = FairPlay + Widevine + PlayReady
- Explains market share

## Export Capabilities

### JSON Export

**Contents:**
- Complete ParsedManifest object
- All variants with full metadata
- All segments
- Metadata object
- Raw manifest content

**Use Cases:**
- Archiving
- Programmatic analysis
- Manifest comparison
- API integration

### CSV Export

**Columns:**
- ID
- Type (video/audio/subtitle)
- Bitrate
- Resolution (widthxheight)
- Frame Rate
- Codecs (quoted, comma-separated)
- URL

**Use Cases:**
- Excel analysis
- Reporting
- Batch processing
- Data visualization in other tools

### Text Report Export

**Sections:**
1. Header with format
2. Basic info (URL, type, duration)
3. Grouped variants (video/audio/subtitle)
4. Segment information
5. Statistics

**Formatting:**
- Human-readable
- Proper indentation
- Section separators
- Includes variant count and details

### Download Manager

**Script Generation:**

**Bash Script (Mac/Linux):**
- Uses curl for downloads
- Creates downloads folder
- Sequential downloads
- Progress indication

**PowerShell Script (Windows):**
- Uses Invoke-WebRequest
- Creates downloads folder
- Sequential downloads
- Progress indication

**FFmpeg Integration:**
- Downloads all segments
- Generates concat file
- Merges to single MP4
- Automatic cleanup

**Features:**
- Numbered filenames (segment_0001.ts)
- Progress messages
- Error handling
- Complete workflow automation

### Clipboard Utilities

**Copy Options:**
- Single URL
- All variant URLs (newline-separated)
- All segment URLs
- cURL commands (one per segment)
- M3U playlist format

**M3U Export:**
- Proper #EXTM3U header
- #EXTINF tags with metadata
- Grouped by type
- Ready for players

## Simulation Features

### Bandwidth Profiles

**Profile Types:**

1. **Stable**
   - Constant bandwidth throughout
   - Tests single quality level
   - No switching occurs
   - Use: Verify specific quality

2. **Varying**
   - Random fluctuations 50-150% of base
   - Realistic network conditions
   - Tests ABR algorithm
   - Use: Real-world simulation

3. **Degrading**
   - Linear degradation 100% → 30%
   - Simulates moving away from router
   - Tests downward quality shifts
   - Use: Mobile scenarios

4. **Improving**
   - Linear improvement 30% → 100%
   - Simulates moving toward router
   - Tests upward quality shifts
   - Use: Recovery scenarios

**Configuration:**
- Base bandwidth selector
- Duration (default 60s)
- 5-second intervals
- Adjustable target duration

### Playback Simulation Algorithm

**Process:**
1. Generate bandwidth profile based on type
2. For each time point:
   - Get recommended variant for current bandwidth
   - Detect quality switch
   - Calculate buffer health
   - Track rebuffering

**Buffer Simulation:**
- Increases when bandwidth > bitrate
- Decreases when bandwidth < bitrate
- Rebuffers when depleted (< 0)
- Maximum 30s buffer

**Quality Selection:**
- Uses 85% bandwidth safety margin
- Selects highest variant within limit
- Switches at segment boundaries

**Output Metrics:**
- All segments with timestamps
- Quality switches with reasons
- Total switch count
- Total rebuffering time
- Average quality (bitrate)

## Validation System

### Validation Checks

**Variant Validation:**
- At least 1 variant required (error)
- 3+ variants recommended (warning)
- No duplicate bitrates (warning)
- Resolution present for video (warning)
- Codec information present (warning)

**ABR Ladder Validation:**
- Gap analysis (>2x average = info)
- Quality distribution check
- Low bitrate availability (<500 Kbps)

**Metadata Validation:**
- LIVE content should have targetDuration (warning)
- Encryption detected (info)
- Profile information (DASH)

**Error Levels:**
- **Error**: Prevents analysis or indicates critical problem
- **Warning**: Potential issue that should be addressed
- **Info**: Suggestion or notable information

### Validation Summary

**Quick Stats:**
- Error count (red)
- Warning count (orange)
- Info count (blue)
- Healthy status (green checkmark)

**Categorization:**
- Groups by category (variants/codecs/metadata/abr-ladder)
- Expandable details
- One-click view of all issues

## Advanced Analytics

### Variant Comparison

**Selection:**
- Choose 2-4 variants
- Button grid for easy selection
- Disabled when limit reached

**Comparison Table:**
- Property rows
- Variant columns
- Highlight best values
- Calculate differences

**Computed Metrics:**
- Bitrate increase from previous
- Percentage increase
- Data usage comparison
- Quality level difference

### Resolution Quality

**Analysis:**
- Maximum and minimum quality
- Quality distribution chart
- Predominant aspect ratio
- Multiple aspect ratio detection

**Recommendations:**
- Missing quality levels
- Aspect ratio consistency
- Device compatibility

### Compression Analysis

**Bitrate per Pixel:**
- Efficiency metric
- Lower = better compression
- Typical range: 0.05-0.3

**Efficiency Scoring:**
- 0-100 scale
- Accounts for resolution
- Identifies best/worst performers

## Search & Filtering

### Search Functionality

**Search Targets:**
- Variant ID
- Playlist URL
- Codec names

**Case-Insensitive:**
- Matches partial strings
- Highlights active search

### Filter Options

**Type Filter:**
- All types
- Video only
- Audio only
- Subtitle only

**Codec Filter:**
- Dropdown of all unique codecs
- Exact match

**Resolution Filter:**
- Minimum resolution threshold
- 4K/1080p/720p/480p/360p presets

**Bitrate Range:**
- Dual sliders (min/max)
- Real-time updates
- Shows formatted values

**Active Filter Display:**
- Shows all active filters as pills
- Quick visual reference
- One-click clear all

## Quick Actions

**Floating Action Button (FAB):**
- Bottom-right corner
- ⚡ icon when closed
- × icon when open
- Rotation animation

**Available Actions:**
1. 🔗 Copy Manifest URL
2. 📋 Copy All Variant URLs
3. 💾 Quick Export JSON
4. 📄 Copy Raw Manifest
5. 🔄 Open in New Tab

**Animation:**
- Slide-up animation
- Staggered entrance
- Smooth transitions

## User Interface Features

### View Modes

**Raw View:**
- Syntax highlighting (Prism.js)
- Line numbers
- Copy button
- Statistics footer (lines, characters, format)

**Structured View:**
- 15+ analysis sections
- Organized by category
- Progressive disclosure
- Scrollable sections

**Timeline View:**
- Interactive controls
- Real-time simulation
- Visual timeline
- Quality switch events

### Loading States

**Indicators:**
- Loading spinner
- Loading text
- Disabled buttons during load
- Progress feedback

**Skeleton Components:**
- Variant card skeletons
- Dashboard skeletons
- Metadata skeletons
- Progressive reveal

### Error Handling

**Error Boundary:**
- Catches React errors
- Shows friendly error message
- Stack trace (expandable)
- Try Again / Reload options

**Error Messages:**
- Fetch errors (network, CORS, 404)
- Parse errors
- Validation errors
- User-friendly explanations

**Toast Notifications:**
- Success messages
- Error alerts
- Info notifications
- Auto-dismiss (3s)
- Manual close option

### Responsive Design

**Breakpoints:**
- Mobile: <768px
- Tablet: 768-1024px
- Desktop: >1024px

**Adaptations:**
- Grid columns adjust
- Font sizes scale
- Touch-friendly targets
- Scrollable tables

## Performance Optimizations

### Code Splitting

**Automatic:**
- Vite separates shared code
- View-specific chunks
- Lazy component loading
- Tree shaking

**Bundle Sizes:**
- Service Worker: 2.85 KB
- Content Script: 1.10 KB
- Popup: 8.26 KB
- DevTools Panel: 2.67 KB
- Viewer: ~245 KB
- Shared: ~143 KB

### State Management

**Zustand Store:**
- Minimal re-renders
- Selector-based updates
- No unnecessary computations

**Component Optimization:**
- useMemo for expensive calculations
- useCallback for stable references
- Conditional rendering

### Memory Management

**Cleanup:**
- Removes old manifests from memory
- Clears tab data when tab closes
- Limits history to 50 items
- Auto-cleanup of event listeners

## Accessibility

**Keyboard Navigation:**
- Tab through interactive elements
- Enter to submit forms
- Escape to close modals
- Proper focus indicators

**Screen Reader Support:**
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Role attributes

**Color Contrast:**
- WCAG AA compliant
- High contrast ratios
- Not relying solely on color
- Text labels with color codes

## Privacy & Security

**Data Handling:**
- All processing local
- No external API calls (except manifest fetch)
- No analytics or tracking
- User data stays in browser

**Storage:**
- Chrome storage API (local only)
- History: 50 items max
- Settings: persisted
- Can be cleared anytime

**Permissions:**
- Minimal required permissions
- No access to browsing history
- No access to personal data
- Transparent permission usage

## Browser Compatibility

**Minimum Requirements:**
- Chrome 88+ (Manifest V3 support)
- Modern JavaScript support
- ES2020 features
- CSS Grid and Flexbox

**Tested On:**
- Chrome 120+
- Chrome 115-119
- Edge 120+
- Brave (Chromium-based)

**Not Supported:**
- Firefox (different extension API)
- Safari (different extension API)
- Older Chrome versions (<88)

## Future Features

**Planned Enhancements:**
1. Network request interception
2. XHR/Fetch manifest detection
3. Real-time manifest updates
4. Manifest comparison diff view
5. Segment integrity checker
6. Bandwidth estimation from network tab
7. Export to PDF report
8. Playlist builder/editor
9. Manifest validator with HLS/DASH spec compliance
10. Performance profiling with Chrome DevTools integration

## Keyboard Shortcuts (Future)

**Planned Shortcuts:**
- Ctrl/Cmd + K: Quick search
- Ctrl/Cmd + E: Quick export
- Ctrl/Cmd + R: Reload manifest
- Ctrl/Cmd + 1/2/3: Switch views
- Ctrl/Cmd + /: Help

## Tips for Best Results

**For Content Creators:**
1. Include 4-6 bitrate variants
2. Ensure lowest variant <500 Kbps
3. Use consistent codecs across variants
4. Include resolution and frame rate metadata
5. Test with Timeline View simulation
6. Check validation report regularly

**For Debugging:**
1. Use DevTools panel for real-time monitoring
2. Compare manifests using history
3. Export for offline analysis
4. Check console for detailed errors
5. Use bandwidth calculator to test edge cases

**For Analysis:**
1. Load manifest in Structured View
2. Review Validation Report first
3. Check Statistics Dashboard for overview
4. Dive into specific analysis sections
5. Export results for documentation

## Troubleshooting Features

**Common Issues:**

**Manifest Won't Load:**
- Check URL is accessible
- Verify no CORS blocking
- Check auth tokens haven't expired
- Try direct download

**Components Don't Render:**
- Check browser console
- Verify no JavaScript errors
- Reload extension
- Clear cache and reload

**Export Doesn't Work:**
- Check browser download permissions
- Verify popup blockers disabled
- Try copy to clipboard instead

**Search Returns No Results:**
- Check filter settings
- Clear all filters
- Verify search term spelling
- Check selected type filter

## Performance Notes

**Large Manifests:**
- 100+ variants: ~1-2s load time
- 1000+ segments: pagination used
- Complex analysis: computed on demand
- Export: may take 2-3s for large files

**Memory Usage:**
- Typical: 50-100 MB
- With large manifest: 100-200 MB
- Clears old data automatically
- Resets when closing viewer

**Recommended Limits:**
- Variants: <200 for best performance
- Segments: <2000 (shows first 10 by default)
- History: 50 items (enforced)

## Integration Points

**Chrome Extension APIs:**
- chrome.storage.local - History and settings
- chrome.tabs - Open new tabs
- chrome.runtime.sendMessage - Fetch manifests
- chrome.contextMenus - Right-click menu
- chrome.devtools.panels - DevTools integration

**External Libraries:**
- m3u8-parser - HLS parsing
- mpd-parser - DASH parsing
- Prism.js - Syntax highlighting
- Zustand - State management

**Web APIs:**
- Fetch API - Manifest retrieval
- Clipboard API - Copy functionality
- URL API - URL parsing
- Blob API - File generation
- MutationObserver - DOM monitoring

## Testing Coverage

**Unit Tests: 124 tests**
- URL resolution (9 tests)
- Format detection (5 tests)
- HLS parsing (3 tests)
- DASH parsing (5 tests)
- Unified parser (3 tests)
- Manifest fetcher (2 tests)
- ABR analysis (7 tests)
- Codec analyzer (8 tests)
- Export utilities (5 tests)
- Playback simulator (6 tests)
- Manifest validator (5 tests)
- Manifest diff (4 tests)
- URL analyzer (10 tests)
- Resolution analyzer (17 tests)
- Frame rate analyzer (9 tests)
- Streaming protocol (14 tests)
- DRM detector (12 tests)

**Browser Tests:**
- Playwright automated tests
- Manual testing checklist
- Cross-browser verification

**Test Coverage:**
- Parsers: 100%
- Utilities: 95%
- Export: 100%
- Validation: 90%
- Components: Manual testing

This comprehensive feature set makes the HLS + DASH Manifest Viewer one of the most complete manifest analysis tools available for Chrome.
