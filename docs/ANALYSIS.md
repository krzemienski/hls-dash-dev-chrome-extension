# Reference Codebase Analysis

**Analysis Date**: 2025-12-02
**Analyst**: Claude (Sequential Deep Analysis)
**Reference Repos**:
- `/Users/nick/Desktop/abr-manifest-viewer-chrome` (Chrome Extension MV2)
- `/Users/nick/Desktop/hls-manifest-viewer` (Electron Desktop App)

---

## Executive Summary

This document provides a comprehensive line-by-line analysis of both reference codebases, identifying reusable patterns, technical debt to avoid, and architectural insights for building the unified HLS + DASH Chrome Extension.

**Key Findings:**
1. **abr-manifest-viewer-chrome** provides solid Chrome extension architecture but requires MV2→MV3 migration
2. **hls-manifest-viewer** demonstrates parsing logic patterns but is Electron-based (different platform)
3. Both use manual parsing; modern libraries (@videojs/m3u8-parser, @videojs/mpd-parser) will eliminate this complexity
4. URI resolution logic is highly reusable
5. Format auto-detection pattern is simple and effective

---

## abr-manifest-viewer-chrome Analysis

### Project Structure
```
abr-manifest-viewer-chrome/
├── background.js (128 lines)
├── manifest.json (14 lines)
├── README.md (3 lines)
├── LICENSE (MIT)
├── images/
│   └── hls.png (icon)
└── viewer/
    ├── index.html (22 lines)
    ├── css/
    │   ├── main.css (35 lines)
    │   └── prism.hls.css (175 lines)
    └── js/
        ├── main.js (186 lines)
        └── vendor/
            ├── jquery-3.5.1.min.js
            └── prism.js
```

**Total Source Lines**: ~560 (excluding vendor libraries)
**Language**: JavaScript (ES5/ES6 mix)
**Build**: None (plain HTML/CSS/JS)
**Last Update**: ~5-6 years ago (jQuery 3.5.1 from 2020)

### manifest.json Analysis

**Lines 1-14: Complete Manifest**
```json
{
  "background": {
     "scripts": [ "background.js" ]
  },
  "description": "View HLS (m3u8) or MPEG-DASH (mpd) manifest files with syntax highlighting in your Chrome browser.",
  "icons": {
     "128": "images/hls.png"
  },
  "manifest_version": 2,
  "name": "HLS + MPEG-DASH Manifest File Viewer",
  "permissions": [ "tabs", "webRequest", "webRequestBlocking",  "*://*/*.m3u8*", "*://*/*.mpd*"],
  "version": "1.0.0"
}
```

**Findings:**
- ✅ **Supports both HLS and DASH** (description, URL patterns)
- ❌ **Manifest V2** (deprecated, must migrate)
- ❌ **webRequestBlocking** (removed in MV3, must use declarativeNetRequest)
- ✅ **Broad URL patterns** (`*://*/*.m3u8*`, `*://*/*.mpd*`)
- ⚠️ **Single icon size** (should have 16, 48, 128 for MV3)

**Reuse Strategy:**
- Adapt URL patterns to host_permissions in MV3
- Add multiple icon sizes
- Convert to service_worker from background.scripts

### background.js Analysis

**Lines 1-8: Request Filtering Configuration**
```javascript
window.ignoreUrls = {};

var CHROME_FILTER_SETTINGS = {
  urls: ["*://*/*.m3u8*", "*://*/*.mpd*"],
  types: ["main_frame"]
};
```

**Findings:**
- Uses global `window.ignoreUrls` for skip list (not persistent)
- Filters only `main_frame` requests (prevents intercepting video player internal requests)
- Smart decision to avoid breaking video players

**Reuse Strategy:**
- Persist ignore list to chrome.storage.local
- Apply main_frame filter to declarativeNetRequest rules

**Lines 12-15: Safelist for Problematic Sites**
```javascript
var urlsWeBreak = [
    'demo.theoplayer.com/test-your-stream-with-statistics',
    'video-dev.github.io/hls.js/demo'
  ];
```

**Findings:**
- Hardcoded safelist for demo players
- Good UX: Don't break testing sites

**Reuse Strategy:**
- Make safelist user-configurable in settings
- Add more known demo sites (DASH-IF reference player, Shaka demo, etc.)

**Lines 23-62: Request Interception Logic**
```javascript
var filterForHLSRequests = function(requestInfo) {
  var url = requestInfo.url,
      viewerBaseUrl = chrome.extension.getURL('/viewer/index.html');

  if (url.indexOf('.m3u8') != -1 ||
      url.indexOf('.mpd') != -1) {

    // Check safelist
    for (var i = urlsWeBreak.length - 1; i >= 0; i--) {
      if(url.indexOf(urlsWeBreak[i]) != -1) {
        return;
      }
    }

    // Ignore viewer's own requests
    if (url.indexOf(viewerBaseUrl) != -1) {
      return;
    }

    // Check user ignore list
    if (window.ignoreUrls[url]) {
      clearIgnoreUrl(url);
      return;
    }

    // Redirect to viewer
    chrome.tabs.update(requestInfo.tabId, {
      url: viewerBaseUrl + "?manifest=" + encodeURIComponent(url)
    });

    return {cancel: true} // Block manifest download
  }
};
```

