# Design System — Visual Language

This documents the **visual language** the web app expresses, so the native app can recreate it with native primitives. DOM components are not reused.

## 1. Foundations

### Theme mode
- **[Verified]** Light mode only in practice. `globals.css` defines `.dark` variables and `tailwind.config.ts` sets `darkMode: ['class']`, but nothing adds the `dark` class (`next-themes` is installed and unused).
- **Mobile:** Ship light only (`userInterfaceStyle: "light"` in app config). Keep the token structure ready for dark mode later.

### Color

The product uses raw Tailwind palette classes far more than the shadcn CSS variables. Hex values are Tailwind 3 defaults.

| Role | Token | Hex | Where it appears |
| --- | --- | --- | --- |
| **Brand primary** | teal-500 | `#14b8a6` | Primary buttons (Start, Send, Save), active accents |
| Brand primary pressed | teal-600 | `#0d9488` | Hover, active sidebar gradient end, active tab border |
| Brand text | teal-700 | `#0f766e` | Links, active tab text |
| Brand tint | teal-50 / teal-100 | `#f0fdfa` / `#ccfbf1` | Badges, light backgrounds, highlight `<mark>` |
| **Test-runner accent** | sky-600 | `#0284c7` | Runner primary buttons, selected option border, current palette cell |
| Runner tint | sky-50 | `#f0f9ff` | Selected option background, summary tiles |
| Text strong | gray-900 | `#111827` | Headings |
| Text body | gray-700 / gray-600 | `#374151` / `#4b5563` | Body copy |
| Text muted | gray-500 / gray-400 | `#6b7280` / `#9ca3af` | Secondary labels, icons |
| Border | gray-200 / gray-100 | `#e5e7eb` / `#f3f4f6` | Cards, inputs, dividers |
| Surface | white, gray-50 `#f9fafb` | | Cards on a subtle gradient background (`from-gray-50 via-white to-teal-50/30`) |
| Login surface | `#faf8f6` | | Login card background |
| Success | green-500/600/700, emerald-500 | `#22c55e` `#16a34a` `#15803d` `#10b981` | Correct, answered, PASSED |
| Error | red-500/600 | `#ef4444` `#dc2626` | Wrong, not-answered, FAILED, errors |
| Warning | amber-500/700 | `#f59e0b` `#b45309` | Retake button, timer ≤ 5 min, medium difficulty |
| Info | blue-500 | `#3b82f6` | Resume button, paused/in-progress status |
| Marked for review | purple-500/600 | `#a855f7` `#9333ea` | Palette "marked" |
| Not visited | gray-300 | `#d1d5db` | Palette |
| Trending | violet-600 → fuchsia-500 → purple-500 gradient | `#7c3aed` `#d946ef` `#a855f7` | Trending pill + shadow `rgba(139,92,246,.35)` |
| Early access callout | red-500 → orange-500 gradient | | "Free Early Access" |
| Google button | `#1a73e8` (prompt CTA) | | Google prompt only |

**Score ring color scale** (`ScoreRing.scoreRingColor`, % of max marks): ≥80 `#10b981`, ≥60 `#14b8a6`, ≥40 `#f59e0b`, ≥20 `#f97316`, else `#ef4444`. Full marks forces green. **Port this exactly as a pure function.**

**Activity score scale** (`ProfileActivity.scoreConfig`): ≥80 emerald, ≥60 teal, ≥40 amber, else red.

### Typography
- **Font:** Inter (Latin subset via `next/font/google`). **[Verified]**
- **Malayalam:** No Malayalam font is loaded. Malayalam glyphs come from the browser/OS fallback. **Mobile:** Android ships Noto Sans Malayalam. Verify rendering on device and consider bundling Noto Sans Malayalam for consistent metrics (`U-18`, `R-10`).
- **Scale in use** (Tailwind): 10–11 px micro labels, 12 (`text-xs`), 14 (`text-sm`, the dominant body size), 16 (`text-base`), 18 (`text-lg`), 20 (`text-xl`), 24 (`text-2xl`, page titles), 30 (`text-3xl`, desktop hero titles).
- **Weights:** 400 body, 500 medium labels, 600 semibold buttons and card titles, 700 bold headings, 800 extrabold stat numbers.
- **Tabular numbers** are used for the timer and durations (`tabular-nums`). Native: `fontVariant: ['tabular-nums']`.
- Uppercase tracking-wide micro labels ("DAILY DIGEST", stat labels).

**Proposed native type scale:** `caption 12/16`, `footnote 13/18`, `body 15/22` (mobile reading), `bodyStrong 15/22 600`, `title3 17/24 600`, `title2 20/28 700`, `title1 24/32 700`, `display 28/34 800` (score values). Respect the OS font scale (see accessibility).

### Spacing
Tailwind 4 px grid. Common values: 8, 12, 16, 20, 24, 32. Mobile page padding is 16 (`px-4`); desktop goes up to 40 (`lg:px-10`). Cards use 16–24 padding. Gaps are 12–24.
**Native tokens:** `xs 4, sm 8, md 12, lg 16, xl 20, 2xl 24, 3xl 32`.

### Radius
`--radius` = 8 px (`lg`), but the product heavily uses `rounded-xl` 12, `rounded-2xl` 16, `rounded-3xl` 24, and `rounded-full` pills.
**Native tokens:** `sm 6, md 8, lg 12, xl 16, 2xl 24, pill 999`. Cards use 12–16. Buttons use 12. Inputs use 12.

