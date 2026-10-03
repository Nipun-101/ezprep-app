# Phase 05 — Question Content Rendering

## Objective
Produce **one reusable, production-quality `QuestionContent` rendering layer** for question text, options, and explanations. It handles Mathpix-flavoured markdown/LaTeX, inline HTML tags, images, and the EN/ML language variants with correct fidelity and acceptable performance on the device. It is used by phase 06 (runner) and phase 07 (answer key).

The phase has two parts:
- **05A Spike (time-boxed, ~3–5 days):** evaluate the renderer options against real content and pick one (U-31).
- **05B Productionise:** build the chosen renderer behind a stable component API.

## Prerequisites
Phase 00 done. Real question samples from staging (U-30): ≥ 30 questions, including inline/display math, fractions, matrices, chemistry, tables, inline HTML (`<b>`, `<sub>`, `<br>`), images, long options, and Malayalam text.

## Source documents
`../mobile-compatibility.md` (mathpix row), `../performance-analysis.md`, `../dependency-audit.md` (`mathpix-markdown-it`), `../accessibility-analysis.md`, `../security-analysis.md`, `../risk-register.md` (R-03, R-10).

## Web reference (read-only)
- Components: `components/attempt/MathText.tsx` (`<MathpixMarkdown text htmlTags />`; plain `pre-wrap` text fallback before the library loads), `MathpixBoundary.tsx` (lazy load + context), `QuestionRenderGuard.tsx` (error boundary), and the question/option markup in `MockTestRunner.tsx` (around the `questionText[language]` and `options.map` blocks), `AnswerKeyList.tsx`.
- Data shape [Verified in `MockTestRunner.tsx`]: `question.questionText.{en|ml}.{text, imageUrl?}`, `option.{en|ml}` (text) + `option.imageUrl?`. Language toggle only when `exam.hasMultiLingualSupport`; labels "English" / "മലയാളം".
- APIs: none directly (content comes from attempt payloads).

## Options to evaluate (05A)

| Option | Description | Pros | Cons |
| --- | --- | --- | --- |
| A. WebView renderer | One `react-native-webview` per question block (or one per screen) with a **bundled, offline** HTML page containing `mathpix-markdown-it` (or KaTeX + markdown-it); RN posts the text and the WebView reports its content height | Highest fidelity parity with the web (same library) | WebView cost per instance; height measurement; scroll nesting; selection/tap handling for options; a11y of WebView content |
| B. Native renderer | Parse markdown into native Text; render math via an SVG math library | Native performance, a11y, theming | Fidelity gaps (tables, chemistry, Mathpix extensions); a library maintenance risk |
| C. Hybrid | Plain text → native `Text`; only blocks containing math/tables → WebView | Fast for most questions | Two code paths; detection heuristics |
| D. Server pre-render | Backend returns HTML/SVG | Simplest client | **Backend change**, out of scope unless agreed |

**Evaluation criteria:** fidelity on all samples (side-by-side screenshots vs the web), time to render a question (target < 150 ms after data on a mid-range device), memory with 100+ questions in the answer key, scroll smoothness, a11y (TalkBack can read the text), Malayalam glyph rendering, offline behavior, bundle size.

## Target mobile components
- `src/features/content/components/QuestionContent.tsx`: `{ text: string; imageUrl?: string; variant: 'question' | 'option' | 'explanation'; onLayoutReady?: () => void }`.
- `src/features/content/components/ContentImage.tsx` (expo-image, aspect ratio from metadata/onLoad, tap to zoom optional).
- `src/features/content/components/LanguageToggle.tsx` (EN / മലയാളം; shown only when supported).
- `src/features/content/model/selectLanguage.ts` (pure: pick the `en`/`ml` text with a fallback to `en` when ml is empty; **verify** the web behavior when ml is missing, since the web shows the empty value).
- `src/features/content/renderer/` (chosen implementation; e.g. `webview/` with `assets/math.html`).
- `RenderGuard` (error boundary → plain text fallback, parity with `QuestionRenderGuard`).
- A dev-only gallery route `app/(dev)/content-gallery.tsx` that renders the fixture set (excluded from production routing).

