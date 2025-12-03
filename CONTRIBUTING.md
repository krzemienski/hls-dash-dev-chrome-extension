# Contributing to HLS + DASH Manifest Viewer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Submitting Changes](#submitting-changes)
7. [Review Process](#review-process)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments, personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct inappropriate in a professional setting

### Enforcement

Project maintainers are responsible for clarifying standards and will take appropriate action in response to unacceptable behavior.

## Getting Started

### Prerequisites

**Required:**
- Node.js 18+ and npm 9+
- Git
- Chrome 88+ for testing
- Code editor (VS Code recommended)

**Recommended:**
- TypeScript knowledge
- React experience
- Chrome extension development basics
- Understanding of HLS/DASH protocols

### Initial Setup

```bash
# 1. Fork repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/hls-dash-dev-chrome-extension.git
cd hls-dash-dev-chrome-extension

# 3. Add upstream remote
git remote add upstream https://github.com/krzemienski/hls-dash-dev-chrome-extension.git

# 4. Install dependencies
npm install

# 5. Build extension
npm run build

# 6. Load in Chrome
# chrome://extensions → Developer mode → Load unpacked → select dist/

# 7. Verify it works
npm test
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Development Workflow

### 1. Create Feature Branch

```bash
# Update main first
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/my-new-feature

# Or for bugs
git checkout -b fix/bug-description
```

### 2. Make Changes

**Follow TDD when possible:**
```bash
# 1. Write failing test
# tests/utils/my-feature.test.ts

# 2. Run test (should fail)
npm test my-feature

# 3. Implement feature
# src/lib/utils/my-feature.ts

# 4. Run test (should pass)
npm test my-feature

# 5. Commit
git add tests/utils/my-feature.test.ts src/lib/utils/my-feature.ts
git commit -m "feat: add my feature"
```

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Type check
npm run build

# Manual testing
# Load extension in Chrome
# Follow relevant sections of TESTING_CHECKLIST.md
```

### 4. Commit Your Changes

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(parser): add support for HLS version 10"

git commit -m "fix(popup): handle empty manifest list correctly

Previously, popup would crash if no manifests detected.
Now shows helpful message instead.

Closes #123"

git commit -m "docs: update API documentation for new parsers"

git commit -m "test: add tests for DASH profile detection"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/my-new-feature

# Create PR on GitHub
# Compare: upstream/main ← your-fork/feature/my-new-feature
```

## Coding Standards

### TypeScript

**Strict Mode:**
```typescript
// ✅ Use strict type checking
function parseManifest(content: string): ParsedManifest {
  // ...
}

// ❌ Avoid any types
function parseManifest(content: any): any {  // Bad!
  // ...
}
```

**Null Safety:**
```typescript
// ✅ Check for null/undefined
if (variant.resolution) {
  const width = variant.resolution.width;
}

// ✅ Or use optional chaining
const width = variant.resolution?.width;

// ❌ Assume values exist
const width = variant.resolution.width;  // May crash!
```

**Type Definitions:**
```typescript
// ✅ Define types for all interfaces
interface MyData {
  id: string;
  value: number;
}

// ✅ Export types that others use
export type { MyData };

// ✅ Use proper imports
import type { SomeType } from './types';  // Type-only import
```

### React

**Functional Components:**
```typescript
// ✅ Use function declarations
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
}

// ❌ Avoid const arrow functions for components
const MyComponent = ({ prop }: Props) => <div>{prop}</div>;  // Works but not preferred
```

**Hooks:**
```typescript
// ✅ Follow hooks rules
function MyComponent() {
  const [state, setState] = useState(initial);  // Top level only

  useEffect(() => {
    // Side effects here
    return () => {
      // Cleanup
    };
  }, [dependencies]);  // Always specify dependencies

  return <div />;
}
```

**Props:**
```typescript
// ✅ Define prop interfaces
interface MyComponentProps {
  title: string;
  count: number;
  onAction?: () => void;  // Optional prop
}

export function MyComponent({ title, count, onAction }: MyComponentProps) {
  // ...
}
```

### Naming Conventions

**Files:**
```
PascalCase for components: VariantList.tsx
camelCase for utilities: url-resolver.ts
kebab-case for test files: url-resolver.test.ts
UPPERCASE for docs: README.md
```

**Variables:**
```typescript
// camelCase for variables and functions
const manifestUrl = 'https://...';
function parseManifest() { }

