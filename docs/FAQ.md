# Frequently Asked Questions (FAQ)

Common questions about the HLS + DASH Manifest Viewer Chrome Extension.

## General Questions

### What is this extension?

A professional Chrome extension for analyzing, visualizing, and debugging HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming over HTTP) manifest files. It provides comprehensive analysis tools including:
- Automatic manifest detection
- 20+ analysis sections
- ABR ladder visualization
- Codec analysis
- Playback simulation
- Export capabilities
- DRM detection
- And much more

### Who is this for?

**Streaming Engineers:**
- Debug manifest issues
- Optimize bitrate ladders
- Verify codec configuration

**Content Creators:**
- Validate manifests before publishing
- Check quality levels
- Ensure device compatibility

**QA Engineers:**
- Test streaming setups
- Compare manifest versions
- Generate test reports

**Students/Learners:**
- Understand HLS/DASH protocols
- Learn about adaptive bitrate streaming
- See real-world examples

### Is it free?

Yes, completely free and open source (ISC License).

### Where can I get it?

**Current:** Load from source (development)
```bash
git clone https://github.com/krzemienski/hls-dash-dev-chrome-extension.git
cd hls-dash-dev-chrome-extension
npm install && npm run build
# Load dist/ in chrome://extensions
```

**Future:** Chrome Web Store (when published)

## Feature Questions

### What formats are supported?

**Fully Supported:**
- ✅ HLS (HTTP Live Streaming) - All versions (1-9+)
- ✅ DASH (MPEG-DASH) - All profiles

**Future:**
- ⏳ Smooth Streaming
- ⏳ HDS (if demand exists)

### Can it play videos?

No. This is an analysis tool, not a video player.

**What it does:**
- Analyzes manifest structure
- Visualizes bitrate ladder
- Simulates playback behavior

**What it doesn't do:**
- Play actual video
- Download video files
- Decrypt DRM content

**For playback:**
- Use VLC, FFmpeg, or online players
- This tool helps you understand the manifest first

### Does it work offline?

**Partially:**
- ✅ Can analyze previously loaded manifests (if in history)
- ✅ Can export data offline
- ❌ Cannot fetch new manifests (requires network)
- ❌ History requires Chrome storage (online for sync)

### Can I use it on mobile?

No. This is a Chrome desktop extension.

**Alternatives:**
- Use desktop Chrome
- Future: Web app version (standalone)
- Future: Mobile-friendly viewer

## Usage Questions

### How do I load a manifest?

**Method 1: Auto-Detection**
1. Navigate to page with streaming content
2. Click extension icon
3. See detected manifests
4. Click to analyze

**Method 2: Manual URL**
1. Click extension icon → "Open Full Viewer"
2. Paste manifest URL
3. Click "Load"

**Method 3: Right-Click**
1. Right-click .m3u8 or .mpd link
2. Select "Analyze with HLS+DASH Viewer"

### Why isn't my manifest detected?

**Common reasons:**

**1. Manifest loaded via XHR/Fetch (not in DOM)**
- Current version detects DOM-based URLs only
- Network interception coming in v1.1
- **Workaround:** Copy URL from Network tab, load manually

**2. Non-standard file extension**
- Detection based on .m3u8 and .mpd extensions
- Some servers use different extensions
- **Workaround:** Manual URL entry

**3. Dynamically loaded after page load**
- Extension monitors DOM changes
- May take a few seconds
- **Workaround:** Wait 5-10 seconds, refresh popup

**4. Content script not running**
- Check chrome://extensions → extension enabled
- **Workaround:** Reload extension and page

### Why does "Load" fail with "Network error"?

**Most common:** CORS (Cross-Origin Resource Sharing) restriction

**What this means:**
- Server blocks requests from extensions
- Browser security feature
- Some CDNs/servers reject programmatic access

**Solutions:**
1. Click manifest URL directly in browser → downloads file
2. Use browser DevTools → Network tab → Copy response
3. If you control server, add CORS header:
   ```
   Access-Control-Allow-Origin: *
   ```

**Other errors:**
- **404:** URL incorrect or manifest doesn't exist
- **401/403:** Authentication required
- **SSL:** Certificate invalid

### How do I export my analysis?

**Export Menu (top-right in viewer):**
1. Click "Export ▼"
2. Choose format:
   - **JSON** - Complete data, machine-readable
   - **CSV** - Spreadsheet format for Excel
   - **Text** - Human-readable report

