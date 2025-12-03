# HLS + DASH Manifest Viewer - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Manifest Detection](#manifest-detection)
3. [Viewer Interface](#viewer-interface)
4. [Analysis Features](#analysis-features)
5. [Export Options](#export-options)
6. [Advanced Features](#advanced-features)

## Getting Started

### First Time Setup

After installing the extension:

1. Pin the extension icon to your Chrome toolbar for easy access
2. Visit a website with HLS or DASH streaming content
3. Click the extension icon to see detected manifests

### Ways to Analyze Manifests

#### Method 1: Auto-Detection (Recommended)

Navigate to any page with streaming content. The extension automatically detects manifests and displays them in:
- Extension popup (click toolbar icon)
- DevTools panel (open DevTools → Manifests tab)

#### Method 2: Manual URL Entry

1. Click extension icon → "Open Full Viewer"
2. Paste manifest URL
3. Click "Load"

Supports:
- HLS: `.m3u8` files
- DASH: `.mpd` files

#### Method 3: Context Menu

Right-click any manifest link → "Analyze with HLS+DASH Viewer"

## Manifest Detection

### What Gets Detected

The extension scans for:
- Links with `.m3u8` or `.mpd` extensions
- Video source elements pointing to manifests
- Manifests loaded via XHR/Fetch (future feature)

### Detection Indicators

**Popup Badge Colors:**
- 🟢 Green = HLS manifest
- 🟣 Purple = DASH manifest

**Source Types:**
- `link` - Found in page HTML
- `xhr` - Detected from network request
- `video-src` - Used by video element

## Viewer Interface

### Three View Modes

#### Raw View
- Syntax-highlighted manifest source
- Line numbers
- Copy button
- Statistics: lines, characters, format

#### Structured View
Comprehensive analysis with sections:
1. **Validation Report** - Issues and warnings
2. **Statistics Dashboard** - Key metrics at a glance
3. **URL Analysis** - CDN detection, auth parameters
4. **Metadata** - Duration, type, encryption status
5. **ABR Ladder** - Visual bitrate comparison
6. **Bitrate Chart** - Distribution graph
7. **Codec Information** - Detailed codec analysis
8. **Bandwidth Calculator** - Quality recommendations
9. **Performance Metrics** - Latency and efficiency
10. **Variants** - Full variant list with details
11. **Segments** - Segment list (for media playlists)
12. **Download Manager** - Script generation

#### Timeline View
- Interactive playback simulation
- Bandwidth profile selector (stable/varying/degrading/improving)
- Quality switching visualization
- Rebuffering detection
- Average quality metrics

## Analysis Features

### ABR Ladder Analysis

**What It Shows:**
- All video quality levels
- Bitrate gaps between variants
- Recommendations for missing qualities

**How to Read:**
- Longer bars = higher bitrate
- ⚠️ warnings = large gaps in ladder
- Recommendations suggest improvements

### Codec Analysis

**Supported Codecs:**

**Video:**
- H.264 (AVC) - Most common
- H.265 (HEVC) - Better compression
- VP9 - Open alternative to H.265
- AV1 - Next-generation codec

**Audio:**
- AAC-LC - Standard quality
- AAC-HE - Low bitrate optimization
- Dolby Digital (AC-3)
- Dolby Digital Plus (E-AC-3)
- Opus - Modern, efficient

**Codec Details Include:**
- Codec name and type
- Profile and level
- Description and benefits
- Compatibility notes

### Performance Metrics

**Metrics Explained:**

1. **Startup Latency**
   - Time to first frame
   - Based on segment duration
   - Lower = faster playback start

2. **Switch Latency**
   - Time to change quality
   - Occurs at segment boundaries
   - Based on segment duration

3. **Buffer Requirement**
   - Recommended buffer size
   - Prevents rebuffering
   - Usually 2-3x min buffer time

4. **Efficiency Score (0-100)**
   - Measures bitrate ladder quality
   - Higher = better structured
   - Considers gap consistency and variant count

5. **Quality Consistency (0-100)**
   - Checks metadata completeness
   - Penalizes missing resolution/codecs
   - Higher = more complete data

### Bandwidth Calculator

**How It Works:**

1. Move slider or select network preset
2. See recommended quality for that bandwidth
3. View all playable variants
4. Uses 85% of bandwidth for safety margin

**Network Presets:**
- 2G: 500 Kbps
- 3G: 1.5 Mbps
- 4G: 5 Mbps
- WiFi: 10 Mbps
- Fast: 25 Mbps

### Validation

**Error Levels:**

🔴 **Errors** - Critical issues
- No variants found
- Invalid manifest structure

🟡 **Warnings** - Potential problems
- Too few variants
- Missing metadata
- Duplicate bitrates

🔵 **Info** - Suggestions
- Large bitrate gaps
- DRM/encryption present

## Export Options

### Export Formats

#### JSON Export
- Complete manifest data
- Preserves all metadata
- Machine-readable
- Use for: Archiving, programmatic analysis

#### CSV Export
- Variant list in spreadsheet format
- Columns: ID, Type, Bitrate, Resolution, Codecs, URL
- Use for: Excel analysis, reporting

#### Text Report
- Human-readable summary
- Organized sections
- Statistics included
- Use for: Documentation, sharing

### Download Manager

Available when viewing media playlists with segments.

#### Bash Script (Mac/Linux)
```bash
chmod +x download.sh
./download.sh
```

#### PowerShell Script (Windows)
```powershell
.\download.ps1
```

#### FFmpeg Integration
- Downloads all segments
- Generates concat file
- Merges to single MP4
- Cleans up temporary files

**Requirements:**
- curl (bash) or PowerShell 3.0+
- FFmpeg (for merge option)

### Copy Utilities

**Copy Options:**
- Copy single URL
- Copy all variant URLs
- Copy all segment URLs
- Copy as cURL commands
- Copy as M3U playlist

## Advanced Features

### History Management

**Automatic History:**
- Manifests viewed are saved automatically
- Limited to 50 most recent
- Includes timestamp, variant count, duration

**Clear History:**
Settings tab → Clear All

### Playback Simulation

**Bandwidth Profiles:**

1. **Stable** - Constant bandwidth
   - Tests single quality level
   - No switching

2. **Varying** - Random fluctuations
   - Tests ABR switching
   - Realistic scenario

3. **Degrading** - Network getting worse
   - Tests downward quality shifts
   - Mobile scenario (moving away from router)

4. **Improving** - Network getting better
   - Tests upward quality shifts
   - Mobile scenario (moving toward router)

**Simulation Results:**
- Quality switches count
- Rebuffering time
- Average quality achieved
- Visual timeline

### URL Analysis

**Detects:**
- CDN providers (CloudFront, Akamai, Fastly, etc.)
- Authentication parameters
- Timestamp parameters
- Protocol (HTTP/HTTPS)

**Warnings:**
- Authentication tokens may expire
- Timestamp-based URLs may have limited validity

### Variant Details

Click "Details" on any variant to see:
- Complete specifications
- Aspect ratio calculation
- Estimated data usage (1min, 10min, 1hr)
- Codec breakdown
- Copy URL option

## Tips and Best Practices

### For Content Creators

1. **Verify ABR Ladder**
   - Check for large gaps
   - Ensure 4-6 variants for optimal experience
   - Include low bitrate option (<500 Kbps) for poor connections

2. **Check Codec Compatibility**
   - H.264 for maximum compatibility
   - Consider modern codecs (AV1, VP9) for efficiency
   - Verify all variants have codec information

3. **Validate Segments**
   - Check segment duration consistency
   - Verify all segments are accessible
   - Monitor for missing metadata

### For Debugging

1. **Use DevTools Panel**
   - Real-time detection
   - Monitor while browsing
   - Quick access to analysis

2. **Compare Manifests**
   - Save different versions
   - Check history for changes
   - Export for comparison

3. **Test Bandwidth Scenarios**
   - Use Timeline View
   - Try different profiles
   - Verify quality switching

### For Downloading Content

1. **Generate Download Script**
   - Navigate to Segments section
   - Click "Copy as cURL" for quick copy
   - Or use Download Manager for complete workflow

2. **FFmpeg Merging**
   - Enable "Include FFmpeg merge"
   - Run generated script
   - Output: single MP4 file

## Keyboard Shortcuts

**Viewer:**
- Enter - Load manifest (when URL input focused)

**URL Input:**
- Ctrl/Cmd + V - Paste (auto-trims whitespace)

## Troubleshooting

### Manifest Won't Load

**CORS Errors:**
- Extension fetches use browser permissions
- Some servers block programmatic access
- Solution: Click manifest URL to download, then load locally

**404 Errors:**
- Verify URL is correct
- Check authentication parameters haven't expired
- Try opening URL directly in browser

### No Manifests Detected

**Possible Causes:**
1. Page doesn't contain streaming content
2. Manifests loaded after page load (SPA)
   - Extension monitors DOM changes
   - Wait a few seconds for detection

3. Manifests use non-standard extensions
   - Use manual URL entry instead

### Performance Issues

**Large Manifests:**
- Segments section shows first 10 by default
- Click "Show All" to expand
- Use Export for full analysis offline

## Privacy & Permissions

**Required Permissions:**

- `declarativeNetRequest` - URL pattern matching
- `storage` - Save history and settings
- `tabs` - Open viewer in new tabs
- `contextMenus` - Right-click menu

**Data Handling:**
- All analysis happens locally
- No data sent to external servers
- History stored in browser only
- Can be cleared anytime

## Support

For issues, feature requests, or questions:
- GitHub Issues: [Repository Issues](https://github.com/krzemienski/hls-dash-dev-chrome-extension/issues)

## Version History

### v1.0.0 (Current)
- Initial release
- HLS and DASH support
- 72 passing tests
- Comprehensive analysis tools
