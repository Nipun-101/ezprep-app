# Testing Strategy

The web app has **no automated tests** [Verified]. The mobile app starts with tests from phase 00, so the risky parts (auth, attempt engine) are covered before they ship.

## 1. Layers

| Layer | Tool | Scope | Where |
| --- | --- | --- | --- |
| Static | `tsc --noEmit` (strict), ESLint (`eslint-config-expo`), Prettier check | All code | Local + CI |
| Unit | `jest-expo` | Pure logic: `features/*/model`, `utils`, zod schemas, env validation, `http.ts` error normalisation | `*.test.ts` next to the source |
| Component | React Native Testing Library | Primitives, feature components, screens with mocked hooks | `*.test.tsx` |
| Integration | RNTL + mocked `fetch` (or MSW) + real QueryClient | Screen + hooks + http, e.g. sign-in → token saved → Home | `__tests__/integration` |
| E2E | Maestro flows | Critical journeys on an emulator or the physical device | `.maestro/` |
| Manual | Device checklist per phase | UX, performance feel, back button, keyboard, accessibility | Phase files |

## 2. Priority test targets

### Auth (phase 01)
- `AuthProvider` state machine: restoring → signedIn/signedOut. 401 → signedOut + cache cleared. Logout clears SecureStore.
- `isSafeInAppPath` port: the full rule table from `lib/safeRedirect.ts` (`//`, `..`, `/login*`, `/`).
- `http.ts`: attaches the bearer token, unwraps the envelope, normalises `message`, timeout → `ApiError` with the network kind, 401 → `onUnauthorized` exactly once under concurrent requests.
- The token is never logged (logger redaction unit test).

### Attempt engine (phase 06): highest value
Port the web logic as pure functions and test them against these cases:
- Time: `computeAttemptSecondsLeft` parity (startedAt + duration − now). Deadline timer correct after a simulated 5-minute background.
- Statuses: answered / not-answered / marked / marked-answered / not-visited transitions. Tapping the selected option clears it. Marking is one-way (web parity).
- Sessions: `isSessionWiseAttempt`, `getActiveSession`, `getSessionQuestionIndexes`, `getLastSessionId`, recovery after a `sessions/complete` error.
- Submit payload: `answers[]` contains **only answered questions** `{ questionId, selectedOptionId }` (web `handleSubmitPaper` maps the answers Map, from which cleared answers are deleted).
- Status routing: SUBMITTED/EXPIRED → result. PAUSED → paused overlay.
- Single-flight: double submit is impossible. Time-up auto-submit happens once.
- Reducer handles a late PATCH failure (no crash, local state kept).

### Results (phase 07)
- Score colour thresholds (`≥80, ≥60, ≥40, ≥20`, full marks → green), accuracy = correct ÷ attempted (0 when attempted = 0), `totalScore`/`timeTaken` fallbacks, section breakdown only when sections > 1.

### Lists and catalog
- `PracticeTestCard`'s action button mapping: START/RETAKE/RESUME/null → label + handler. Locked/unavailable states.
- Pagination: `fetchNextPage` stops at the last page. Search/subject filter resets pages.

### Current affairs
- Date key in local time. The future-date guard. The seen-date logic (badge when today's key ≠ stored). Swipe threshold decision function.

### Session hardening (phase 12)
- Auth response Zod accepts optional `refreshToken` / `expiresIn` (degraded Redis omit).
- Login bodies always include `client: 'mobile'`.
- `http.ts` refresh is **single-flight**: concurrent 401s share one `POST /auth/refresh`; success stores rotated refresh and retries once; refresh 401 → one sign-out.
- Logout clears access + refresh SecureStore keys and best-effort calls `POST /auth/logout`.
- Tokens never appear in logs (redaction covers `refreshtoken`).

### Access locking (phase 13)
- `isAccessDenied` / `isStartBlocked`: missing `access` ⇒ allowed; `RESUME` + `resumeAttemptId` never blocked by lock; denied Start/Retake.
- Entitlement UI copy is exactly the owner website-only message; assert **no** “View plans”, Buy, or URL / `Linking` purchase actions in the locked path.
- Optional: focus/AppState invalidation helpers refetch the correct React Query keys.

### Multi-target exams (phase 14)
- `orderCategoriesByTargets` stable sort; empty targets leave order unchanged.
- Cap at 5; primary = first id.
- Results prompt: only explicit “Not now” calls dismiss-prompt (back/overlay close does not).

### Support & feedback (phase 15)
- `buildFeedbackPayload`: omit empty text and zero ratings; enforce max 1000; reject empty payload client-side.
- Component: Send disabled when empty; star toggle clears.

### Subscriptions read-only (phase 16)
- `formatPaiseAsRupees`, `gstBreakdownLine` (intra vs inter), `formatDurationPreset`.
- Section error isolation (one rejected promise does not blank sibling sections).
- Coming-soon constants no longer list courses / concept-videos / bookmarks / subscriptions-as-placeholder.

## 3. Mocking rules
- Mock at the **HTTP boundary** (fetch), not inside feature hooks, so contracts get exercised.
- Fixtures: build them from the response shapes documented in `api-architecture.md`. Mark every field the web code reads. Never use real user data or tokens.
- Mock `expo-secure-store`, `AsyncStorage`, and the Google/MSG91 SDKs with in-memory fakes.
- Time: Jest fake timers + an injectable `now()` for the runner.

## 4. E2E flows (Maestro)

| Flow | Phase |
| --- | --- |
| Launch → sign-in screen → phone → OTP (test number / staging, `U-30`) → Home | 01 |
| Restore session on relaunch, then logout → sign-in | 01 / 12 |
| Kill app mid-session → relaunch still signed in (refresh present) | 12 |
| Home → exam → Topic Wise → start test → answer 2 → pause & leave → resume → submit → result | 06–07 |
| Background the app mid-attempt for 60 s → timer correct on return | 06 |
| Current affairs: swipe through cards, change date, badge clears | 09 |
| Locked paper → owner message, no purchase CTA (no payment automation) | 13 |
| More → Share feedback → thank-you | 15 |
| More → My Subscriptions loads sections | 16 |

E2E against a real backend needs a **test account / staging environment / OTP bypass** (`U-30`). Until that exists, E2E runs only up to the sign-in screen or uses an injected dev token in development builds (never in release). **Do not** automate Razorpay or website checkout in Maestro for v1 (purchases are website-only).

### Manual cross-phase validation (phases 12–16)
Each phase file owns its device checklist. Minimum owner smoke after 12–16:

1. OTP sign-in lasts beyond 15 minutes (or silent refresh keeps the session).
2. Locked paper shows the website-only message; buy on `ezprep.in` in a browser; return to app → paper unlocks.
3. Target exams: add from Home/exam star; results Not now vs Add.
4. Feedback + Subscriptions + More cleanup (no Courses/Bookmarks/Concept Videos).

## 5. CI (phase 00 for setup, phase 10 for release gates)
- On PR: install (frozen lockfile), typecheck, lint, unit + component tests.
- On main/tag: an EAS Build `preview` profile (Android APK) for internal testers.
- Release: EAS Build `production` (AAB) → EAS Submit to the Play internal track (manual promotion).

## 6. Physical-device policy
Each phase has a manual device checklist. A phase is not done until that checklist passes on the **physical Android device** using a **development build** (not Expo Go). Phases 06 and 10 also need a **release (preview/production) build**.
