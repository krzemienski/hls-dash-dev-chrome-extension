# System 3 Implementation Plan: Unified Dual-Mode Manifest Viewer

> **FOR EXECUTION SESSION:** Use `/superpowers:execute-plan @docs/plans/SYSTEM_3_IMPLEMENTATION_PLAN.md`
>
> **CRITICAL:** Complete Phase 0 (Session Context Priming) FIRST - this loads ALL context from previous work.
>
> **After Phase 0 complete:** Proceed autonomously through implementation phases WITHOUT checking in between tasks.

**Version:** 1.1.0 (Upgrade from v1.0.0)
**Architecture:** Integrated Dual-Mode System
**Approach:** Additive enhancement to tested v1.0.0 codebase
**Validation:** Functional testing in Chrome DevTools only (NO test files)
**Multi-Session:** 15-20 sessions over several weeks
**Execution Mode:** Autonomous after context priming complete

---

## 🎯 PROJECT VISION

Transform the HLS + DASH Manifest Viewer from a comprehensive analysis tool into a **unified dual-mode system** that combines:

1. **Automatic URL interception** - Click any .m3u8/.mpd URL → Extension takes over
2. **Minimalistic spec validation** - Quick view with spec compliance checking
3. **Comprehensive analysis** - All existing 20+ tools available on demand
4. **Context-aware defaults** - Auto-interception = spec mode, Manual loading = analysis mode

**Target:** Chrome extension that becomes the browser's built-in .m3u8/.mpd viewer (like PDF viewer) with optional deep analysis capabilities.

---

## 📋 EXECUTION SESSION PREREQUISITES

**Before starting ANY implementation phase, the execution session MUST:**

1. ✅ Read `docs/DECISION_THREE_SYSTEMS.md` - Understand why System 3 chosen
2. ✅ Read `docs/WIREFRAMES_THREE_SYSTEMS.md` - Understand UI architecture completely
3. ✅ Read this plan file completely (all 3300+ lines)
4. ✅ Execute Phase 0 (Session Context Priming) - Load all previous work
5. ✅ Confirm understanding of v1.0.0 codebase (8,351 lines, 36 components, 22 utilities)
6. ✅ Confirm understanding of validation strategy (Chrome DevTools only, no test files)
7. ✅ Confirm readiness to proceed autonomously

**After Phase 0 complete:** Session can execute Phases 1-11 autonomously, only reporting progress and results, NOT asking for permission between tasks.

---

## 📋 CRITICAL CONSTRAINTS

### Mandatory Requirements

**SESSION MANAGEMENT:**
- ✅ EVERY session MUST start with `session-context-priming` skill
- ✅ Load ALL Serena MCP memories before starting work
- ✅ Pull Context7 docs for libraries used in that phase
- ✅ Save phase completion status to Serena MCP after each phase
- ✅ Save ALL research and knowledge to Serena MCP (not just code)

**VALIDATION STRATEGY:**
- ❌ **NO test files** (no .test.ts, no .spec.ts, no unit tests)
- ✅ **ONLY functional validation** via Chrome DevTools as end user
- ✅ Load extension in chrome://extensions after each change
- ✅ Test with real .m3u8/.mpd URLs in browser
- ✅ Verify behavior in DevTools (Console, Elements, Network tabs)
- ✅ Screenshot validation results as evidence
- ✅ Document validation outcomes in Serena MCP

**CODE QUALITY:**
- ✅ Production-ready code only (no placeholders, no TODOs)
- ✅ TypeScript strict mode (zero errors)
- ✅ Preserve all 124 existing tests (they must continue passing)
- ✅ All existing v1.0.0 features must continue working
- ✅ Build must succeed: `npm run build` with zero errors

**KNOWLEDGE MANAGEMENT:**
- ✅ Use Serena MCP for ALL research findings
- ✅ Document HLS spec knowledge completely
- ✅ Document DASH spec knowledge completely
- ✅ Save Chrome extension patterns learned
- ✅ Maintain phase completion tracking

---

## 🗂️ PLAN STRUCTURE OVERVIEW

**Total Phases:** 12 (0-11)
**Estimated Sessions:** 15-20 sessions
**Estimated Calendar Time:** 6-10 weeks
**Estimated Total Effort:** 150-200 hours

### Phase Breakdown

| Phase | Name | Sessions | Duration | Deliverable |
|-------|------|----------|----------|-------------|
| **0** | Session Context Priming | Every session | 30-60 min | Context loaded |
| **1** | HLS Specification Mastery | 1-2 | 2-3 days | HLS spec docs |
| **2** | DASH Specification Mastery | 1-2 | 2-3 days | DASH spec docs |
| **3** | Chrome Extension API Research | 1 | 1 day | Extension patterns |
| **4** | Write Comprehensive Specification | 1-2 | 2-3 days | 3000+ line spec |
| **5** | URL Interception Implementation | 1 | 1 day | Working redirects |
| **6** | HLS Spec Validator Implementation | 2-3 | 2-3 days | HLS validation |
| **7** | DASH Spec Validator Implementation | 2-3 | 2-3 days | DASH validation |
| **8** | Spec Mode UI Implementation | 2-3 | 2-3 days | 8 new components |
| **9** | Segment Availability Checker | 1 | 1 day | Segment checking |
| **10** | Mode Toggle & Integration | 1-2 | 1-2 days | Dual-mode system |
| **11** | Comprehensive Validation | 2-3 | 2-3 days | Full Chrome testing |

---

## 📖 DETAILED PHASE SPECIFICATIONS

---

## PHASE 0: SESSION CONTEXT PRIMING

**MANDATORY FIRST STEP FOR EVERY SESSION**

### Purpose

Load complete context from all previous sessions to prevent:
- Repeating completed work
- Missing critical decisions
- Losing accumulated knowledge
- Breaking existing functionality

### Execution

**EVERY session must:**

```bash
# Step 1: Invoke session-context-priming skill
/skill session-context-priming

# OR if skill not available:
# Manually execute context loading:
```

**Manual Context Loading Steps:**

1. **Activate Serena MCP:**
```
mcp__serena__activate_project("/Users/nick/Desktop/hls-dash-dev-chrome-extension")
```

2. **List and read ALL Serena memories:**
```
mcp__serena__list_memories()

# Read each memory completely (not just summaries!):
mcp__serena__read_memory("project-state-v1.0.0")
mcp__serena__read_memory("testing-status")
mcp__serena__read_memory("url-test-database")
mcp__serena__read_memory("session-1-testing-complete")  # If exists
mcp__serena__read_memory("hls-spec-knowledge")  # After Phase 1
mcp__serena__read_memory("dash-spec-knowledge")  # After Phase 2
mcp__serena__read_memory("phase-N-completion")  # For each completed phase
# ... read ALL available memories
```

3. **Read critical project files:**
```
Read: package.json
Read: public/manifest.json
Read: vite.config.ts
Read: src/viewer/viewer.tsx
Read: src/store/manifest-store.ts
Read: src/lib/parsers/index.ts
Read: docs/DECISION_THREE_SYSTEMS.md
Read: docs/WIREFRAMES_THREE_SYSTEMS.md
Read: docs/plans/SYSTEM_3_IMPLEMENTATION_PLAN.md (this file)
```

4. **Check git status:**
```bash
git status
git log --oneline -10
git branch --show-current
```

5. **Pull Context7 docs for current phase:**
```
# If working on React components:
mcp__Context7__get-library-docs("/websites/react_dev", "hooks components")

# If working on Chrome extension:
mcp__Context7__get-library-docs("/websites/developer_chrome_extensions", "manifest v3 apis")

# If working on validation:
mcp__Context7__get-library-docs("/vitest-dev/vitest", "testing validation")
```

6. **Determine current phase:**
- Check which phase completion memories exist
- Read the latest phase completion status
- Identify next phase to execute

7. **Sequential thinking (15-30 thoughts):**
- Synthesize all loaded context
- Understand current project state
- Identify what's been completed
- Plan current session's work
- Confirm no conflicts with existing code

### Deliverable

**Context Summary** showing:
- Current version and git state
- Phases completed (from Serena memories)
- Knowledge accumulated (HLS spec, DASH spec, etc.)
- Code changes since last session
- Current session's target phase
- Readiness confirmation

### Validation

✅ Can answer: "What was completed in the last session?"
✅ Can answer: "What HLS/DASH spec knowledge do we have?"
✅ Can answer: "Which components exist and what do they do?"
✅ Can answer: "What needs to be done in this session?"

### Time: 30-60 minutes

---

## PHASE 1: HLS SPECIFICATION MASTERY

**Sessions:** 2 (Session 2 for research, Session 3 for validation)
**Duration:** 2-3 days
**Prerequisites:** Phase 0 complete, Apple HLS tools available at /usr/local/share/hlstools/

### Objectives

1. Achieve **complete understanding** of HLS specification
2. Document ALL HLS tags with valid values and constraints
3. Understand validation rules from Apple Media Stream Validator
4. Document HLS version differences (v1-v9+)
5. Create comprehensive validation rule set for implementation
6. Save all knowledge to Serena MCP for future phases

### Skills to Invoke

**At session start:**
- ✅ `session-context-priming` (mandatory)

**During research:**
- ✅ `systematic-debugging` (if encountering unclear spec sections)
- ✅ `mcp__sequential-thinking__sequentialthinking` (for deep spec analysis)

### Detailed Steps

#### Step 1.1: Read Apple HLS Tools Documentation

**File to read:**
```
/usr/local/share/hlstools/readme.rtf
```

**What to extract:**
- Media Stream Validator usage and rules
- Variant Playlist Validator usage
- What makes a playlist compliant vs non-compliant
- Error messages and their meanings
- Recommended best practices

**Sequential thinking:**
Use `mcp__sequential-thinking__sequentialthinking` with 100+ thoughts to deeply understand:
- How validator detects errors
- What each error means
- How to implement equivalent JavaScript validation

**Save to Serena:**
```
mcp__serena__write_memory(
  "apple-hls-tools-analysis",
  "Complete analysis of Apple HLS tools including all validator rules..."
)
```

#### Step 1.2: Study HLS RFC 8216 Specification

**Resource:**
```
https://datatracker.ietf.org/doc/html/rfc8216
```

**Use web fetch:**
```
mcp__fetch__fetch(
  url="https://datatracker.ietf.org/doc/html/rfc8216",
  max_length=50000
)
```

**What to document:**

**Playlist Types:**
- Master Playlist: Contains variant streams (EXT-X-STREAM-INF)
- Media Playlist: Contains media segments (EXTINF)
- Identification rules (how to detect which type)

**Required Tags:**
- Every playlist: #EXTM3U (must be first line)
- Media playlist: #EXTINF before each segment
- Master playlist: #EXT-X-STREAM-INF before each variant

**Optional but Common Tags:**
- EXT-X-VERSION: Version number (1-9+)
- EXT-X-TARGETDURATION: Maximum segment duration
- EXT-X-MEDIA-SEQUENCE: First segment sequence number
- EXT-X-INDEPENDENT-SEGMENTS: Segments can be decoded independently
- EXT-X-PLAYLIST-TYPE: VOD or EVENT
- EXT-X-ENDLIST: Indicates VOD (no more segments)

**Version-Specific Features:**
- v1: Basic playlist
- v2: IV attribute in EXT-X-KEY
- v3: Floating-point EXTINF durations
- v4: Byte range support (EXT-X-BYTERANGE)
- v5: EXT-X-MAP for initialization segments
- v6: EXT-X-INDEPENDENT-SEGMENTS
- v7: Low-latency features (EXT-X-PART, EXT-X-PRELOAD-HINT)

**Codec Strings:**
- H.264: `avc1.[profile][level]` (e.g., avc1.640020)
- H.265: `hvc1.[profile][level]` or `hev1.[profile][level]`
- AAC: `mp4a.40.[object-type]` (e.g., mp4a.40.2 for AAC-LC)
- VP9: `vp09.[profile].[level].[bitdepth]`
- AV1: `av01.[profile].[level].[tier]`