## Files to create
The above + `fixtures/questions.sample.json` (**sanitised** real content, with no answers needed) + tests: `selectLanguage.test.ts`, `QuestionContent.test.tsx` (fallback path, empty text renders nothing).

## Files that may be modified
`app.config.ts` (fonts if a Malayalam font is bundled, R-10), `../MOBILE_STATUS.md`, `../package-strategy.md`-tracked deps via `MOBILE_STATUS.md`.

## Do-not-touch boundaries
Runner and results logic. This phase delivers components only.

## Dependencies
Conditional on the decision: `react-native-webview` (A/C), a native math library (B/C), an optional Noto Sans Malayalam font.

## Implementation tasks
1. Collect and sanitise the fixtures. Build the dev gallery.
2. Prototype A and B (C if A is too slow) against the fixtures. Record screenshots and timings in `MOBILE_STATUS.md` (05A deliverable: a decision note).
3. Implement the chosen renderer:
   - (WebView) A single bundled HTML asset, no remote scripts, `originWhitelist={['about:blank']}` or a file origin only, `javaScriptEnabled` only for the renderer, no injected tokens, `onShouldStartLoadWithRequest` blocks navigation, links are not clickable (or open externally only after review), auto-height messaging, `scrollEnabled={false}` inside the native ScrollView, a transparent background, the font size following the system scale.
   - (Native) Markdown → Text spans; math → SVG; tables → horizontal ScrollView.
4. Text-only fast path: if the content has no math/markup markers, render native `Text` (all options).
5. Images: max width = container, preserve the aspect ratio, a placeholder while loading, error → hidden with an a11y label.
6. Language: the `selectLanguage` util; `LanguageToggle` component; Malayalam font check (R-10).
7. Warm-up: `preloadRenderer()` called by the launch flow (parity with `loadMathpix()` preload).
8. Error boundary fallback to plain text.

## Requirements
- **UX:** No visible layout jump after rendering (reserve height or fade in); options remain fully tappable (the WebView must not swallow touches in option rows, or render options natively when possible).
- **API:** None.
- **Security:** No remote code in the renderer; HTML from content is untrusted, so sanitise/disable script execution inside content (`htmlTags` allows tags, so strip `<script>`, event handlers, and `javascript:` URLs); no tokens in the WebView.
- **Performance:** Targets as in the evaluation criteria; the answer key with 100 questions stays scrollable (virtualise; render lazily).
- **Testing:** Unit tests for the utils; snapshot tests are not meaningful for WebView content, so use the gallery for visual verification.

## Acceptance criteria
- The decision note is recorded (U-31 resolved).
- All fixtures render correctly (side-by-side review with the web) in the gallery on the device.
- Performance targets met in a **preview (release) build**.
- Malayalam renders legibly.
- A malformed content sample falls back to plain text without crashing.

## Manual device checklist
- [ ] Gallery: every fixture, in EN and ML.
- [ ] Largest system font: math scales, nothing clipped, tables scroll horizontally.
- [ ] TalkBack reads question text (including a math sample, recording what it reads).
- [ ] Airplane mode: rendering still works (no remote assets).
- [ ] Memory/scroll on the long-list fixture (100 items).

## Risks
R-03 (fidelity/perf), R-10 (Malayalam), R-15.

## Rollback / isolation
The component API stays stable even if the renderer is swapped later. The plain-text fallback is always available. The gallery route is dev-only.

## Completion checklist
- [ ] The decision note, timings, and screenshots are in `MOBILE_STATUS.md`.
- [ ] The renderer is sandboxed (security review of the WebView settings, if used).
- [ ] U-18 / R-10 outcome recorded.

## Definition of done
`QuestionContent` renders real EZ Prep question content faithfully, safely, and fast enough on the physical Android device in a release build, ready for the runner and answer key.