// PascalCase for components and types
function VariantCard() { }
interface ParsedManifest { }

// SCREAMING_SNAKE_CASE for constants
const MAX_HISTORY_ITEMS = 50;
const DEFAULT_TIMEOUT = 5000;
```

**CSS Classes:**
```typescript
// Use Tailwind utilities
<div className="p-4 bg-white rounded-lg border border-gray-200">

// For custom classes (rare)
<div className="custom-gradient-background">
```

### Code Organization

**File Structure:**
```
src/
├── lib/              # Business logic (pure functions)
│   ├── parsers/      # Manifest parsing
│   ├── utils/        # Helper utilities
│   ├── export/       # Export functions
│   ├── simulation/   # Simulation logic
│   └── validation/   # Validation logic
├── components/       # React components
│   ├── viewer/       # Viewer page components
│   ├── popup/        # Popup components
│   └── common/       # Shared components
├── store/            # State management
└── types/            # Type definitions
```

**Import Order:**
```typescript
// 1. External libraries
import React from 'react';
import { create } from 'zustand';

// 2. Internal modules
import { parseManifest } from '../lib/parsers';
import { useManifestStore } from '../store/manifest-store';

// 3. Types
import type { ParsedManifest } from '../types/manifest';

// 4. Styles (if any)
import './styles.css';
```

### Comments

**When to Comment:**
```typescript
// ✅ Explain why, not what
// Use 85% safety margin to prevent quality thrashing
const targetBitrate = bandwidth * 0.85;

// ✅ Document complex algorithms
/**
 * Parse ISO 8601 duration to seconds
 * PT1H30M5S → 5405 seconds
 */
function parseDuration(iso: string): number {
  // ...
}

// ❌ Don't state the obvious
// Set the bitrate to 1000000
const bitrate = 1000000;  // This adds no value
```

**JSDoc for Public APIs:**
```typescript
/**
 * Parse manifest content and extract variants
 *
 * @param content - Raw manifest content (HLS or DASH)
 * @param url - Base URL for resolving relative URLs
 * @returns Parsed manifest with variants and metadata
 * @throws Error if content is empty or invalid
 *
 * @example
 * const manifest = parseManifest(hlsContent, 'https://example.com/master.m3u8');
 * console.log(manifest.variants.length);
 */
export function parseManifest(content: string, url: string): ParsedManifest {
  // ...
}
```

## Testing Requirements

### Test Coverage

**Required:**
- All new utilities must have tests (aim for 100%)
- All new parsers must have tests
- Validation logic must have tests
- Export functions must have tests

**Optional (but encouraged):**
- Component tests
- Integration tests
- E2E tests

### Writing Tests

**Structure:**
```typescript
// tests/utils/my-feature.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../src/lib/utils/my-feature';

describe('myFunction', () => {
  it('should do something specific', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(() => myFunction(invalidInput)).toThrow();
  });
});
```

**Test Fixtures:**
```bash
# Add test data to tests/fixtures/
# Use real-world examples
# Include edge cases
```

**Coverage Target:**
- New code: 90%+
- Overall: Maintain or improve

**Run Before PR:**
```bash
npm test                # All tests
npm test -- --coverage  # With coverage report
npm run build           # Type check
```

## Submitting Changes

### Pull Request Process

**1. Prepare PR:**
```bash
# Ensure up-to-date with upstream
git fetch upstream
git rebase upstream/main

# Run full test suite
npm test

# Build and manual test
npm run build
# Test in Chrome

# Push to your fork
git push origin feature/my-new-feature
```

**2. Create PR:**
- Go to repository on GitHub
- Click "New Pull Request"
- Base: upstream/main ← Head: your-fork/feature/my-new-feature
- Fill in template

**3. PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tested in Chrome

## Screenshots (if UI changes)
[Add screenshots]

## Related Issues
Closes #issue-number
```

### What Makes a Good PR