**Sequential thinking:**
Use 200+ thoughts to work through:
- Each tag's purpose and valid values
- Relationships between tags
- Version compatibility rules
- Common mistakes and violations

**Save to Serena:**
```
mcp__serena__write_memory(
  "hls-rfc-8216-complete",
  "Complete HLS RFC 8216 documentation including..."
)
```

#### Step 1.3: Study Apple HLS Authoring Specification

**Resource:**
```
https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices
```

**What to document:**
- Apple-specific requirements beyond RFC 8216
- Recommended bitrate ladders
- Codec recommendations
- Resolution and frame rate guidelines
- Subtitle and caption requirements
- DRM (FairPlay) integration

**Save to Serena:**
```
mcp__serena__write_memory(
  "apple-hls-authoring-spec",
  "Apple's HLS authoring guidelines and recommendations..."
)
```

#### Step 1.4: Create HLS Validation Rule Set

**Document structure:**
```markdown
# HLS Validation Rules

## Master Playlist Rules

### REQUIRED Tags:
1. #EXTM3U (line 1)
   - Must be first line
   - No whitespace before
   - Error severity: ERROR if missing

2. #EXT-X-STREAM-INF (before each variant)
   - Required attributes: BANDWIDTH
   - Recommended attributes: CODECS, RESOLUTION
   - Error severity: ERROR if missing BANDWIDTH

### OPTIONAL Tags:
...

## Media Playlist Rules

### REQUIRED Tags:
1. #EXTM3U (line 1)
2. #EXTINF (before each segment)
   - Duration required
   - Format: #EXTINF:<duration>,<title>

### Version-Specific Validations:

#### Version 3+ Required:
- EXTINF duration can be float
- If float used: EXT-X-VERSION:3 or higher required

#### Version 4+ Required:
- If EXT-X-BYTERANGE used: Version 4+
- If EXT-X-I-FRAMES-ONLY used: Version 4+

...

## Codec String Validation

### H.264/AVC Format:
Pattern: `avc1.[profile-idc][constraint-flags][level-idc]`
Example: `avc1.640020`
Validation:
- Must start with "avc1."
- Followed by 6 hex digits
- Profile: 42=Baseline, 4D=Main, 64=High
- Level: 1F=3.1, 20=3.2, 28=4.0, 29=4.1, 2A=4.2

...
```

**This becomes the SOURCE OF TRUTH for implementing validation code.**

**Save to Serena:**
```
mcp__serena__write_memory(
  "hls-validation-rules-complete",
  "[3000+ line document with ALL HLS validation rules]"
)
```

### Deliverables

1. ✅ `hls-spec-knowledge.md` in Serena MCP (complete HLS understanding)
2. ✅ `apple-hls-tools-analysis.md` in Serena MCP (validator tool knowledge)
3. ✅ `hls-rfc-8216-complete.md` in Serena MCP (spec documentation)
4. ✅ `apple-hls-authoring-spec.md` in Serena MCP (Apple guidelines)
5. ✅ `hls-validation-rules-complete.md` in Serena MCP (validation rule set)

### Validation Gate 1.1: HLS Knowledge Verification

**Test your understanding:**

Can you answer these questions WITHOUT looking anything up?

1. What's the difference between a Master Playlist and Media Playlist?
2. What tags are REQUIRED in a Master Playlist?
3. What tags are REQUIRED in a Media Playlist?
4. What does EXT-X-VERSION:6 enable that version 5 doesn't?
5. How do you parse an H.264 codec string (avc1.640020)?
6. What's the format of EXTINF tag and what are valid values?
7. When is EXT-X-ENDLIST required vs optional?
8. What does EXT-X-INDEPENDENT-SEGMENTS mean?
9. How do you validate BANDWIDTH attribute values?
10. What are the rules for EXT-X-KEY (encryption)?

**Passing criteria:** Answer 10/10 correctly with specific details

**If FAIL:** Re-read spec, add more sequential thinking, retry

**If PASS:** Proceed to Phase 2

### Time Estimate

- Reading Apple HLS tools: 2-4 hours
- Reading RFC 8216: 4-6 hours
- Sequential thinking through spec: 3-5 hours
- Creating validation rule set: 3-4 hours
- Documenting to Serena MCP: 1-2 hours
- **Total:** 13-21 hours (spread over 2-3 sessions)

---

## PHASE 2: DASH SPECIFICATION MASTERY

**Sessions:** 2-3 (Sessions 4-5 for research, Session 6 for validation)
**Duration:** 2-3 days
**Prerequisites:** Phase 0-1 complete, git available for cloning

### Objectives

1. Achieve **complete understanding** of MPEG-DASH specification
2. Document MPD structure with all elements and attributes
3. Understand DASH-IF conformance validation rules
4. Document DASH profile differences (live, on-demand, main)
5. Create comprehensive validation rule set for implementation
6. Save all knowledge to Serena MCP

### Skills to Invoke

**At session start:**
- ✅ `session-context-priming` (mandatory)

**During research:**
- ✅ `systematic-debugging` (for complex spec sections)
- ✅ `mcp__sequential-thinking__sequentialthinking` (500+ thoughts for DASH spec)

### Detailed Steps

#### Step 2.1: Clone and Study DASH-IF Conformance

**Clone repository:**
```bash
cd /tmp
git clone https://github.com/Dash-Industry-Forum/DASH-IF-Conformance.git
cd DASH-IF-Conformance
```

**Use Serena MCP to analyze:**
```
mcp__serena__activate_project("/tmp/DASH-IF-Conformance")
mcp__serena__list_dir(".", recursive=true)
```

**Key files to read:**
- README.md (project overview)
- Validator source code (Python, study validation logic)
- Test vectors (examples of valid/invalid MPDs)
- Documentation on conformance rules

**What to extract:**
- How validator checks MPD structure
- Required elements and attributes
- Common validation errors
- Profile-specific rules
- Codec validation patterns

**Sequential thinking:**
Use 150+ thoughts to understand:
- Validator architecture
- How rules are implemented
- What triggers errors vs warnings
- How to port logic to JavaScript

**Save to Serena:**
```
mcp__serena__write_memory(
  "dash-if-conformance-analysis",
  "Complete analysis of DASH-IF Conformance validator including all rules..."
)
```

#### Step 2.2: Study MPEG-DASH ISO Specification

**Resource:**
```
ISO/IEC 23009-1 (MPEG-DASH standard)
```

**Public resources:**
- DASH-IF official documentation: https://dashif.org/guidelines/
- DASH specification overview papers
- MPEG-DASH tutorials and guides

**Use web search and fetch:**
```
mcp__tavily__tavily-search("MPEG-DASH ISO 23009-1 specification elements")
mcp__fetch__fetch("https://dashif.org/guidelines/", "Extract DASH specification details")
```

**What to document:**

**MPD Structure Hierarchy:**
```
MPD (Media Presentation Description)
├── Period (one or more)
│   ├── AdaptationSet (one or more per Period)
│   │   ├── Representation (one or more per AdaptationSet)
│   │   │   ├── SegmentTemplate OR
│   │   │   ├── SegmentList OR
│   │   │   └── SegmentBase
│   │   │       └── Segments (media chunks)
│   │   ├── ContentProtection (DRM)
│   │   └── Accessibility (subtitles, captions)
│   └── BaseURL (optional)
└── Attributes (type, mediaPresentationDuration, minBufferTime, etc.)
```

**Required MPD Attributes:**
- `type`: "static" (VOD) or "dynamic" (live)
- `mediaPresentationDuration`: Total duration (for static)
- `minBufferTime`: Minimum buffer required
- `profiles`: Profile identifier (urn:mpeg:dash:profile:isoff-live:2011, etc.)

**Required Period Elements:**
- At least one AdaptationSet
- Optional: `start` attribute, `duration` attribute

**Required AdaptationSet Attributes:**
- `mimeType`: video/mp4, audio/mp4, text/vtt, etc.
- OR `contentType`: video, audio, text
- `codecs`: Codec string

**Required Representation Attributes:**
- `id`: Unique identifier
- `bandwidth`: Bitrate in bps
- One of: SegmentTemplate, SegmentList, or SegmentBase

**Addressing Modes:**
1. **SegmentTemplate:** URL pattern with $Number$, $Time$, $RepresentationID$ variables
2. **SegmentList:** Explicit list of segment URLs
3. **SegmentBase:** Single-segment with byte ranges (indexRange)

**Codec Strings (same as HLS):**
- H.264: avc1.[profile][level]
- H.265: hvc1.[profile][level]
- VP9: vp09.

[...]
- AV1: av01.[...]
- AAC: mp4a.40.[object-type]

**DRM / ContentProtection:**
- Widevine: schemeIdUri="urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"
- PlayReady: schemeIdUri="urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95"
- FairPlay: schemeIdUri="urn:uuid:94ce86fb-07ff-4f43-adb8-93d2fa968ca2"

**Sequential thinking:**
Use 300+ thoughts to work through:
- MPD hierarchy and relationships
- How segments are addressed in each mode
- Profile differences and constraints
- Codec identification and validation
- DRM detection patterns

**Save to Serena:**
```
mcp__serena__write_memory(
  "dash-iso-spec-complete",
  "Complete MPEG-DASH ISO specification documentation..."
)
```

#### Step 2.3: Study DASH-IF Interoperability Guidelines

**Resource:**
```
https://dashif.org/guidelines/
```

**What to document:**
- Profile definitions (isoff-live, isoff-on-demand, isoff-main)
- Conformance requirements for each profile
- Recommended practices
- Common pitfalls
- Interoperability test vectors

**Save to Serena:**
```
mcp__serena__write_memory(
  "dash-if-iop-guidelines",
  "DASH-IF Interoperability Guidelines complete documentation..."
)
```

#### Step 2.4: Create DASH Validation Rule Set

**Document structure:**
```markdown
# DASH Validation Rules

## MPD-Level Validations

### REQUIRED Attributes:
1. type ("static" or "dynamic")
   - Error if missing
   - Error if invalid value

2. profiles (URN string)
   - Required for conformance
   - Must match known profile URN
   - Examples:
     - urn:mpeg:dash:profile:isoff-live:2011
     - urn:mpeg:dash:profile:isoff-on-demand:2011

3. minBufferTime (duration format)
   - Required
   - Format: PTnnn.nnnS (ISO 8601)
   - Must be > 0

### Profile-Specific Rules:

#### isoff-on-demand (VOD):
- Required: mediaPresentationDuration
- Required: All segments available immediately
- Forbidden: minimumUpdatePeriod

#### isoff-live (Live):
- Required: minimumUpdatePeriod (MPD refresh interval)
- Optional: mediaPresentationDuration
- Optional: timeShiftBufferDepth

## Period-Level Validations

### REQUIRED Elements:
1. At least one AdaptationSet
   - Error if no AdaptationSets

### Attribute Validations:
- start: Must be valid duration
- duration: Must be valid duration
- id: Must be unique within MPD

## AdaptationSet-Level Validations

### REQUIRED Attributes (one of):
- mimeType OR
- contentType

### Common Attributes:
- codecs: Must be valid codec string
- width/height: For video
- audioSamplingRate: For audio

## Representation-Level Validations

### REQUIRED Attributes:
1. id: Unique identifier
2. bandwidth: Bitrate in bps (must be positive integer)

### REQUIRED Elements (one of):
- SegmentTemplate OR
- SegmentList OR
- SegmentBase

### SegmentTemplate Validations:
- media: URL pattern with variables
- initialization: Init segment URL pattern
- timescale: Positive integer
- Variables: $Number$, $Time$, $RepresentationID$, $Bandwidth$

### SegmentList Validations:
- SegmentURL elements required
- Each SegmentURL must have media attribute

### SegmentBase Validations:
- Initialization element with sourceURL
- indexRange: "start-end" format

## Codec String Validation
[Same as HLS, repeated for completeness]

## ContentProtection Validation
- schemeIdUri: Must be valid UUID URN
- Known schemes: Widevine, PlayReady, FairPlay, ClearKey
- cenc:default_KID: UUID format

...
```