**Quick Export:**
- Click ⚡ FAB button (bottom-right)
- Select "Quick Export JSON"

**Copy to Clipboard:**
- Use Quick Actions for URLs
- Or Export menu → format → manually copy

### What's the difference between view modes?

**Raw View:**
- Shows original manifest file
- Syntax highlighted
- Line numbers
- Useful for: Seeing exact content, copying manifest

**Structured View:**
- 20+ analysis sections
- Validation, stats, visualizations
- All features available
- Useful for: Complete analysis, finding issues

**Timeline View:**
- Playback simulation
- Interactive bandwidth controls
- Quality switching visualization
- Useful for: Testing ABR behavior, network scenarios

## Technical Questions

### What data does it collect?

**None.**

This extension:
- ❌ Does NOT collect any data
- ❌ Does NOT send data to external servers
- ❌ Does NOT track your activity
- ✅ Processes everything locally
- ✅ You can verify (open source)

**Local storage (optional):**
- Manifest history (50 items max, local only)
- Your settings (local only)
- You can clear anytime

### How does manifest detection work?

**Content script scans DOM for:**
```javascript
// 1. Links with manifest extensions
document.querySelectorAll('a[href$=".m3u8"], a[href$=".mpd"]')

// 2. Video sources
document.querySelectorAll('video[src$=".m3u8"], source[src$=".m3u8"]')

// 3. Monitors for changes
new MutationObserver(() => {
  scanForManifests();
})
```

**When found:**
- Stored in service worker memory
- Displayed in popup
- Shown in DevTools panel

### What permissions does it need?

**Required permissions:**

**storage:**
- Save your history (optional)
- Save your settings

**tabs:**
- Open viewer in new tab
- Get current tab for detection

**declarativeNetRequest:**
- Match manifest URL patterns
- Future: Intercept network requests

**contextMenus:**
- Right-click menu on manifest links

**host_permissions (*.m3u8, *.mpd):**
- Fetch manifests from any domain
- Required for core functionality