**Findings:**
- ✅ String matching for .m3u8 and .mpd (simple, effective)
- ✅ Multiple safeguards (safelist, self-reference, ignore list)
- ✅ Uses encodeURIComponent for URL safety
- ❌ String indexOf (not robust for edge cases like "example.m3u8.backup")

**Reuse Strategy:**
- Improve URL matching with proper regex or URL parsing
- Keep multi-layer safeguard concept
- Adapt to declarativeNetRequest redirect action

**Lines 64-68: webRequest Listener Registration**
```javascript
chrome.webRequest.onBeforeRequest.addListener(
  filterForHLSRequests,
  CHROME_FILTER_SETTINGS,
  ["blocking"]
);
```

**MV3 Migration Required:**
```json
// NEW: public/rules.json
[
  {
    "id": 1,
    "action": { "type": "redirect", "redirect": { ... } },
    "condition": { "regexFilter": "^https?://.*\\.m3u8", "resourceTypes": ["main_frame"] }
  }
]
```

**Lines 71-81: Message Handler**
```javascript
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == 'get-manifest-for-tab') {
      getManifestForTab(request.manifestUrl, sender.tab.id);
    } else if (request.action == 'ignore-next-request-from') {
      ignoreNextRequestFrom(request.url);
    }
  }
);
```

**Findings:**
- Simple action-based message protocol
- Synchronous (no sendResponse callback used)

**Reuse Strategy:**
- Adopt action-based message pattern
- Add TypeScript interfaces for message types
- Make async with proper response handling

**Lines 92-111: AJAX Manifest Fetching**
```javascript
var ajaxMe = function(url, callback, roundTrip = false) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    let responseText = xhr.responseText;

    if (xhr.readyState == 4) {
      if (xhr.status == 404) {
        responseText = "Unable to load... 404 not found error...";
      } else if (xhr.status == 0 && xhr.statusText == "") {
        responseText = "Unable to load... invalid SSL certificate...";
      }

      callback(responseText, roundTrip);
    }
  }
  xhr.send();
};
```

**Findings:**
- ✅ Good error handling for 404 and SSL errors
- ❌ XMLHttpRequest (not available in service workers)
- ✅ Helpful user messages for errors

**MV3 Migration:**
```typescript
async function fetchManifest(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Manifest not found (404). Check URL.");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error("Network error. Possible CORS or SSL issue.");
    }
    throw error;
  }
}
```

### viewer/js/main.js Analysis

**Lines 1-18: Page Initialization**
```javascript
$(function() {
  displayManifestUrl();
  requestManifestFromBackground();

  $('#manifest-url').on('click', function(e) {
    e.preventDefault();
    var url = getManifestUrl();
    chrome.runtime.sendMessage({
      action:'ignore-next-request-from',
      url: url
    });
    window.location.href = url;
  });
});
```

**Findings:**
- jQuery document ready pattern
- Loads manifest URL from query param and displays it
- Clicking manifest URL adds to ignore list then navigates (allows user to download original)
- Smart UX: Prevents infinite redirect loop

**Reuse Strategy:**
- Convert to React useEffect
- Keep ignore-then-navigate pattern for "Download Original" feature

**Lines 29-44: URL Utilities**
```javascript
$.urlParam = function(name){
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return results ? results[1] || 0 : 0;
};

function getManifestUrl() {
  return decodeURIComponent($.urlParam('manifest'));
}

function displayManifestUrl(){
  var manifestUrl = getManifestUrl();
  $('#manifest-url').attr('href', manifestUrl).text(manifestUrl);
}
```

**Findings:**
- Query parameter parsing with regex
- Properly decodes URI component

**Modern Replacement:**
```typescript
const searchParams = new URLSearchParams(window.location.search);
const manifestUrl = searchParams.get('url') || '';
const decodedUrl = decodeURIComponent(manifestUrl);
```

**Lines 54-75: Manifest Processing**
```javascript
function processManifest(manifest) {
  window.manifest = manifest;

  var manifestParser = new ManifestParser(manifest),
      uriMap = manifestParser.createUriMap();

  // Format detection
  var formatType = 'm3u8';
  if(manifest.startsWith('<')){
    formatType = 'xml';
  }

  $('pre').addClass('language-' + formatType).find('code').text(manifestParser.manifest);
  Prism.highlightAll();
  manifestParser.overrideLinks(uriMap);

  $('.loader').hide();
}
```

**Findings:**
- ✅ **Brilliant format detection**: `startsWith('<')` for XML/DASH
- ✅ **Two-pass rendering**: Apply text → highlight → override links
- ✅ **Maintains original manifest** while creating clickable version

**Reuse Strategy:**
- Keep format detection logic
- Adapt two-pass rendering to React (raw text → Prism → link injection)
- Store manifest in component state instead of window global