**This becomes 1000+ lines of detailed validation rules.**

**Save to Serena:**
```
mcp__serena__write_memory(
  "dash-validation-rules-complete",
  "[1000+ line document with ALL DASH validation rules]"
)
```

### Deliverables

1. ✅ `apple-hls-tools-analysis.md` in Serena MCP
2. ✅ `hls-rfc-8216-complete.md` in Serena MCP
3. ✅ `apple-hls-authoring-spec.md` in Serena MCP
4. ✅ `dash-if-conformance-analysis.md` in Serena MCP
5. ✅ `dash-iso-spec-complete.md` in Serena MCP
6. ✅ `dash-if-iop-guidelines.md` in Serena MCP
7. ✅ `dash-validation-rules-complete.md` in Serena MCP

### Validation Gate 2.1: DASH Knowledge Verification

**Test your understanding:**

Can you answer these WITHOUT looking anything up?

1. What's the difference between MPD type "static" vs "dynamic"?
2. What are the three addressing modes in DASH?
3. What's required in a SegmentTemplate?
4. How do you identify video vs audio AdaptationSet?
5. What's the difference between isoff-live and isoff-on-demand profiles?
6. How do you detect Widevine DRM in an MPD?
7. What's the format of mediaPresentationDuration attribute?
8. What's minimumUpdatePeriod and when is it required?
9. How many Periods can an MPD have?
10. What's the Purpose of indexRange in SegmentBase?

**Passing criteria:** Answer 10/10 correctly with specific details

**If FAIL:** Re-study spec, more sequential thinking, retry

**If PASS:** Proceed to Phase 3

### Time Estimate

- Clone and analyze DASH-IF Conformance: 3-4 hours
- Study MPEG-DASH spec: 5-7 hours
- Study DASH-IF IOP guidelines: 2-3 hours
- Sequential thinking (500+ thoughts): 4-6 hours
- Create validation rule set: 4-5 hours
- Document to Serena MCP: 2-3 hours
- **Total:** 20-28 hours (spread over 2-3 sessions)

---

## PHASE 3: CHROME EXTENSION API RESEARCH

**Sessions:** 1 (Session 7)
**Duration:** 1 day
**Prerequisites:** Phases 0-2 complete

### Objectives

1. Master `declarativeNetRequest` API for URL interception
2. Understand Manifest V3 redirect patterns
3. Learn how to preserve URL context during redirect
4. Research entry point detection techniques
5. Document Chrome extension URL interception patterns
6. Save patterns to Serena MCP

### Skills to Invoke

- ✅ `session-context-priming` (session start)
- ✅ Context7 for Chrome extension docs

### Detailed Steps

#### Step 3.1: Pull Chrome Extension Documentation

**Use Context7:**
```
mcp__Context7__get-library-docs(
  context7CompatibleLibraryID="/websites/developer_chrome_extensions",
  topic="declarativeNetRequest redirect manifest v3",
  mode="code"
)
```

**Focus areas:**
- declarativeNetRequest API
- Redirect action types
- URL pattern matching
- regexFilter and regexSubstitution
- Resource types (main_frame, sub_frame, xmlhttprequest)

#### Step 3.2: Study URL Interception Patterns

**Research questions:**
1. How to redirect .m3u8 URLs to extension viewer?
2. How to preserve original URL in redirect?
3. How to use regexSubstitution with capture groups?
4. What are limitations of declarativeNetRequest?
5. Can we intercept XHR/fetch requests? (Answer: Not in Manifest V3 main strategy)

**Example redirect rule to understand:**
```json
{
  "id": 1,
  "priority": 1,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "chrome-extension://EXTENSION_ID/src/viewer/viewer.html#\\0"
    }
  },
  "condition": {
    "regexFilter": "^https?://.*\\.m3u8.*$",
    "resourceTypes": ["main_frame"]
  }
}
```

**Questions to answer:**
- What does `\\0` mean in regexSubstitution? (Full match)
- Can we use capture groups? ((.*) and \\1)
- How to handle query parameters?
- How to URL-encode the original URL?

**Use web search:**
```
mcp__tavily__tavily-search(
  "Chrome extension declarativeNetRequest redirect examples manifest v3"
)
```

#### Step 3.3: Study Entry Point Detection

**Problem:** How to detect if user arrived via interception vs manual?

**Possible solutions:**

**Option A: URL parameter:**
```
Intercept: viewer.html#url&source=intercepted
Manual: viewer.html#url
```

**Option B: Referrer check:**
```javascript
const isIntercepted = !document.referrer.includes('chrome-extension');
```

**Option C: Storage flag:**
```javascript
// Service worker sets flag before redirect
chrome.storage.session.set({ entryPoint: 'interception' });

// Viewer checks flag
const { entryPoint } = await chrome.storage.session.get('entryPoint');
```

**Research and decide best approach.**

**Save to Serena:**
```
mcp__serena__write_memory(
  "chrome-extension-patterns",
  "Chrome extension URL interception patterns and techniques..."
)
```

#### Step 3.4: Study Existing Chrome Extensions That Intercept Files

**Examples to research:**
- PDF viewer extensions
- Markdown viewer extensions
- JSON viewer extensions

**What to learn:**
- How they implement URL interception
- How they handle file:// vs https:// URLs
- How they preserve original URL
- How they detect entry point

**Use GitHub search:**
```
mcp__github__search_code(
  q="declarativeNetRequest redirect extension:json"
)
```

**Save findings to Serena.**

### Deliverables

1. ✅ `chrome-extension-api-patterns.md` in Serena MCP
2. ✅ `declarative-net-request-guide.md` in Serena MCP
3. ✅ `url-interception-implementation-plan.md` in Serena MCP
4. ✅ `entry-point-detection-strategy.md` in Serena MCP

### Validation Gate 3.1: Chrome Extension Knowledge Check

**Can you answer:**

1. What Chrome API intercepts URL navigation in Manifest V3?
2. How do you write a redirect rule for *.m3u8 files?
3. What's the purpose of regexSubstitution?
4. How do you preserve the original URL in the redirect?
5. What resourceTypes can declarativeNetRequest intercept?
6. Can you intercept XHR/fetch with declarativeNetRequest? Why/why not?
7. How do you detect if viewer was opened via interception vs manual?
8. What's the format of chrome-extension:// URLs?

**Passing criteria:** Answer 8/8 correctly

**If PASS:** Proceed to Phase 4

### Time Estimate

- Pull and read Context7 docs: 1-2 hours
- Study declarativeNetRequest: 2-3 hours
- Research interception patterns: 2-3 hours
- Study existing extensions: 2 hours
- Document patterns: 2 hours
- **Total:** 9-12 hours (1 session)

---

## PHASE 4: WRITE COMPREHENSIVE SPECIFICATION DOCUMENT

**Sessions:** 2 (Sessions 8-9)
**Duration:** 2-3 days
**Prerequisites:** Phases 0-3 complete (all research done)

### Objectives

1. Write 3000+ line specification document
2. Document every feature in detail
3. Define all validation rules (HLS + DASH)
4. Specify all UI components and layouts
5. Define data models and APIs
6. Create implementation roadmap
7. Save to `docs/SPECIFICATION_V1.1.md`

### Skills to Invoke

- ✅ `session-context-priming` (session start)
- ✅ Sequential thinking for organization

### Document Structure

```markdown
# HLS + DASH Manifest Viewer v1.1 - Complete Specification

## Table of Contents
1. Project Overview
2. System Architecture
3. Feature Specifications
4. HLS Parsing and Validation
5. DASH Parsing and Validation
6. UI/UX Specifications
7. Data Models
8. API Definitions
9. Chrome Extension Integration
10. Functional Validation Procedures
11. Implementation Phases
12. Future Roadmap (v1.2+)

[3000+ lines of detailed specifications]
```

### Specification Sections

#### Section 1: Project Overview (200 lines)
- Vision and goals
- Target users
- Use cases
- Success criteria
- Constraints and limitations

#### Section 2: System Architecture (300 lines)
- Dual-mode system overview
- Component hierarchy
- State management (Zustand store extensions)
- Message passing architecture
- URL interception flow
- Entry point detection logic
- Mode switching mechanism

#### Section 3: Feature Specifications (400 lines)

**Spec Validator Mode Features:**
- Raw manifest display with line numbers
- Syntax highlighting (HLS tags, XML elements)
- Inline error/warning highlighting
- Validation sidebar with issue list
- Playlist type identification
- Feature detection display
- Segment availability checking
- Spec reference links

**Deep Analysis Mode Features:**
- All existing v1.0.0 features (20+ analysis tools)
- Mode toggle integration
- Data sharing between modes

#### Section 4: HLS Parsing and Validation (800 lines)

**Parsing Specifications:**
- Master playlist parsing rules
- Media playlist parsing rules
- Tag extraction methods
- Codec string parsing
- URL resolution logic

**Validation Specifications:**
- All validation rules from Phase 1 research
- Error vs warning criteria
- Severity levels
- Spec reference mapping
- Version-specific validations

**Example validation rule:**
```typescript
/**
 * HLS Validation Rule: EXTM3U_FIRST_LINE
 *
 * Rule: The first line of every HLS playlist MUST be #EXTM3U
 *
 * Spec Reference: RFC 8216 Section 4
 *
 * Severity: ERROR
 *
 * Implementation:
 * const lines = content.split('\n');
 * if (lines[0].trim() !== '#EXTM3U') {
 *   return {
 *     code: 'EXTM3U_FIRST_LINE',
 *     severity: 'error',
 *     line: 1,
 *     message: 'First line must be #EXTM3U',
 *     specReference: 'RFC 8216 § 4'
 *   };
 * }
 */
```

[Document ALL validation rules like this - 200+ rules]

#### Section 5: DASH Parsing and Validation (800 lines)

**Parsing Specifications:**
- XML parsing strategy
- MPD element extraction
- Period/AdaptationSet/Representation hierarchy
- Segment addressing mode detection
- ContentProtection parsing

**Validation Specifications:**
- All validation rules from Phase 2 research
- Schema compliance checks
- Profile-specific validations
- Attribute format validations

**Example validation rule:**
```typescript
/**
 * DASH Validation Rule: MPD_TYPE_REQUIRED
 *
 * Rule: MPD element MUST have 'type' attribute
 *
 * Spec Reference: ISO/IEC 23009-1 Section 5.3.1.2
 *
 * Severity: ERROR
 *
 * Valid Values: "static" | "dynamic"
 *
 * Implementation:
 * const mpdElement = parsedXML.getElementsByTagName('MPD')[0];
 * const type = mpdElement.getAttribute('type');
 * if (!type) {
 *   return {
 *     code: 'MPD_TYPE_REQUIRED',
 *     severity: 'error',
 *     element: 'MPD',
 *     message: 'MPD element must have type attribute',
 *     specReference: 'ISO/IEC 23009-1 § 5.3.1.2'
 *   };
 * }
 * if (type !== 'static' && type !== 'dynamic') {
 *   return {
 *     code: 'MPD_TYPE_INVALID',
 *     severity: 'error',
 *     element: 'MPD',
 *     message: `Invalid type "${type}". Must be "static" or "dynamic"`,
 *     specReference: 'ISO/IEC 23009-1 § 5.3.1.2'
 *   };
 * }
 */
```

[Document ALL validation rules - 200+ rules]

#### Section 6: UI/UX Specifications (400 lines)

**Spec Validator Mode Layout:**
```
┌────────────────────────────────────────────────────────┐
│ [Layout specification with exact dimensions]           │
│ [Color codes, fonts, spacing]                          │
│ [Interaction behaviors]                                │
│ [Accessibility requirements]                           │
└────────────────────────────────────────────────────────┘
```

