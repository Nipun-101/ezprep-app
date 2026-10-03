# Engineering Rules (Global Project Rules)

Every mobile implementation session follows these rules. When a phase file conflicts with them, these rules win unless the phase file names an explicit, approved exception.

## 1. Session protocol
1. Read this file, then [`MOBILE_STATUS.md`](MOBILE_STATUS.md), then the phase file.
2. Read only the web source files the phase lists (web = reference for behavior, never for copy-paste).
3. Implement **only** the current phase. Don't start the next phase or "prepare" for it.
4. Validate: typecheck, lint, tests, then the phase's device checklist on the physical Android device.
5. Update `MOBILE_STATUS.md`: status, date, what was done, deviations, new unknowns, follow-ups.
6. If a blocker (an unknown) can't be resolved, stop. Record it in `MOBILE_STATUS.md` and `unknowns.md` instead of guessing.

## 2. Boundaries
- Do not modify the Next.js web app or the backend.
- Do not change product behavior (what the user can do, business rules, scoring, timing) without a recorded product decision.
- Do not change API contracts from the client side. If a backend change is needed, document it and wait.
- Do not add dependencies outside [`package-strategy.md`](package-strategy.md) without recording the rationale in `MOBILE_STATUS.md`.
- Use `npx expo install` for Expo-managed packages and Yarn for everything else. Commit the lockfile.

## 3. Security rules
- No private secrets in the app, in `app.config.ts`, or in `EXPO_PUBLIC_*` variables. Only the client-safe values in `security-analysis.md` §2.
- Auth tokens live **only** in `expo-secure-store` (and in memory). Never in AsyncStorage, logs, URLs, analytics, or crash reports.
- Never log tokens, OTPs, phone numbers, emails, names, or full API responses. Use `services/logger.ts`, which redacts.
- Validate API responses with zod at the boundary. Treat every API field as untrusted (nullable unless proven otherwise).
- Handle 401 everywhere through the single `http.ts` path.
- HTTPS only in preview/production. No `usesCleartextTraffic`. No dev menu, no debug flags, no test credentials in release builds.
- No auth in WebViews. If a WebView is used for content (math), it gets no tokens, no navigation to arbitrary URLs (`originWhitelist` limited), no `javascript:` injection of user data without escaping.
- Request only the permissions a feature needs. Remove default permissions you don't need.
- Document every security assumption that needs backend confirmation in `unknowns.md`.

## 4. Code rules
- TypeScript `strict: true`. No `any` (use `unknown` + zod). No `@ts-ignore` without a comment explaining the constraint.
- Follow the layers in [`mobile-architecture.md`](mobile-architecture.md): route files are thin; API calls only through `src/features/*/api` + `src/api/http.ts`; device APIs only through `src/services`.
- Server state goes in TanStack Query. Global client state only in `src/stores` (auth, CA-seen). Everything else is local.
- Styling uses `StyleSheet` + `src/theme` tokens. No hard-coded colors outside `theme/`.
- Every screen handles **loading, empty, error (with retry), and offline** states.
- Accessibility: every touchable has `accessibilityRole` + `accessibilityLabel`; touch targets ≥ 44×44 dp; support dynamic font scaling without clipping; colour is never the only signal.
- Platform-specific code goes in `.android.tsx`/`.ios.tsx` or `Platform.select`. Never assume Android-only.
- Port **logic** from the web as pure functions with tests (e.g. `lib/attempt-sessions.ts`, `lib/exam-test-routes.ts`, `lib/safeRedirect.ts`). Re-implement **UI** natively.
- User-visible copy matches the web unless a phase says otherwise.

## 5. Quality gates (each phase)
- `yarn typecheck`, `yarn lint`, and `yarn test` pass.
- New pure logic has unit tests. New screens have at least one component test for the main and error states.
- The phase's manual device checklist passes on the physical device (dev build), and on a release build for phases 06 and 10.
- No new warnings in the Metro console during the checklist (yellow-box warnings are triaged).

## 6. Change management
- One phase = one branch = one PR (or a small series). Use the phase number in the branch name: `phase-03-home-discovery`.
- Feature flags (`src/config/flags.ts`) for anything blocked by a pending backend decision (e.g. Google sign-in).
- Rollback = revert the phase PR. A phase must not leave earlier phases broken.