**Lines 77-186: ManifestParser Class**

This is the most valuable code in the reference repo.

**Lines 80-86: URL Helper Methods**
```javascript
function getManifestUrlWithPath() {
  return this.getManifestUrl().match(/^([a-z]+:\/\/[^?]+\/)/i)[0];
}

function getManifestUrlWithoutPath() {
  return this.getManifestUrl().match(/^([a-z]+:\/\/[^/]+)/i)[0];
}
```

**Findings:**
- Extracts base URL with path: `https://example.com/path/to/`
- Extracts base URL without path: `https://example.com`
- Used for relative URL resolution

**Lines 88-91: Relative URL Detection**
```javascript
function isRelative(url) {
  return !/^(?:[a-z]+:)?\/\//i.test(url);
}
```

**Findings:**
- ✅ **Excellent regex**: Detects protocol-relative (`//example.com`) and absolute (`https://`) URLs
- Returns true for relative paths like `playlist.m3u8` or `/path/playlist.m3u8`

**Reuse Strategy**: Copy this exact logic - it's correct and battle-tested

**Lines 93-108: URI Resolution Logic**
```javascript
function getEvaluatedUri(uriReference){
  var evaluatedUri = uriReference;
  if (isRelative(uriReference)) {
    if(uriReference.startsWith('/')){
      // Domain-relative: /path/file.m3u8 → https://example.com/path/file.m3u8
      evaluatedUri = getManifestUrlWithoutPath() + uriReference;
    } else {
      // Path-relative: file.m3u8 → https://example.com/path/to/file.m3u8
      evaluatedUri = getManifestUrlWithPath() + uriReference;
    }
  }
  return evaluatedUri;
}
```

**Findings:**
- ✅ **Critical logic**: Handles both path-relative and domain-relative URLs
- ✅ **Spec-compliant**: Matches HLS/DASH relative URL resolution behavior
- ✅ **Well-tested**: This is the core of making nested playlists work

**Reuse Strategy**:
- Port to TypeScript with URL API for safer parsing
- Add unit tests for edge cases (query params, fragments, special chars)

**Lines 110-122: URI Extraction Regex**
```javascript
function getUrisFromLine(line){
  var uriMatch = /(?:<[^\/]+URL)>([^<]*)<|(?:URI|src)="([^"]*)"|(^[^"#<]+$)|([a-z]+:\/\/[^"#<]+)/gmi.exec(line),
      uriArray = [],
      uriMatchLength = uriMatch ? uriMatch.length : 0;
  if(uriMatchLength > 1){
    for(var i = 1; i < uriMatch.length; i++){
      if(uriMatch[i]){
        uriArray.push(uriMatch[i].trim());
      }
    }
  }
  return uriArray;
}
```

**Findings:**
- Regex handles multiple patterns:
  - DASH: `<BaseURL>http://example.com</BaseURL>`
  - HLS: `URI="playlist.m3u8"`
  - Plain URLs: Lines with just a URL
  - Absolute URLs: `https://` or `http://`
- Returns array (handles multiple URLs per line)

**Reuse Strategy:**
- May not be needed if using parser libraries (they extract URLs)
- Keep as fallback or for custom link detection
- Useful for "Find all URLs" feature

**Lines 128-158: URI Map Creation**
```javascript
this.createUriMap = function(){
  var lines = manifest.split("\n"),
      uriMap = {};

  for(i in lines) {
    var l = lines[i],
        capturedUris = getUrisFromLine(l);
    for(var j = 0; j < capturedUrisLength; j++){
      var capturedUri = capturedUris[j],
          evaluatedUri = getEvaluatedUri(capturedUri),
          token = `replace-${random()}`;

      // Replace URI in line with token
      lines[i] = l.replace(capturedUri, `###${token}###${capturedUri}###end-${token}###`);

      uriMap[capturedUri] = {
        replaceWith: `<a href="${evaluatedUri}">${capturedUri}</a>`,
        token: token
      };
    }
  }

  this.manifest = lines.join("\n");
  return uriMap;
};
```

**Findings:**
- ✅ **Token replacement system**: Prevents double-replacement issues
- ✅ **Preserves original URI text** while linking to resolved URL
- ✅ **Handles duplicates**: Reuses token for same URI

**Technical Debt:**
- Uses global loop variable `i` (not `var i`, can cause bugs)
- Modifies `this.manifest` as side effect

**Reuse Strategy:**
- Simplify: After Prism highlighting, use DOM manipulation to wrap URLs in <a> tags
- Or: Use React components to render clickable URLs directly

**Lines 175-183: Link Override (Post-Highlighting)**
```javascript
this.overrideLinks = function(uriMap) {
  var lines = $('pre code').html();
  for(var capturedUri in uriMap){
    let obj = uriMap[capturedUri];
    let token = obj.token;
    lines = lines.replace(new RegExp(`###${token}###[^#]*###end-${token}###`, 'g'), obj.replaceWith);
  }
  $('pre code').html(lines);
};
```

**Findings:**
- ✅ **Two-pass rendering**:
  1. Replace URIs with tokens → Prism highlight → Replace tokens with links
  2. Prevents Prism from breaking HTML anchor tags
- ✅ **Regex replacement**: Safe for HTML content

**Reuse Strategy:**
- Adapt to React: Use dangerouslySetInnerHTML after Prism + link injection
- Or: Use Prism's hooks API for custom token handling

### viewer/index.html Analysis

**Lines 1-22: Simple HTML Structure**
```html
<!doctype html>
<html>
    <head>
        <title>Adaptive Bitrate Manifest Viewer</title>
        <link rel="stylesheet" href="/viewer/css/prism.hls.css">
        <link rel="stylesheet" href="/viewer/css/main.css">
    </head>
    <body>
        <a id="manifest-url"></a>
        <div class="loader"></div>
        <pre><code></code></pre>

        <script src="/viewer/js/vendor/jquery-3.5.1.min.js"></script>
        <script src="/viewer/js/vendor/prism.js"></script>
        <script src="/viewer/js/main.js"></script>
    </body>
