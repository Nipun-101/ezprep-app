# Security Analysis

## 1. Current web posture (observations, not changes)

| # | Observation | Evidence | Relevance to mobile |
| --- | --- | --- | --- |
| S1 | The bearer token sits in `localStorage` **and** a JS-readable cookie (not HttpOnly). Any XSS can read it | `lib/auth.ts` | Mobile must use OS secure storage |
| S2 | No refresh token. The token lifetime is set by the backend (cookie 7 d) | `lib/auth.ts` | Expect re-login on expiry. No silent refresh to implement unless the backend adds one (`U-04`) |
| S3 | Logout is client-only. No server revocation | `lib/auth.ts` | A stolen token stays valid until expiry. Ask the backend whether revocation exists (`U-04`) |
| S4 | Middleware checks cookie **presence** only | `middleware.ts` | Fine as UX gating. The API must enforce auth |
| S5 | Some authenticated-looking pages are outside protection (`/analytics`, `/profile`, `/study-materials`) | `middleware.ts` | N/A for mobile (all app screens are behind the auth group) |
| S6 | `MathText` renders Mathpix markdown with `htmlTags` enabled | `MathText.tsx` | Question/explanation content is trusted CMS content. If rendered in a WebView, **disable JS navigation, block external URLs, no `injectedJavaScript` with secrets, no token in the WebView** |
| S7 | Open-redirect protection for post-login paths | `lib/safeRedirect.ts` | Port the same rules for deep links |
| S8 | Google OAuth uses state + PKCE S256 | `lib/googleAuth.ts` | The native flow must keep equivalent protections (handled by the native SDK or AuthSession) |
| S9 | MSG91 `widgetId` + `tokenAuth` are public browser values | `.env.example`, README | Equally public in a mobile binary. **Assumption:** MSG91 tokenAuth is designed to be public. Confirm the MSG91 dashboard restricts it (domain/app restrictions) (`U-01`) |
| S10 | `console.error` logs whole error objects (axios errors include request config with the `Authorization` header) | many | Mobile logger must **redact headers** and never log tokens, OTP payloads, or phone numbers |
| S11 | Fallback API URL `http://localhost:4000` in auth paths | auth code | Mobile config must **fail fast** if the API URL is missing, not fall back |
| S12 | Attempt details endpoint may return `correctAnswer` before submission | `AttemptDetails` type includes it; runner strips it via `attemptDetailsToRunnerData` | **[Unknown]** whether the server sends answers for IN_PROGRESS attempts (`U-06`). If yes, it is exploitable from any client, and mobile makes inspection easier. Backend should verify |
| S13 | `.env` file exists locally (gitignored) with live values | `.gitignore`, `.env` | Never copy `.env` into the mobile repo. Create `.env.example` with names only |

## 2. Client-safe vs server-only configuration

| Value | Client-safe? | Notes |
| --- | --- | --- |
| API base URL (`EXPO_PUBLIC_API_URL`) | ✅ | Per environment |
| MSG91 widget id / tokenAuth | ✅ (already public on web) | Confirm MSG91 restrictions (`U-01`) |
| Google **web** OAuth client id | ✅ | Needed as `webClientId` for native ID tokens |
| Google **Android** OAuth client id | ✅ (not even needed in code: tied to package name + SHA-1) | Configured in Google Cloud |
| Google iOS client id / reversed URL scheme | ✅ | Later |
| Google OAuth **client secret** | ❌ **server only** | Never in the app |
| MSG91 **auth key** (server API key) | ❌ **server only** | Never in the app |
| JWT signing secret | ❌ **server only** | |
| Any analytics/crash DSN | ✅ usually (public by design) | Decide per vendor |
| EAS tokens, keystore passwords, Play service account JSON | ❌ CI secrets only | EAS secrets / CI secret store. Never in the repo |

**Rule:** Anything in `EXPO_PUBLIC_*` ends up in the JS bundle and can be extracted. Treat it as public.

## 3. Mobile security rules
See [`engineering-rules.md`](engineering-rules.md) §Security for the binding list. Summary:
- Store the token only in `expo-secure-store` (`keychainAccessible: AFTER_FIRST_UNLOCK` or stricter). Never in AsyncStorage, never in logs.
- Use HTTPS-only API in release. Allow cleartext only in a dev-build network config.
- Validate API responses with zod at the service boundary. Fail closed with a user-friendly error.
- On 401: clear the token, clear the query cache (no stale personal data), route to sign-in.
- Request no unnecessary permissions. Initially **none** besides INTERNET. CA image saving uses the share sheet, which needs no storage permission.
- Disable release-build debug features. Do not enable `android:debuggable`. Strip verbose logging.
- Do not use WebView for authentication.
- If a WebView is used for math: `originWhitelist` limited to `about:blank`/local content, `javaScriptEnabled` only if the renderer needs it, `onShouldStartLoadWithRequest` blocks navigation, no cookies/token shared.

## 4. Assumptions that need backend validation
1. The API enforces authorization on every user-specific endpoint (attempts are scoped to the token's user).
2. `POST /auth/verify-otp` verifies the MSG91 access token server-side with MSG91 and is not trusting the client.
3. Correct answers are withheld until an attempt is submitted/expired (`U-06`).
4. Token lifetime and revocation policy (`U-04`).
5. CORS is irrelevant to native apps. The backend must not rely on CORS/Origin as a security control.
6. Rate limiting on auth endpoints exists server-side.