**Component Specifications:**
- SpecValidatorView (container)
- RawManifestPanel (text display)
- ValidationSidebar (issues list)
- PlaylistTypeBadge (type indicator)
- FeatureDetectionList (features found)
- LineHighlighter (error/warning highlighting)
- SegmentAvailabilityDisplay (segment status)
- SpecReferenceLinkButton (spec links)

**For each component:**
- Props interface
- State requirements
- Render logic
- Event handlers
- Styling specifications

#### Section 7: Data Models (200 lines)

**TypeScript Interfaces:**

```typescript
// Extend existing ParsedManifest type
interface ParsedManifest {
  // ... existing fields from v1.0.0
  validation?: ValidationResult;  // NEW
  segmentAvailability?: SegmentAvailability;  // NEW
}

interface ValidationResult {
  compliant: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  playlistType?: 'master' | 'media' | 'mpd-static' | 'mpd-dynamic';
  detectedVersion?: string;  // HLS version or DASH profile
  detectedFeatures: string[];
}

interface ValidationIssue {
  code: string;  // EXTM3U_FIRST_LINE, MPD_TYPE_REQUIRED, etc.
  severity: 'error' | 'warning' | 'info';
  line?: number;  // Line number in manifest
  element?: string;  // MPD element name
  attribute?: string;  // Attribute name
  message: string;
  specReference: string;  // RFC 8216 § 4, ISO/IEC 23009-1 § 5.3.1.2
  specUrl?: string;  // Link to spec documentation
}

interface SegmentAvailability {
  checked: boolean;
  total: number;
  available: number;
  missing: number;
  segments: Map<string, SegmentStatus>;
}

interface SegmentStatus {
  url: string;
  available: boolean;
  statusCode?: number;
  error?: string;
  size?: number;
}

// Extend Zustand store
interface ManifestState {
  // ... existing v1.0.0 fields
  viewMode: 'spec' | 'analysis';  // NEW
  entryPoint: 'interception' | 'manual';  // NEW
  validationResults: ValidationResult | null;  // NEW
  segmentAvailability: SegmentAvailability | null;  // NEW
}
```

#### Section 8: API Definitions (200 lines)

**Validation APIs:**
```typescript
// HLS Validator
export function validateHLSCompliance(
  manifest: ParsedManifest
): ValidationResult;

// DASH Validator
export function validateDASHCompliance(
  manifest: ParsedManifest
): ValidationResult;

// Segment Checker
export async function checkSegmentAvailability(
  segments: string[]
): Promise<SegmentAvailability>;
```

#### Section 9: Chrome Extension Integration (200 lines)

**URL Interception Configuration:**
- manifest.json modifications
- declarativeNetRequest rules
- rules.json structure
- Permission requirements

**Entry Point Detection:**
- How viewer.tsx detects interception vs manual
- Default mode selection logic
- URL hash handling

#### Section 10: Functional Validation Procedures (300 lines)

**For each feature, define:**
1. How to test in Chrome
2. What to verify in DevTools
3. Screenshots to capture
4. Pass/fail criteria
5. Troubleshooting steps

**Example procedure:**
```
VALIDATION PROCEDURE: URL Interception

1. Build extension:
   npm run build

2. Load in Chrome:
   chrome://extensions → Load unpacked → dist/

3. Test automatic interception:
   a. Navigate to: https://devstreaming-cdn.apple.com/.../master.m3u8
   b. Expected: Extension intercepts, redirects to viewer
   c. Verify in address bar: URL changed to chrome-extension://...
   d. Verify viewer displays manifest in Spec mode
   e. Verify no console errors in DevTools

4. Screenshot:
   - Address bar showing extension URL
   - Viewer displaying manifest
   - DevTools console (should be clean)

5. Pass criteria:
   ✅ Redirect happens automatically
   ✅ Original URL preserved in hash
   ✅ Manifest loads and displays
   ✅ No JavaScript errors

6. If fails:
   - Check declarativeNetRequest rules
   - Verify permissions in manifest.json
   - Check console for errors
   - Debug and fix
   - Rebuild and retry
```

[Document procedures for ALL features - 30+ procedures]

#### Section 11: Implementation Phases (200 lines)

[Reference to phases 5-11 detailed in this plan]

#### Section 12: Future Roadmap (200 lines)

**v1.2 Features:**
- Media file codec validation (actual video/audio checking)
- Network performance analysis
- Comparative manifest analysis
- AI-powered optimization suggestions

### Deliverable

✅ `docs/SPECIFICATION_V1.1.md` (3000+ lines)
✅ Save summary to Serena: `specification-v1.1-complete.md`

### Validation Gate 4.1: Specification Completeness

**Checklist:**
- [ ] Every feature has detailed specification
- [ ] Every validation rule documented with code example
- [ ] Every UI component specified with props and behavior
- [ ] Every data model defined with TypeScript interfaces
- [ ] Functional validation procedures for all features
- [ ] Implementation phases clearly defined
- [ ] Spec references cited for all validation rules

**If all checked:** Proceed to Phase 5

### Time Estimate

- Structure and outline: 2 hours
- Write Section 1-3: 3-4 hours
- Write Section 4 (HLS): 6-8 hours
- Write Section 5 (DASH): 6-8 hours
- Write Section 6-10: 6-8 hours
- Review and polish: 2-3 hours
- **Total:** 25-33 hours (spread over 2 sessions)

---

## PHASE 5: URL INTERCEPTION IMPLEMENTATION

**Sessions:** 1 (Session 10)
**Duration:** 1 day
**Prerequisites:** Phases 0-4 complete, specification written

### Objectives

1. Implement declarativeNetRequest redirect rules
2. Add rules for .m3u8 and .mpd URL interception
3. Modify viewer.tsx to detect entry point
4. Set appropriate default mode based on entry point
5. Functional validation in Chrome browser

### Skills to Invoke

- ✅ `session-context-priming` (session start)
- ✅ `systematic-debugging` (if issues during implementation)

### Detailed Implementation Steps

#### Step 5.1: Modify manifest.json

**File:** `public/manifest.json`

**Changes:**

```json
{
  "manifest_version": 3,
  "name": "HLS + DASH Manifest Viewer Pro",
  "version": "1.1.0",  // ← BUMP version

  // ... existing fields ...

  "declarative_net_request": {
    "rule_resources": [
      {
        "id": "manifest_interception_rules",  // ← NEW
        "enabled": true,
        "path": "rules.json"
      }
    ]
  },

  "permissions": [
    "declarativeNetRequest",  // ← Already exists
    "declarativeNetRequestWithHostAccess",  // ← Verify exists
    // ... existing permissions ...
  ]
}
```

**Use Serena to read current manifest first:**
```
mcp__serena__read_file("public/manifest.json")
```

**Then edit:**
```
mcp__serena__replace_content(
  relative_path="public/manifest.json",
  needle="\"version\": \"1.0.0\"",
  repl="\"version\": \"1.1.0\"",
  mode="literal"
)
```

#### Step 5.2: Create rules.json

**File:** `public/rules.json`

**Content:**

```json
[
  {
    "id": 1,
    "priority": 1,
    "action": {
      "type": "redirect",
      "redirect": {
        "regexSubstitution": "chrome-extension://__MSG_@@extension_id__/src/viewer/viewer.html#\\0"
      }
    },
    "condition": {
      "regexFilter": "^https?://.*\\.m3u8(\\?.*)?$",
      "resourceTypes": ["main_frame"]
    }
  },
  {
    "id": 2,
    "priority": 1,
    "action": {
      "type": "redirect",
      "redirect": {
        "regexSubstitution": "chrome-extension://__MSG_@@extension_id__/src/viewer/viewer.html#\\0"
      }
    },
    "condition": {
      "regexFilter": "^https?://.*\\.mpd(\\?.*)?$",
      "resourceTypes": ["main_frame"]
    }
  }
]
```

**Explanation:**
- Rule 1: Intercepts .m3u8 URLs (with optional query params)
- Rule 2: Intercepts .mpd URLs (with optional query params)
- `\\0` = full matched URL
- `__MSG_@@extension_id__` = dynamic extension ID
- `main_frame` = only intercepts navigation (not XHR/fetch)

**Create file:**
```
mcp__serena__create_text_file(
  relative_path="public/rules.json",
  content="[... rules ...]"
)
```

#### Step 5.3: Modify viewer.tsx for Entry Point Detection

**File:** `src/viewer/viewer.tsx`

**Current code (find with Serena):**
```
mcp__serena__find_symbol(
  name_path="Viewer",
  relative_path="src/viewer/viewer.tsx",
  include_body=true
)
```

**Add entry point detection logic:**

```typescript
// src/viewer/viewer.tsx

import { useEffect, useState } from 'react';
import { useManifestStore } from '../store/manifest-store';

export function Viewer() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse hash to get manifest URL
    const hash = window.location.hash.substring(1);

    if (hash) {
      const manifestUrl = decodeURIComponent(hash);

      // Detect entry point
      // If no referrer or referrer is not extension popup/devtools → interception
      const referrer = document.referrer;
      const isFromExtension = referrer.includes('chrome-extension://') &&
                              (referrer.includes('popup.html') ||
                               referrer.includes('panel.html'));

      const entryPoint = isFromExtension ? 'manual' : 'interception';

      // Set entry point in store
      useManifestStore.getState().setEntryPoint(entryPoint);

      // Set default mode based on entry point
      const defaultMode = entryPoint === 'interception' ? 'spec' : 'analysis';
      useManifestStore.getState().setViewMode(defaultMode);

      // Load manifest (existing logic)
      loadManifest(manifestUrl);
    }

    setIsLoading(false);
  }, []);

  const viewMode = useManifestStore(state => state.viewMode);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render appropriate mode
  if (viewMode === 'spec') {
    return <SpecValidatorView />;
  } else {
    return (
      <>
        <ViewerHeader />
        {/* ... existing v1.0.0 view rendering ... */}
      </>
    );
  }
}
```

**Implementation approach:**

**Find current Viewer component:**
```
mcp__serena__read_file("src/viewer/viewer.tsx")
```

**Add entry point detection logic using Serena edit:**
```
mcp__serena__replace_content(
  relative_path="src/viewer/viewer.tsx",
  needle="useEffect(() => {\\s*const hash = window.location.hash",
  repl="useEffect(() => {\n    const hash = window.location.hash.substring(1);\n\n    if (hash) {\n      // Detect entry point\n      const referrer = document.referrer;\n      const isFromExtension = referrer.includes('chrome-extension://');\n      const entryPoint = isFromExtension ? 'manual' : 'interception';\n      \n      useManifestStore.getState().setEntryPoint(entryPoint);\n      const defaultMode = entryPoint === 'interception' ? 'spec' : 'analysis';\n      useManifestStore.getState().setViewMode(defaultMode);\n    }",
  mode="regex"
)
```

#### Step 5.4: Extend Zustand Store

**File:** `src/store/manifest-store.ts`

**Read current store:**
```
mcp__serena__read_file("src/store/manifest-store.ts")
```

**Add new state fields:**

```typescript
interface ManifestState {
  // Existing v1.0.0 fields
  manifest: ParsedManifest | null;
  loading: boolean;
  error: string | null;
  selectedView: 'raw' | 'structured' | 'timeline';
  selectedVariantId: string | null;

  // NEW fields for v1.1.0
  viewMode: 'spec' | 'analysis';
  entryPoint: 'interception' | 'manual';
  validationResults: ValidationResult | null;
  segmentAvailability: SegmentAvailability | null;

  // NEW actions
  setViewMode: (mode: 'spec' | 'analysis') => void;
  setEntryPoint: (entry: 'interception' | 'manual') => void;
  setValidationResults: (results: ValidationResult) => void;
  setSegmentAvailability: (availability: SegmentAvailability) => void;
}
```

**Implement with Serena:**
```
mcp__serena__insert_after_symbol(
  name_path="ManifestState",
  relative_path="src/store/manifest-store.ts",
  body="  viewMode: 'spec' | 'analysis';\n  entryPoint: 'interception' | 'manual';\n  validationResults: ValidationResult | null;\n  segmentAvailability: SegmentAvailability | null;"
)
```