</html>
```

**Findings:**
- Minimal structure: URL link + loader + code display
- All content dynamically populated via JavaScript
- No framework, just vanilla JS + jQuery

**Reuse Strategy:**
- Convert to React app with Vite build
- Keep simple structure concept (URL, content, metadata)
- Add tabs for multiple views

### viewer/css/prism.hls.css Analysis

**Lines 144-168: Custom HLS Token Styling**
```css
.token.bandwidth {
	color: green;
}
.token.resolution {
	color: green;
}
.token.framerate {
	color: #1E0DAD;
}
.token.subtitles {
	color: #1E0DAD;
}
.token.tags, .token.byterange, .token.extinf {
	color: #950084;
}
.token.version {
	color: green;
}
.token.media {
	color: #680000;
}
```

**Findings:**
- ✅ **Custom token classes**: Bandwidth/resolution green, framerate/subtitles blue, tags purple
- ✅ **Good contrast**: Colors are distinct and readable
- ✅ **Semantic naming**: Token names match HLS tag purposes

**Reuse Strategy:**
- Extend Prism with custom language definition for M3U8
- Add DASH/MPD token definitions (Period, AdaptationSet, Representation)
- Consider using Prism's existing XML highlighting for DASH

### Key Takeaways from abr-manifest-viewer-chrome

**✅ Excellent Patterns to Reuse:**
1. URI resolution logic (isRelative, getEvaluatedUri)
2. Format auto-detection (startsWith('<'))
3. Safelist + ignore list architecture
4. Two-pass rendering (highlight → link injection)
5. main_frame filtering
6. Error message user-friendliness

**❌ Technical Debt to Avoid:**
1. Global variables (window.ignoreUrls)
2. jQuery dependency (use React)
3. String indexOf for URL matching (use proper regex)
4. No TypeScript (add strict typing)
5. No build process (add Vite)
6. Manual parsing (use libraries)

**🔄 Must Migrate:**
1. Manifest V2 → V3
2. webRequest blocking → declarativeNetRequest
3. XMLHttpRequest → fetch API
4. Background scripts → Service worker

**📊 Complexity Assessment:**
- **Simple**: 8 source files, focused feature set
- **Well-designed**: Good separation (background vs viewer)
- **Maintainable**: Clear code structure despite age
- **Extendable**: Easy to add features (just needs modernization)

---

## hls-manifest-viewer Analysis

### Project Structure
```
hls-manifest-viewer/
├── app/
│   ├── index.html (23 lines)
│   ├── index.js (115 lines)
│   └── main.js (95 lines)
├── package.json (74 lines)
├── package-lock.json
└── README.md (9 lines)
```

**Total Source Lines**: ~316
**Platform**: Electron v9 (desktop app, NOT browser extension)
**Language**: JavaScript (ES6)
**Build**: electron-builder
**Last Update**: ~4-5 years ago (Electron 9 from 2020)

### package.json Analysis

**Lines 1-11: Project Configuration**
```json
{
  "name": "hls-manifest-viewer",
  "version": "1.0.0",
  "description": "Viewer for HLS manifest",
  "main": "app/main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron .",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  }
}
```

**Findings:**
- Electron main entry point (not applicable to Chrome extension)
- No tests (reflects "old project" nature)

**Lines 69-73: Dependencies**
```json
"dependencies": {
  "axios": "^0.19.2",
  "url-parse": "^1.4.7"
}
```

**Findings:**
- **axios**: HTTP client (v0.19.2 from 2020, outdated)
- **url-parse**: URL parsing library
- Both are Node.js libraries (not browser-compatible without bundling)

**Adaptation for Chrome Extension:**
- Replace axios with fetch API (native to browsers and service workers)
- Replace url-parse with native URL API (supported in all modern browsers)

### app/index.html Analysis

**Lines 1-23: Electron App UI**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hls Manifest Viewer</title>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
  </head>
  <body style="background-color:gainsboro;">
    <label for="txtManifest">Enter Manifest URL:</label>
    <input type="text" style="width: 70%;" id="txtManifest"/>
    <button id="btnGo" value="GO"> GO </button>
    <div id="loading" style="display: none;">
      <img src="../resources/loading.gif" alt="Loading image">
      <h3 style="text-align: center;">Loading...</h3>
    </div>
    <div id="playlist"></div>
    <script src="index.js"></script>
  </body>
</html>
```

