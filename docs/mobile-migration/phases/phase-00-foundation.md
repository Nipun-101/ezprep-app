# Phase 00 — Foundation

## Objective
Create the mobile codebase and its non-negotiable infrastructure: Expo + Expo Router + TypeScript strict, development build on the physical Android device, theme tokens, the HTTP client, env validation, logging, storage services, test tooling, and CI. At the end of this phase there are **no product features**, only a running app shell with a diagnostics screen.

## Prerequisites
- Decisions: **U-26** (separate repo), **U-29** (package name `in.ezprep.app`?, scheme `ezprep`, display name), **U-14/U-30** (staging API URL).
- Expo account / EAS project owner. Android device with USB debugging. Node LTS + Yarn.
- Backend asks U-01, U-02, U-04, U-06, U-32 sent to the backend owner (tracked in `MOBILE_STATUS.md`).

## Source documents
`../mobile-architecture.md`, `../package-strategy.md`, `../design-system.md`, `../security-analysis.md`, `../testing-strategy.md`, `../engineering-rules.md`, `../api-architecture.md` §1 (client config).

## Web reference (read-only)
- `lib/api/client.ts` (base URL, envelope, 401 behavior), `tailwind.config.ts`, `app/globals.css` (tokens), `app/layout.tsx` (font, metadata), `.env.example` (variable names only).
- APIs: none called in this phase except an optional reachability check (no auth).

## Target mobile routes and components
- `app/_layout.tsx` (providers, fonts, splash), `app/index.tsx` (temporary diagnostics screen: app version, variant, API URL host, health check result), `app/+not-found.tsx`.
- `src/components/ui`: `Screen`, `Text`, `Button`, `Card`, `LoadingState`, `ErrorState`, `EmptyState` (minimal versions).

## Files to create
```
package.json, yarn.lock, app.config.ts, eas.json, tsconfig.json, babel.config.js (if needed), metro.config.js (if needed)
.eslintrc.js / eslint.config.js, .prettierrc, .gitignore, .env.example (EXPO_PUBLIC_* names only), jest.config.js
app/_layout.tsx, app/index.tsx, app/+not-found.tsx
src/config/env.ts, src/config/flags.ts
src/api/http.ts, src/api/errors.ts, src/api/envelope.ts, src/api/queryClient.ts
src/services/secureStorage.ts, src/services/kvStorage.ts, src/services/logger.ts, src/services/appState.ts
src/theme/{colors,typography,spacing,radius,elevation,index}.ts
src/components/ui/{Screen,Text,Button,Card,LoadingState,ErrorState,EmptyState}.tsx
src/utils/safeRedirect.ts (port of lib/safeRedirect.ts) + tests
.github/workflows/ci.yml (or the chosen CI)
README.md (setup, run, build), docs/ (copy or link this documentation set)
```

## Files that may be modified
None outside the new mobile repository. `../MOBILE_STATUS.md` (status update).

## Do-not-touch boundaries
- The Next.js repo (except `MOBILE_STATUS.md` if the docs stay here) and the backend.
- No auth, catalog, or attempt features. No feature packages from later phases.