### Deliverables

1. ✅ `public/manifest.json` updated (version 1.1.0, permissions verified)
2. ✅ `public/rules.json` created (interception rules)
3. ✅ `src/viewer/viewer.tsx` modified (entry point detection)
4. ✅ `src/store/manifest-store.ts` extended (new state fields)
5. ✅ `src/types/manifest.ts` extended (new interfaces)

### Functional Validation Gate 5.1: URL Interception Works

**CRITICAL: Test in real Chrome browser**

**Step 1: Build extension**
```bash
cd /Users/nick/Desktop/hls-dash-dev-chrome-extension
npm run build
```

**Expected output:**
- Build succeeds
- dist/ directory created
- rules.json present in dist/

**Step 2: Load in Chrome**
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `dist/` folder
5. Verify extension loads without errors

**Step 3: Test .m3u8 interception**
1. In Chrome address bar, navigate to:
   ```
   https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8
   ```

2. **Expected behavior:**
   - URL should redirect to: `chrome-extension://[id]/src/viewer/viewer.html#https%3A%2F%2Fdevstreaming...`
   - Viewer should open automatically
   - Manifest should load

3. **Verify in DevTools:**
   - Open DevTools (F12)
   - Console tab: Should show no errors
   - Check console for: `entryPoint: 'interception'` log (if we add it)
   - Elements tab: Verify viewer HTML rendered

4. **Take screenshot:**
   - Full browser window showing:
     - Address bar with chrome-extension:// URL
     - Viewer displaying manifest
     - DevTools console clean

**Step 4: Test .mpd interception**
1. Navigate to:
   ```
   https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd
   ```

2. **Expected:** Same redirection behavior for DASH

3. **Verify same checks as Step 3**

**Step 5: Test manual loading still works**
1. Click extension icon
2. Click "Open Full Viewer"
3. Paste URL
4. Click Load
5. **Expected:** Opens in analysis mode (not spec mode)
6. **Verify:** `entryPoint: 'manual'` in store

**Screenshot all validation steps**

**Save validation results:**
```
mcp__serena__write_memory(
  "phase-5-validation-results",
  "URL Interception validation complete:
  - .m3u8 interception: PASS/FAIL with screenshot evidence
  - .mpd interception: PASS/FAIL with screenshot evidence
  - Manual loading: PASS/FAIL
  - Entry point detection: PASS/FAIL
  ..."
)
```

**Passing criteria:**
✅ .m3u8 URLs auto-redirect to viewer
✅ .mpd URLs auto-redirect to viewer
✅ Original URL preserved in hash
✅ Entry point correctly detected ('interception')
✅ Manual loading still works and sets entry point='manual'
✅ Zero console errors

**If ANY fail:** Debug, fix, rebuild, retest

**If ALL pass:** Proceed to Phase 6

### Time Estimate

- Read current code files: 1 hour
- Implement changes: 3-4 hours
- Build and test: 2-3 hours
- Debug issues: 2-4 hours
- Documentation: 1 hour
- **Total:** 9-13 hours (1 session)

---

## PHASE 6: HLS SPEC VALIDATOR IMPLEMENTATION

**Sessions:** 2-3 (Sessions 11-13)
**Duration:** 2-3 days
**Prerequisites:** Phases 0-5 complete, HLS spec knowledge in Serena MCP

### Objectives

1. Implement HLS spec compliance validator
2. Create all validation rules from Phase 1 research
3. Validate master playlists against HLS spec
4. Validate media playlists against HLS spec
5. Functional testing with compliant and non-compliant manifests

### Skills to Invoke

- ✅ `session-context-priming` (session start)
- ✅ `systematic-debugging` (during implementation)
- ✅ Read Serena memory: `hls-validation-rules-complete`

### Detailed Implementation Steps

#### Step 6.1: Create HLS Validation Types

**File:** `src/types/validation.ts` (new file)

```typescript
export interface ValidationResult {
  compliant: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  playlistType: 'master' | 'media';
  hlsVersion?: number;
  detectedFeatures: HLSFeature[];
  checkedRules: string[];  // Which rules were checked
  timestamp: string;
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  tag?: string;
  attribute?: string;
  message: string;
  specReference: string;
  specUrl?: string;
  suggestion?: string;
}

export interface HLSFeature {
  name: string;
  version: number;  // Minimum HLS version required
  detected: boolean;
  tag?: string;  // Which tag indicates this feature
}
```

**Create file:**
```
mcp__serena__create_text_file(
  relative_path="src/types/validation.ts",
  content="[... types ...]"
)
```

#### Step 6.2: Implement HLS Validation Rules

**File:** `src/lib/validation/hls-spec-rules.ts` (new file)

**Structure:**

```typescript
import type { ValidationIssue, HLSFeature } from '../../types/validation';

/**
 * HLS Validation Rule: EXTM3U must be first line
 */
export function validateEXTM3UFirstLine(content: string): ValidationIssue | null {
  const lines = content.trim().split('\n');
  const firstLine = lines[0]?.trim();

  if (firstLine !== '#EXTM3U') {
    return {
      code: 'EXTM3U_FIRST_LINE',
      severity: 'error',
      line: 1,
      message: 'First line must be #EXTM3U',
      specReference: 'RFC 8216 § 4',
      specUrl: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4',
      suggestion: 'Add #EXTM3U as the first line of the playlist'
    };
  }

  return null;
}

/**
 * HLS Validation Rule: Master playlist must have EXT-X-STREAM-INF
 */
export function validateMasterPlaylistHasVariants(
  content: string,
  playlistType: 'master' | 'media'
): ValidationIssue | null {
  if (playlistType !== 'master') return null;

  if (!content.includes('#EXT-X-STREAM-INF')) {
    return {
      code: 'MASTER_NO_VARIANTS',
      severity: 'error',
      message: 'Master playlist must contain at least one EXT-X-STREAM-INF tag',
      specReference: 'RFC 8216 § 4.3.4.2',
      specUrl: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2',
      suggestion: 'Add EXT-X-STREAM-INF tags for variant streams'
    };
  }

  return null;
}

/**
 * HLS Validation Rule: BANDWIDTH attribute required in EXT-X-STREAM-INF
 */
export function validateStreamInfBandwidth(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      if (!line.includes('BANDWIDTH=')) {
        issues.push({
          code: 'STREAM_INF_BANDWIDTH_REQUIRED',
          severity: 'error',
          line: index + 1,
          tag: 'EXT-X-STREAM-INF',
          attribute: 'BANDWIDTH',
          message: 'EXT-X-STREAM-INF must include BANDWIDTH attribute',
          specReference: 'RFC 8216 § 4.3.4.2',
          specUrl: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2'
        });
      }
    }
  });

  return issues;
}

/**
 * HLS Validation Rule: CODECS attribute recommended
 */
export function validateStreamInfCodecs(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      if (!line.includes('CODECS=')) {
        issues.push({
          code: 'STREAM_INF_CODECS_RECOMMENDED',
          severity: 'warning',
          line: index + 1,
          tag: 'EXT-X-STREAM-INF',
          attribute: 'CODECS',
          message: 'EXT-X-STREAM-INF should include CODECS attribute for better compatibility',
          specReference: 'RFC 8216 § 4.3.4.2',
          suggestion: 'Add CODECS attribute with video and audio codec strings'
        });
      }
    }
  });

  return issues;
}

/**
 * HLS Validation Rule: EXTINF required before each segment
 */
export function validateMediaPlaylistSegments(
  content: string,
  playlistType: 'master' | 'media'
): ValidationIssue[] {
  if (playlistType !== 'media') return [];

  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');
  let lastEXTINFLine = -1;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // If line is a segment URL (not a tag, not empty)
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('.')) {
      // Check if previous tag was EXTINF
      if (lastEXTINFLine !== index - 1) {
        issues.push({
          code: 'SEGMENT_MISSING_EXTINF',
          severity: 'error',
          line: index + 1,
          message: 'Media segment must be preceded by #EXTINF tag',
          specReference: 'RFC 8216 § 4.3.2.1',
          suggestion: 'Add #EXTINF:<duration>,<title> before this segment URL'
        });
      }
    }

    if (trimmed.startsWith('#EXTINF')) {
      lastEXTINFLine = index;
    }
  });

  return issues;
}

/**
 * HLS Validation Rule: Version compatibility
 */
export function validateVersionCompatibility(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Extract declared version
  const versionMatch = content.match(/#EXT-X-VERSION:(\d+)/);
  const declaredVersion = versionMatch ? parseInt(versionMatch[1]) : 1;

  // Check for features that require specific versions
  const featureRequirements: { pattern: RegExp; tag: string; minVersion: number }[] = [
    { pattern: /#EXTINF:[0-9]+\.[0-9]+/, tag: 'EXTINF (float)', minVersion: 3 },
    { pattern: /#EXT-X-BYTERANGE/, tag: 'EXT-X-BYTERANGE', minVersion: 4 },
    { pattern: /#EXT-X-I-FRAMES-ONLY/, tag: 'EXT-X-I-FRAMES-ONLY', minVersion: 4 },
    { pattern: /#EXT-X-MAP/, tag: 'EXT-X-MAP', minVersion: 5 },
    { pattern: /#EXT-X-INDEPENDENT-SEGMENTS/, tag: 'EXT-X-INDEPENDENT-SEGMENTS', minVersion: 6 },
    { pattern: /#EXT-X-START/, tag: 'EXT-X-START', minVersion: 6 },
    { pattern: /#EXT-X-PART/, tag: 'EXT-X-PART', minVersion: 7 },
  ];

  featureRequirements.forEach(({ pattern, tag, minVersion }) => {
    if (pattern.test(content) && declaredVersion < minVersion) {
      const match = content.match(pattern);
      const lineNumber = content.substring(0, match?.index).split('\n').length;

      issues.push({
        code: 'VERSION_FEATURE_MISMATCH',
        severity: 'error',
        line: lineNumber,
        tag,
        message: `${tag} requires HLS version ${minVersion}+, but version ${declaredVersion} is declared`,
        specReference: `RFC 8216 § 7`,
        suggestion: `Change EXT-X-VERSION to ${minVersion} or remove ${tag}`
      });
    }
  });

  return issues;
}

/**
 * HLS Validation Rule: Codec string format validation
 */
export function validateCodecStrings(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const codecPattern = /CODECS="([^"]+)"/g;
  let match;

  while ((match = codecPattern.exec(content)) !== null) {
    const codecs = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;

    // Validate each codec in the list
    const codecList = codecs.split(',').map(c => c.trim());

    codecList.forEach(codec => {
      const issues = validateSingleCodec(codec, lineNumber);
      if (issue) {
        issues.push(issue);
      }
    });
  }

  return issues;
}

function validateSingleCodec(codec: string, lineNumber: number): ValidationIssue | null {
  // H.264 validation
  if (codec.startsWith('avc1.')) {
    const suffix = codec.substring(5);
    if (!/^[0-9A-Fa-f]{6}$/.test(suffix)) {
      return {
        code: 'INVALID_H264_CODEC_STRING',
        severity: 'error',
        line: lineNumber,
        message: `Invalid H.264 codec string: "${codec}". Expected format: avc1.[6 hex digits]`,
        specReference: 'RFC 6381 § 3.3',
        suggestion: 'Use correct format like avc1.640020 for High Profile Level 3.2'
      };
    }
  }

  // H.265 validation
  if (codec.startsWith('hvc1.') || codec.startsWith('hev1.')) {
    // Validate HEVC format
    // [Implementation based on spec]
  }

  // AAC validation
  if (codec.startsWith('mp4a.40.')) {
    const objectType = codec.substring(8);
    if (!/^[0-9]+$/.test(objectType)) {
      return {
        code: 'INVALID_AAC_CODEC_STRING',
        severity: 'error',
        line: lineNumber,
        message: `Invalid AAC codec string: "${codec}"`,
        specReference: 'RFC 6381 § 3.3'
      };
    }
  }

  return null;
}

// ... IMPLEMENT ALL VALIDATION RULES FROM hls-validation-rules-complete memory
// This file becomes 500-800 lines with all rules implemented
```