**Findings:**
- Manual URL input (no auto-detection)
- Loading state with GIF image
- Simple form-based UI
- Inline styles (no CSS file)

**Reuse Concepts:**
- Manual input feature (for popup)
- Loading state pattern
- Clear separation of input vs display areas

### app/index.js Analysis

**Lines 10-16: Manifest URL Validation**
```javascript
function validManifest(url){
    if(path.basename(url.pathname).endsWith('m3u8') || path.basename(url.pathname).endsWith('m3u')){
        return true;
    } else {
        return false;
    }
}
```

**Findings:**
- Checks file extension (.m3u8 or .m3u)
- Uses Node.js `path` module (not available in browser)
- Doesn't validate DASH (.mpd)

**Browser-Compatible Replacement:**
```typescript
function isValidManifestUrl(urlString: string): { valid: boolean; format: 'hls' | 'dash' | null } {
  try {
    const url = new URL(urlString);
    const pathname = url.pathname.toLowerCase();

    if (pathname.endsWith('.m3u8') || pathname.endsWith('.m3u')) {
      return { valid: true, format: 'hls' };
    }
    if (pathname.endsWith('.mpd')) {
      return { valid: true, format: 'dash' };
    }
    return { valid: false, format: null };
  } catch {
    return { valid: false, format: null };
  }
}
```

**Lines 18-32: User Input Handling**
```javascript
goBtn.addEventListener('click', function(e){
    var manifestURL = document.getElementById('txtManifest').value;
    var url = new urlParse(manifestURL);
    if(validManifest(url)){
        baseURL = url.origin + path.dirname(url.pathname) +"/";
        instance = axios.create({"baseURL": baseURL});
        requestServer(path.basename(url.pathname))
    } else {
        playlistDiv.style.display = "none"
        dialog.showErrorBox("Invalid Manifest", "Entered URL is not a valid HLS URL");
    }
})
```

**Findings:**
- ✅ Validates URL before fetching
- ✅ Calculates base URL for relative path resolution
- ✅ Shows error dialog for invalid URLs
- ❌ Electron dialog API (not available in Chrome extension)
- ❌ Node.js path module

**Adaptation:**
- Use native URL API: `new URL(manifestURL)`
- Error display in popup UI (not native dialog)
- Base URL extraction with URL API methods

**Lines 48-62: Axios Fetching**
```javascript
function requestServer(path){
    showLoading()
    instance.get(path)
    .then(function(response){
        console.log(response.data)
        processResponse(response.data)
    })
    .catch(function(error){
        console.log(error)
        processError(error)
    })
    .then(function(){
        showResonse()
    })
}
```

**Findings:**
- Promise-based async handling
- axios instance with baseURL (simplifies relative paths)
- Always shows response after loading (even on error)

**Fetch API Replacement:**
```typescript
async function fetchManifest(path: string): Promise<string> {
  setLoading(true);
  try {
    const url = new URL(path, baseURL);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    processManifest(text);
  } catch (error) {
    processError(error);
  } finally {
    setLoading(false);
  }
}
```

**Lines 71-94: Response Processing**
```javascript
function processResponse(response){
    responseLines = response.split('\n');
    htmlText = "";
    responseLines.forEach(line => {
        if(line.startsWith("#")){
            if(line.startsWith("#EXT-X-I-FRAME-STREAM-INF:")){
                htmlText = htmlText + "<p>" + processIframeStream(line) + "</p>";
            } else{
                htmlText = htmlText + "<p>" + line + "</p>";
            }
        } else {
            if(line.indexOf("m3u8") != -1){
                htmlText = htmlText + createButtonTag(line);
            } else {
                htmlText = htmlText + "<p>" + line + "</p>";
            }
        }
        playlist = document.getElementById("playlist");
        playlist.innerHTML = htmlText;
   });
}
```

**Findings:**
- ✅ **Line-by-line parsing**: Simple approach
- ✅ **Special handling for I-FRAME-STREAM-INF**: Recognizes importance
- ✅ **Interactive buttons for nested playlists**: Great UX
- ❌ **Inefficient**: Updates innerHTML on every line (performance issue)
- ❌ **No syntax highlighting**: Plain text output
- ❌ **Limited tag recognition**: Only handles comments vs URIs

**Reuse Concepts:**
- Button-based playlist navigation (adapt for React)
- Special treatment for I-FRAME-STREAM-INF
- Line-by-line rendering approach (with React optimization)

