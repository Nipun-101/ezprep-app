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

## 3. Mocking rules
- Mock at the **HTTP boundary** (fetch), not inside feature hooks, so contracts get exercised.
- Fixtures: build them from the response shapes documented in `api-architecture.md`. Mark every field the web code reads. Never use real user data or tokens.
- Mock `expo-secure-store`, `AsyncStorage`, and the Google/MSG91 SDKs with in-memory fakes.
- Time: Jest fake timers + an injectable `now()` for the runner.

## 4. E2E flows (Maestro)

| Flow | Phase |
| --- | --- |
| Launch → sign-in screen → phone → OTP (test number / staging, `U-30`) → Home | 01 |
| Restore session on relaunch, then logout → sign-in | 01 |
| Home → exam → Topic Wise → start test → answer 2 → pause & leave → resume → submit → result | 06–07 |
| Background the app mid-attempt for 60 s → timer correct on return | 06 |
| Current affairs: swipe through cards, change date, badge clears | 09 |

E2E against a real backend needs a **test account / staging environment / OTP bypass** (`U-30`). Until that exists, E2E runs only up to the sign-in screen or uses an injected dev token in development builds (never in release).

## 5. CI (phase 00 for setup, phase 10 for release gates)
- On PR: install (frozen lockfile), typecheck, lint, unit + component tests.
- On main/tag: an EAS Build `preview` profile (Android APK) for internal testers.
- Release: EAS Build `production` (AAB) → EAS Submit to the Play internal track (manual promotion).

## 6. Physical-device policy
Each phase has a manual device checklist. A phase is not done until that checklist passes on the **physical Android device** using a **development build** (not Expo Go). Phases 06 and 10 also need a **release (preview/production) build**.
