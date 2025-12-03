# HLS + DASH Manifest Viewer Pro

A powerful Chrome Extension for viewing, analyzing, and debugging HLS (M3U8) and DASH (MPD) streaming manifests.

## Features

### 🔍 Manifest Detection
- Automatic detection of HLS and DASH manifests on web pages
- Scans DOM for `.m3u8` and `.mpd` URLs
- Detects manifests from links, XHR requests, and video sources
- Real-time monitoring via DevTools panel

### 📊 Analysis Tools
- **ABR Ladder Visualization** - Visual representation of adaptive bitrate variants
- **Bitrate Distribution Chart** - Compare bitrate levels across variants
- **Codec Analysis** - Detailed codec information (H.264, H.265, AV1, AAC, etc.)
- **Performance Metrics** - Startup latency, switching time, efficiency scores
- **Bandwidth Calculator** - Find optimal quality for your connection speed
- **URL Analysis** - CDN detection, auth parameter identification

### 🎯 Playback Simulation
- Simulate ABR playback with different bandwidth profiles
- Visualize quality switching behavior
- Track rebuffering events
- Test stable, varying, degrading, and improving network conditions

### ✅ Validation
- Detect missing variants or metadata
- Identify bitrate ladder gaps
- Warn about codec issues
- Check for duplicate bitrates

### 📥 Export & Download
- Export to JSON, CSV, or text report
- Generate download scripts (Bash/PowerShell)
- FFmpeg merge workflows for segments
- Copy URLs, cURL commands, M3U playlists

### 🎨 Three View Modes
1. **Raw View** - Syntax-highlighted manifest source
2. **Structured View** - Organized sections with comprehensive analysis
3. **Timeline View** - Playback simulation with quality switching

## Installation

### From Source

```bash
# Clone repository
git clone https://github.com/krzemienski/hls-dash-dev-chrome-extension.git
cd hls-dash-dev-chrome-extension

# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist/` folder
```

## Usage

### Quick Start

1. **Install the extension** and pin it to your toolbar
2. **Navigate** to a website with HLS or DASH streams
3. **Click the extension icon** to see detected manifests
4. **Click a manifest** to open the full analyzer

### From DevTools

1. Open Chrome DevTools (F12)
2. Go to the **Manifests** tab
3. Detected manifests appear automatically
4. Click **Analyze** to open in viewer

### Manual URL Entry

1. Click extension icon → **Open Full Viewer**
2. Paste manifest URL in the input field
3. Click **Load** to analyze

### Right-Click Menu

- Right-click any `.m3u8` or `.mpd` link
- Select **"Analyze with HLS+DASH Viewer"**

## Development

### Build Commands

```bash
npm run dev      # Watch mode (rebuilds on changes)
npm run build    # Production build
npm test         # Run test suite (72 tests)
npm test -- --ui # Test UI
```

### Tech Stack

- **Framework**: React 18 + TypeScript 5.7
- **Build**: Vite 6
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Parsing**: m3u8-parser, mpd-parser
- **Syntax**: Prism.js
- **Testing**: Vitest (72 tests, 13 suites)

### Project Structure

```
src/
├── background/         # Service worker
├── content/           # Content script (detection)
├── popup/             # Extension popup (400x600px)
├── viewer/            # Full-page viewer
├── devtools/          # DevTools panel
├── components/        # React components
│   ├── viewer/        # Viewer components
│   └── popup/         # Popup components
├── lib/
│   ├── parsers/       # HLS/DASH parsers
│   ├── utils/         # Utilities
│   ├── export/        # Export utilities
│   ├── simulation/    # Playback simulator
│   ├── validation/    # Manifest validator
│   └── fetchers/      # Network fetchers
├── store/             # Zustand state
└── types/             # TypeScript types
```

## Testing

Test-driven development approach with 72 passing tests:

```bash
npm test                    # Run all tests
npm test url-resolver       # Run specific test
npm test -- --coverage      # Coverage report
```

Test coverage includes:
- URL resolution and parsing
- Format detection (HLS/DASH)
- Manifest parsing
- ABR analysis
- Playback simulation
- Export utilities
- Codec analysis
- Validation logic

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

ISC

## Credits

Built with:
- [m3u8-parser](https://github.com/videojs/m3u8-parser) by Video.js
- [mpd-parser](https://github.com/videojs/mpd-parser) by Video.js
- React, TypeScript, Tailwind CSS, and Vite

Reference implementations:
- abr-manifest-viewer-chrome
- hls-manifest-viewer