**Lines 96-109: I-FRAME Parsing**
```javascript
function processIframeStream(line) {
    uriIndex = line.indexOf("URI=");
    var iFrameHTML = line.substr(0, uriIndex + 5);
    lastQuoteIndex = line.indexOf("\"", uriIndex + 6);
    iframeURI = line.substring(uriIndex + 5, lastQuoteIndex);
    restOfLine = line.substring(lastQuoteIndex);
    iFrameHTML = iFrameHTML + createButtonTag(iframeURI);
    return iFrameHTML;
}
```

**Findings:**
- Manual string manipulation to extract URI from #EXT-X-I-FRAME-STREAM-INF tag
- Creates clickable button for iframe playlist

**Modern Replacement:**
- Parser libraries handle this (m3u8-parser extracts I-frame stream info)
- Still useful concept: Display I-frame playlists distinctly

### app/main.js Analysis

**Lines 1-95: Electron App Setup**
- Not applicable to Chrome extension
- Electron-specific APIs: BrowserWindow, Menu, app
- No reusable code for browser extension

**Key Insight**: This file is entirely Electron-specific and provides no patterns for Chrome extension

### Key Takeaways from hls-manifest-viewer

**✅ Useful Concepts (not direct code reuse):**
1. Manual URL input pattern
2. Loading state management
3. Button-based playlist navigation (interactive exploration)
4. Special handling for I-FRAME-STREAM-INF
5. Error dialog patterns

**❌ Not Reusable (platform-specific):**
1. All Electron APIs
2. axios library (use fetch)
3. url-parse library (use URL API)
4. Node.js path module (use URL pathname)
5. Electron dialog (use extension UI)

**⚠️ Limitations to Address:**
1. HLS-only (no DASH support)
2. No syntax highlighting
3. Manual parsing (inefficient, incomplete)
4. No variant visualization
5. No ABR information displayed

**📊 Value for Reference:**
- **Low for direct code reuse** (different platform)
- **Medium for UI/UX concepts** (navigation pattern)
- **Low for parsing logic** (too basic, missing features)
- **High for understanding requirements** (what users need from manifest viewer)

---

## Comparative Analysis

| Feature | abr-manifest-viewer | hls-manifest-viewer | New Extension |
|---------|-------------------|-------------------|--------------|
| **Platform** | Chrome Extension | Electron Desktop | Chrome Extension |
| **Manifest Version** | V2 | N/A | V3 |
| **HLS Support** | ✅ | ✅ | ✅ |
| **DASH Support** | ✅ | ❌ | ✅ |
| **Auto-Detection** | ✅ webRequest | ❌ | ✅ declarativeNetRequest |
| **Manual Input** | ❌ | ✅ | ✅ (in popup) |
| **Syntax Highlighting** | ✅ Prism.js | ❌ | ✅ Prism.js + custom |
| **Clickable URLs** | ✅ | ✅ (buttons) | ✅ |
| **ABR Visualization** | ❌ | ❌ | ✅ (table + chart) |
| **Variant Comparison** | ❌ | ❌ | ✅ |
| **DevTools Panel** | ❌ | N/A | ✅ |
| **Playback Simulation** | ❌ | ❌ | ✅ |
| **Export** | ❌ | ❌ | ✅ (JSON/CSV) |
| **Modern Libraries** | ❌ | ❌ | ✅ |
| **TypeScript** | ❌ | ❌ | ✅ |
| **Build Process** | ❌ | ✅ (electron-builder) | ✅ (Vite) |

### Architectural Comparison

**abr-manifest-viewer-chrome:**
```
Browser → webRequest intercept → redirect → Viewer Page
                                              ↓
                                    Viewer requests manifest
                                              ↓
                                    Background fetches via XHR
                                              ↓
                                    Returns to Viewer
                                              ↓
                                    Manual parse + highlight + link
```

**hls-manifest-viewer:**
```
User Input → Electron App
              ↓
        Axios Fetch
              ↓
        Line-by-line Parse
              ↓
        DOM Render (buttons for playlists)
```

**New Extension:**
```
Multiple Detection Methods:
  1. declarativeNetRequest → Viewer
  2. Content Script → Popup → Viewer
  3. DevTools Network → DevTools Panel
  4. Manual Input → Popup → Viewer
              ↓
    Service Worker fetch()
              ↓
    Library-based parsing (@videojs)
              ↓
    React Component Rendering
              ↓
    Multiple Views (Raw, Structured, Timeline, Simulation)
```

### Code Quality Comparison

**abr-manifest-viewer-chrome:**
- **Strengths**: Simple, focused, effective
- **Weaknesses**: Outdated dependencies, no typing, manual parsing
- **Maintainability**: 6/10 (clear but dated)
- **Extensibility**: 7/10 (easy to add features)

**hls-manifest-viewer:**
- **Strengths**: Simple UI, clear user flow
- **Weaknesses**: Platform-specific, HLS-only, basic parsing
- **Maintainability**: 5/10 (Electron-locked)
- **Extensibility**: 4/10 (would need major refactor for new features)

**New Extension Target:**
- **Strengths**: Modern stack, comprehensive features, typed
- **Maintainability**: 9/10 (TypeScript, clear structure)
- **Extensibility**: 9/10 (component-based, library-powered)

