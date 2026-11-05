# State Management

## 1. What the web app uses

| Mechanism | Used? | Where |
| --- | --- | --- |
| Redux / Zustand / Jotai / custom store | **No** | — |
| React Query / SWR | **No** | — |
| React Context | Yes, once | `ExamPageContext` in `components/exam/ExamLayoutClient.tsx` (exam detail shared with tabs) and `MathpixContext` (library handle) |
| Component `useState`/`useEffect` | Yes, everywhere | All server data is fetched per component |
| `react-hook-form` / `zod` | Installed, **not used** by feature code (only `components/ui/form.tsx`) | — |
| URL state | Minimal: `redirect`, `categoryId`, OAuth `code/state/error`, route params `id`, `attemptId` | |
| Memory / HttpOnly | Access JWT in memory; refresh via API `ezprep_rt` cookie | `lib/auth.ts` |
| `localStorage` | `ezp:currentAffairsLastSeenDate` (auth tokens no longer stored) | `lib/current-affairs-seen.ts` |
| `sessionStorage` | `ezprep.google.oauth.{state,verifier,redirect,next}`, `ezp:mockAttempt:<id>` (attempt payload cache), `ezprep.google.prompt.dismissed` | `lib/googleAuth.ts`, `lib/attempt-storage.ts`, `GoogleSignInPrompt.tsx` |
| Cookies | `authToken`, `logoutResumePath` | `lib/auth.ts`, `middleware.ts` |
| Module singletons | `pendingSession` (Google exchange de-dupe), Mathpix `cached`/`pending` | `lib/googleAuth.ts`, `MathpixBoundary.tsx` |
| Browser events as state bus | `window` `current-affairs-seen` CustomEvent + `storage` event | `lib/current-affairs-seen.ts`, `useCurrentAffairsNotification.ts` |

## 2. State categories and mobile disposition

**A** = preserve concept · **B** = reimplement differently · **C** = eliminate (web-specific)

| State | Today | Disposition | Mobile approach |
| --- | --- | --- | --- |
| Auth token | localStorage + cookie | **B** | `expo-secure-store`, mirrored in an in-memory `AuthProvider` context (`status: 'restoring' \| 'signedOut' \| 'signedIn'`) |
| Auth cookie for middleware | cookie | **C** | Route-group guard reads the auth context |
| Post-login redirect | `?redirect`, `logoutResumePath` cookie | **B** | In-memory pending route in the auth layer. Resume-after-logout is optional (`U-15`) |
| OAuth PKCE handoff | sessionStorage | **C/B** | Not needed with a native SDK; otherwise kept in memory for the auth session only |
| Exam catalog (by category) | Server ISR 24 h | **B** | Query cache, `staleTime` of hours, pull-to-refresh |
| Exam detail | Context per exam layout | **A** | Query keyed `['exam', examId]`, shared by the exam stack screens. No custom context needed |
| Test lists + pagination + filters | Component state | **A** | Infinite query keyed by `[type, examId, search, subjectId]`. Filters stay screen-local |
| Launch in progress (`startingTestId`) | Hook state | **A** | Mutation state. Keep the "one launch at a time" rule |
| Attempt payload cache | sessionStorage | **B** | Pass the launch payload to the runner through the query cache (`setQueryData(['attempt', id])`). Persistence across app kill is optional (`U-17`) |
| Runner state (answers, marked, visited, index, language, paused, dialogs) | `useState` in a 1,170-line component | **A, restructured** | A feature-local `useReducer` + pure functions (port `lib/attempt-sessions.ts` logic). **Never** a global store |
| Timer seconds | `setInterval` decrement in child + parent tick state | **B** | Derive from a deadline timestamp (`Date.now()`-based), isolated in a timer component, reconciled with the server on foreground |
| Results | Component state | **A** | Query `['attempt', id]` (details). Submit response seeded into the cache |
| Profile | Component state per widget | **A** | Separate queries per widget (independent loading/error is good UX). Mutation for PATCH updates the `['me']` cache |
| Current affairs list | Component state per date | **A** | Query `['currentAffairs', dateKey]` |
| Swipe stack progress | Component state | **A** | Screen-local |
| CA "seen today" | localStorage + window events | **B** | AsyncStorage + a tiny context or query to drive the badge. No window events |
| Google prompt dismissed | sessionStorage | **C** | Not applicable on native |
| Search query/results | Component state, debounce | **A** | Screen-local state + query with debounce, previous results kept while typing |
| Header hidden-on-scroll | Component refs/state | **C** | Use native header behavior; no custom scroll-hide |
| Mobile drawer open | DashboardLayout state | **C** | Replaced by tabs |
| Language (EN/ML) | Per runner/results, not persisted. Runner → results passes it along | **A** | Same, optionally persist the last choice (`U-18`) |
| Form state (profile edit) | `useState` + manual validation | **A** | `useState` + small pure validators. `react-hook-form` is not justified for one form |

## 3. Principles for the mobile app

1. **Server state lives in the query cache.** Feature hooks wrap queries. Screens never call the API directly.
2. **Client state is feature-local** unless two unrelated screens need it. Only auth and the CA badge are global.
3. **No global state library** (no Zustand/Redux) until a concrete cross-feature need appears.
4. The **attempt runner's state machine** is the one piece of complex client state. Model it explicitly (reducer + typed actions), unit-test it, and keep the server authoritative for time and status.
