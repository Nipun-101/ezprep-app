# Web-Specific / Non-Portable Features

For each item: **why web-specific**, **product impact**, **native replacement**, **needs Expo/native dependency?**, **migration risk**.

| # | Web feature | Where | Why web-only | Matters to product? | Native replacement | Dependency | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `localStorage` (auth token, CA seen date) | `lib/auth.ts`, `lib/current-affairs-seen.ts` | Browser storage API | Yes (session) | Token → SecureStore. CA date → AsyncStorage | `expo-secure-store`, `@react-native-async-storage/async-storage` | Low |
| 2 | `sessionStorage` (PKCE handoff, attempt cache, prompt dismissal) | `lib/googleAuth.ts`, `lib/attempt-storage.ts` | Per-tab browser storage | Attempt cache: offline fallback for the runner | In-memory query cache. Optional persisted cache | none / optional | Low |
| 3 | `document.cookie` + Edge middleware | `lib/auth.ts`, `middleware.ts` | Server routing gate | Yes (route protection) | Expo Router route groups + `Redirect` driven by the auth context | none | Low |
| 4 | `window.location.href` redirects, `location.reload()` | client.ts, auth.ts, AttemptResultClient | Document navigation | Yes | `router.replace`, query `refetch()` | none | Low |
| 5 | Browser history trap (`pushState` + `popstate`) | `MockTestRunner` | Browser back button | **Yes**: stops accidental exit mid-test | Android `BackHandler` + Expo Router `usePreventRemove` / `beforeRemove`; disable the iOS swipe-back gesture on the runner | none (react-navigation built-in) | **Medium**: must cover hardware back, gesture back, header back |
| 6 | `beforeunload` + `fetch keepalive` pause | `MockTestRunner`, `AttemptPageClient` | Tab close event | **Yes**: freezes the server timer on close | `AppState` `background` → best-effort pause (product decision `U-03`). On next foreground, reconcile with `GET attempt` | none | **High**: the behavior choice affects fairness and timing |
| 7 | `setInterval` countdown | `AttemptTimer` | JS timers are throttled/suspended when the app is backgrounded on mobile | **Yes**: the timer must be correct | Deadline-based timer (`endsAt = now + secondsLeft`), recompute on each tick and on foreground | none | **High** |
| 8 | MSG91 browser widget script (`otp-provider.js`) | `LoginModal` | Injects DOM UI and globals | **Yes**: primary sign-in | Native UI calling MSG91 via an SDK or backend (`U-01`) | Possibly an MSG91 RN SDK | **High** |
| 9 | Google OAuth full-page redirect + PKCE via `crypto.subtle` | `lib/googleAuth.ts`, `app/page.tsx` | Redirect back to a web origin | Yes | Native Google sign-in (Credential Manager) or system browser auth session (`U-02`) | `@react-native-google-signin/google-signin` (dev build) or `expo-auth-session` + `expo-web-browser` + `expo-crypto` | **High**: likely backend change |
| 10 | `mathpix-markdown-it` (DOM + MathJax SVG, `MathpixLoader`, `MathpixMarkdown`) | `components/attempt/Math*.tsx` | Produces HTML/SVG DOM | **Yes**: questions contain math | Spike options: (a) WebView-based renderer, (b) native math lib, (c) server-side pre-render to SVG/HTML (backend change) | `react-native-webview` likely | **Highest**: affects runner and results |
| 11 | HTML in content (`htmlTags` enabled) | `MathText` | Mathpix markdown may contain HTML tags | Yes | Same renderer as #10 | | High |
| 12 | `<img>` / `next/image` with remote URLs | runner, results, CA, categories, avatar | DOM images | Yes | `expo-image` with caching, explicit sizing, aspect-ratio handling | `expo-image` | Low–Medium (unknown sizes) |
| 13 | Tailwind CSS / CSS variables / `cn()` | everywhere | CSS engine | Visual only | Theme tokens + `StyleSheet` | none | Low (effort, not risk) |
| 14 | CSS keyframe animations (trending) + `prefers-reduced-motion` | `globals.css` | CSS | Cosmetic | Reanimated + `AccessibilityInfo` | `react-native-reanimated` | Low |
| 15 | Radix Dialog / AlertDialog / Sheet / Select / Popover | many | DOM portals, focus trap | Yes (confirm flows, pickers) | RN `Modal`, a bottom sheet, native pickers | Possibly `@gorhom/bottom-sheet` (optional) | Medium |
| 16 | HTML `<table>` | exam structure, results sections | DOM | Info display | Lists of rows/cards | none | Low |
| 17 | `<select>` elements | practice subject filter, profile target exam, complete-profile | DOM | Yes | Bottom-sheet list picker | none | Low |
| 18 | Pointer events + `setPointerCapture` swipe | `CurrentAffairsSwipeStack` | DOM pointer API | Yes (core CA UX) | Gesture Handler `Pan` + Reanimated | `react-native-gesture-handler`, `react-native-reanimated` | Medium |
| 19 | Blob download via `<a download>` / `window.open` fallback | CA image download | DOM | Minor | Share sheet (`expo-sharing` after `expo-file-system` download), or save to gallery (`expo-media-library`, needs permission) | `expo-file-system`, `expo-sharing` | Low |
| 20 | `document.body.style.overflow` scroll lock | LoginModal, runner | DOM | N/A | Not needed | none | None |
| 21 | `scrollIntoView`, `getElementById`, `ResizeObserver`, `matchMedia`, `window.scrollY` | dashboard, header, exam tabs | DOM layout APIs | Minor UX | `SectionList.scrollToLocation`, `onLayout`, `useWindowDimensions` | none | Low |
| 22 | `window` CustomEvent + `storage` event bus | CA badge | Browser events | Badge freshness | Context / query invalidation | none | Low |
| 23 | Keyboard navigation (Arrow/Enter/Escape) | SearchBox, LoginModal | Desktop keyboard | No (mobile) | Drop. Android back closes sheets and modals | none | None |
| 24 | Hover states (`hover:`), `onMouseEnter` | everywhere | Mouse | No | Pressed states, ripple | none | None |
| 25 | `title` tooltip on badges (description + criteria) | `ProfileBadges` | Hover tooltip | **Yes**: the only place criteria are shown | Tap a badge → sheet with description + "How to earn" | none | Low |
| 26 | `mailto:` / external links `target=_blank` | Footer, legal | Browser | Minor | `Linking.openURL`, `expo-web-browser` for legal pages | `expo-web-browser` | Low |
| 27 | `alert()` | complete-profile | Browser dialog | (orphan page) | `Alert.alert` if ever needed | none | None |
| 28 | Vercel Analytics | `app/layout.tsx` | Web analytics | Business metrics | TBD (`U-16`) | TBD | Low |
| 29 | ISR `revalidate` | home, dashboard | Next server cache | Freshness | Client query `staleTime` | `@tanstack/react-query` | Low |
| 30 | Service workers / PWA / Web push / clipboard / file input / WebSockets / drag-and-drop | — | — | **Not used** **[Verified]** | — | — | None |
| 31 | iOS input zoom fix (`font-size: 16px`) | `globals.css` | Mobile Safari quirk | N/A | Not needed | — | None |
| 32 | `next/font` Inter | layout | Next font loader | Brand | `expo-font` + Inter TTFs (`@expo-google-fonts/inter`) | `expo-font` | Low |
| 33 | `Buffer` in `decodeToken` | `lib/auth.ts` (unused) | Node global | No | Do not port | — | None |