**Good PR:**
- ✅ Focused on single feature/fix
- ✅ Clear description
- ✅ Tests included
- ✅ Documentation updated
- ✅ No unrelated changes
- ✅ Follows coding standards
- ✅ Commit history clean

**Avoid:**
- ❌ Multiple unrelated changes
- ❌ No description
- ❌ No tests
- ❌ Breaking existing functionality
- ❌ Reformatting entire files
- ❌ Debugging console.logs left in

### PR Size Guidelines

**Ideal:**
- Small: 1-100 lines changed
- Medium: 100-500 lines
- Large: 500-1000 lines

**Too Large:**
- >1000 lines changed
- Consider breaking into multiple PRs

**Exception:**
- Generated files (package-lock.json)
- Documentation
- Test fixtures

## Review Process

### What Reviewers Look For

**Code Quality:**
- TypeScript types correct
- No `any` types
- Null checks present
- Error handling proper

**Testing:**
- Tests exist for new code
- All tests pass
- Edge cases covered
- No flaky tests

**Documentation:**
- README updated if needed
- API docs updated
- Code comments where necessary
- CHANGELOG entry (for releases)

**Functionality:**
- Works as described
- No regressions
- Handles errors gracefully
- User experience smooth

**Performance:**
- No unnecessary re-renders
- Efficient algorithms
- Bundle size impact minimal
- Memory leaks avoided

### Review Timeline

**Typical:**
- Initial review: 1-3 days
- Follow-up reviews: 1-2 days
- Depends on PR complexity

**Expedited:**
- Critical bugs: Same day
- Security fixes: ASAP
- Simple docs: 1 day

### Addressing Feedback

**When reviewer requests changes:**

```bash
# 1. Make requested changes
# edit files

# 2. Commit changes
git add .
git commit -m "fix: address review feedback

- Fixed null check in parser
- Added test for edge case
- Updated documentation"

# 3. Push to same branch
git push origin feature/my-new-feature

# PR automatically updates
```

**Responding to Comments:**
- Reply to each comment
- Mark resolved when fixed
- Explain reasoning if disagreeing
- Be respectful and professional

## Contribution Ideas

### Good First Issues

**For Beginners:**
- Documentation improvements
- Adding more test cases
- Fixing typos
- Improving error messages
- Adding code comments

**Label:** `good-first-issue`

### Help Wanted

**Medium difficulty:**
- New codec support
- Additional export formats
- UI improvements
- Performance optimizations

**Label:** `help-wanted`

### Feature Requests

**Check first:**
1. Search existing issues
2. Check roadmap
3. Discuss in issue before implementing

**Create issue:**
- Describe feature clearly
- Explain use case
- Provide examples
- Get maintainer approval before starting

## Areas Needing Help

### High Priority

**1. Network Request Interception:**
- Detect manifests from XHR/Fetch
- Use declarativeNetRequest API
- Manifest V3 compatible

**2. Real-Time Manifest Updates:**
- Detect manifest changes
- Diff viewer
- Live stream support

**3. Segment Integrity Checker:**
- Verify segment URLs accessible
- Check for broken segments
- Validate byte ranges

### Medium Priority

**4. Additional Export Formats:**
- PDF reports
- Excel (XLSX)
- Markdown reports
- HTML standalone reports

**5. Manifest Builder/Editor:**
- Create manifest from scratch
- Edit existing manifests
- Validate while editing
- Export compliant manifest

**6. Advanced Filtering:**
- Regex search
- Complex filter combinations
- Saved filter presets

### Low Priority

**7. Internationalization (i18n):**
- Multi-language support
- Localization
- RTL language support

**8. Themes:**
- Dark mode (UI ready, needs CSS)
- Custom color schemes
- Accessibility themes

**9. Keyboard Shortcuts:**
- Quick actions
- View switching
- Search activation

## Development Guidelines

### Adding New Features

**Process:**
1. Create issue describing feature
2. Discuss approach with maintainers
3. Get approval before starting
4. Create feature branch
5. Write tests first (TDD)
6. Implement feature
7. Update documentation
8. Create PR

**Checklist:**
- [ ] Issue exists and is approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Manually tested in Chrome
- [ ] No console errors
- [ ] Backwards compatible (if applicable)
- [ ] Performance impact acceptable

