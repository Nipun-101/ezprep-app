# Phase 03 — Home & Exam Discovery

## Objective
The Home tab lists exams grouped by category (web `/dashboard`), with a Trending badge, and global search finds categories and exams. Tapping an exam opens the exam route (a stub until phase 04).

## Prerequisites
Phase 02 done. U-07 (image sizes) helps; it isn't blocking. U-20 (density) is needed for visual sign-off.

## Source documents
`../route-inventory.md` (`/dashboard`, `?categoryId=`), `../api-architecture.md` (C1, C4), `../responsive-analysis.md` (Dashboard), `../design-system.md`, `../performance-analysis.md`, `../asset-analysis.md`.

## Web reference (read-only)
- Routes: `/dashboard`, `/dashboard?categoryId=`.
- Components: `app/dashboard/page.tsx`, `components/dashboard/DashboardExamsContent.tsx`, `CategorySection.tsx`, `ExamCardDashboard.tsx`, `SearchBox.tsx`, `DashboardHeader.tsx`.
- Lib: `lib/api/exams.ts` (`getExamsByCategory`, `ApiExamCategory`), `lib/api/search.ts`.
- APIs: `GET /exams/by-category` (the web calls it **server-side without a token**, so it is very likely public [Inferred], U-05), `GET /search?q=`.

## Verified web behavior to keep
- Section title: "Popular Exams from {category.name}". Exams render as cards with the **category image** (not a per-exam image) or the first letter as a fallback; title max 2 lines; a "Trending" pill when `exam.trending === true`.
- Empty catalog → "Exam listings will be available soon." The web swallows fetch errors into this empty state. **Mobile distinguishes error (Retry) from empty.**
- Search: 320 ms debounce on the trimmed query; results grouped into categories and exams; a category result → Home scrolled to that category; an exam result → the exam page; query highlight in results.
- The web caches the catalog for 24 h (ISR). Mobile `staleTime` is 1 h with pull-to-refresh.

## Target mobile routes and components
- `app/(app)/(tabs)/index.tsx` → `HomeScreen`. The header has the logo and a search entry (a tappable field that opens the modal).
- `app/(app)/search.tsx` (modal): autofocus input, results `SectionList`, recent results not persisted (web parity).
- `app/(app)/exam/[examId]/index.tsx` (**stub**: title + "Coming in phase 04", replaced later).
- `src/features/catalog/`: `api/catalogApi.ts` + zod schemas, `hooks/useExamCatalog.ts`, `hooks/useSearch.ts`, `components/CategorySection.tsx`, `ExamCard.tsx`, `TrendingPill.tsx`, `SearchResultRow.tsx`, `utils/highlight.ts`.

## Files to create
The files above + tests: `catalogApi.test.ts` (schema tolerance), `HomeScreen.test.tsx` (loading/empty/error/data), `useSearch.test.ts` (debounce, cancel, empty query), `highlight.test.ts`.

## Files that may be modified
`app/(app)/_layout.tsx` (register search modal + exam route), `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
Auth, the shell primitives' APIs, and the attempt or exam-hub logic (phase 04).

## Dependencies
None new (expo-image, TanStack Query, and zod from phase 00).

## Implementation tasks
1. zod schemas for `ApiExamCategory[]` (id, name, imageUrl?, exams[{ id, title, trending? }] + passthrough). Read `lib/api/exams.ts` for the exact fields.
2. `useExamCatalog` (`['catalog']`, staleTime 1 h).
3. HomeScreen: a `FlatList` of category sections, each with a 2-column grid of `ExamCard` (U-20); pull-to-refresh; skeleton on first load.
4. `ExamCard`: an 80 dp rounded image via `expo-image` (`cachePolicy: 'memory-disk'`, placeholder initial), title, an optional Trending pill (gradient optional; a solid violet is acceptable), `accessibilityRole="button"`, label "{title}{, trending}".
5. Category scroll target: `router.navigate('/(tabs)?categoryId=…')` → scroll to the section index once the data is loaded, then clear the param.
6. Search modal: debounce 320 ms, cancel the stale query (the TanStack Query `signal` passed to fetch), keep previous results while loading, empty-state copy ("No results"), error with Retry.
7. Highlight the match in titles (pure util).
8. Navigation to the exam stub.

## Requirements
- **UX:** The first meaningful paint shows skeletons; images fade in; the keyboard dismisses on scroll in search; Android back closes the search modal.
- **API:** Tolerate extra fields. Missing `imageUrl` → initial letter. Unknown `trending` → false.
- **Security:** Images over HTTPS only (reject `http:` in production or report it, U-07).
- **Performance:** Home scroll at 60 fps on the device with real data; memoised `ExamCard`; image decoding sized to 80 dp.
- **Testing:** As listed; fixtures follow `api-architecture.md` C1/C4.

## Acceptance criteria
Home shows real categories/exams from staging; error and empty states are distinct; search finds an exam and a category and navigates correctly; pull-to-refresh refetches.

## Manual device checklist
- [ ] Cold start → Home with data. Airplane mode → error + Retry.
- [ ] Scroll smoothness with all categories. No image flicker on re-scroll.
- [ ] Search: type fast (only the latest results show), clear, a no-results query, a category result scrolls to the section.
- [ ] TalkBack: card labels, search field label, result rows.
- [ ] Large font: card titles wrap without overlap.

## Risks
R-11 (images), R-15 (list performance).

## Rollback / isolation
A feature folder plus routes. Reverting restores the phase 02 placeholder Home.

## Completion checklist
- [ ] U-05 finding (catalog/search auth) recorded.
- [ ] Visual review against the web mobile layout.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A signed-in user browses real exam categories, searches, and reaches an exam route on the physical device, with loading, empty, error, and offline states handled.
