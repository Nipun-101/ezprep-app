# Phase 01 — Authentication

## Objective
Users can sign in with **phone OTP** and (when the backend contract is ready) **Google**. The session is stored securely, restored on launch, expires correctly on 401, and logout works. Signed-in users land on a placeholder Home. Signed-out users can't reach `(app)` routes.

Split into two independently shippable parts:
- **01A Session + phone OTP** (blocked only by U-01, U-28)
- **01B Google sign-in** (blocked by U-02). Behind the flag `flags.googleSignIn`.

## Prerequisites
- Phase 00 done.
- U-01 spike result (MSG91 RN SDK works) **or** backend OTP endpoints available.
- U-30: test phone numbers / staging.
- For 01B: U-02 contract agreed; Android OAuth clients registered for the dev/preview SHA-1s.

## Source documents
`../authentication.md`, `../mobile-authentication.md`, `../security-analysis.md`, `../api-architecture.md` (A1–A2, P1), `../navigation-map.md` (J1), `../design-system.md`.

## Web reference (read-only)
- Routes: `/login`, `/` (guest), the `middleware.ts` guard behavior.
- Components: `components/auth/LoginModal.tsx`, `GoogleSignInButton.tsx`, `GoogleSignInPrompt.tsx`, `GoogleOAuthReturn.tsx`, `app/login/page.tsx`.
- Lib: `lib/auth.ts`, `lib/googleAuth.ts`, `lib/safeRedirect.ts`, `lib/authCookieNames.ts`, `lib/api/client.ts` (401 interceptor).
- APIs: `POST /auth/verify-otp`, `POST /auth/google` (new contract per U-02), `GET /users/me` (restore validation).

## Target mobile routes and components
- `app/(auth)/_layout.tsx`, `sign-in.tsx`, `phone.tsx`, `verify.tsx`.
- `app/(app)/_layout.tsx` (guard), `app/(app)/(tabs)/index.tsx` (placeholder Home: "Signed in" + Logout; replaced in 02/03).
- `src/features/auth/`: `AuthProvider`, `useAuth`, `api/authApi.ts` (verifyOtp, googleSignIn), `otp/` adapter (`msg91.ts` SDK or backend implementation behind one interface `OtpProvider { send(phone), verify(reqId, otp) → msg91Token }`), `google/` adapter (`googleSignIn.ts`), components `PhoneInput`, `OtpInput`, `GoogleButton`, `LegalNotice`, `VerifyingOverlay`.

## Files to create
The files above, plus tests: `AuthProvider.test.tsx`, `otpFlow.test.tsx`, `googleFlow.test.tsx`, `http.unauthorized.test.ts`.

## Files that may be modified
`app/_layout.tsx` (add AuthProvider, splash until restored), `src/api/http.ts` (wire the token getter and onUnauthorized only), `app.config.ts` (Google sign-in config plugin for 01B), `src/config/flags.ts`, `src/config/env.ts` (if a var is added), `../MOBILE_STATUS.md`. Remove `app/index.tsx` diagnostics from the release routing (keep it accessible in dev only).

## Do-not-touch boundaries
Web repo, backend. Phase 00 primitives' public API (extend, don't break). No catalog/attempt features.

## Dependencies
`expo-web-browser` (legal links), the MSG91 RN SDK (if option A), `@react-native-google-signin/google-signin` (01B; dev build required).

## Implementation tasks
1. **AuthProvider** state machine (`restoring | signedOut | signedIn`) per `../mobile-authentication.md` §2. Expose `signIn(token)` and `signOut(reason)`. Single in-flight sign-in promise.
2. Restore: read SecureStore during the splash → set status → background `GET /users/me`; a 401 → signOut('expired').
3. Wire `http.ts`: the token getter from the provider; `onUnauthorized` → `signOut('expired')` + `queryClient.clear()`; show the expiry message on the sign-in screen.
4. Route guards in group layouts (or `Stack.Protected`). Pending deep-link target stored in memory, validated by `safeRedirect`.
5. **Sign-in screen:** logo, headline/subtitle copy from `LoginModal` (read the web for exact strings), "Continue with mobile number", "Continue with Google" (only if the flag is on + client id is set), legal notice links → in-app browser (U-12).
6. **OTP adapter:** implement the chosen option (U-01). Phone screen: +91 prefix, 10-digit validation. Verify screen: OTP field with SMS autofill hints, resend countdown, change number. Then `POST /auth/verify-otp { accessToken }` → `data.accessToken` → `signIn`.
7. **Google adapter (01B):** `GoogleSignin.configure({ webClientId })`, `hasPlayServices`, `signIn` → `idToken` → agreed endpoint → `signIn`. Cancel is silent. Map errors per `../mobile-authentication.md` §6.
8. Logout (placeholder Home, moved to More in 02): confirm dialog (U-25) → `signOut('user')` + `GoogleSignin.signOut()` if used.
9. Error copy parity with the web (see `../authentication.md`). The verifying overlay reads "Verifying your account...".
10. Tests (see below).

## Requirements
- **UX:** Keyboard-aware layout; the OTP field autofocuses; buttons show pending state and are disabled while in flight; Android back from verify → phone (number kept); back from sign-in exits the app.
- **API:** zod schemas for `{ data: { accessToken: string } }`. Treat any other shape as an error. Never send the phone number to the EZ Prep API unless the contract requires it.
- **Security:** The token only goes in SecureStore. No logging of OTP/phone/token. No WebView. Release builds have no test bypass. Google `webClientId` is client-safe. Validate the `safeRedirect` target before navigating.
- **Performance:** Restore is under 300 ms beyond font load (SecureStore read only; `/users/me` runs in the background).
- **Testing:** Unit tests for the provider transitions, 401 handling (concurrent 401s → one signOut), and safeRedirect. Component tests for the phone validation, OTP submit, error display, and the hidden Google button when unconfigured. The SDKs are mocked.

## Acceptance criteria
- A real test number signs in on the device and reaches Home. Relaunching the app keeps the user signed in.
- Logout returns to sign-in. Relaunch stays signed out. SecureStore is empty.
- An invalid/expired token (simulate by corrupting it in a dev menu or via a backend-expired token) → the next request signs out with the expiry message.
- (01B) Google sign-in works on the dev and preview builds. Cancel shows no error.
- Deep link `ezprep://exam/123` while signed out → after sign-in, lands on the target (once 04 exists; for now it validates and falls back to Home).

## Manual device checklist
- [ ] OTP: wrong code → error. Resend works after the countdown. Change number works.
- [ ] SMS autofill suggestion appears (if supported by the template).
- [ ] Airplane mode during send/verify → a clear error. Retry works.
- [ ] Kill the app on the verify screen → relaunch → sign-in (no half state).
- [ ] Google: account chooser, cancel, and success. A device without Google Play Services (emulator image) → falls back gracefully.
- [ ] TalkBack reads the fields, buttons, and errors. Large font doesn't clip the OTP field.
- [ ] Hardware back behavior as specified.

## Risks
R-01, R-02, R-09, R-16.

## Rollback / isolation
Google is behind a flag, so it can be shipped disabled. The OTP provider is behind an interface, so SDK vs backend can be swapped without touching the UI. Reverting the phase PR restores the phase 00 shell.

## Completion checklist
- [ ] U-01 / U-02 outcomes recorded.
- [ ] SHA-1s registered for dev and preview (production in phase 10).
- [ ] No token/OTP in logs (grep a device logcat during the flow).
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A user can sign in by phone OTP (and Google if U-02 is resolved), stay signed in across launches, be signed out on expiry, and log out, all on the physical Android device, with tests covering the session logic.