#### Step 6.3: Implement HLS Validator Main Function

**File:** `src/lib/validation/hls-spec-validator.ts` (new file)

```typescript
import type { ParsedManifest } from '../../types/manifest';
import type { ValidationResult, ValidationIssue } from '../../types/validation';
import * as rules from './hls-spec-rules';

/**
 * Validate HLS manifest against specification
 *
 * Runs all validation rules and returns comprehensive results
 *
 * @param manifest - Parsed HLS manifest
 * @param rawContent - Original manifest text (for line number references)
 * @returns ValidationResult with all issues found
 */
export function validateHLSCompliance(
  manifest: ParsedManifest,
  rawContent: string
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  // Detect playlist type
  const playlistType = detectPlaylistType(rawContent);

  // Run all validation rules
  const allIssues: ValidationIssue[] = [
    rules.validateEXTM3UFirstLine(rawContent),
    rules.validateMasterPlaylistHasVariants(rawContent, playlistType),
    ...rules.validateStreamInfBandwidth(rawContent),
    ...rules.validateStreamInfCodecs(rawContent),
    ...rules.validateMediaPlaylistSegments(rawContent, playlistType),
    ...rules.validateVersionCompatibility(rawContent),
    ...rules.validateCodecStrings(rawContent),
    // ... call ALL rule functions
  ].filter(issue => issue !== null);

  // Categorize by severity
  allIssues.forEach(issue => {
    if (issue.severity === 'error') errors.push(issue);
    else if (issue.severity === 'warning') warnings.push(issue);
    else info.push(issue);
  });

  // Detect HLS version
  const versionMatch = rawContent.match(/#EXT-X-VERSION:(\d+)/);
  const hlsVersion = versionMatch ? parseInt(versionMatch[1]) : 1;

  // Detect features in use
  const detectedFeatures = detectHLSFeatures(rawContent, hlsVersion);

  return {
    compliant: errors.length === 0,
    errors,
    warnings,
    info,
    playlistType,
    hlsVersion,
    detectedFeatures,
    checkedRules: getAllRuleNames(),
    timestamp: new Date().toISOString()
  };
}

function detectPlaylistType(content: string): 'master' | 'media' {
  // Master playlist has EXT-X-STREAM-INF
  if (content.includes('#EXT-X-STREAM-INF')) {
    return 'master';
  }

  // Media playlist has EXTINF
  if (content.includes('#EXTINF')) {
    return 'media';
  }

  // Default to master if ambiguous
  return 'master';
}

function detectHLSFeatures(content: string, version: number): HLSFeature[] {
  const features: HLSFeature[] = [];

  // Define feature detection patterns
  const featurePatterns: { name: string; pattern: RegExp; minVersion: number; tag: string }[] = [
    {
      name: 'Independent Segments',
      pattern: /#EXT-X-INDEPENDENT-SEGMENTS/,
      minVersion: 6,
      tag: 'EXT-X-INDEPENDENT-SEGMENTS'
    },
    {
      name: 'Byte Range Support',
      pattern: /#EXT-X-BYTERANGE/,
      minVersion: 4,
      tag: 'EXT-X-BYTERANGE'
    },
    {
      name: 'I-Frame Playlists',
      pattern: /#EXT-X-I-FRAMES-ONLY/,
      minVersion: 4,
      tag: 'EXT-X-I-FRAMES-ONLY'
    },
    {
      name: 'Initialization Segments',
      pattern: /#EXT-X-MAP/,
      minVersion: 5,
      tag: 'EXT-X-MAP'
    },
    {
      name: 'Low Latency (LL-HLS)',
      pattern: /#EXT-X-PART/,
      minVersion: 7,
      tag: 'EXT-X-PART'
    },
    {
      name: 'Preload Hints',
      pattern: /#EXT-X-PRELOAD-HINT/,
      minVersion: 7,
      tag: 'EXT-X-PRELOAD-HINT'
    },
    {
      name: 'Encryption (AES-128)',
      pattern: /#EXT-X-KEY:METHOD=AES-128/,
      minVersion: 1,
      tag: 'EXT-X-KEY'
    },
    {
      name: 'Encryption (SAMPLE-AES)',
      pattern: /#EXT-X-KEY:METHOD=SAMPLE-AES/,
      minVersion: 5,
      tag: 'EXT-X-KEY'
    },
  ];

  featurePatterns.forEach(({ name, pattern, minVersion, tag }) => {
    const detected = pattern.test(content);

    features.push({
      name,
      version: minVersion,
      detected,
      tag
    });
  });

  return features;
}

function getAllRuleNames(): string[] {
  return [
    'EXTM3U_FIRST_LINE',
    'MASTER_NO_VARIANTS',
    'STREAM_INF_BANDWIDTH_REQUIRED',
    'STREAM_INF_CODECS_RECOMMENDED',
    'SEGMENT_MISSING_EXTINF',
    'VERSION_FEATURE_MISMATCH',
    'INVALID_H264_CODEC_STRING',
    'INVALID_HEVC_CODEC_STRING',
    'INVALID_AAC_CODEC_STRING',
    // ... ALL rule codes
  ];
}
```

**Implementation notes:**
- Each validation rule is a separate function (testable, maintainable)
- Rules return `null` if passing, `ValidationIssue` if failing
- Main validator collects all issues
- Clear spec references for every rule

**This file will be 800-1200 lines implementing ALL HLS validation rules.**

#### Step 6.4: Integrate Validator into Parser

**File:** `src/lib/parsers/index.ts`

**Modify parseManifest to include validation:**

```typescript
import { validateHLSCompliance } from '../validation/hls-spec-validator';

export function parseManifest(content: string, url: string): ParsedManifest {
  const format = detectManifestFormat(content);

  let parsed: ParsedManifest;

  if (format === 'hls') {
    parsed = parseHLS(content, url);

    // Run HLS validation
    const validation = validateHLSCompliance(parsed, content);
    parsed.validation = validation;

  } else if (format === 'dash') {
    parsed = parseDASH(content, url);

    // DASH validation will be added in Phase 7
  } else {
    throw new Error(`Unknown manifest format`);
  }

  return parsed;
}
```

### Deliverables

1. ✅ `src/types/validation.ts` (validation types)
2. ✅ `src/lib/validation/hls-spec-rules.ts` (800-1200 lines of rules)
3. ✅ `src/lib/validation/hls-spec-validator.ts` (main validator, 200-300 lines)
4. ✅ `src/lib/parsers/index.ts` modified (validation integration)
5. ✅ Save to Serena: `phase-6-implementation-complete.md`

### Functional Validation Gate 6.1: HLS Validator Works

**CRITICAL: Test in Chrome browser with real manifests**

**Test 1: Compliant HLS Master Playlist**

1. Build: `npm run build`
2. Reload extension in Chrome
3. Navigate to: `https://devstreaming-cdn.apple.com/.../bipbop_16x9_variant.m3u8`
4. **Expected:**
   - Viewer opens (interception works)
   - Console log shows: `validation: { compliant: true, errors: [], ... }`
   - If we add debug UI: See "✅ SPEC COMPLIANT"

5. **Verify in DevTools Console:**
   ```javascript
   // In console, check store:
   window.__ZUSTAND_STORE__.getState().manifest.validation
   // Should show: { compliant: true, errors: [], warnings: [...], ... }
   ```

6. Screenshot: Console showing validation results

**Test 2: Non-Compliant HLS (Create Test Case)**

Create test file: `/tmp/invalid-hls.m3u8`
```
EXT-X-VERSION:6
#EXT-X-STREAM-INF:CODECS="avc1.640020"
stream.m3u8
```

Issues:
- Missing #EXTM3U on first line
- Missing BANDWIDTH attribute

1. Serve via local HTTP: `npx http-server /tmp -p 9999 --cors`
2. Navigate to: `http://localhost:9999/invalid-hls.m3u8`
3. **Expected:**
   - Viewer opens
   - Validation shows 2 errors
   - Console shows error objects

4. **Verify in Console:**
   ```javascript
   window.__ZUSTAND_STORE__.getState().manifest.validation.errors
   // Should show:
   // [
   //   { code: 'EXTM3U_FIRST_LINE', severity: 'error', line: 1, ... },
   //   { code: 'STREAM_INF_BANDWIDTH_REQUIRED', severity: 'error', line: 2, ... }
   // ]
   ```

5. Screenshot: Console showing errors detected

**Test 3: Version Mismatch**

Create: `/tmp/version-mismatch.m3u8`
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:BANDWIDTH=1000000
stream.m3u8
```

Issue: EXT-X-INDEPENDENT-SEGMENTS requires version 6, but version 3 declared

1. Navigate to this manifest
2. **Expected:** Error detected about version mismatch
3. **Verify error code:** VERSION_FEATURE_MISMATCH

**Test 4: Invalid Codec String**

Create: `/tmp/invalid-codec.m3u8`
```
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=1000000,CODECS="invalid"
stream.m3u8
```

1. Navigate to this manifest
2. **Expected:** Error about invalid codec string format

**Create test manifest suite:**
- 10 compliant HLS manifests (should have 0 errors)
- 10 non-compliant HLS manifests (should detect specific errors)

**Document ALL test results in Serena:**
```
mcp__serena__write_memory(
  "phase-6-validation-results",
  "HLS Validator functional testing results:
  - Compliant manifests: 10/10 passed
  - Non-compliant detection: 10/10 errors found
  - Version mismatch detection: PASS
  - Codec validation: PASS
  ..."
)
```

**Passing criteria:**
✅ Compliant manifests show `compliant: true, errors: []`
✅ All intentional errors detected correctly
✅ Correct line numbers reported
✅ Spec references present
✅ Feature detection accurate
✅ Version compatibility checking works
✅ Codec string validation functional

**If ANY fail:**
- Debug in Chrome DevTools Console
- Add console.log to validator code
- Fix validation logic
- Rebuild
- Retest

**If ALL pass:** Save evidence to Serena, proceed to Phase 7

### Time Estimate

- Create validation types: 1-2 hours
- Implement HLS validation rules (50+ rules): 10-12 hours
- Implement main validator: 3-4 hours
- Integration with parser: 2 hours
- Functional testing in Chrome: 4-6 hours
- Debug and fixes: 3-5 hours
- Documentation: 2 hours
- **Total:** 25-33 hours (2-3 sessions)

---

## PHASE 7: DASH SPEC VALIDATOR IMPLEMENTATION

**Sessions:** 2-3 (Sessions 14-16)
**Duration:** 2-3 days
**Prerequisites:** Phases 0-6 complete, DASH spec knowledge in Serena MCP

### Objectives

Same as Phase 6, but for DASH:

1. Implement DASH spec compliance validator
2. Create all validation rules from Phase 2 research
3. Validate MPD structure against DASH spec
4. Functional testing with compliant and non-compliant MPDs

### Skills to Invoke

- ✅ `session-context-priming`
- ✅ `systematic-debugging`
- ✅ Read Serena: `dash-validation-rules-complete`

### Detailed Implementation Steps

#### Step 7.1: Implement DASH Validation Rules

**File:** `src/lib/validation/dash-spec-rules.ts` (new file)

**Similar structure to HLS rules, but for DASH:**

```typescript
import type { ValidationIssue } from '../../types/validation';

/**
 * DASH Validation Rule: MPD type attribute required
 */
