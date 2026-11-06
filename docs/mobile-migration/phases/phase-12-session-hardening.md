# Phase 12 — Session hardening (Redis sessions + refresh)

## Objective
Make mobile sessions Instagram/WhatsApp-style: **stay signed in across launches**, **independent of web**, with **rotating refresh** and **server-side revoke on logout**.

Backend + web already support this. This phase wires the native client.

## Urgency (P0)

After API auth updates (2026-11-05), `POST /auth/verify-otp` defaults `client` to **`web`**. The current mobile OTP body sends only `{ accessToken }`, so phone sign-in receives:

- a **~15 minute** access JWT (web TTL), and
- **no** `refreshToken` in the JSON (refresh goes to an HttpOnly cookie the app ignores).

OTP users are forced to re-login roughly every 15 minutes until this phase ships. Google `POST /auth/google/mobile` defaults to `mobile` and is less broken, but still lacks refresh/logout wiring.

**Ship `client: 'mobile'` on OTP immediately as part of this phase.**

## How mobile sessions work (API contract today)

```mermaid
sequenceDiagram
  participant App
  participant API
  participant Redis
  App->>API: login with client=mobile
  API->>Redis: session sid TTL 90d + refresh hash
  API-->>App: accessToken + refreshToken + expiresIn
  App->>App: SecureStore both tokens
  Note over App,API: Until this phase ships, OTP wrongly gets web 15m TTL
  App->>API: API call Bearer access
  API->>Redis: sid must exist (cached ~90s)
  App->>API: 401 or proactive refresh
  API->>Redis: rotate refresh, SLIDE idle window +90d
  API-->>App: new access + refresh
  App->>API: POST /auth/logout
  API->>Redis: delete this sid only
```

| Concern | Behavior |
| --- | --- |
| Login | Always send `client: 'mobile'` (OTP + Google). `POST /auth/google/mobile` already defaults to mobile; **OTP does not** — must send explicitly |
| Access JWT | With `client=mobile`, today **90d** (`MOBILE_ACCESS_TTL_SEC`) so pre-refresh builds keep working. After this phase proves refresh on device, prefer shortening to **~1h** on the API only (ask the API owner; do not change API code in this mobile session) |
| Refresh | Opaque; stored hashed in Redis; **rotated** on every use. Presenting an already-rotated refresh **revokes the whole session** |
| Idle window | **90d sliding** on each successful refresh — open the app at least once per 90 days → stay signed in |
| Web logout | Revokes **web `sid` only** — phone stays signed in |
| Mobile logout | `POST /auth/logout` → revoke this device only |
| Stolen refresh | Rotation + mismatch revoke; store refresh only in SecureStore |
| Degraded Redis | Login may omit `refreshToken`. Tolerate missing refresh; do not crash. Refresh then fails with 401 → sign-out |

## Prerequisites
- Phase 01 done.
- Backend live with refresh + sliding mobile sessions + logout (`docs/STUDENT_SESSION_AUTH.md`, `docs/REDIS.md` § Student sessions in `ez-prep-api`).

## Source documents
`../authentication.md`, `../mobile-authentication.md`, backend `docs/REDIS.md` § Student sessions, backend `docs/STUDENT_SESSION_AUTH.md`.

## Web / API reference (read-only)
- Web: `lib/auth.ts`, `lib/api/client.ts` (single-flight refresh), `components/providers/AuthSessionProvider.tsx`.
- API: `src/auth/auth.controller.ts` (`verify-otp`, `google/mobile`, `refresh`, `logout`), `src/auth/dto/refresh-token.dto.ts`, `src/auth/session/session.constants.ts`.

## Mobile targets
- `src/features/auth/` (`AuthProvider`, `authApi.ts`, session helpers).
- `src/api/http.ts` (401 → refresh → retry; single-flight).
- `src/services/secureStorage.ts` (existing SecureStore helpers).
- Status: `ez-prep-mobile/MOBILE_STATUS.md` (authoritative; not the empty template under this docs folder).

