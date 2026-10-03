# Performance Analysis

Labels: **[Arch]** architectural requirement (decide in phase 00/early) · **[Guide]** implementation guideline · **[Profile]** only if profiling shows a need.

## 1. Existing characteristics worth preserving

| Characteristic | Where | Mobile equivalent |
| --- | --- | --- |
| Catalog cached 24 h (ISR) | `/`, `/dashboard` | **[Arch]** Query `staleTime` of hours for the catalog. Show cached data instantly on launch |
| Mathpix loaded lazily and **preloaded** at test launch (`loadMathpix()` in `useLaunchAttempt`) | attempt | **[Arch]** Warm the math renderer before the runner opens (e.g. a pre-mounted hidden WebView, or a renderer init on the exam screen) |
| Attempt payload handed over from launch (no second fetch for first paint) | `attempt-storage.ts` | **[Arch]** Seed the query cache with the start/resume payload. Still reconcile with `GET attempt` as the web does |
| Answer key rendered progressively (6 per 40 ms) | `AnswerKeyList` | **[Arch]** `FlatList` virtualization replaces manual batching |
| Answer key code-split (`next/dynamic`) | results | Not applicable (single bundle). Keep the results screen light |
| Debounced search (320 ms) and topic search (400 ms) | SearchBox, PracticeTestsClient | **[Guide]** Same debounce plus request cancellation (AbortController / query cancel) |
| Per-widget independent loading on profile | profile | **[Guide]** Separate queries so one slow widget does not block others |
| Optimistic answer selection | runner | **[Arch]** Keep. The UI must not wait for the PATCH |
| Single launch at a time (prevents double starts) | `useLaunchAttempt` | **[Arch]** Keep (prevents duplicate attempts) |

## 2. Existing weaknesses (do not replicate)

| Issue | Evidence | Mobile approach |
| --- | --- | --- |
| **Runner re-renders every second.** `AttemptTimer` calls `onTick` and the parent stores `secondsLeft`, so the whole 1,170-line runner (question, options, Mathpix) re-renders each tick | `MockTestRunner.handleTick` | **[Arch]** The timer owns its own state. The parent reads remaining time only on demand (ref/getter) and on pause/submit. Memoise the question view |
| Timer drift / background suspension | `setInterval` decrement | **[Arch]** Deadline-based time computation |
| No request cancellation; stale responses are ignored but still downloaded | multiple | **[Guide]** AbortController via the query library |
| Repeated fetch of exam detail per exam visit, of catalog in the profile editor | `ExamLayoutClient`, `ProfileEditModal` | **[Guide]** Shared query cache |
| `images.unoptimized` (full-size images even for 80 px thumbnails) | `next.config.js` | **[Guide]** `expo-image` caching. Ask for thumbnails (`U-07`) |
| 1.1 MB banner, 336 KB logo | `public/` | **[Guide]** Optimised assets |
| Profile edit loads all exam categories to build one picker | `ProfileEditModal` | **[Guide]** Reuse the cached catalog query |
| Pagination re-fetches the whole page on filter change with a full spinner (content disappears) | test lists | **[Guide]** Keep previous data while fetching (`placeholderData`) |
| Search results cleared at every new query | SearchBox | **[Guide]** Keep previous results visible while loading |

## 3. React Native techniques that differ from web

| Concern | Technique | Label |
| --- | --- | --- |
| Long lists (tests, activity, answer key, catalog) | `FlatList`/`SectionList` with stable `keyExtractor` (API ids), `getItemLayout` where rows are fixed height, sensible `windowSize`/`initialNumToRender`. FlashList only if profiling shows FlatList jank | [Arch] / [Profile] |
| Answer key items with math | Each item may host rendered math. Virtualise, and measure the cost of the renderer per row (WebView per row is expensive; see phase 05) | **[Arch]** |
| Question palette (up to hundreds of cells) | Grid inside the bottom sheet, built once per status change. Memoised cells | [Guide] |
| Animations (swipe stack, trending pill) | Reanimated worklets on the UI thread. Avoid `setState` per gesture frame, which the web does today with `setDrag` on every pointer move | **[Arch]** |
| Touch feedback | `Pressable` with Android ripple and immediate pressed style | [Guide] |
| Startup | Keep the splash until fonts load and auth restores from SecureStore. Render cached catalog immediately | [Arch] |
| JS thread work | Do not parse or render math synchronously during taps. Precompute question status arrays with `useMemo` | [Guide] |
| Images | `expo-image`, fixed sizes, `recyclingKey` in lists, prefetch next question images | [Guide]/[Profile] |
| Network | One query per resource, deduped. Retry only idempotent GETs (1–2 retries with backoff). **Never auto-retry** `start`, `submit`, `sessions/complete` | **[Arch]** |
| Memory | Do not keep every question rendered. The runner shows one question at a time | [Guide] |
| Re-renders | Do not memoise everything. Measure with React DevTools Profiler and Perf Monitor on the physical device | [Profile] |

## 4. Performance budget targets (initial, validate on device)

| Metric | Target | Measured on |
| --- | --- | --- |
| Cold start to interactive Home (signed in, cached catalog) | < 2.5 s on a mid-range Android | Release build |
| Tap option → selected visual | < 100 ms | Release build |
| Question next/prev | < 150 ms including math render | Release build |
| Answer key scroll | No dropped frames visible at 60 Hz for a 100-question paper | Release build |
| Swipe card gesture | 60 fps | Release build |

These are proposals and need product agreement (`U-24`). Measure in **release** builds; development builds are much slower.