export function validateMPDType(xmlContent: string): ValidationIssue | null {
  const typeMatch = xmlContent.match(/<MPD[^>]*type="([^"]+)"/);

  if (!typeMatch) {
    return {
      code: 'MPD_TYPE_REQUIRED',
      severity: 'error',
      element: 'MPD',
      attribute: 'type',
      message: 'MPD element must have type attribute ("static" or "dynamic")',
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Add type="static" for VOD or type="dynamic" for live'
    };
  }

  const type = typeMatch[1];
  if (type !== 'static' && type !== 'dynamic') {
    return {
      code: 'MPD_TYPE_INVALID',
      severity: 'error',
      element: 'MPD',
      attribute: 'type',
      message: `Invalid MPD type "${type}". Must be "static" or "dynamic"`,
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2'
    };
  }

  return null;
}

/**
 * DASH Validation Rule: minBufferTime required and valid format
 */
export function validateMinBufferTime(xmlContent: string): ValidationIssue | null {
  const minBufferMatch = xmlContent.match(/minBufferTime="([^"]+)"/);

  if (!minBufferMatch) {
    return {
      code: 'MIN_BUFFER_TIME_REQUIRED',
      severity: 'error',
      element: 'MPD',
      attribute: 'minBufferTime',
      message: 'MPD must have minBufferTime attribute',
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Add minBufferTime="PT2.0S" or similar'
    };
  }

  const minBuffer = minBufferMatch[1];

  // Validate ISO 8601 duration format: PTnnn.nnnS
  if (!/^PT[\d.]+S$/.test(minBuffer)) {
    return {
      code: 'MIN_BUFFER_TIME_INVALID_FORMAT',
      severity: 'error',
      element: 'MPD',
      attribute: 'minBufferTime',
      message: `Invalid minBufferTime format: "${minBuffer}". Must be ISO 8601 duration (e.g., PT2.0S)`,
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Use format PTnnn.nnnS (e.g., PT2.0S for 2 seconds)'
    };
  }

  return null;
}

/**
 * DASH Validation Rule: At least one Period required
 */
export function validatePeriodExists(xmlContent: string): ValidationIssue | null {
  if (!xmlContent.includes('<Period')) {
    return {
      code: 'PERIOD_REQUIRED',
      severity: 'error',
      element: 'MPD',
      message: 'MPD must contain at least one Period element',
      specReference: 'ISO/IEC 23009-1 § 5.3.2',
      suggestion: 'Add <Period> element with AdaptationSets'
    };
  }

  return null;
}

/**
 * DASH Validation Rule: AdaptationSet must have mimeType or contentType
 */
export function validateAdaptationSetType(xmlContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find all AdaptationSet tags
  const adaptationSetPattern = /<AdaptationSet[^>]*>/g;
  let match;

  while ((match = adaptationSetPattern.exec(xmlContent)) !== null) {
    const tag = match[0];

    if (!tag.includes('mimeType=') && !tag.includes('contentType=')) {
      issues.push({
        code: 'ADAPTATION_SET_TYPE_REQUIRED',
        severity: 'error',
        element: 'AdaptationSet',
        message: 'AdaptationSet must have either mimeType or contentType attribute',
        specReference: 'ISO/IEC 23009-1 § 5.3.3',
        suggestion: 'Add mimeType="video/mp4" or contentType="video"'
      });
    }
  }

  return issues;
}

/**
 * DASH Validation Rule: Representation must have id and bandwidth
 */
export function validateRepresentationAttributes(xmlContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const repPattern = /<Representation[^>]*>/g;
  let match;

  while ((match = repPattern.exec(xmlContent)) !== null) {
    const tag = match[0];

    if (!tag.includes('id=')) {
      issues.push({
        code: 'REPRESENTATION_ID_REQUIRED',
        severity: 'error',
        element: 'Representation',
        attribute: 'id',
        message: 'Representation must have id attribute',
        specReference: 'ISO/IEC 23009-1 § 5.3.5',
        suggestion: 'Add id="1" or similar unique identifier'
      });
    }

    if (!tag.includes('bandwidth=')) {
      issues.push({
        code: 'REPRESENTATION_BANDWIDTH_REQUIRED',
        severity: 'error',
        element: 'Representation',
        attribute: 'bandwidth',
        message: 'Representation must have bandwidth attribute',
        specReference: 'ISO/IEC 23009-1 § 5.3.5',
        suggestion: 'Add bandwidth="1000000" (bitrate in bps)'
      });
    }
  }

  return issues;
}

/**
 * DASH Validation Rule: Profile-specific validations
 */
export function validateProfileRequirements(xmlContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const profileMatch = xmlContent.match(/profiles="([^"]+)"/);
  if (!profileMatch) {
    return [{
      code: 'PROFILES_REQUIRED',
      severity: 'error',
      element: 'MPD',
      attribute: 'profiles',
      message: 'MPD must have profiles attribute',
      specReference: 'ISO/IEC 23009-1 § 5.3.1.2',
      suggestion: 'Add profiles="urn:mpeg:dash:profile:isoff-live:2011" or similar'
    }];
  }

  const profile = profileMatch[1];
  const typeMatch = xmlContent.match(/type="([^"]+)"/);
  const type = typeMatch ? typeMatch[1] : null;

  // isoff-on-demand profile requirements
  if (profile.includes('isoff-on-demand')) {
    if (type !== 'static') {
      issues.push({
        code: 'PROFILE_TYPE_MISMATCH',
        severity: 'error',
        element: 'MPD',
        message: 'isoff-on-demand profile requires type="static"',
        specReference: 'DASH-IF IOP § 3.2.2',
        suggestion: 'Change type to "static" or use different profile'
      });
    }

    if (!xmlContent.includes('mediaPresentationDuration=')) {
      issues.push({
        code: 'ON_DEMAND_DURATION_REQUIRED',
        severity: 'error',
        element: 'MPD',
        attribute: 'mediaPresentationDuration',
        message: 'isoff-on-demand profile requires mediaPresentationDuration',
        specReference: 'DASH-IF IOP § 3.2.2',
        suggestion: 'Add mediaPresentationDuration="PT634.566S"'
      });
    }
  }

  // isoff-live profile requirements
  if (profile.includes('isoff-live')) {
    if (type === 'static' && !xmlContent.includes('minimumUpdatePeriod=')) {
      // Dynamic live should have minimumUpdatePeriod
      // Static can optionally have it for refreshing
    }
  }

  return issues;
}

// ... IMPLEMENT ALL DASH VALIDATION RULES
// This file becomes 1000-1500 lines
```

#### Step 7.2: Implement DASH Validator Main Function

**File:** `src/lib/validation/dash-spec-validator.ts` (new file)

```typescript
import type { ParsedManifest } from '../../types/manifest';
import type { ValidationResult } from '../../types/validation';
import * as rules from './dash-spec-rules';

export function validateDASHCompliance(
  manifest: ParsedManifest,
  rawContent: string
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  // Detect MPD type
  const mpdType = detectMPDType(rawContent);

  // Run all DASH validation rules
  const allIssues: ValidationIssue[] = [
    rules.validateMPDType(rawContent),
    rules.validateMinBufferTime(rawContent),
    rules.validatePeriodExists(rawContent),
    ...rules.validateAdaptationSetType(rawContent),
    ...rules.validateRepresentationAttributes(rawContent),
    ...rules.validateProfileRequirements(rawContent),
    // ... ALL rule functions
  ].filter(issue => issue !== null);

  // Categorize
  allIssues.forEach(issue => {
    if (issue.severity === 'error') errors.push(issue);
    else if (issue.severity === 'warning') warnings.push(issue);
    else info.push(issue);
  });

  // Detect profile
  const profileMatch = rawContent.match(/profiles="([^"]+)"/);
  const profile = profileMatch ? profileMatch[1] : 'unknown';

  // Detect features
  const detectedFeatures = detectDASHFeatures(rawContent, mpdType);

  return {
    compliant: errors.length === 0,
    errors,
    warnings,
    info,
    playlistType: mpdType === 'static' ? 'mpd-static' : 'mpd-dynamic',
    dashProfile: profile,
    detectedFeatures,
    checkedRules: getAllDASHRuleNames(),
    timestamp: new Date().toISOString()
  };
}
```

### Functional Validation Gate 7.1: DASH Validator Works

**Same testing approach as Phase 6, but for DASH:**

**Test 1: Compliant DASH**
- URL: https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd
- Expected: `compliant: true, errors: []`

**Test 2-5: Non-compliant DASH manifests**
- Missing type attribute
- Invalid minBufferTime format
- Missing Period
- Missing Representation bandwidth
- etc.

**Create 10 compliant + 10 non-compliant DASH test cases**

**Document results in Serena**

**Passing criteria:** All validation tests pass in Chrome

**If pass:** Proceed to Phase 8

### Time Estimate

- Implement DASH rules (70+ rules): 12-15 hours
- Implement main validator: 3-4 hours
- Integration: 2 hours
- Functional testing: 6-8 hours
- Debug and fixes: 4-6 hours
- Documentation: 2 hours
- **Total:** 29-39 hours (2-3 sessions)

---

## PHASE 8: SPEC MODE UI IMPLEMENTATION

**Sessions:** 2-3 (Sessions 17-19)
**Duration:** 2-3 days
**Prerequisites:** Phases 0-7 complete (validators working)

### Objectives

1. Build Spec Validator Mode UI components
2. Implement raw manifest display with line numbers
3. Implement syntax highlighting for HLS/DASH
4. Implement validation sidebar
5. Implement line highlighting for errors/warnings
6. Add spec reference links
7. Functional validation in Chrome

### Skills to Invoke

- ✅ `session-context-priming`
- ✅ `frontend-development` (for React component patterns)
- ✅ `ui-styling` (for Tailwind CSS styling)

### Component Implementation

#### Component 1: SpecValidatorView (Container)

**File:** `src/components/viewer/SpecValidatorView.tsx` (new)

```typescript
import { useManifestStore } from '../../store/manifest-store';
import { RawManifestPanel } from './RawManifestPanel';
import { ValidationSidebar } from './ValidationSidebar';

export function SpecValidatorView() {
  const manifest = useManifestStore(state => state.manifest);
  const loading = useManifestStore(state => state.loading);
  const error = useManifestStore(state => state.error);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!manifest) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-screen">
      {/* Left panel: Raw manifest (70%) */}
      <div className="w-[70%] border-r border-gray-200">
        <RawManifestPanel manifest={manifest} />
      </div>

      {/* Right panel: Validation sidebar (30%) */}
      <div className="w-[30%] overflow-y-auto">
        <ValidationSidebar manifest={manifest} />
      </div>
    </div>
  );
}
```

#### Component 2: RawManifestPanel

**File:** `src/components/viewer/RawManifestPanel.tsx` (new)

```typescript
import { useMemo } from 'react';
import { useManifestStore } from '../../store/manifest-store';
import Prism from 'prismjs';

