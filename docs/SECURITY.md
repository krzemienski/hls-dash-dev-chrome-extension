# Security & Privacy Guide

Comprehensive documentation of security measures and privacy practices in the HLS + DASH Manifest Viewer.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Privacy Commitment](#privacy-commitment)
3. [Data Collection](#data-collection)
4. [Security Features](#security-features)
5. [Permission Justification](#permission-justification)
6. [Threat Model](#threat-model)
7. [Security Best Practices](#security-best-practices)
8. [Reporting Security Issues](#reporting-security-issues)

## Security Overview

### Security Principles

**Core Commitments:**
1. **Privacy First** - No tracking, no analytics, no data collection
2. **Minimal Permissions** - Only request what's absolutely necessary
3. **Local Processing** - All analysis happens in browser
4. **Transparency** - Open source for security auditing
5. **Secure by Design** - Security considerations in every feature

**Manifest V3 Compliance:**
- Uses latest Chrome extension platform
- Service workers instead of background pages
- declarativeNetRequest instead of webRequest
- No remote code execution
- Content Security Policy enforced

## Privacy Commitment

### What We DON'T Collect

**Never collected or transmitted:**
- ❌ Browsing history
- ❌ Manifest URLs you analyze
- ❌ Personal information
- ❌ Usage statistics
- ❌ Error reports
- ❌ Analytics data
- ❌ Cookies or tracking
- ❌ Device fingerprinting

### What We Store Locally

**Chrome Storage (chrome.storage.local):**

**1. Manifest History (Optional):**
```typescript
{
  url: string,          // Manifest URL
  format: 'hls' | 'dash',
  timestamp: number,    // When viewed
  variantCount: number, // How many variants
  duration?: number,    // Manifest duration (if available)
  title?: string        // Optional user title
}
```

**Storage:**
- Local to your browser only
- Never synced or transmitted
- Limited to 50 items
- You can clear anytime
- Deleted when extension uninstalled

**2. User Settings:**
```typescript
{
  autoInterceptEnabled: boolean,  // Auto-detect manifests
  theme: 'light' | 'dark' | 'auto',
  defaultView: 'raw' | 'structured' | 'timeline',
  syntaxTheme: string,
  ignoredUrls: string[],  // URLs to not detect
  safelist: string[]      // URLs to always detect
}
```

**Storage:**
- Local only
- Your preferences only
- Can be reset to defaults
- Not shared with anyone

**3. Detected Manifests (Temporary):**
- Stored in service worker memory
- Only while browser open
- Cleared when tab closes
- Never persisted to disk
- Never transmitted

### Data Flows

**All data stays local:**
```
User's Browser
  ├─► Fetch manifest from source (direct request)
  ├─► Parse in browser (local processing)
  ├─► Store results in memory (temporary)
  ├─► Save to chrome.storage (local, optional)
  └─► Never leaves browser
```

**No external services:**
- No API calls to our servers (we have none!)
- No analytics endpoints
- No crash reporting services
- No CDN for code
- All code bundled in extension

## Data Collection

### What Happens to Your Data

**Manifest Content:**
1. Fetched directly from source URL
2. Parsed in your browser
3. Displayed in UI
4. Never sent anywhere
5. Cleared when you close viewer

**URLs:**
- Temporarily in memory for active analysis
- Optionally saved to history (local storage)
- Never transmitted to any server
- You control via settings

**Settings:**
- Stored in chrome.storage.local
- Only on your device
- Not synced (even if Chrome Sync enabled)
- Can be cleared in Settings tab

### Third-Party Data Sharing

**None.**

We don't share data with third parties because we don't collect data to share.

### Cookies

**None.**

This extension doesn't use cookies, tracking pixels, or any tracking technology.

## Security Features

### Content Security Policy

**Enforced by Chrome:**
```
default-src 'self';
script-src 'self';
object-src 'none';
base-uri 'self';
```

**What this means:**
- Only code from extension bundle can run
- No inline scripts
- No eval()
- No loading code from internet
- Maximum security

**Our Compliance:**
- ✅ All JavaScript in bundled files
- ✅ No innerHTML with user content
- ✅ No dynamic code generation
- ✅ No remote script loading

### XSS Prevention

**Input Sanitization:**
```typescript
// ✅ React auto-escapes
<div>{userInput}</div>
// Even if userInput contains <script>, it's rendered as text

// ✅ We use textContent, never innerHTML
element.textContent = manifestUrl;

// ❌ We never do this
element.innerHTML = userContent;  // Not used anywhere
```

**URL Validation:**
```typescript
// ✅ Validate before use
try {
  const parsed = new URL(userInput);
  // Now know it's a valid URL
} catch {
  throw new Error('Invalid URL');
}
```

**Manifest Content:**
- Displayed as text or syntax-highlighted code
- Never executed
- Never injected into DOM as HTML
- Safe to view malicious manifests

### CSRF Protection

**Not Applicable:**
- No user accounts
- No server-side state
- No authenticated requests to our servers
- All requests are read-only manifest fetches

### Authentication Token Handling

**Detection:**
- We detect auth tokens in URLs (token=, key=, etc.)
- We warn users tokens may expire
- We display them in UI for debugging

**Security Measures:**
```typescript
// ✅ Never log tokens
console.log('Loading manifest:', url);  // Shows full URL

// ✅ But we warn users
if (analysis.hasAuth) {
  showWarning('URL contains authentication tokens');
}

// ✅ Not stored persistently
// Only in memory while viewing
// Cleared when done
```

**Best Practices for Users:**
- Don't share screenshots with visible tokens
- Tokens shown for debugging only
- We warn about expiration
- Clear history if tokens sensitive

## Permission Justification

### Required Permissions

**1. `storage`**
```json
"permissions": ["storage"]
```

**Why needed:**
- Save manifest history (optional)
- Store user settings
- Remember ignored URLs

**What it accesses:**
- chrome.storage.local only
- Your data only
- Never synced
- Can be cleared

**Alternatives considered:**
- localStorage: Doesn't work in service worker
- IndexedDB: Overkill for small data
- No storage: Lose history/settings

**2. `tabs`**
```json
"permissions": ["tabs"]
```

**Why needed:**
- Open viewer in new tab
- Get current tab for manifest detection
- Close tabs programmatically

**What it accesses:**
- Tab URL and ID only
- No tab content
- No browsing history

**Alternatives considered:**
- None: Core functionality requires tabs

**3. `declarativeNetRequest`**
```json
"permissions": ["declarativeNetRequest", "declarativeNetRequestWithHostAccess"]
```

**Why needed:**
- Match URL patterns for manifest files
- Future: Intercept network requests for detection

**What it accesses:**
- URL patterns only
- No actual request content (yet)
- Declarative rules only

**Note:** Currently used minimally, reserved for future XHR detection feature

**4. `contextMenus`**
```json
"permissions": ["contextMenus"]
```

**Why needed:**
- Right-click menu on manifest links
- "Analyze with HLS+DASH Viewer" option

**What it accesses:**
- Link URLs only
- User-initiated action
- No background scanning

### Host Permissions

```json
"host_permissions": [
  "*://*/*.m3u8*",
  "*://*/*.mpd*"
]
```

**Why needed:**
- Fetch manifest files from any domain
- Necessary for core functionality
- User initiates all fetches

**What we do:**
- Only fetch when user requests
- Direct fetch to source (no proxy)
- Display content to user
- Never store full content permanently

**Scope:**
- Only URLs ending in .m3u8 or .mpd
- No access to other pages
- No access to page content
- Just file downloads

**Alternatives considered:**
- Require users to download manually: Poor UX
- Limit to specific domains: Too restrictive
- Use CORS proxy: Privacy/security concern

### Optional Permissions

**None currently.**

All permissions are required for core functionality.

## Threat Model

### Threats We Protect Against

**1. Malicious Manifests:**

**Threat:**
- User loads malicious manifest
- Contains XSS payloads
- Attempts code execution

**Protection:**
- All content displayed as text
- React auto-escapes
- No eval() or innerHTML
- CSP prevents code execution

**Result:** ✅ Safe to view any manifest

**2. Network Attacks:**

**Threat:**
- MITM attack on manifest fetch
- Modified manifest content
- Redirects to malicious URLs

**Protection:**
- HTTPS encouraged (not enforced)
- Browser handles SSL/TLS
- No code execution from manifest
- User sees actual content

**Result:** ⚠️ Use HTTPS URLs when possible

**3. Extension Compromise:**

**Threat:**
- Attacker modifies extension code
- Malicious update pushed

**Protection:**
- Chrome Web Store signing
- Integrity verification
- Code review before updates
- Open source (community audit)

**Result:** ✅ Chrome verifies integrity

**4. Data Exfiltration:**

**Threat:**
- Extension sends data to external server
- Tracking or surveillance

**Protection:**
- No network requests except manifest fetches
- Open source (verify in code)
- No analytics or tracking
- All processing local

**Result:** ✅ No data leaves browser

### Threats Out of Scope

**1. Manifest Server Security:**
- We fetch from wherever user specifies
- Server security is server owner's responsibility
- We just display what's there

**2. DRM Bypass:**
- We detect and display DRM information
- We don't decrypt or bypass protection
- Analysis only, no decryption

**3. Content Copyright:**
- Tool for analysis, not piracy
- Users responsible for legal use
- We provide information, not access

## Security Best Practices

### For Users

**URL Safety:**
```
✅ Use HTTPS URLs
❌ Avoid HTTP URLs (insecure)

✅ Verify domain is correct
❌ Don't paste untrusted URLs

✅ Check for typos
❌ Typosquatting can redirect
```

**Token Security:**
- Tokens displayed for debugging
- Don't share screenshots with tokens
- Clear history if tokens are sensitive
- Tokens may expire (we warn you)

**Download Scripts:**
- Review generated scripts before running
- Scripts download from URLs you provided
- Verify URLs before executing
- Use in trusted environment only

### For Developers

**Code Security:**

**1. Input Validation:**
```typescript
// ✅ Always validate
function processUrl(url: string) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL');
  }

  try {
    new URL(url);  // Validates format
  } catch {
    throw new Error('Malformed URL');
  }

  // Now safe to use
}
```

**2. Output Encoding:**
```typescript
// ✅ Use React (auto-escapes)
<div>{userContent}</div>

// ✅ Or manually escape if needed
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

**3. Type Safety:**
```typescript
// ✅ Use strict types
function parse(content: string): ParsedManifest {
  // TypeScript prevents many bugs
}

// ❌ Avoid any
function parse(content: any): any {
  // No type safety!
}
```

**4. Error Handling:**
```typescript
// ✅ Catch and handle
try {
  const result = await riskyOperation();
} catch (error) {
  // Log for debugging
  console.error('Operation failed:', error);

  // Don't expose internals to user
  showUserError('Operation failed. Please try again.');

  // Don't continue with bad state
  return;
}
```

**5. Chrome API Guards:**
```typescript
// ✅ Check API exists
if (typeof chrome !== 'undefined' && chrome.storage) {
  await chrome.storage.local.set({ key: value });
}

// Prevents crashes in testing/standalone mode
// Degrades gracefully
```

## Vulnerability Disclosure

### Reporting Security Issues

**Do NOT:**
- ❌ Open public GitHub issue for security vulnerabilities
- ❌ Post details in discussions
- ❌ Tweet about it

**DO:**
- ✅ Email security concerns to: [security contact - add real email]
- ✅ Include detailed description
- ✅ Provide steps to reproduce
- ✅ Suggest fix if possible
- ✅ Allow time for fix before disclosure

**Response Timeline:**
- Initial response: 48 hours
- Status update: 7 days
- Fix timeline: Based on severity

**Severity Levels:**

**Critical:**
- Remote code execution
- Data exfiltration
- Authentication bypass
- Fix: Immediate (24-48 hours)

**High:**
- XSS vulnerabilities
- Permission escalation
- Fix: 1 week

**Medium:**
- Information disclosure
- Denial of service
- Fix: 2-4 weeks

**Low:**
- Minor issues
- Fix: Next release

### Disclosure Policy

**Responsible Disclosure:**
1. Reporter contacts us privately
2. We confirm and investigate
3. We develop and test fix
4. We release patch
5. We publish security advisory
6. Reporter gets credit (if desired)

**Public Disclosure:**
- 90 days after fix released
- Or when fix deployed to all users
- Full details published
- Credit given to reporter

## Security Features

### Manifest V3 Security

**Why Manifest V3:**
- More secure than V2
- Service workers (isolated, limited lifetime)
- No persistent background page (attack surface reduced)
- Stricter CSP
- Limited permissions

**Key Improvements:**
- No arbitrary code execution
- Declarative APIs preferred
- Better resource management
- Enhanced privacy controls

### Isolation

**Context Isolation:**
```
Service Worker (isolated)
  │
  ├─► Cannot access page DOM
  ├─► Cannot run page scripts
  └─► Separate JavaScript context

Content Script (isolated)
  │
  ├─► Cannot access page variables
  ├─► Separate execution context
  └─► Can read/modify DOM only
```

**Benefits:**
- Page cannot access extension
- Extension cannot be compromised by page
- Mutual isolation

**Communication:**
- Only via message passing
- Structured message format
- Validated on both ends

### Network Security

**Manifest Fetching:**
```typescript
// Direct fetch to source
const response = await fetch(manifestUrl);

// No proxy servers
// No intermediaries
// No logging
// Just browser → source
```

**HTTPS Preferred:**
- Users should use HTTPS URLs
- We don't enforce (some test content is HTTP)
- Browser shows security indicators
- SSL/TLS handled by browser

**CORS Handling:**
- Extension has host permissions
- Can fetch from any domain
- Same-origin policy bypassed (by design)
- User must initiate fetch

### Code Integrity

**Build Process:**
```
Source Code (TypeScript)
  │
  ├─► Type checking (prevents bugs)
  ├─► Compilation (ES2020)
  ├─► Bundling (Vite/Rollup)
  ├─► Minification (no functionality change)
  └─► Output (dist/)
```

**Verification:**
```bash
# Reproducible builds
git checkout v1.0.0
npm install
npm run build
# Should produce identical output

# Verify integrity
shasum -a 256 dist/service-worker.js
```

**Chrome Web Store:**
- Google signs extension
- Integrity verified on install
- Tampering detected and prevented
- Automatic updates are signed

## Permission Justification

### Detailed Permission Usage

**storage:**
```typescript
// Used in:
// - src/lib/utils/storage.ts

// Operations:
chrome.storage.local.get('history');  // Read history
chrome.storage.local.set({ history: [...] });  // Save history
chrome.storage.local.get('settings');  // Read settings
chrome.storage.local.set({ settings: {...} });  // Save settings

// Data stored:
// - Manifest history (user-controlled)
// - User preferences

// Never accessed:
// - Other extensions' storage
// - Browser history
// - Passwords
```

**tabs:**
```typescript
// Used in:
// - src/popup/popup.tsx
// - src/background/service-worker.ts
// - src/components/viewer/QuickActions.tsx

// Operations:
chrome.tabs.query({ active: true, currentWindow: true });  // Get current tab
chrome.tabs.create({ url: viewerUrl });  // Open viewer tab

// Never accessed:
// - Tab content
// - Browsing history
// - Private data
```

**declarativeNetRequest:**
```typescript
// Currently:
// - Defined in manifest for future use
// - No active rules yet (rules.json is [])

// Future use:
// - Intercept manifest requests
// - Detect XHR-loaded manifests
// - Always user-initiated

// Never:
// - Block requests
// - Modify requests
// - Track requests
```

**contextMenus:**
```typescript
// Used in:
// - src/background/service-worker.ts

// Operation:
chrome.contextMenus.create({
  id: 'analyze-manifest',
  title: 'Analyze with HLS+DASH Viewer',
  contexts: ['link'],
  targetUrlPatterns: ['*://*/*.m3u8*', '*://*/*.mpd*']
});

// Only appears on manifest links
// User must click to activate
// No background scanning
```

**host_permissions:**
```json
["*://*/*.m3u8*", "*://*/*.mpd*"]
```

**Usage:**
```typescript
// Allows fetching manifests from any domain
fetch('https://any-domain.com/path/file.m3u8')

// Required because manifests can be on any CDN
// User specifies URL
// Direct fetch to source
// No intermediaries
```

## Threat Model

### Attack Vectors

**1. Malicious Manifest Content:**

**Attack:**
```
# In manifest.m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1000000
<script>alert('XSS')</script>
```

**Protection:**
- React escapes all text content
- Prism.js renders as highlighted text
- No code execution possible
- CSP prevents inline scripts

**Result:** ✅ Safe

**2. Malicious Manifest URL:**

**Attack:**
```
javascript:alert('XSS')
data:text/html,<script>...</script>
```

**Protection:**
```typescript
// URL validation
try {
  const url = new URL(userInput);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP(S) URLs allowed');
  }
} catch {
  // Invalid URL rejected
}
```

**Result:** ✅ Safe

**3. Compromised CDN:**

**Attack:**
- Manifest served from compromised CDN
- Contains malicious redirects

**Protection:**
- We just display content
- No execution
- User sees what's there
- Can verify against original source

**Result:** ✅ Information only, no execution

**4. Supply Chain Attack:**

**Attack:**
- Malicious dependency in npm package
- Code injected during build

**Protection:**
- package-lock.json locks versions
- Audit dependencies: `npm audit`
- Review dependency updates
- Minimal dependencies

**Prevention:**
```bash
# Before installing new package
npm audit <package-name>

# Check package reputation
# - Downloads per week
# - Last publish date
# - GitHub stars
# - Known maintainers
```

**5. Extension Update Attack:**

**Attack:**
- Malicious update pushed to users
- Compromised developer account

**Protection (Chrome Web Store):**
- All updates reviewed by Google
- Signing verification
- Cannot push unsigned updates
- Account security (2FA recommended)

**Protection (Self-Hosted):**
- Update URL must be HTTPS
- CRX signature verified
- Private key kept secure
- Update server hardened

## Security Best Practices

### For End Users

**Safe Usage:**
1. Install from Chrome Web Store (when published)
2. Or load from trusted source
3. Review permissions before installing
4. Keep extension updated
5. Report suspicious behavior

**URL Safety:**
- Verify URLs before loading
- Use HTTPS when possible
- Don't load manifests from untrusted sources
- Check domain matches expected source

**Token Safety:**
- Don't share screenshots with auth tokens
- Clear history if manifests contain sensitive tokens
- Tokens shown for debugging only

### For Developers

**Secure Coding:**

**1. Validate All Input:**
```typescript
function processInput(input: unknown) {
  // Type guard
  if (typeof input !== 'string') {
    throw new TypeError('Expected string');
  }

  // Format validation
  if (!isValidFormat(input)) {
    throw new Error('Invalid format');
  }

  // Now safe to process
}
```

**2. Use Prepared Queries (SQL):**
- Not applicable (no database)
- But principle applies: parameterize, don't concatenate

**3. Escape Output:**
- React does automatically
- Trust React's XSS protection
- Don't use innerHTML

**4. Least Privilege:**
- Request minimum permissions
- Only access what's needed
- No broad permissions

**5. Defense in Depth:**
- Multiple layers of protection
- CSP + type safety + validation
- No single point of failure

## Compliance

### GDPR Compliance

**Article 6 (Lawful Basis):**
- N/A: We don't process personal data

**Article 7 (Consent):**
- N/A: No data collection requiring consent

**Article 13 (Information):**
- Privacy policy clearly states no data collection
- Transparent about local storage

**Article 17 (Right to Erasure):**
- Users can clear all data in Settings tab
- Uninstalling removes all data
- No server-side data to delete

**Result:** ✅ Fully compliant (no personal data processed)

### CCPA Compliance

**Categories of Personal Information:**
- None collected

**Sale of Personal Information:**
- N/A: Nothing to sell

**Right to Delete:**
- Users can clear local data
- Uninstall removes everything

**Result:** ✅ Fully compliant

### COPPA Compliance

**Children's Privacy:**
- No data collection
- Safe for all ages
- No age restrictions needed

**Result:** ✅ Compliant

## Security Audit

### Self-Audit Checklist

**Code Security:**
- [x] No eval() or Function()
- [x] No innerHTML with user content
- [x] Input validation on all user input
- [x] Type safety via TypeScript
- [x] Error handling in place

**Extension Security:**
- [x] Minimal permissions requested
- [x] Manifest V3 compliant
- [x] CSP compliant
- [x] No remote code loading
- [x] Service worker used correctly

**Data Security:**
- [x] No unnecessary data collection
- [x] Local processing only
- [x] No external API calls
- [x] User data stays in browser
- [x] Clear data option available

**Network Security:**
- [x] Direct fetches only
- [x] No proxy servers
- [x] HTTPS recommended
- [x] Proper error handling

### External Audit

**Open Source:**
- All code visible on GitHub
- Community can audit
- Issues can be reported
- Transparent development

**Recommended:**
- Professional security audit (if funding available)
- Penetration testing
- Code review by security experts

## Incident Response

### Security Incident Procedure

**If vulnerability discovered:**

**1. Immediate:**
- Notify core team
- Assess severity
- Determine scope

**2. Within 24 Hours:**
- Develop patch
- Test thoroughly
- Prepare update

**3. Within 48 Hours:**
- Release patched version
- Submit to Chrome Web Store
- Notify users (if critical)

**4. Within 7 Days:**
- Publish security advisory
- Credit reporter
- Update documentation

### User Notification

**Critical vulnerabilities:**
- Extension description updated
- Email to users (if possible)
- GitHub security advisory
- Social media announcement

**Medium/Low vulnerabilities:**
- Included in release notes
- GitHub security advisory
- Fixed in next regular update

## Privacy Policy

### Simple Statement

**We Don't Collect Data. Period.**

This extension:
- Does not collect personal information
- Does not track your activity
- Does not send data to external servers
- Processes everything locally in your browser
- Stores preferences locally only
- Allows you to clear all data anytime

### Legal Statement

**Data Controller:**
- User (you control your data)
- Not us (we don't have your data)

**Data Processor:**
- Your browser
- Chrome storage API
- No third-party processors

**Data Retention:**
- History: Until you clear it
- Settings: Until you reset or uninstall
- Temp data: Until browser closed

**Data Deletion:**
- Settings tab → Clear history
- Uninstall extension
- Chrome settings → Clear extension data

## Regular Security Practices

### Dependency Management

**Regular Updates:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

**Before Merging Dependency Updates:**
1. Review changelog
2. Check for breaking changes
3. Run full test suite
4. Manual testing in Chrome
5. Verify no new vulnerabilities

### Code Review

**Security Focus:**
- Check for XSS vulnerabilities
- Verify input validation
- Check for injection risks
- Review permission usage
- Verify no data leakage

**Automated Checks (Future):**
- ESLint security rules
- SonarQube scanning
- Dependabot alerts
- SAST (Static Application Security Testing)

### Version Control

**Secure Repository:**
- No secrets in code
- No API keys committed
- No private keys
- .gitignore configured

**Branch Protection:**
- Require PR reviews
- Require tests to pass
- No direct commits to main
- Signed commits encouraged

## Future Security Enhancements

**Planned:**
1. Content security headers for viewer
2. Subresource integrity for external resources
3. Automated security scanning in CI/CD
4. Regular penetration testing
5. Bug bounty program (if funding available)

## Contact

**Security Concerns:**
- Email: [Add security contact]
- PGP Key: [Add if available]
- Response time: 48 hours

**General Issues:**
- GitHub Issues (non-security)
- Discussions for questions

By prioritizing security and privacy, we ensure this extension is safe to use for analyzing any manifest content.
