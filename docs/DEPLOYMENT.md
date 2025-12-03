# Deployment Guide

Complete guide for deploying and distributing the HLS + DASH Manifest Viewer Chrome Extension.

## Table of Contents

1. [Development Deployment](#development-deployment)
2. [Production Build](#production-build)
3. [Chrome Web Store Publishing](#chrome-web-store-publishing)
4. [Enterprise Deployment](#enterprise-deployment)
5. [Self-Hosting](#self-hosting)
6. [Update Strategy](#update-strategy)

## Development Deployment

### Local Development Setup

**Prerequisites:**
```bash
# Check Node.js version (requires 18+)
node --version

# Check npm version
npm --version
```

**Installation:**
```bash
# Clone repository
git clone https://github.com/krzemienski/hls-dash-dev-chrome-extension.git
cd hls-dash-dev-chrome-extension

# Install dependencies
npm install

# Build extension
npm run build
```

**Load in Chrome:**
1. Open `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Navigate to and select the `dist/` folder
5. Extension should appear in list
6. Pin extension to toolbar for easy access

### Development Workflow

**Watch Mode:**
```bash
# Terminal 1: Watch for changes
npm run dev

# This runs: vite build --watch
# Rebuilds automatically on file changes
```

**After Code Changes:**
1. Save file (build happens automatically)
2. Go to `chrome://extensions`
3. Click reload icon on extension card
4. Test changes in browser

**Quick Reload:**
- Service worker: Reload extension
- Content script: Reload page
- Popup: Close and reopen
- Viewer: Hard reload (Cmd/Ctrl + Shift + R)

### Testing During Development

**Run Tests:**
```bash
# All tests
npm test

# Specific test file
npm test url-resolver

# With coverage
npm test -- --coverage

# UI mode
npm test -- --ui
```

**Browser Testing:**
```bash
# Run Playwright tests
cd /path/to/playwright-skill
node run.js /tmp/playwright-test-extension.js
```

**Manual Testing:**
- Follow `docs/TESTING_CHECKLIST.md`
- Test critical paths after each feature
- Verify no console errors

## Production Build

### Build Process

**Clean Build:**
```bash
# Remove old build
rm -rf dist/

# TypeScript type check + Vite build
npm run build
```

**Output Verification:**
```bash
# Check dist/ structure
ls -la dist/

# Verify manifest.json
cat dist/manifest.json | jq .

# Check bundle sizes
du -h dist/assets/*.js

# Verify all entry points exist
ls dist/service-worker.js
ls dist/content-script.js
ls dist/src/popup/popup.html
ls dist/src/viewer/viewer.html
ls dist/src/devtools/devtools.html
ls dist/src/devtools/panel.html
```

**Expected Output:**
```
dist/
├── manifest.json (1.3 KB)
├── rules.json (3 B)
├── service-worker.js (~3 KB)
├── content-script.js (~1 KB)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── assets/
│   ├── globals-*.css (~35 KB)
│   ├── globals-*.js (~143 KB - shared React/Zustand)
│   ├── viewer-*.js (~245 KB - viewer code)
│   ├── popup-*.js (~8 KB)
│   ├── panel-*.js (~3 KB)
│   ├── storage-*.js (~1 KB)
│   ├── ErrorBoundary-*.js (~2 KB)
│   └── modulepreload-polyfill-*.js (~1 KB)
└── src/
    ├── popup/popup.html
    ├── viewer/viewer.html
    └── devtools/
        ├── devtools.html
        └── panel.html
```

### Pre-Release Checklist

**Code Quality:**
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No console errors in extension
- [ ] No console warnings in production build

**Functionality:**
- [ ] Can load HLS manifests
- [ ] Can load DASH manifests
- [ ] Popup opens and works
- [ ] DevTools panel appears
- [ ] Manifest detection works
- [ ] All export formats work
- [ ] Settings persist correctly

**Documentation:**
- [ ] README.md updated
- [ ] CHANGELOG.md has version entry
- [ ] Version number bumped in manifest.json
- [ ] Screenshots updated if UI changed

**Assets:**
- [ ] Icons generated (16px, 48px, 128px)
- [ ] manifest.json complete
- [ ] All required files in dist/

## Chrome Web Store Publishing

### Preparation

**1. Create Icons:**
```bash
# Generate proper icons (not placeholders)
# Recommended: Use SVG source, export to PNG

convert icon.svg -resize 16x16 public/icons/icon16.png
convert icon.svg -resize 48x48 public/icons/icon48.png
convert icon.svg -resize 128x128 public/icons/icon128.png
convert icon.svg -resize 440x280 screenshot1.png  # For store listing
```

**Icon Requirements:**
- Format: PNG
- Sizes: 16px, 48px, 128px (required)
- 440x280 or 920x680 for promotional images
- 1280x800 or 640x400 for screenshots
- No padding/margin in icons

**2. Create Store Assets:**
- 5-10 screenshots (1280x800 or 640x400)
- Promotional tile (440x280, optional)
- Detailed description (up to 16,384 characters)
- Short description (up to 132 characters)

**3. Update manifest.json:**
```json
{
  "version": "1.0.0",
  "name": "HLS + DASH Manifest Viewer Pro",
  "description": "View and analyze HLS (M3U8) and DASH (MPD) streaming manifests...",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### Publishing Steps

**1. Create Developer Account:**
- Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Pay one-time $5 registration fee
- Complete developer profile

**2. Create New Item:**
- Click "New Item"
- Upload `dist/` folder as ZIP:
  ```bash
  cd dist
  zip -r ../extension-v1.0.0.zip .
  cd ..
  ```
- Wait for upload and analysis

**3. Fill Store Listing:**

**Product Details:**
- Extension name
- Summary (132 chars max)
- Detailed description (markdown supported)
- Category: Developer Tools
- Language: English (+ others if localized)

**Screenshots & Media:**
- Upload 5 screenshots showing key features
- Upload promotional tile (optional)
- YouTube video (optional)

**Privacy:**
- Privacy policy URL (required if collecting data)
- For this extension: "No user data collected"
- Single purpose: "Manifest analysis tool"
- Permissions justification

**Distribution:**
- Visibility: Public/Unlisted/Private
- Geographic distribution: All countries
- Pricing: Free

**4. Submit for Review:**
- Click "Submit for Review"
- Review typically takes 1-3 business days
- May request changes
- Check email for updates

### Review Requirements

**What Chrome Checks:**
1. **Manifest Compliance:**
   - Valid Manifest V3 format
   - Proper permission declarations
   - Correct file references

2. **Permissions:**
   - Justified use of each permission
   - Minimal permissions principle
   - Clear explanation in privacy

3. **Functionality:**
   - Extension works as described
   - No malicious behavior
   - No policy violations

4. **Content:**
   - Appropriate for all audiences
   - No misleading information
   - Proper screenshots

**Common Rejection Reasons:**
- Unnecessary permissions
- Unclear privacy policy
- Misleading description
- Broken functionality
- Policy violations

**How to Avoid:**
- Request only needed permissions
- Test thoroughly before submission
- Write clear, honest descriptions
- Follow all policies
- Respond quickly to reviewer questions

## Enterprise Deployment

### G Suite / Google Workspace

**Admin Console Deployment:**

1. **Upload Extension:**
   - Admin console → Apps → Chrome apps & extensions
   - Add custom Chrome app
   - Upload CRX or provide Web Store URL

2. **Configure Policy:**
```json
{
  "ExtensionInstallForceList": [
    "extension-id;https://clients2.google.com/service/update2/crx"
  ]
}
```

3. **Deploy to OUs:**
   - Select organizational units
   - Force install or allow install
   - Set permissions

**Private Distribution:**
1. Build extension: `npm run build`
2. Pack extension:
   ```bash
   # Chrome command line
   chrome --pack-extension=./dist --pack-extension-key=./private-key.pem
   ```
3. Upload .crx to internal server
4. Configure update XML manifest
5. Push via enterprise policy

### Self-Hosted Updates

**Update Manifest XML:**
```xml
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='extension-id'>
    <updatecheck codebase='https://your-server.com/extension.crx' version='1.0.0' />
  </app>
</gupdate>
```

**Distribution:**
1. Host .crx file on HTTPS server
2. Host update.xml on same server
3. Configure enterprise policy to point to update.xml
4. Extensions auto-update from your server

## Self-Hosting

### Build for Self-Hosting

**Same as production:**
```bash
npm run build
```

**Distribution Options:**

1. **ZIP Distribution:**
   ```bash
   cd dist && zip -r manifest-viewer.zip .
   ```
   - Users download ZIP
   - Extract to folder
   - Load unpacked in chrome://extensions

2. **Git Distribution:**
   - Users clone repository
   - Run `npm install && npm run build`
   - Load dist/ folder

3. **CRX Distribution (Advanced):**
   ```bash
   # Generate private key
   openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem

   # Pack extension
   chrome --pack-extension=./dist --pack-extension-key=./key.pem
   ```
   - Produces .crx file
   - Users drag-drop to chrome://extensions
   - Requires "Allow extensions from other stores"

### Custom Domain Hosting

**For Viewer Page Only (Standalone):**

1. Build production: `npm run build`
2. Copy dist/ to web server
3. Configure web server:
   ```nginx
   # Nginx example
   location / {
     root /path/to/dist;
     try_files $uri $uri/ /src/viewer/viewer.html;
   }

   # CORS headers for manifest fetching
   add_header Access-Control-Allow-Origin *;
   ```
4. Access via `https://your-domain.com/src/viewer/viewer.html`

**Limitations:**
- Extension APIs won't work (chrome.*)
- Fallback to direct fetch mode
- No storage persistence
- No popup/devtools integration

**Use Cases:**
- Public demo
- Shareable viewer links
- Testing without installation

## Update Strategy

### Versioning

**Semantic Versioning:**
- MAJOR.MINOR.PATCH
- Example: 1.2.3

**Version Bumps:**
- MAJOR: Breaking changes, API changes
- MINOR: New features, backwards-compatible
- PATCH: Bug fixes, no new features

**Where to Update:**
```json
// package.json
{
  "version": "1.0.0"
}

// public/manifest.json
{
  "version": "1.0.0"
}
```

### Changelog

**Format (CHANGELOG.md):**
```markdown
# Changelog

## [1.1.0] - 2024-12-03

### Added
- Frame rate analysis panel
- DRM detection
- Protocol information panel

### Changed
- Improved bitrate ladder visualization
- Enhanced export functionality

### Fixed
- Chrome API guard for standalone mode
- Resolution null checks

## [1.0.0] - 2024-12-02

Initial release
```

### Update Process

**Development:**
```bash
# 1. Make changes
# 2. Update version in both files
# 3. Update CHANGELOG.md
# 4. Commit changes
git add package.json public/manifest.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"

# 5. Tag release
git tag v1.1.0
git push origin v1.1.0

# 6. Build and test
npm run build
# Manual testing

# 7. Submit to Chrome Web Store
```

**Chrome Web Store:**
1. Build new version
2. Create ZIP: `cd dist && zip -r ../v1.1.0.zip .`
3. Upload to Developer Dashboard
4. Update store listing if needed
5. Submit for review

**Enterprise:**
1. Build new version
2. Generate new CRX (with same private key)
3. Update version in update.xml
4. Deploy CRX to hosting server
5. Chrome auto-updates within 5 hours

### Hotfix Process

**Critical Bug:**
```bash
# 1. Create hotfix branch
git checkout -b hotfix/1.0.1

# 2. Fix bug
# 3. Test thoroughly
npm test
npm run build
# Manual testing

# 4. Update version (PATCH only)
# package.json: 1.0.0 → 1.0.1
# manifest.json: 1.0.0 → 1.0.1

# 5. Commit and tag
git commit -am "fix: critical bug in manifest parsing"
git tag v1.0.1

# 6. Merge to main
git checkout main
git merge hotfix/1.0.1
git push origin main v1.0.1

# 7. Emergency publish to store
```

## Chrome Web Store Publishing

### First-Time Setup

**1. Developer Account:**
- Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Sign in with Google account
- Pay $5 registration fee (one-time)
- Complete identity verification

**2. Prepare Assets:**

**Icons:**
- 16x16px (toolbar, tab)
- 48x48px (extensions page)
- 128x128px (web store, installation)

**Screenshots (Required: 1-5):**
- 1280x800px or 640x400px
- PNG or JPEG
- Show key features
- Include captions

**Promotional Images (Optional):**
- Small tile: 440x280px
- Large tile: 920x680px
- Marquee: 1400x560px

**3. Write Store Listing:**

**Name (max 45 chars):**
```
HLS + DASH Manifest Viewer Pro
```

**Summary (max 132 chars):**
```
Analyze HLS/DASH manifests with ABR visualization, codec analysis, playback simulation, and comprehensive export tools.
```

**Description (max 16,384 chars):**
```markdown
# Features
- Automatic manifest detection
- HLS and DASH support
- ABR ladder visualization
- Codec analysis
- Playback simulation
- Export to JSON/CSV/Text
- ... (full feature list)

# Use Cases
... (target audience)

# How It Works
... (step-by-step)
```

**Category:**
- Primary: Developer Tools
- Could fit in: Productivity

### Submission Process

**1. Create ZIP:**
```bash
cd dist
zip -r ../extension.zip .
cd ..
```

**2. Upload:**
- Go to Developer Dashboard
- Click "New Item"
- Upload extension.zip
- Wait for processing (1-2 minutes)

**3. Fill Listing Details:**
- Product details
- Privacy practices
- Store listing
- Distribution settings

**4. Privacy Tab:**

**Single Purpose:**
```
This extension provides manifest analysis tools for HLS and DASH streaming protocols.
```

**Permission Justification:**
```
- storage: Save user preferences and manifest history locally
- tabs: Open analysis viewer in new tabs
- declarativeNetRequest: Match manifest URL patterns
- contextMenus: Provide right-click analysis option
- host_permissions: Fetch manifest files from any domain
```

**Data Usage:**
```
This extension does not collect, transmit, or share any user data.
All manifest analysis happens locally in the browser.
History and settings are stored locally using Chrome's storage API.
```

**5. Submit:**
- Review all information
- Check "I have read and agree to terms"
- Click "Submit for Review"

### Review Timeline

**Typical Timeline:**
- Initial review: 1-3 business days
- Follow-up questions: +1-2 days per response
- Re-review after changes: 1-2 days

**Status Tracking:**
- Email notifications for status changes
- Dashboard shows current status
- Can check "Package" tab for analysis results

**Possible Outcomes:**
- **Approved**: Extension goes live
- **Pending**: Awaiting review
- **Rejected**: Must fix issues and resubmit
- **Taken Down**: Policy violation (post-publication)

### Post-Approval

**Going Live:**
- Extension appears in Chrome Web Store within minutes
- Users can install immediately
- Shows in search results
- Appears in category listings

**Monitoring:**
- Check Web Store listing regularly
- Monitor user reviews
- Track installation count
- Respond to user feedback

## Update Deployment

### Publishing Updates

**1. Prepare Update:**
```bash
# Update version
# package.json: "version": "1.1.0"
# public/manifest.json: "version": "1.1.0"

# Update changelog
# CHANGELOG.md: Add [1.1.0] section

# Commit version bump
git commit -am "chore: bump version to 1.1.0"
git tag v1.1.0
```

**2. Build and Test:**
```bash
npm run build
npm test

# Load in Chrome for manual testing
# Follow full testing checklist
```

**3. Upload to Store:**
```bash
cd dist
zip -r ../v1.1.0.zip .
cd ..
```
- Upload ZIP to Developer Dashboard
- Update "What's New" section
- Submit for review

**4. Review and Release:**
- Wait for approval
- Test published version
- Announce update

### Auto-Update Behavior

**User Experience:**
- Chrome checks for updates every ~5 hours
- Downloads update in background
- Update applied on browser restart
- Or when extension reloaded manually

**Force Update:**
```bash
# Users can force update:
# chrome://extensions → Developer mode → Update
```

### Rollback Procedure

**If Update Has Issues:**

1. **Unpublish problematic version:**
   - Developer Dashboard → Remove version
   - Stops new installations

2. **Upload previous version:**
   ```bash
   # Get previous dist/
   git checkout v1.0.0
   npm run build
   cd dist && zip -r ../rollback.zip .
   ```
   - Upload to store
   - Mark as hotfix

3. **Notify Users:**
   - Update description with known issues
   - Post in support channels
   - Fix and re-release ASAP

## Enterprise Deployment

### Google Workspace

**Admin Setup:**
```
Admin Console
  → Apps
    → Chrome management
      → Apps & extensions
        → Add custom Chrome app
```

**Installation:**
```json
{
  "extension-id": {
    "installation_mode": "force_installed",
    "update_url": "https://clients2.google.com/service/update2/crx"
  }
}
```

**Force Install vs Allow:**
- `force_installed`: Auto-installs, cannot remove
- `normal_installed`: Auto-installs, can remove
- `allowed`: Available but not auto-installed
- `blocked`: Cannot install

**Per-OU Deployment:**
- Different settings for different groups
- Dev team: Force install
- General users: Allow install
- External: Blocked

### Microsoft Intune

**Package Extension:**
```powershell
# Create MSIX package
makeappx pack /d dist /p manifest-viewer.msix
```

**Deploy:**
1. Upload to Intune
2. Assign to groups
3. Configure settings
4. Monitor deployment

### SCCM Deployment

**Create Package:**
```bash
# Include dist/ folder
# Add install script:

# install.ps1
$extensionPath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Extensions\extension-id"
Copy-Item -Recurse "dist\*" "$extensionPath\1.0.0"
```

**Deploy via SCCM:**
1. Create application
2. Add deployment type
3. Specify install command
4. Deploy to collections

## Beta Testing

### Beta Channel Setup

**1. Create Beta Listing:**
- Separate Web Store listing
- Mark as "unlisted"
- Different extension ID

**2. Beta Build:**
```bash
# Update manifest
{
  "name": "HLS + DASH Viewer (Beta)",
  "version": "1.1.0-beta.1"
}

# Build
npm run build
```

**3. Distribute to Testers:**
- Share unlisted store link
- Or share ZIP for load unpacked
- Collect feedback

**4. Graduate to Stable:**
- Remove "-beta" from name
- Update version to stable
- Publish to main listing

### Testing Groups

**Internal Team:**
- Load unpacked from dist/
- Daily builds
- Immediate feedback

**Closed Beta:**
- Unlisted store listing
- Selected users
- 1-2 week cycle

**Open Beta:**
- Public but marked as beta
- Wider testing
- Pre-release features

## Deployment Automation

### CI/CD Pipeline (GitHub Actions)

**Build and Test:**
```yaml
# .github/workflows/build.yml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: extension-dist
          path: dist/
```

**Automated Publishing:**
```yaml
# .github/workflows/publish.yml
name: Publish to Chrome Web Store

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run build
      - uses: browser-actions/release-chrome-extension@latest
        with:
          extension-id: ${{ secrets.EXTENSION_ID }}
          client-id: ${{ secrets.CLIENT_ID }}
          client-secret: ${{ secrets.CLIENT_SECRET }}
          refresh-token: ${{ secrets.REFRESH_TOKEN }}
          zip-path: dist.zip
```

**Required Secrets:**
- EXTENSION_ID: From Web Store
- CLIENT_ID: From Google API Console
- CLIENT_SECRET: From Google API Console
- REFRESH_TOKEN: Generated via OAuth flow

## Monitoring

### Post-Deployment Monitoring

**Chrome Web Store Stats:**
- Daily active users
- Install count
- Uninstall count
- User ratings
- Review feedback

**Error Monitoring:**
```typescript
// Add to service worker
chrome.runtime.onError.addListener((error) => {
  // Log to analytics service (optional)
  console.error('Extension error:', error);
});
```

**User Feedback:**
- Monitor store reviews
- GitHub issues
- Support email
- Usage patterns

### Analytics (Optional)

**Privacy-Friendly:**
```typescript
// Basic usage stats (no PII)
{
  "event": "manifest_loaded",
  "format": "hls",
  "variant_count": 5
  // No URLs, no user data
}
```

**Implementation:**
- Use Google Analytics with privacy mode
- Or self-hosted analytics
- Anonymous only
- Opt-in only
- Clear privacy policy

## Rollout Strategy

### Gradual Rollout (Web Store)

**Phase 1: Limited (1-3 days)**
- 5% of users get update
- Monitor for critical issues
- Can roll back easily

**Phase 2: Expanded (1-3 days)**
- 25% of users
- Continued monitoring
- Address issues found

**Phase 3: Full Release**
- All users
- Continuous monitoring
- Prepare hotfix if needed

**Configure:**
- Web Store Developer Dashboard
- Distribution settings
- Rollout percentage

### Feature Flags (Future)

```typescript
interface FeatureFlags {
  enableNewExportFormat: boolean;
  enableAdvancedFiltering: boolean;
  enableAIAnalysis: boolean;
}

// Check feature flags
if (flags.enableNewExportFormat) {
  // Show new export option
}
```

**Storage:**
- Chrome storage for user preferences
- Remote config for A/B testing (optional)
- Default values in code

## Distribution Channels

### Chrome Web Store (Primary)

**Pros:**
- Automatic updates
- Trust and discoverability
- Easy installation
- Usage analytics

**Cons:**
- Review process
- Store policies
- 5% of revenue (if paid)

### GitHub Releases

**Manual Installation:**
```bash
# Latest release
curl -LO https://github.com/user/repo/releases/latest/download/extension.zip

# Unzip
unzip extension.zip -d extension/

# Load in Chrome
# chrome://extensions → Load unpacked → select extension/
```

**Benefits:**
- Full control
- No review process
- Open source transparency
- Direct user connection

### Enterprise App Store

**Internal Deployment:**
- Company intranet
- Internal app catalog
- Managed via group policy
- Custom approval process

## Security Considerations

### Code Signing

**Web Store:**
- Automatically signed by Google
- Users see verified publisher
- Tampering detected

**Self-Hosted:**
- Sign with private key
- Keep key secure
- Users see "packed by developer"

### Update Security

**Integrity:**
- CRX format includes hash
- Chrome verifies integrity
- Rejects tampered updates

**HTTPS Required:**
- Update URLs must use HTTPS
- Prevents MITM attacks
- Ensures authenticity

### Privacy Compliance

**GDPR:**
- No personal data collected
- User controls all data (can clear)
- Privacy policy clearly states practices

**CCPA:**
- No selling of data
- No tracking
- User has full control

## Maintenance

### Long-Term Maintenance

**Regular Updates:**
- Dependency updates: Monthly
- Security patches: As needed
- Chrome API changes: As announced
- Bug fixes: Based on reports

**Monitoring:**
- Watch Chrome extension blog for API changes
- Monitor dependency security advisories
- Track user-reported issues
- Stay updated on web standards

**Deprecation Handling:**
```bash
# Check for deprecated APIs
npm outdated

# Update dependencies
npm update

# Test thoroughly
npm test
npm run build
```

### Sunset Plan (If Needed)

**Graceful Shutdown:**
1. Announce sunset (6 months notice)
2. Stop new feature development
3. Maintain for critical bugs only
4. Archive repository
5. Unpublish from store (gives users time to migrate)
6. Mark as deprecated in README

This deployment guide ensures smooth distribution and maintenance of the extension across all deployment scenarios.