---

## Reusable Code Inventory

### High-Value Reuse (Adapt to TypeScript)

**From abr-manifest-viewer-chrome/viewer/js/main.js:**

```javascript
// Lines 88-91: Relative URL Detection
function isRelative(url) {
  return !/^(?:[a-z]+:)?\/\//i.test(url);
}

// Lines 93-108: URI Resolution
function getEvaluatedUri(uriReference){
  var evaluatedUri = uriReference;
  if (isRelative(uriReference)) {
    if(uriReference.startsWith('/')){
      evaluatedUri = getManifestUrlWithoutPath() + uriReference;
    } else {
      evaluatedUri = getManifestUrlWithPath() + uriReference;
    }
  }
  return evaluatedUri;
}

// Lines 62-65: Format Detection
var formatType = 'm3u8';
if(manifest.startsWith('<')){
  formatType = 'xml';
}
```

**Adaptation Plan:**
```typescript
// src/lib/utils/url-resolver.ts
export function isRelativeUrl(url: string): boolean {
  return !/^(?:[a-z]+:)?\/\//i.test(url);
}

export function resolveManifestUrl(
  uriReference: string,
  baseUrl: string
): string {
  if (!isRelativeUrl(uriReference)) {
    return uriReference; // Already absolute
  }

  const base = new URL(baseUrl);

  if (uriReference.startsWith('/')) {
    // Domain-relative
    return `${base.origin}${uriReference}`;
  } else {
    // Path-relative
    return new URL(uriReference, baseUrl).toString();
  }
}

// src/lib/parsers/unified-parser.ts
export function detectManifestFormat(content: string): 'hls' | 'dash' {
  return content.trimStart().startsWith('<') ? 'dash' : 'hls';
}
```

### Medium-Value Reuse (Conceptual)

**From abr-manifest-viewer-chrome:**
- Ignore list pattern (background.js lines 1, 50-52, 83-90)
- Safelist pattern (background.js lines 12-15)
- Error message formatting (background.js lines 99-103)

**From hls-manifest-viewer:**
- Button-based navigation (index.js lines 96-98, 111-114)
- I-FRAME special handling (index.js lines 100-109)
- Loading/loaded state transitions (index.js lines 34-46)

### Low-Value / No Reuse

- jQuery code (all of it - use React)
- XMLHttpRequest (use fetch)
- Electron APIs (not applicable)
- axios (use fetch)
- Manual line-by-line parsing (use libraries)

---

## Anti-Patterns Identified (Avoid These)

1. **Global State in window Object**
   - `window.ignoreUrls = {}` (background.js line 1)
   - Use chrome.storage for persistence, proper state management

2. **Synchronous innerHTML Updates in Loop**
   - hls-manifest-viewer index.js lines 90-92
   - Causes reflow on every line, terrible performance
   - Use React virtual DOM or batch updates

3. **No Input Sanitization**
   - Both repos directly insert URLs into HTML
   - Risk: XSS if manifest contains malicious content
   - Solution: Use textContent or sanitize before innerHTML

4. **No TypeScript**
   - Makes refactoring risky
   - No IDE autocomplete or type checking
   - Solution: Full TypeScript from the start

5. **Hardcoded Strings**
   - Error messages inline (multiple places)
   - Magic numbers (uriIndex + 5, etc.)
   - Solution: Constants file, typed error messages

6. **No Error Boundaries**
   - Parsing errors crash entire page
   - Solution: React Error Boundaries everywhere

---

## Technical Debt Catalog (What NOT to Replicate)

| Issue | Location | Impact | Solution |
|-------|----------|--------|----------|
| jQuery dependency | abr viewer/index.html:16 | Bundle bloat | Use React |
| Global variables | abr background.js:1 | State bugs | chrome.storage |
| XHR instead of fetch | abr background.js:92-111 | Incompatible with service workers | fetch API |
| String indexOf matching | abr background.js:36-37 | False positives | Proper URL parsing |
| Manual manifest parsing | Both repos | Incomplete, error-prone | Use @videojs libraries |
| No TypeScript | Both repos | Hard to maintain | Full TS from start |
| Inline styles | hls index.html | Hard to maintain | Tailwind classes |
| Electron APIs | hls main.js:1-95 | Platform lock-in | Browser APIs only |
| No build process | abr entire project | Can't use modern JS | Vite build |
| No tests | Both repos | Regression risk | Per-phase verification |

---

## Best Practices Identified (Replicate These)

| Practice | Location | Benefit | Application |
|----------|----------|---------|-------------|
| main_frame filtering | abr background.js:7 | Avoids breaking video players | Use in declarativeNetRequest rules |
| Safelist for known sites | abr background.js:12-15 | Prevents breaking demos | Make user-configurable |
| Format auto-detection | abr main.js:62-65 | Simple, reliable | Keep this pattern |
| Two-pass rendering | abr main.js:68-72 | Links don't break syntax highlighting | Adapt to React |
| Error user-friendliness | abr background.js:99-103 | Better UX than raw errors | Apply to all error handling |
| Loading states | hls index.js:34-46 | User feedback during async ops | Add to all components |
| Relative URL resolution | abr main.js:93-108 | Nested playlists work | Port to TS |
| URL validation before fetch | hls index.js:21-30 | Avoids bad requests | Add comprehensive validation |