### Elevation
Soft shadows (`shadow-sm` → `shadow-2xl`) with coloured glows (`shadow-teal-200`, `shadow-orange-200`).
**Native:** two or three elevation tokens (`card`, `raised`, `overlay`), with `elevation` on Android and shadow props on iOS. Drop coloured glows on Android, because elevation shadows are grey. Instead, use a tinted border or background where the glow carried meaning (trending).

## 2. Component inventory

| Pattern | Web implementation | Reusable? | Native intent |
| --- | --- | --- | --- |
| Primary button | shadcn `Button` + teal or sky classes; h-11 to h-14, rounded-xl | Truly reusable | `Button` primitive: variants `primary`, `secondary/outline`, `ghost`, `destructive`, `runner` (sky); sizes `md 44`, `lg 52`; `loading` state with spinner + label swap ("Starting...") |
| Action-by-state button | `ACTION_CONFIG` in 3 card files (START teal / RETAKE amber / RESUME blue) | Feature-specific, duplicated | One `TestActionButton` with a shared config |
| Card | shadcn `Card` and ad-hoc `bg-white rounded-xl border` | Reusable | `Card` primitive (padding, radius, border, elevation) |
| Stat tile | `StatCard` (exam hub), profile stat cards | Reusable | `StatTile` (icon, label, value, sub) |
| Badge / pill | shadcn `Badge`, ad-hoc pills | Reusable | `Badge` (tone: neutral/success/warning/danger/info/brand) |
| Input | shadcn `Input`, raw `<input>` | Reusable | `TextField` (label, error, helper, left icon, clear button) |
| Select | Radix `Select`, native `<select>` | Web-specific | A bottom sheet picker or native picker. Never a web-style dropdown |
| Dialog / confirm | Radix `AlertDialog` | Web-specific | A native-feeling `ConfirmDialog` (modal) for destructive or irreversible steps |
| Sheet / drawer | Radix `Sheet` (sidebar, palette) | Web-specific | A bottom sheet for the palette; tabs replace the sidebar drawer |
| Tabs | Link-based horizontal tab bar (exam) | Coupled to Next | Material top tabs or a segmented control inside the exam stack |
| Toast | Installed, unused. Inline alerts used instead | — | Inline error banners first. Add a toast only if needed |
| Alert (inline) | shadcn `Alert` destructive | Reusable | `InlineAlert` (tone, title, message) |
| Loading | Spinners (border-spin divs, `Loader2`), skeletons on profile and answer key | Reusable | `ActivityIndicator`, `Skeleton` blocks; full-screen `LoadingState` |
| Empty state | Icon + title + copy, per screen | Reusable pattern | `EmptyState` (icon, title, message, optional action) |
| Error state | Red box with message, sometimes Retry | Inconsistent | `ErrorState` (message, Retry) used everywhere |
| Coming soon | `ComingSoon` | Reusable | Same component |
| Pagination | Numbered `TestListPagination` | Web-specific | **Infinite scroll** with footer spinner |
| Score ring | SVG circle | Reusable concept | `react-native-svg` ring |
| Progress bar | Div width % | Reusable | `ProgressBar` |
| Calendar | `react-day-picker` in popover | Web-specific | Native date picker or a simple sheet calendar |
| Swipe stack | Pointer events + CSS transforms | Web-specific | Gesture Handler + Reanimated |
| Question palette | Grid of numbered buttons with status colors + legend | Feature-specific | Same visual in a bottom sheet |
| Math text | `mathpix-markdown-it` DOM render | Web-only | See phase 05 |
| Icons | `lucide-react` (76 imports) | Library | `lucide-react-native` keeps the icon vocabulary (optional; see package-strategy) |
| Logo | `/ezprep-logo-1.png` (1380×752, large whitespace, `mix-blend-multiply` + `scale-[1.65]` hacks) | Asset | Needs a tightly cropped / vector logo (`asset-analysis.md`) |

## 3. Animations and transitions

| Animation | Web | Native intent |
| --- | --- | --- |
| Trending pill pulse, shimmer, flame wiggle | CSS keyframes, disabled for `prefers-reduced-motion` | A subtle Reanimated loop or a static pill. Must respect `AccessibilityInfo.isReduceMotionEnabled` |
| Hover lifts (`hover:-translate-y-1`) | Hover only | Drop. Use pressed state (opacity/scale 0.98) |
| `active:scale-95` | Tap feedback | `Pressable` pressed style + Android ripple |
| Score ring stroke transition 700 ms | CSS | Optional Reanimated |
| Swipe card exit 280 ms | CSS transition | Reanimated spring/timing |
| Header hide on scroll | Custom JS | Drop |
| Accordion | tailwindcss-animate | Only if a collapsible is needed |
| Spinners, bounce dots | CSS | `ActivityIndicator` |

## 4. Copy and tone

Microcopy is product content. Preserve it verbatim unless product decides otherwise. Examples: "Start Practice", "Mark for Review & Next", "You cannot return to this section after moving ahead.", "Your progress is saved. Resume whenever you're ready.", "Headlines handled. You're ahead of the curve." Malayalam strings exist only in the results screen ("ടെസ്റ്റ് പൂർത്തിയായി", "ഉത്തരക്കുറിപ്പ്", "പരീക്ഷയിലേക്ക്") and the language option label "മലയാളം".