## Implementation tasks
1. SecureStore keys: `ezprep.auth.token` (access) + `ezprep.auth.refresh` (refresh). Use existing SecureStore service (`AFTER_FIRST_UNLOCK`). Never log either value.
2. Expand auth Zod to `{ accessToken, refreshToken?, expiresIn?, user?, isNewUser? }`. `refreshToken` optional for degraded mode.
3. Change `signIn` to accept `{ accessToken, refreshToken?, expiresIn? }`; restore **both** tokens on launch before hiding splash.
4. `exchangeMsg91Token` / Google exchange: always send `client: 'mobile'`. Persist the full auth response, not only `accessToken`.
5. HTTP client: on 401, **single-flight** `POST /auth/refresh` with `{ refreshToken }` in the JSON body (not cookies). On success, store the new access **and** rotated refresh, then retry the original request once. On refresh failure → `signOut('expired')` with the existing expiry copy. Concurrent 401s must share one in-flight refresh promise (reuse detection otherwise logs the user out).
6. Optional: proactive refresh when access is within 24h of expiry (use `expiresIn` / stored expiry). Not required for acceptance if 401 refresh works.
7. Logout: best-effort `POST /auth/logout` with the current Bearer access (optional auth on API), then clear SecureStore + in-memory tokens + Google `signOut()` + React Query cache (same as today).
8. Keep `skipUnauthorizedHandler` behavior for mid-submit paths (Phase 06) so a 401 during submit does not clear the answer queue before the runner can show an error — refresh may still run; do not invent a new submit contract.
9. After device proof: ask the API owner to lower `MOBILE_ACCESS_TTL_SEC` (e.g. 3600). **Do not** modify `ez-prep-api` in this session.
10. Update `ez-prep-mobile/MOBILE_STATUS.md`. Supersede U-04 in status notes (refresh + server logout now wired).

## Do-not-touch boundaries
- Do not change web cookie/middleware auth.
- Do not invent refresh cookie handling on mobile.
- Do not lower API TTLs from the mobile repo.
- Do not implement payments, locks, or profile changes in this phase.

## Dependencies
None new. No native modules. OTA-safe on the existing development build.

## Requirements
- **Security:** Never log access/refresh tokens, Authorization headers, or OTP values. Redact already lists `refreshtoken`.
- **API:** Do not invent endpoints. Paths: `POST /auth/verify-otp`, `POST /auth/google/mobile`, `POST /auth/refresh`, `POST /auth/logout`.
- **UX:** Silent refresh must not flash the sign-in screen. Failed refresh uses the existing “session expired” path.

## Acceptance criteria
- Kill/relaunch keeps the session (access + refresh restored).
- OTP login response includes a usable long-lived mobile session (or short access + refresh that silently renews).
- Web logout does not sign out mobile (and vice versa).
- Corrupted/expired access + valid refresh → silent refresh, no sign-in screen.
- Invalid / reused refresh → sign-in with expiry message.
- Two parallel API 401s trigger only one refresh call.
- Unused for 90+ days → must sign in again (idle window; cannot fully automate — document as manual knowledge).

## Tests
- Unit: auth response Zod (with and without `refreshToken`); refresh single-flight (second caller awaits the same promise); logout clears both SecureStore keys.
- Unit/integration: mocked fetch — 401 → refresh 200 → original request retried once with new Bearer; refresh 401 → sign-out once.
- Unit: OTP/Google request bodies include `client: 'mobile'`.
- Component: Auth restore with both tokens present vs access-only degraded.

## Manual device checklist
- [ ] Phone OTP sign-in; confirm session lasts well beyond 15 minutes (or silent refresh keeps the user in).
- [ ] Google sign-in still works; relaunch stays signed in.
- [ ] Kill app → relaunch → still Home (not sign-in).
- [ ] Force an expired/corrupt access token in SecureStore (dev-only) with a valid refresh → next API call recovers without sign-in UI.
- [ ] Clear/invalidate refresh → next API call → sign-in with expiry message.
- [ ] Logout from More → cannot call authenticated APIs; Google account picker does not reuse a stale native session incorrectly.
- [ ] Sign in on web and logout on web → mobile session still works.
- [ ] Airplane mode then reconnect: no spurious sign-out solely from network errors (only auth 401 after failed refresh).
- [ ] Record findings in `MOBILE_STATUS.md`.

## Risks
- Rooted-device SecureStore extraction — mitigated by refresh rotation and per-device revoke.
- Concurrent refresh without single-flight → accidental full revoke (API reuse detection).
- Origin forcing: if a request somehow sends a CORS `Origin` in `CORS_ORIGINS`, the API forces `client=web`. React Native normally sends no Origin; do not add a browser-like Origin header.

## Rollback
Feature-flag refresh; access-only 90d mobile tokens remain valid until natural expiry if the API still issues them. If OTP still omits `client`, roll forward — leaving `client` off is worse than shipping refresh.

## Completion checklist
- [ ] `client: 'mobile'` on OTP and Google.
- [ ] SecureStore refresh key + single-flight refresh + logout API.
- [ ] Tests green; device checklist done.
- [ ] `ez-prep-mobile/MOBILE_STATUS.md` updated.
- [ ] Ask API owner about lowering `MOBILE_ACCESS_TTL_SEC` (follow-up, not a gate).

## Definition of done
A student stays signed in across launches with rotating refresh; OTP no longer receives a 15-minute web session; logout revokes only this device on the server.