---

## Feature Gap Analysis

### Features in Reference Repos
- ✅ View manifest with syntax highlighting (abr)
- ✅ Clickable nested playlists (both)
- ✅ Format detection (abr)
- ✅ Error handling (both)
- ✅ URL interception (abr)
- ✅ Manual input (hls)

### Missing Features (Adding in New Extension)
- ❌ ABR variant visualization
- ❌ Variant comparison
- ❌ DevTools panel
- ❌ Content script detection
- ❌ Segment timeline
- ❌ Playback simulation
- ❌ Export functionality
- ❌ Search/filter
- ❌ Manifest validation
- ❌ History management

### Feature Priority Assessment

**Must Have (from reference learnings):**
1. Auto-interception (from abr)
2. Clickable URLs (from both)
3. Format detection (from abr)
4. Error handling (from both)
5. Loading states (from both)

**Should Have (user expectations based on reference):**
6. Manual input (from hls)
7. Nested playlist navigation (from both)
8. Syntax highlighting (from abr)

**Nice to Have (beyond reference capabilities):**
9. All advanced features in phases 10-24

---

## Migration Complexity Assessment

### abr-manifest-viewer-chrome → New Extension

**Easy (1-2 hours):**
- URI resolution logic (TypeScript port)
- Format detection (direct copy)
- Manifest URL display (React component)

**Medium (3-5 hours):**
- webRequest → declarativeNetRequest (requires rule rewrite)
- XMLHttpRequest → fetch (API change + error handling)
- jQuery → React (component conversion)

**Hard (6-10 hours):**
- Background page → Service worker (lifecycle management)
- Manual parsing → Library integration (architectural change)
- Single view → Multi-view tabs (new features)

**Total Migration Effort**: ~15-20 hours to modernize core patterns

### hls-manifest-viewer → New Extension

**Easy (1-2 hours):**
- Manual input UI (React form)
- Loading state pattern (component state)

**Medium (3-5 hours):**
- Electron → Chrome extension (platform change)
- axios → fetch (API replacement)
- url-parse → URL API (library removal)

**Hard (8-10 hours):**
- Desktop app → Browser extension (architecture change)
- Node.js APIs → Browser APIs (comprehensive refactor)
- Line-by-line parsing → Library parsing (approach change)

**Total Adaptation Effort**: ~15-20 hours (but mostly learning from concepts, not copying code)

---

## Recommendations

### Immediate Actions
1. ✅ Use @videojs/m3u8-parser and @videojs/mpd-parser (avoid manual parsing)
2. ✅ Port URI resolution logic from abr-manifest-viewer-chrome (lines 88-108 of main.js)
3. ✅ Adopt format detection pattern (startsWith('<'))
4. ✅ Implement safelist + ignore list pattern
5. ✅ Use Prism.js with custom HLS/DASH tokens

### Avoid
1. ❌ Don't copy manual parsing logic
2. ❌ Don't use jQuery (use React)
3. ❌ Don't use XMLHttpRequest (use fetch)
4. ❌ Don't use global variables (use proper state management)
5. ❌ Don't skip TypeScript (type safety is critical)

### Learn From
1. 📚 How abr handles auto-interception (webRequest pattern)
2. 📚 How hls handles nested playlist navigation (button pattern)
3. 📚 Error messaging approach (both repos)
4. 📚 Loading state patterns (both repos)
5. 📚 Two-pass rendering to preserve syntax highlighting (abr)

---

## Conclusion

Both reference codebases provide valuable insights despite their age:

**abr-manifest-viewer-chrome** is the primary reference:
- Solid Chrome extension architecture (needs MV2→MV3 update)
- Excellent URI resolution logic (highly reusable)
- Good UX patterns (safelist, ignore list)
- Demonstrates what users expect from manifest viewer

**hls-manifest-viewer** is secondary reference:
- Different platform (Electron) limits direct code reuse
- Useful UI/UX concepts (manual input, button navigation)
- Demonstrates HLS-specific features to support
- Shows limitations of manual parsing approach

**Combined Learnings:**
- Modern libraries are essential (manual parsing is insufficient)
- Multiple detection methods improve UX
- Clickable URLs are critical feature
- Loading states and error handling are make-or-break
- Safeguards prevent breaking legitimate streaming sites

**Path Forward:**
Use abr-manifest-viewer-chrome as architectural reference, adapt its URI resolution logic, and build on top of modern libraries to create a feature-rich, production-ready extension that far exceeds both reference implementations.

**Files Requiring Detailed Re-Reading:**
- abr-manifest-viewer-chrome/viewer/js/main.js (lines 77-186) - ManifestParser class
- abr-manifest-viewer-chrome/background.js (lines 23-62) - Interception logic

All other files have been completely analyzed with actionable insights extracted.