export function RawManifestPanel({ manifest }: { manifest: ParsedManifest }) {
  const validationResults = useManifestStore(state => state.validationResults);

  // Get error/warning line numbers
  const errorLines = useMemo(() => {
    if (!validationResults) return new Set<number>();

    return new Set(
      validationResults.errors.map(e => e.line).filter(l => l !== undefined)
    );
  }, [validationResults]);

  const warningLines = useMemo(() => {
    if (!validationResults) return new Set<number>();

    return new Set(
      validationResults.warnings.map(w => w.line).filter(l => l !== undefined)
    );
  }, [validationResults]);

  // Split raw content into lines
  const lines = manifest.raw.split('\n');

  // Apply syntax highlighting
  const highlighted = useMemo(() => {
    if (manifest.format === 'hls') {
      // Use Prism for basic highlighting
      return Prism.highlight(manifest.raw, Prism.languages.javascript, 'hls');
    } else {
      // XML highlighting for DASH
      return Prism.highlight(manifest.raw, Prism.languages.xml, 'xml');
    }
  }, [manifest.raw, manifest.format]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <h2 className="text-sm font-semibold text-gray-700">Raw Manifest</h2>
        <button
          onClick={() => navigator.clipboard.writeText(manifest.raw)}
          className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Copy
        </button>
      </div>

      {/* Line-numbered code display */}
      <div className="flex-1 overflow-auto font-mono text-sm">
        <div className="inline-block min-w-full">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const hasError = errorLines.has(lineNumber);
            const hasWarning = warningLines.has(lineNumber);

            return (
              <div
                key={index}
                className={`
                  flex hover:bg-gray-100
                  ${hasError ? 'bg-red-50 border-l-4 border-red-500' : ''}
                  ${hasWarning && !hasError ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}
                `}
              >
                {/* Line number */}
                <div className="w-12 flex-shrink-0 text-right px-2 py-1 text-gray-400 select-none bg-gray-100">
                  {lineNumber}
                </div>

                {/* Line content */}
                <div className="flex-1 px-3 py-1">
                  <code>{line}</code>
                </div>

                {/* Error/warning indicator */}
                {hasError && (
                  <div className="w-8 flex-shrink-0 flex items-center justify-center text-red-500">
                    ❌
                  </div>
                )}
                {hasWarning && !hasError && (
                  <div className="w-8 flex-shrink-0 flex items-center justify-center text-yellow-500">
                    ⚠️
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-white border-t text-xs text-gray-600">
        Line {lines.length} of {lines.length} | {manifest.raw.length} characters
      </div>
    </div>
  );
}
```

#### Component 3: ValidationSidebar

**File:** `src/components/viewer/ValidationSidebar.tsx` (new)

```typescript
import { useManifestStore } from '../../store/manifest-store';
import { PlaylistTypeBadge } from './PlaylistTypeBadge';
import { FeatureDetectionList } from './FeatureDetectionList';
import { ValidationIssueList } from './ValidationIssueList';

export function ValidationSidebar({ manifest }: { manifest: ParsedManifest }) {
  const validationResults = useManifestStore(state => state.validationResults);

  if (!validationResults) {
    return <div className="p-4">Running validation...</div>;
  }

  const { compliant, errors, warnings, info } = validationResults;

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Compliance Status */}
      <div className="p-4 border-b">
        {compliant ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold">SPEC COMPLIANT</div>
              <div className="text-sm">No errors found</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-lg">
            <span className="text-2xl">❌</span>
            <div>
              <div className="font-bold">NON-COMPLIANT</div>
              <div className="text-sm">{errors.length} error{errors.length !== 1 ? 's' : ''} found</div>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mt-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded text-sm">
            ⚠️ {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Playlist Type */}
      <div className="p-4 border-b">
        <PlaylistTypeBadge validation={validationResults} format={manifest.format} />
      </div>

      {/* Features Detected */}
      <div className="p-4 border-b">
        <FeatureDetectionList features={validationResults.detectedFeatures} />
      </div>

      {/* Validation Issues */}
      {(errors.length > 0 || warnings.length > 0 || info.length > 0) && (
        <div className="p-4">
          <ValidationIssueList
            errors={errors}
            warnings={warnings}
            info={info}
          />
        </div>
      )}
    </div>
  );
}
```

[Continue with implementations of all 8 components...]

### Deliverables

1. ✅ 8 new React components for Spec mode
2. ✅ Tailwind CSS styling for all components
3. ✅ Integration with Zustand store
4. ✅ Save to Serena: `phase-8-ui-implementation-complete.md`

### Functional Validation Gate 8.1: Spec Mode UI Works

**Test in Chrome:**

1. Build and reload extension
2. Navigate to HLS URL (auto-interception)
3. **Expected:** Spec mode UI appears
4. **Verify:**
   - Raw manifest displays on left with line numbers
   - Validation sidebar shows on right
   - Compliance status shows correctly
   - Error/warning lines highlighted
   - Features detected and listed
   - No console errors

5. Screenshot all components

**Test with multiple manifests:**
- Compliant HLS → Shows green ✅
- Non-compliant HLS → Shows red ❌ with error list
- Compliant DASH → Works correctly
- Non-compliant DASH → Shows errors

**Passing criteria:**
✅ All 8 components render correctly
✅ Layout matches wireframe specification
✅ Validation results display accurately
✅ Line highlighting works
✅ Responsive to window resize
✅ No visual glitches

**If pass:** Document to Serena, proceed to Phase 9

### Time Estimate

- Component 1-8 implementation: 16-20 hours
- Styling with Tailwind: 4-5 hours
- Integration testing: 4-6 hours
- Bug fixes: 3-5 hours
- Documentation: 2 hours
- **Total:** 29-38 hours (2-3 sessions)

---

## PHASE 9: SEGMENT AVAILABILITY CHECKER

**Sessions:** 1 (Session 20)
**Duration:** 1 day
**Prerequisites:** Phases 0-8 complete

### Objectives

1. Implement segment URL resolution
2. Implement HEAD request checking for segment availability
3. Display segment availability status
4. Handle CORS errors gracefully
5. Prepare for v1.1 media codec validation

### Implementation

**File:** `src/lib/utils/segment-availability-checker.ts` (new)

```typescript
export interface SegmentCheckResult {
  url: string;
  available: boolean;
  statusCode?: number;
  size?: number;
  error?: string;
  responseTime?: number;
}

export async function checkSegmentAvailability(
  segmentUrls: string[]
): Promise<SegmentCheckResult[]> {
  const results: SegmentCheckResult[] = [];

  for (const url of segmentUrls) {
    const startTime = Date.now();

    try {
      const response = await fetch(url, { method: 'HEAD' });

      results.push({
        url,
        available: response.ok,
        statusCode: response.status,
        size: parseInt(response.headers.get('content-length') || '0'),
        responseTime: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        url,
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      });
    }
  }

  return results;
}
```

[Full implementation with batch checking, progress tracking, etc.]

### Functional Validation Gate 9.1

**Test with manifest that has segments:**

1. Load media playlist (not master)
2. Click "Check All Segments"
3. Verify HEAD requests sent (Network tab)
4. Verify results display correctly
5. Test with broken segment URL (404)
6. Verify 404 detected and displayed

**Pass criteria:** Segment checking works accurately

---

## PHASE 10: MODE TOGGLE & FINAL INTEGRATION

**Sessions:** 1-2 (Sessions 21-22)
**Duration:** 1-2 days

### Objectives

1. Add mode toggle UI to viewer header
2. Implement smooth mode switching
3. Preserve manifest data across mode switch
4. Test all integration points
5. Verify both modes work perfectly

### Implementation

**Add toggle button to ViewerHeader:**

```typescript
const viewMode = useManifestStore(state => state.viewMode);
const setViewMode = useManifestStore(state => state.setViewMode);

<button
  onClick={() => setViewMode(viewMode === 'spec' ? 'analysis' : 'spec')}
  className="..."
>
  {viewMode === 'spec' ? '→ Deep Analysis' : '← Spec Validator'}
</button>
```

### Functional Validation Gate 10.1

**End-to-end testing:**

1. Auto-interception → Spec mode → Toggle → Analysis mode → Toggle back
2. Manual entry → Analysis mode → Toggle → Spec mode → Toggle back
3. All features work in both modes
4. Data preserved across toggles
5. No memory leaks

**Pass criteria:** Seamless mode switching, all features functional

---

## PHASE 11: COMPREHENSIVE CHROME VALIDATION

**Sessions:** 2-3 (Sessions 23-25)
**Duration:** 2-3 days

### Objectives

1. Test ALL features in Chrome DevTools
2. Test with all 62 collected URLs in both modes
3. Screenshot all features working
4. Create comprehensive validation report
5. Prepare for v1.1.0 release

### Validation Procedures

**Test Matrix: 62 URLs × 2 Modes = 124 tests**

For each URL:
1. Test in Spec mode (auto-interception)
2. Test in Analysis mode (toggle)
3. Verify validation accuracy
4. Screenshot both modes
5. Document results

**Additional testing:**
- Error handling (404, CORS, malformed)
- Performance (load time, memory)
- Edge cases (huge manifests, single variant, etc.)

### Final Deliverable

✅ `docs/V1.1_VALIDATION_REPORT.md` (comprehensive testing documentation)
✅ 200+ screenshots in `docs/validation-screenshots/`
✅ All features verified working in Chrome
✅ Save to Serena: `v1.1.0-release-ready.md`

---

## APPENDIX A: SKILLS REFERENCE

Skills to use throughout this plan:

- `session-context-priming` - Every session start (MANDATORY)
- `systematic-debugging` - When encountering bugs
- `frontend-development` - For React component patterns
- `ui-styling` - For Tailwind CSS styling
- `code-review` - Before completing each phase
- `executing-plans` - For executing this plan in batches

---

## APPENDIX B: SERENA MCP MEMORY STRATEGY

**Memory naming convention:**

```
Research Phase Memories:
- hls-spec-knowledge.md
- dash-spec-knowledge.md
- chrome-extension-patterns.md
- apple-hls-tools-analysis.md
- dash-if-conformance-analysis.md

Implementation Phase Memories:
- phase-5-interception-complete.md
- phase-6-hls-validator-complete.md
- phase-7-dash-validator-complete.md
- phase-8-ui-complete.md
- phase-9-segment-checker-complete.md
- phase-10-integration-complete.md
- phase-11-validation-complete.md

Validation Results:
- phase-5-validation-results.md
- phase-6-validation-results.md
- [etc.]

Release Status:
- v1.1.0-release-ready.md
```

**Each memory should include:**
- What was completed
- What was learned
- What code was written
- Validation results
- Screenshots (references)
- Next phase prerequisites

---

## APPENDIX C: FUNCTIONAL VALIDATION CHECKLIST

**Instead of unit tests, we validate functionally in Chrome:**

### For Every Feature:

1. **Build:** `npm run build`
2. **Load:** chrome://extensions → Reload extension
3. **Test:** Navigate to test URL or use feature
4. **Verify in DevTools:**
   - Console: No errors
   - Elements: UI rendered correctly
   - Network: Requests as expected
   - Application: Storage correct
5. **Screenshot:** Evidence of working feature
6. **Document:** Result in Serena MCP

### Test Manifest Collection

**Create test suite:**
- `test-data/validation-tests/compliant-hls-1.m3u8`
- `test-data/validation-tests/non-compliant-hls-1.m3u8`
- `test-data/validation-tests/compliant-dash-1.mpd`
- `test-data/validation-tests/non-compliant-dash-1.mpd`
- [20+ test manifests covering all rules]

**Serve locally:**
```bash
npx http-server test-data/validation-tests -p 9999 --cors
```

**Test each one in Chrome, document results**

---

## ESTIMATED TOTAL EFFORT

**Sessions:** 15-25 sessions
**Calendar Time:** 6-10 weeks
**Development Hours:** 150-200 hours

**Phase by Phase:**
- Phase 0: 30-60 min per session (×15-25 sessions = 7-25 hours)
- Phase 1: 13-21 hours
- Phase 2: 20-28 hours
- Phase 3: 9-12 hours
- Phase 4: 25-33 hours
- Phase 5: 9-13 hours
- Phase 6: 25-33 hours
- Phase 7: 29-39 hours
- Phase 8: 29-38 hours
- Phase 9: 8-12 hours
- Phase 10: 8-12 hours
- Phase 11: 20-30 hours

**Total:** ~220-295 hours (with context priming overhead)

---

## SUCCESS CRITERIA

**v1.1.0 is complete when:**

✅ All 11 phases completed
✅ URL interception working for .m3u8 and .mpd
✅ HLS spec validator fully functional
✅ DASH spec validator fully functional
✅ Spec mode UI complete and polished
✅ Analysis mode (existing v1.0.0) still fully functional
✅ Mode toggle working seamlessly
✅ Tested with 62+ URLs in both modes
✅ All existing 124 tests still passing
✅ Zero critical bugs
✅ Comprehensive validation report written
✅ All knowledge saved to Serena MCP
✅ Ready for Chrome Web Store update

---

**This plan is designed for multi-session execution with complete context preservation between sessions using Serena MCP and rigorous functional validation in Chrome DevTools.**

**NEXT SESSION should start with Phase 1: HLS Specification Mastery.**