**Why these are safe:**
- Minimal permissions (only what's needed)
- No access to browsing history
- No access to other sites
- Open source (verify yourself)

### Is my data private?

**Yes.**

**What happens to manifest URLs:**
1. You provide URL
2. Extension fetches directly from source
3. Parses in your browser
4. Displays results to you
5. Optionally saves URL to history (local storage)
6. Never transmitted to us (we have no servers!)

**Privacy guarantees:**
- All processing local
- No external API calls
- No analytics or tracking
- No data collection
- Open source for verification

### Can I use this commercially?

Yes. ISC License allows commercial use.

**You can:**
- Use in commercial projects
- Use for paid work
- Distribute to team
- Modify for internal use

**You should:**
- Keep license notice
- Credit original project (appreciated)

### How do I report bugs?

**GitHub Issues:** https://github.com/krzemienski/hls-dash-dev-chrome-extension/issues

**Include:**
1. Chrome version
2. Extension version
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots if helpful
6. Manifest URL (if manifest-specific)

**For security issues:**
- Email directly (don't post publicly)
- Allow time for fix before disclosure

## Performance Questions

### Why is it slow to load large manifests?

**Large = 100+ variants or 1000+ segments**

**Reasons:**
1. Network fetch time (depends on server)
2. Parsing time (~100-500ms)
3. Rendering 1000+ DOM elements

**Solutions:**
- Use pagination (show first 10 segments by default)
- Use search/filter to reduce visible items
- Export for offline analysis

**Performance targets:**
- Typical manifest: <1s total
- Large manifest: <5s total
- Huge manifest: <10s total

### Why does my browser use a lot of memory?

**Normal:**
- Idle: 10-30 MB
- With manifest: 50-200 MB
- Large manifest: 200-400 MB

**If higher:**
- Check for multiple manifests in history
- Clear history in Settings tab
- Close other tabs
- Reload extension

**Memory is released when:**
- Close viewer tab
- Clear manifest
- Close browser

### How can I make it faster?

**Tips:**
1. Use search/filter to reduce visible variants
2. Don't load 1000+ segments at once (use Show All toggle)
3. Close DevTools panel when not needed (polls every 2s)
4. Export and analyze offline for very large manifests
5. Clear history periodically

## Troubleshooting Questions

### Extension won't load - what do I check?

**1. Check Chrome version:**
```
chrome://version
Need Chrome 88+ (Manifest V3 support)
Recommend Chrome 120+
```

**2. Check manifest.json:**
```bash
cat dist/manifest.json | jq .
# Should be valid JSON
# manifest_version should be 3
```

**3. Check all files present:**
```bash
ls dist/service-worker.js
ls dist/content-script.js
ls dist/manifest.json
# All should exist
```

**4. Check extension console:**
```
chrome://extensions → service worker
Look for error messages
```

**5. Rebuild:**
```bash
rm -rf dist/
npm run build
# Then reload
```

### Popup is blank - how do I fix?

**Debug:**
1. Right-click popup → Inspect
2. Check Console for errors
3. Check Network tab for failed requests

**Common causes:**
- JavaScript error in popup code
- Chrome API not available
- Asset failed to load (404)

**Solutions:**
- Check service worker console for errors
- Reload extension
- Clear cache: chrome://extensions → reload
- Rebuild: `npm run build`

### No manifests detected on page with streaming

**Check:**
1. Does page actually have .m3u8 or .mpd URLs?
   - View page source
   - Check Network tab
2. Are manifests in DOM or loaded via XHR?
   - DOM = detected ✅
   - XHR = not detected yet (v1.1 feature)
3. Is content script running?
   - Open console, should see: "Content script loaded on: [url]"

**Workarounds:**
- Copy URL from Network tab
- Use "Open Full Viewer"
- Paste URL manually

### Export doesn't work

**Check:**
1. Browser allows downloads?
   - Check chrome://settings/content/downloads
2. Popup blockers disabled?
3. Sufficient disk space?

**Try:**
- Use "Copy to Clipboard" instead
- Use Quick Actions FAB
- Try different export format

### Can't see DevTools panel

**Check:**
1. DevTools is open
2. Scroll through tabs (might be last)
3. Click >> to see hidden tabs
4. Panel named "Manifests"

**If missing:**
- Close and reopen DevTools
- Reload extension
- Check devtools.html path in manifest.json
- Check for errors in extension console

## Development Questions

### How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md)

**Quick start:**
1. Fork repository
2. Clone your fork
3. Create feature branch
4. Make changes + add tests
5. Update documentation
6. Submit pull request

**Good first issues:**
- Documentation improvements
- Adding test cases
- Fixing typos
- Improving error messages

### How do I run tests?

```bash
# All tests
npm test

# Specific test
npm test url-resolver

# Single run (no watch)
npm test -- --run

# With coverage
npm test -- --coverage

# UI mode
npm test -- --ui
```

### How do I add a new feature?

**Process:**
1. Write test first (TDD)
2. Run test (should fail)
3. Implement feature
4. Run test (should pass)
5. Update documentation
6. Submit PR

**Example:**
```bash
# 1. Create test
touch tests/utils/my-feature.test.ts

# 2. Write failing test
npm test my-feature  # Fails

# 3. Create implementation
touch src/lib/utils/my-feature.ts

# 4. Implement until test passes
npm test my-feature  # Passes

# 5. Commit
git add tests/utils/my-feature.test.ts src/lib/utils/my-feature.ts
git commit -m "feat: add my feature"
```

### How is this different from other manifest viewers?

**This Extension:**
- ✅ Most comprehensive analysis (20+ sections)
- ✅ Both HLS and DASH support
- ✅ Playback simulation
- ✅ DRM detection
- ✅ 124 tests
- ✅ 20,000+ lines of documentation
- ✅ Open source

**Others:**
- ⚠️ Basic parsing only
- ⚠️ HLS or DASH (not both)
- ❌ No simulation
- ❌ Limited analysis
- ❌ Minimal documentation

**Unique features:**
- Timeline simulation with bandwidth profiles
- DRM platform coverage analysis
- Frame rate categorization and smoothness scoring
- Resolution quality analysis with device recommendations
- Comprehensive protocol feature detection
- Download manager with FFmpeg integration
- Variant comparison (up to 4 side-by-side)

## Compatibility Questions

### Which browsers are supported?

**Supported:**
- ✅ Chrome 88+ (Manifest V3 requirement)
- ✅ Chrome 120+ recommended
- ✅ Edge 88+ (Chromium-based)
- ✅ Brave (Chromium-based)
- ✅ Opera (Chromium-based)

**Not Supported:**
- ❌ Firefox (different extension system)
- ❌ Safari (different extension system)
- ❌ Chrome on iOS (different browser engine)

### Does it work on Mac/Windows/Linux?

Yes, works on all platforms where Chrome is supported.

**Tested on:**
- ✅ macOS 12+
- ✅ Windows 10+
- ✅ Linux (Ubuntu 20.04+)

### Does it work with all HLS versions?

Yes, supports HLS versions 1 through 9+, including:
- ✅ HLS v3 (basic)
- ✅ HLS v4 (byte range)
- ✅ HLS v6 (independent segments)
- ✅ HLS v7+ (low latency features)

### Does it work with all DASH profiles?

Yes, supports all DASH profiles:
- ✅ isoff-live (live streaming)
- ✅ isoff-on-demand (VOD)
- ✅ isoff-main (main profile)
- ✅ Custom profiles

## Technical Questions

### How does parsing work?

**Uses industry-standard parsers:**
- **HLS:** m3u8-parser by Video.js team
- **DASH:** mpd-parser by Video.js team

**Process:**
```
1. Detect format (HLS vs DASH)
2. Route to appropriate parser
3. Extract variants, metadata, segments
4. Resolve relative URLs to absolute
5. Return structured ParsedManifest object
```

**Reliability:**
- Tested with real-world manifests
- Handles edge cases
- Error recovery
- 100% test coverage for parsers

### What's the technology stack?

**Frontend:**
- React 18 (UI framework)
- TypeScript 5.7 (type safety)
- Tailwind CSS v4 (styling)

**Build:**
- Vite 6 (build tool)
- Rollup (bundler)

**State:**
- Zustand (state management)

**Testing:**
- Vitest (unit tests)
- Playwright (browser tests)

**Parsing:**
- m3u8-parser (HLS)
- mpd-parser (DASH)

**Other:**
- Prism.js (syntax highlighting)

### How big is the extension?

**Bundle sizes:**
- Total: 439 KB (uncompressed)
- Gzipped: 139 KB
- Service worker: 2.85 KB
- Content script: 1.10 KB
- Popup: 8.26 KB
- Viewer: 245 KB
- Shared code: 143 KB

**Comparison:**
- Small for feature set
- Well-optimized
- Under 500 KB target

### Can I use the code in my project?

Yes, ISC License allows:
- ✅ Use in commercial projects
- ✅ Modify the code
- ✅ Distribute modified versions
- ✅ Private use

**Requirements:**
- Include original license
- Credit original authors (appreciated)

**Not required:**
- Sharing modifications (but encouraged)
- Contributing back (but welcomed)

## Advanced Questions

### Can I extend the extension?

**Current:** No plugin system

**Future (v2.0):** Plugin architecture planned

**Now:** Fork and modify
```bash
git clone https://github.com/your-fork/hls-dash-dev-chrome-extension.git
# Make changes
# Build your version
# Load locally
```

### How do I add support for new codec?

**Example: Adding Dolby Vision**

**1. Update codec analyzer:**
```typescript
// src/lib/utils/codec-analyzer.ts

export function parseCodec(codecString: string): CodecParsed {
  // ... existing code

  // Add Dolby Vision
  if (codecString.startsWith('dvhe') || codecString.startsWith('dvh1')) {
    return {
      codec: 'Dolby Vision',
      profile: extractDolbyProfile(codecString),
      level: extractDolbyLevel(codecString)
    };
  }

  // ...
}
```

**2. Add description:**
```typescript
const descriptions = {
  // ... existing
  'Dolby Vision': 'HDR format with dynamic metadata for enhanced picture quality',
};
```

**3. Add tests:**
```typescript
it('should parse Dolby Vision codec', () => {
  expect(parseCodec('dvhe.05.06')).toEqual({
    codec: 'Dolby Vision',
    profile: 'Profile 5',
    level: '06'
  });
});
```

**4. Test and submit PR**

### How do I add a new analysis section?

**Steps:**

**1. Create analysis utility:**
```typescript
// src/lib/utils/my-analysis.ts
export function analyzeMyFeature(manifest: ParsedManifest) {
  // Analysis logic
  return { metric1, metric2, insights };
}
```

**2. Add tests:**
```typescript
// tests/utils/my-analysis.test.ts
describe('analyzeMyFeature', () => {
  it('should analyze correctly', () => {
    const result = analyzeMyFeature(mockManifest);
    expect(result.metric1).toBeDefined();
  });
});
```

**3. Create component:**
```typescript
// src/components/viewer/MyAnalysisPanel.tsx
export function MyAnalysisPanel({ manifest }: Props) {
  const analysis = useMemo(() =>
    analyzeMyFeature(manifest),
    [manifest]
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2>My Analysis</h2>
      {/* Display results */}
    </div>
  );
}
```

**4. Add to StructuredView:**
```typescript
// src/components/viewer/StructuredView.tsx
import { MyAnalysisPanel } from './MyAnalysisPanel';

export function StructuredView({ manifest }: Props) {
  return (
    <div>
      {/* ... existing sections */}
      <MyAnalysisPanel manifest={manifest} />
    </div>
  );
}
```

**5. Update docs, submit PR**

### How do I debug the extension?

**Service Worker:**
```
chrome://extensions → service worker
Console shows background activity
```

**Popup:**
```
Right-click popup → Inspect
DevTools for popup context
```

**Viewer:**
```
F12 on viewer page
Regular DevTools
```

**Content Script:**
```
F12 on any page
Console shows content script logs
```

**Tips:**
- Use console.log liberally during development
- Use debugger; statements
- Use React DevTools
- Check Network tab for fetch issues

## Update Questions

### How do I update the extension?

**From Chrome Web Store (future):**
- Automatic updates every ~5 hours
- Or chrome://extensions → Update

**From Source:**
```bash
cd hls-dash-dev-chrome-extension
git pull
npm install
npm run build
# Reload extension in chrome://extensions
```

### Will updates break my saved data?

**No, with caveats:**

**Preserved:**
- ✅ History (unless storage format changes)
- ✅ Settings (unless new settings added)

**Migration:**
- Major version updates may require migration
- Will provide migration guide
- Can export history before update (future feature)

### How do I get notified of updates?

**Options:**
1. Watch GitHub repository (releases)
2. Subscribe to Chrome Web Store updates (automatic)
3. Follow project announcements (future)

## Feature Requests

### Can you add feature X?

**Maybe!**

**Process:**
1. Check if already planned (see [ROADMAP.md](ROADMAP.md))
2. Search existing issues
3. Create GitHub Discussion
4. Describe use case
5. Community votes
6. Maintainers evaluate
7. Added to roadmap if approved

**Higher priority if:**
- Many users request it
- Solves real problem
- Aligns with project vision
- You're willing to implement it

### When will network request interception be added?

**Planned for:** v1.1.0 (Q1 2025)

**What it will do:**
- Detect manifests loaded via XHR/Fetch
- Capture manifest content from network
- Increase detection rate significantly

**Why not in v1.0:**
- Core functionality complete first
- Requires declarativeNetRequest API
- More complex implementation
- Prioritized getting v1.0 solid

### Will you add support for format X?

**Depends on demand.**

**Potentially:**
- Smooth Streaming (if users need it)
- HDS (deprecated but some still use)
- CMAF (emerging standard)

**Process:**
- Create issue with use case
- Show demand (👍 reactions)
- Discuss implementation
- May be added to roadmap

## Comparison Questions

### vs Online Manifest Viewers?

**This Extension:**
- ✅ Works offline (after loading)
- ✅ Privacy (no server uploads)
- ✅ Integrated with browser
- ✅ Auto-detection
- ✅ More features

**Online Viewers:**
- ❌ Requires internet
- ❌ Upload manifest to server
- ❌ Limited features
- ✅ No installation needed

**Use this if:** Privacy matters, comprehensive analysis needed

**Use online if:** Quick check, can't install extensions

### vs Command-Line Tools?

**This Extension:**
- ✅ Visual interface
- ✅ No terminal needed
- ✅ Interactive analysis
- ✅ Real-time updates

**Command-Line Tools (FFmpeg, etc.):**
- ✅ Scriptable
- ✅ Batch processing
- ✅ CI/CD integration
- ❌ Less visual

**Use both:** Extension for analysis, CLI for automation

### vs Video Players?

**This Extension:**
- ✅ Analyzes manifests
- ❌ Doesn't play video

**Video Players:**
- ✅ Play video
- ⚠️ Basic manifest info only

**Use together:**
- Analyze manifest with extension
- Verify playback with player

## Misc Questions

### Is there a mobile version?

Not currently.

**Challenges:**
- Chrome extensions don't work on mobile
- Different API on mobile browsers

**Alternatives:**
- Use desktop Chrome
- Future: Web app version (works on mobile browsers)

### Can I customize the UI?

**Limited customization:**
- ✅ Choose theme (light/dark/auto)
- ✅ Choose default view
- ⏳ More themes (future)

**Full customization:**
- Fork project
- Modify components
- Build your version

### How do I clear my history?

**In extension:**
1. Click extension icon
2. Go to History tab
3. Click "Clear All"
4. Confirm

**Or:**
```javascript
// In browser console (popup or viewer)
import { clearHistory } from './lib/utils/storage';
await clearHistory();
```

**Or:**
```
chrome://settings/content/all
→ Find extension
→ Clear data
```

### What happens when I uninstall?

**Removed:**
- Extension code
- History
- Settings
- All data

**Preserved:**
- Nothing (complete removal)

**Re-installing:**
- Starts fresh
- No data carried over
- Can export history first (future feature)

### Can I use this to download videos?

**No.**

This tool analyzes manifests, not downloads video.

**For downloading:**
1. Use Download Manager to generate script
2. Script downloads segments
3. Optionally merges with FFmpeg
4. **Note:** Respect copyright and terms of service

**This tool provides:**
- Scripts for downloading
- Not the actual downloading

### Does this work with DRM-protected content?

**Partially.**

**What it does:**
- ✅ Detect DRM systems (Widevine, PlayReady, FairPlay)
- ✅ Show encryption info
- ✅ Analyze platform coverage
- ✅ Display key formats

**What it doesn't do:**
- ❌ Decrypt content
- ❌ Bypass DRM
- ❌ Obtain licenses
- ❌ Play encrypted content

**Use case:** Understanding DRM configuration, not bypassing it

## Getting Help

### Where can I get help?

**Documentation:**
1. [README.md](../README.md) - Start here
2. [USER_GUIDE.md](USER_GUIDE.md) - How to use
3. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Fix problems
4. This FAQ - Common questions

**Community:**
- GitHub Issues (bugs)
- GitHub Discussions (questions)
- Check existing issues first

**Don't:**
- Email maintainers directly (use public channels)
- Ask in unrelated issues
- Expect immediate responses

### How quickly are issues addressed?

**Target response time:**
- Critical bugs: 24-48 hours
- Regular bugs: 1 week
- Feature requests: 2-4 weeks
- Questions: 48 hours

**Actual time depends on:**
- Issue complexity
- Maintainer availability
- Community contributions

### Can I hire someone to help with this?

**For custom work:**
- Contact maintainers via GitHub
- Or hire independent developer
- Code is open source

**For support:**
- Check documentation first
- Community support via GitHub
- Commercial support not currently available

## Future Questions

### What's coming in v1.1?

See [ROADMAP.md](ROADMAP.md)

**Planned:**
- Network request interception (XHR detection)
- Real-time manifest updates for LIVE streams
- Dark mode CSS
- Keyboard shortcuts
- Performance improvements
- Virtual scrolling

**Timeline:** Q1 2025

### How can I influence the roadmap?

**Ways to help:**
1. Create feature request in Discussions
2. Vote on existing requests (👍 reaction)
3. Explain your use case
4. Offer to implement it
5. Sponsor development (future)

**Most requested features get priority.**

### Will there be a paid version?

**Current plan:** Free and open source

**Future possibilities:**
- Free version: Current features
- Pro version: AI analysis, team features, cloud sync
- Enterprise: Custom deployment, SLA support

**Decision:** Based on community feedback and adoption

### How long will this be maintained?

**Commitment:**
- v1.x maintained for 2+ years minimum
- Security updates indefinitely
- Bug fixes as reported
- Community can maintain if needed (open source)

**Long-term:**
- Active development planned through 2025+
- Building community to share maintenance
- Open source ensures longevity

---

**Still have questions?**
- Check [full documentation](README.md)
- Search [GitHub issues](https://github.com/krzemienski/hls-dash-dev-chrome-extension/issues)
- Ask in [GitHub Discussions](https://github.com/krzemienski/hls-dash-dev-chrome-extension/discussions)

**Found an error in this FAQ?**
- Submit issue or PR to fix it
- Help improve documentation

This FAQ is maintained by the community. Contributions welcome!