## Dependencies
Core + data/storage + tooling sections of `../package-strategy.md`: `expo`, `expo-router` and deps, `expo-dev-client`, `expo-font` + Inter, `expo-splash-screen`, `expo-status-bar`, `expo-constants`, `expo-linking`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-svg`, `expo-image`, `@tanstack/react-query`, `zod`, `expo-secure-store`, `@react-native-async-storage/async-storage`; dev: `eslint-config-expo`, `prettier`, `jest-expo`, `@testing-library/react-native`.

## Implementation tasks
1. `npx create-expo-app` with the TypeScript/Router template. Remove example screens. Set `strict: true` and the `@/*` → `src/*` alias.
2. `app.config.ts` with `APP_VARIANT` (`development` | `preview` | `production`): package `in.ezprep.app` + `.dev`/`.preview` suffixes, the name suffix, scheme `ezprep`, portrait orientation (U-22), `android.permissions: []` (strip defaults not needed), `userInterfaceStyle: 'light'`, adaptive icon placeholders (U-23).
3. `eas.json` profiles: `development` (dev client, internal), `preview` (APK, internal), `production` (AAB, auto-increment versionCode). Env per profile via EAS environment variables.
4. `src/config/env.ts`: zod-parse `EXPO_PUBLIC_API_URL` (https required unless development), `EXPO_PUBLIC_MSG91_WIDGET_ID`, `EXPO_PUBLIC_MSG91_TOKEN_AUTH`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (optional). Throw a readable error at startup when invalid.
5. `src/api/http.ts`: `request<T>(method, path, { body, query, schema, timeoutMs, auth })`. Base `${API_URL}/api/v1`, JSON, timeout via AbortController, `Authorization` from a token getter (injected later by Auth), envelope unwrap, zod parse, `ApiError` normalisation (status, message from body when it's a string, kind: `network | timeout | http | parse`), `onUnauthorized` hook (single fire).
6. `src/api/queryClient.ts`: defaults (staleTime 30 s, retry 1 on GET for network/5xx only, no mutation retry). Wire `focusManager` to AppState and (optionally) `onlineManager`.
7. Services: `secureStorage` (get/set/delete with try/catch), `kvStorage` (typed JSON over AsyncStorage), `logger` (redaction of `authorization|token|accessToken|otp|phone|email`, `debug` off in non-dev), `appState` (subscribe helper).
8. Theme tokens from `../design-system.md` (teal brand, slate neutrals, sky runner accent, radii, spacing, Inter weights 400/500/600/700).
9. UI primitives with accessibility props and font scaling.
10. Root layout: load fonts while the splash is visible, `GestureHandlerRootView`, `SafeAreaProvider`, `QueryClientProvider`, root `ErrorBoundary`.
11. Diagnostics screen (development and preview only): app version, variant, API host, and a reachability call to a public endpoint (e.g. `exam-groups/by-category` if public, U-05). Show the error state on failure.
12. Port `lib/safeRedirect.ts` → `src/utils/safeRedirect.ts` with unit tests (all rules).
13. Unit tests: env parsing, `http.ts` (success, envelope, error message, timeout, 401 hook once), logger redaction.
14. CI: install (frozen lockfile) → typecheck → lint → test.
15. Build the `development` profile with EAS and install it on the device. Document the commands in the README.

## Requirements
- **UX:** Inter loads before the first render (no FOUT); safe areas respected; status bar dark content on a light background.
- **API:** No endpoints used beyond the diagnostics check. The client contract is fixed for all later phases.
- **Security:** Only client-safe env names. `.env*` ignored except `.env.example`. No cleartext in preview/production. No secrets in EAS public env. Release builds have no dev menu.
- **Performance:** Cold start of the dev build is acceptable. Record the release-build baseline (preview APK) cold start in `MOBILE_STATUS.md`.
- **Testing:** jest-expo runs in CI. ≥ 1 test per service.

## Acceptance criteria
- `yarn typecheck`, `yarn lint`, and `yarn test` pass locally and in CI.
- The dev build installs on the physical device, opens the diagnostics screen, and shows the API reachability result.
- A preview APK builds on EAS and launches.
- An invalid or missing env var produces a clear startup error, not a crash loop.

## Manual device checklist
- [ ] Dev build installs and launches. Fast refresh works over USB/LAN.
- [ ] Inter renders (compare with the web).
- [ ] Safe area on a notched/gesture-nav device. Hardware back on the root exits the app.
- [ ] Font size set to the largest in Android settings: diagnostics text doesn't clip.
- [ ] Airplane mode: the diagnostics check shows the error state with Retry. Retry works after reconnecting.
- [ ] The preview APK launches with no dev menu.

## Risks
R-17 (env misuse), R-14 (token drift), R-20 (backend asks not raised early).

## Rollback / isolation
A new repository. Rollback = do not merge. Nothing depends on it yet.

## Completion checklist
- [ ] All files created as listed. No feature code.
- [ ] Package name and scheme recorded (U-29 resolved).
- [ ] Backend asks sent and logged in `MOBILE_STATUS.md`.
- [ ] `MOBILE_STATUS.md` updated with build commands, versions (Expo SDK, RN), and the baseline start time.

## Definition of done
A strict-TypeScript Expo Router app with a validated env, a tested HTTP client, storage/logging services, theme tokens, CI, and dev + preview builds running on the physical Android device.