### Adding New Parsers

**Example: Adding Smooth Streaming Parser**

**1. Create test:**
```typescript
// tests/parsers/smooth-parser.test.ts
import { parseSmoothStreaming } from '../../src/lib/parsers/smooth-parser';

describe('parseSmoothStreaming', () => {
  it('should parse Smooth Streaming manifest', () => {
    const manifest = parseSmoothStreaming(content, url);
    expect(manifest.format).toBe('smooth');
    expect(manifest.variants.length).toBeGreaterThan(0);
  });
});
```

**2. Implement parser:**
```typescript
// src/lib/parsers/smooth-parser.ts
import type { ParsedManifest } from '../../types/manifest';

export function parseSmoothStreaming(content: string, url: string): ParsedManifest {
  // Parse Smooth Streaming XML
  // Extract QualityLevels
  // Return ParsedManifest format
}
```

**3. Add to unified parser:**
```typescript
// src/lib/parsers/index.ts
export function parseManifest(content: string, url: string): ParsedManifest {
  const format = detectManifestFormat(content);

  switch (format) {
    case 'hls': return parseHLS(content, url);
    case 'dash': return parseDASH(content, url);
    case 'smooth': return parseSmoothStreaming(content, url);  // Add here
  }
}
```

**4. Update format detection:**
```typescript
// src/lib/parsers/format-detector.ts
export function detectManifestFormat(content: string): ManifestFormat {
  if (content.includes('<SmoothStreamingMedia')) {
    return 'smooth';
  }
  // ... existing checks
}
```

**5. Update types:**
```typescript
// src/types/manifest.ts
export type ManifestFormat = 'hls' | 'dash' | 'smooth';
```

**6. Add documentation:**
- Update README.md
- Update FEATURES.md
- Add parser docs to API.md

### Adding New Components

**Process:**
1. Design component interface (props)
2. Create component file
3. Export from parent
4. Add to relevant view
5. Test rendering
6. Add to documentation

**Example: New Analysis Panel**

```typescript
// src/components/viewer/MyAnalysisPanel.tsx
import type { ParsedManifest } from '../../types/manifest';

interface MyAnalysisPanelProps {
  manifest: ParsedManifest;
}

export function MyAnalysisPanel({ manifest }: MyAnalysisPanelProps) {
  // Analysis logic
  const analysis = analyzeMyFeature(manifest);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">
        My Analysis
      </h2>
      {/* Content */}
    </div>
  );
}
```

**Add to StructuredView:**
```typescript
import { MyAnalysisPanel } from './MyAnalysisPanel';

export function StructuredView({ manifest }: Props) {
  return (
    <div>
      {/* ... other sections */}
      <MyAnalysisPanel manifest={manifest} />
    </div>
  );
}
```

### Adding New Utilities

**1. Create utility file:**
```typescript
// src/lib/utils/my-utility.ts

/**
 * Description of what this does
 */
export function myUtility(input: string): Result {
  // Implementation
}
```

**2. Write tests:**
```typescript
// tests/utils/my-utility.test.ts
import { myUtility } from '../../src/lib/utils/my-utility';

describe('myUtility', () => {
  it('should work correctly', () => {
    expect(myUtility('input')).toBe('expected');
  });
});
```

**3. Export if needed:**
```typescript
// src/lib/utils/index.ts (if it exists)
export { myUtility } from './my-utility';
```

## Testing Requirements

### Before Submitting PR

**Required Checks:**
```bash
# 1. All tests pass
npm test
# Should see: "Tests: X passed"

# 2. Type check passes
npm run build
# Should complete without errors

# 3. No lint errors (if linter configured)
npm run lint

# 4. Manual testing
# Load in Chrome
# Test your specific changes
# Verify no regressions
```

### Writing Good Tests

**Test Structure:**
```typescript
describe('Feature name', () => {
  // Setup
  const testData = createTestData();

  it('should handle normal case', () => {
    const result = myFunction(testData);
    expect(result).toBeDefined();
    expect(result.property).toBe(expected);
  });

  it('should handle edge case', () => {
    const result = myFunction(edgeCase);
    expect(result).toMatchObject(expected);
  });

  it('should throw error for invalid input', () => {
    expect(() => myFunction(invalidInput)).toThrow();
  });
});
```

