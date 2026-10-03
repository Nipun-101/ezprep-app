# Executive Summary

## What exists
EZ Prep web is a **Next.js 13.5 App Router** app (React 18, TypeScript strict, Tailwind + shadcn/Radix, axios). It is a thin client over a separate REST API (`ez-prep-api`, `/api/v1`). It has no route handlers, server actions, or tests. **[Verified]**

The real product surface is smaller than the route count suggests:

| Real, API-backed | Mock / static / placeholder |
| --- | --- |
| Sign-in (MSG91 phone OTP, Google OAuth PKCE) | `/analytics` (dummy data, unprotected) |
| Dashboard: exams by category, search | `/study-materials` (static arrays) |
| Exam hub: overview, topic-wise, full mocks, sprint tests | 8 "coming soon" dashboard routes |
| Attempt runner: timer, palette, sessions, pause/resume, submit | `/test` (legacy dummy runner), `/complete-profile` (orphan) |
| Results + answer key | Marketing home sections (static) |
| Profile: stats, activity, subjects, badges, edit | |
| Current affairs: daily swipe cards + "new" badge | |

## Assessment
- **Architecture is migration-friendly.** Business logic lives in small, mostly pure modules (`lib/attempt-sessions.ts`, `lib/exam-test-routes.ts`, `lib/safeRedirect.ts`, `lib/api/*`). These can be ported as tested pure functions. UI must be rebuilt natively.
- **Auth is the hardest boundary.** Both sign-in methods depend on browser mechanics: the MSG91 DOM widget, and a Google redirect to the web origin. Sessions use a bearer JWT with no refresh and client-only logout, which maps cleanly to SecureStore.
- **The attempt runner is the product core and the main engineering risk.** It uses an interval timer that re-renders the whole runner, fire-and-forget answer saves, and `beforeunload` pause. Math rendering is DOM-only (`mathpix-markdown-it`).
- **Quality baseline is low.** There are no tests, no API schema, unused dependencies, and dead code. The mobile app must not inherit this. It starts with zod contracts and tests.

## Top risks
1. **Google sign-in needs a backend contract change** for native (ID token). Ship OTP first. (R-01, U-02)
2. **No native MSG91 path confirmed.** Spike the MSG91 RN SDK. Fallback is backend OTP endpoints. (R-02, U-01)
3. **Math/question rendering fidelity and performance.** Dedicated spike phase. (R-03, U-31)
4. **Timer and answer durability on mobile** (background, kill, flaky network). (R-04, R-05, U-03, U-17)
5. **Play Store requirements**: account deletion, Data Safety, brand assets. (R-13, U-32, U-23)

## Recommendation
- A **separate Expo repo** with Expo Router, TypeScript strict, development builds, TanStack Query + zod over a small `fetch` client, SecureStore for the token, and `StyleSheet` + theme tokens. No global state library.
- **Navigation:** auth group → bottom tabs (Home · Current Affairs · Profile · More) + a full-screen attempt runner.
- **Phases:** 00 Foundation → 01 Auth → 02 Shell → 03 Discovery → 04 Exam hub → 05 Question rendering (spike) → 06 Attempt engine → 07 Results → 08 Profile → 09 Current affairs → 10 Release hardening → 11 iOS. Phases 08 and 09 can run in parallel with 04–07 after 02. Phase 05's spike can start right after 00.
- **First phase:** Phase 00 Foundation. Before it starts, resolve **U-29** (package name), **U-26** (repo), and **U-30** (staging/test accounts), and send **U-01/U-02** to the backend team so Phase 01 isn't blocked.

See [`phases/README.md`](phases/README.md) for the full plan.
