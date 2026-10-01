# Responsive Behavior Analysis

## 1. Breakpoints

**[Verified]** Tailwind defaults (no custom `screens` in `tailwind.config.ts`): `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. JS media queries: `(max-width: 767px)` in `DashboardHeader`, `(min-width: 1024px)` in `MockTestRunner`. CSS: `@media (max-width: 767px)` forces input font-size to 16 px to stop iOS zoom.

**`lg` (1024) is the main layout switch.** Below it, the app is in "mobile mode": drawer navigation, bottom action bar, sheet palette.

Throughout this document "mobile" means < 640, "tablet" 640–1023, "desktop" ≥ 1024.

## 2. Global shell

| Element | Mobile | Tablet | Desktop | Native decision |
| --- | --- | --- | --- | --- |
| Sidebar nav | Hidden. Hamburger opens a left `Sheet` (w-72) with an extra "Free Early Access" callout | Same | Fixed 288 px sidebar | **Bottom tabs** (Home, Current Affairs, Profile) + a "More" entry for Coming-soon items and legal. A drawer is not the native default for 3–5 destinations |
| Header | Fixed, hides on scroll-down (14 px threshold) and shows on scroll-up (8 px). Global search full width. Gift pill hidden | Gift pill visible ≥ sm | Same, offset by sidebar | Native stack header. Search becomes its own screen launched from a header search icon on Home. Drop scroll-hide |
| Global search on exam pages | Hidden on mobile (the page has its own search) | | Shown | Search only from Home |
| Content width | Full, px-4 | | `max-w-[1600px]`, px-10 | Full width, 16 px padding; cap content width on tablets (`U-19`) |
| Body | `overflow-x: hidden` | | | N/A |

## 3. Per-screen analysis

### Dashboard (exams by category)
- Grid columns: 2 → 3 (sm) → 4 (md) → 5 (lg) → 6 (xl) → 7 (2xl). Cards are square-ish: an 80 px image plus a title.
- **Mobile intent:** a 2-column grid of compact cards per category.
- **Native:** A `SectionList` with a section per category. Each section renders exams as a 2-column grid (rows of 2) or a **horizontal carousel per category**. *Recommendation:* keep the 2-column grid to match web mobile, because users can see all exams. **[Requires visual validation]** with real data sizes (number of exams per category, `U-20`).

### Exam layout + Overview
- The back button text "Back to Dashboard" is hidden < md. On mobile, the exam name moves next to the back arrow.
- `ExamIntro` (big description card) is **hidden < md**. So on phones the description is not shown at all **[Verified]**.
- Stat cards: 2 columns → 4 (lg).
- Structure table scrolls horizontally on mobile (`overflow-x-auto`).
- Link cards: 1 → 2 (md) → 3 (xl).
- **Native:** The stack header shows the exam name. Overview shows 2×2 stats and a vertical list of subject rows (subject name; "N Qs · M marks/Q · −x negative · T min") instead of a table. The test-type entry cards are unnecessary if top tabs exist. Keep them as shortcuts only if product wants. Whether to show the description on mobile is a product choice (`U-21`); the web hides it on phones.

### Test lists (practice / full mocks / sprint)
- Cards: 1 column → 2 (md) → 3 (lg).
- Search + subject select stack vertically on mobile and sit in a row ≥ sm.
- Numbered pagination.
- **Native:** A single-column `FlatList` with **infinite scroll** (page size the same as web: 20/12), a sticky search field, and a subject filter as chips or a bottom-sheet picker. Pull-to-refresh.

### Attempt runner (most important)
| Element | Mobile/Tablet (< lg) | Desktop (≥ lg) |
| --- | --- | --- |
| Page scroll | Document scrolls | Locked to viewport (`h-[100dvh]`, inner scroll) |
| Header | Sticky: small logo, title, "Q n/N · section", timer (smaller), language select (85 px) | Larger |
| Question card | Full width | Left column, independently scrollable |
| Palette | Right `Sheet` (80% width) opened from a grid icon in the bottom bar | Fixed 300 px right column |
| Mark/Clear | Two half-width buttons under the question ("Mark & Next", "Clear" on < sm) | In the bottom action row |
| Prev / Next / Submit | **Fixed bottom bar:** Prev · grid icon · Save & Next (or Submit/Next Section on the last question) | Inline action row |
| Option tap target | p-4, radio 24 px | Tighter |

**Native decision:** Follow the web **mobile** layout. Use a fixed header, a scrollable question body, a fixed bottom action bar (safe-area aware), Mark/Clear secondary actions, and the palette in a **bottom sheet** (more thumb-friendly than a right sheet). Lock portrait during the attempt (`U-22`). Add a horizontal swipe for next/previous only if product wants it, since it risks accidental navigation.

### Results
- Score card stacks vertically on mobile and goes horizontal ≥ sm.
- Section-wise score: **cards on mobile (< sm)**, a table ≥ sm.
- Section filter: a `Select` on mobile, pill buttons ≥ sm.
- **Native:** Section cards. A horizontal chip row for the filter (fits better than a select when sections ≤ ~6; fall back to a sheet if more).

### Current affairs
- Hero: stacked on mobile, row ≥ lg. Date controls in a 3-column grid.
- Card stack height `min(76dvh, 700px)`, max width 512.
- **Native:** The full-screen card stack is a natural mobile pattern. Date control in the header (prev · date button → native date picker · next).

### Profile
- Stat cards: 2 columns → 3 (sm) → 5 (lg).
- Main grid: 1 column → 3 (xl) (activity 2/3, subjects + badges 1/3).
- Edit modal: centered dialog, `max-h-[70vh]` scroll. Location inputs 1 col → 3 (sm).
- **Native:** A single scroll: header → stats (2-column grid or horizontal scroll) → recent activity → subjects → badges. Edit as a pushed screen with a keyboard-aware scroll view.

### Login
- Centered modal max 400 px on every viewport. Google prompt docks at the bottom on mobile and bottom-left on ≥ sm.
- **Native:** A full-screen sign-in screen.

## 4. Things to not carry over
- Hover states (206 lines use `hover:`), hover-revealed arrows in search results, `onMouseEnter` active index.
- Desktop keyboard navigation in search (arrow keys).
- Desktop multi-column layouts (sidebar + content + palette).
- Horizontal-scrolling tables.
- `scroll-mt-28` / `scrollIntoView` anchoring tricks.

## 5. Items that need visual validation on a device
- Exam card density with real catalog data (`U-20`).
- Long Malayalam text and math wrapping in options.
- Runner layout on small Android phones (≤ 360 dp width) with the keyboard closed. The bottom bar plus header must leave room for long questions.
- Current affairs card heights with long bullet lists plus image.