**Test Coverage:**
- Happy path (normal usage)
- Edge cases (boundary conditions)
- Error cases (invalid input)
- Null/undefined handling

**Avoid:**
- Testing implementation details
- Brittle tests that break with refactoring
- Tests that depend on each other
- Flaky tests (random failures)

## Documentation Requirements

### Code Documentation

**Functions:**
```typescript
/**
 * Brief description
 *
 * Longer explanation if needed.
 * Can be multiple lines.
 *
 * @param paramName - Description
 * @param otherParam - Description
 * @returns Description of return value
 * @throws ErrorType when condition
 */
```

**Interfaces:**
```typescript
/**
 * Represents a parsed manifest variant
 */
export interface Variant {
  /** Unique identifier for this variant */
  id: string;

  /** Bitrate in bits per second */
  bitrate: number;

  // ... other properties
}
```

### User Documentation

**Update when:**
- Adding new features
- Changing UI
- Modifying behavior
- Adding/removing dependencies

**Files to update:**
- README.md - Overview and quick start
- FEATURES.md - Detailed feature list
- USER_GUIDE.md - How to use
- API.md - API changes
- CHANGELOG.md - Version history

## Common Mistakes to Avoid

### 1. Forgetting Chrome API Guards

```typescript
// ❌ Will crash outside extension
const url = chrome.runtime.getURL('viewer.html');

// ✅ Check API exists
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const url = chrome.runtime.getURL('viewer.html');
}
```

### 2. Mutating State Directly

```typescript
// ❌ Don't mutate
const variant = manifest.variants[0];
variant.bitrate = 1000000;  // Bad!

// ✅ Create new object
const updated = {
  ...variant,
  bitrate: 1000000
};
```

### 3. Missing Dependencies

```typescript
// ❌ Missing dependency
useEffect(() => {
  doSomething(value);
}, []);  // value should be in array

// ✅ Include all dependencies
useEffect(() => {
  doSomething(value);
}, [value]);
```

### 4. Incorrect Imports

```typescript
// ❌ Wrong path
import { parseHLS } from 'src/lib/parsers/hls-parser';

// ✅ Relative path
import { parseHLS } from '../../lib/parsers/hls-parser';

// ✅ Type-only import for types
import type { ParsedManifest } from '../types/manifest';
```

### 5. Not Testing in Chrome

**Always test your changes:**
1. Build: `npm run build`
2. Reload extension in chrome://extensions
3. Test the specific feature
4. Verify no errors in console
5. Test edge cases

## Getting Help

### Questions?

**Before asking:**
1. Check documentation
2. Search closed issues
3. Read troubleshooting guide

**Where to ask:**
- GitHub Discussions (preferred)
- Issue with "question" label
- Comments on related PR/issue

**Don't:**
- Email maintainers directly
- Ask in unrelated issues
- Repeat questions asked before

### Mentorship

**New contributors:**
- Maintainers happy to help
- Ask questions in issue comments
- Request guidance on approach
- Pair programming available for complex features

**Learning resources:**
- Chrome Extension docs: https://developer.chrome.com/docs/extensions/
- React docs: https://react.dev
- TypeScript handbook: https://www.typescriptlang.org/docs/
- Vitest docs: https://vitest.dev

## Recognition

### Contributors

All contributors will be:
- Listed in README.md contributors section
- Mentioned in release notes
- Credited in git history
- Thanked publicly

### Significant Contributions

**Major features:**
- Blog post feature announcement
- Social media shoutout
- Added to core team (if interested)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

Your contributions are understood to be original work that you have the right to contribute.

## Release Process (for Maintainers)

**Version Bump:**
```bash
# Update version
# package.json
# public/manifest.json

# Update CHANGELOG.md

# Commit
git commit -am "chore: bump version to X.Y.Z"

# Tag
git tag vX.Y.Z

# Push
git push origin main --tags
```

**Release Checklist:**
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Built and tested
- [ ] ZIP created for store
- [ ] Submitted to Chrome Web Store
- [ ] GitHub release created
- [ ] Announcement prepared

Thank you for contributing to making this the best manifest analysis tool available!
