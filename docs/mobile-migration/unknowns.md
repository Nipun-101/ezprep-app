# Unknowns

Each item couldn't be settled from this repository. **Blocks** is the earliest phase that can't finish until the item is resolved. Priority: 🔴 blocks a mandatory phase or the release · 🟠 changes the design · 🟢 product polish.

Summary of the 🔴 items: **U-01, U-02, U-03, U-06, U-12, U-23, U-29, U-30, U-32** (U-04 superseded by Phase 12 / Redis sessions).

---

### U-01 🔴 MSG91 OTP on mobile
- **Question:** Can the existing MSG91 widget (`widgetId` + `tokenAuth`) run from a native app via MSG91's mobile/React Native SDK and return an access token that `POST /auth/verify-otp` accepts? Does the MSG91 dashboard restrict `tokenAuth` by domain, and does it require captcha?
- **Why it matters:** Phone OTP is the primary sign-in method. The browser widget can't run in RN.
- **Evidence:** `components/auth/LoginModal.tsx` loads `https://verify.msg91.com/otp-provider.js` and calls `window.initSendOTP`; the success callback's `data.message` is posted to `/auth/verify-otp`. `.env.example` lists `NEXT_PUBLIC_MSG91_WIDGET_ID` and `NEXT_PUBLIC_MSG91_TOKEN_AUTH`.
- **Options:** A) MSG91 RN SDK. B) New backend send/verify endpoints. C) A WebView widget (rejected).
- **How to verify:** Check the MSG91 dashboard settings and the MSG91 RN SDK docs, then run a spike on the physical device in a dev build. Ask the backend team how `verify-otp` validates the token (MSG91 verify-access-token API?).
- **Blocks:** Phase 01 (OTP part).

### U-02 🔴 Google sign-in contract for native
- **Question:** Will the backend accept a Google **ID token** (or a server auth code without PKCE/redirect) from the native app? Which client IDs does `GOOGLE_CLIENT_IDS` contain? Who owns the Google Cloud project, so that Android OAuth clients (package + SHA-1s) can be created?
- **Why it matters:** The web contract `{code, redirectUri, codeVerifier}` is tied to a web redirect URI.
- **Evidence:** `lib/googleAuth.ts` (PKCE, `redirect_uri` = origin root); `app/page.tsx` `GoogleOAuthReturn`; `.env` comments mention API-side `GOOGLE_CLIENT_IDS` / `GOOGLE_REDIRECT_URIS` (names only).
- **Options:** A) `{ idToken }` mode (recommended). A′) server auth code. B) system browser + App Links (needs web hosting changes).
- **How to verify:** Read the backend `auth/google` handler. Agree on the request/response schema and error codes in writing.
- **Blocks:** Phase 01 (Google part). Phase 10 (release SHA-1s).

### U-03 🔴 Attempt behavior when the app goes to background
- **Question:** When the app is backgrounded mid-attempt, should the app pause the attempt (as the web does on tab close via `beforeunload`), or should the timer keep running?
- **Why it matters:** Fairness and timer accuracy. Android may kill backgrounded apps without warning.
- **Evidence:** The web sends a keepalive `POST :id/pause` only on unload/back. A hidden tab is **not** paused (no `visibilitychange` handler) [Verified by absence].
- **Options:** A) Don't pause on background. Reconcile with the server on foreground (closest to web visibility behavior). B) Pause on background, after a grace period. C) Pause immediately.
- **How to verify:** Product decision. Confirm with the backend team whether the timer runs server-side while IN_PROGRESS (inferred from `computeAttemptSecondsLeft`).
- **Blocks:** Phase 06.

### U-04 ✅ Token lifetime and revocation — **resolved (superseded by Phase 12)**
- **Resolution (2026-11):** Backend Redis student sessions. Web: ~15m access in memory + HttpOnly refresh cookie, 7d absolute. Mobile (`client=mobile`): access currently up to 90d (`MOBILE_ACCESS_TTL_SEC`), refresh token in JSON, **90d sliding** idle, `POST /auth/refresh` (rotating), `POST /auth/logout` revokes this `sid` only. Web logout does not affect mobile.
- **Mobile work:** Phase 12 wires SecureStore refresh + single-flight refresh + logout. Until Phase 12 ships, OTP must still send `client: 'mobile'` or it incorrectly receives the web 15m session.
- **Follow-up (not blocking):** After Phase 12 device proof, ask API owner to lower `MOBILE_ACCESS_TTL_SEC` (e.g. 1h).
- **Blocks:** None for design. Phase 12 implements the client.

### U-05 🟠 Which endpoints require auth?
- **Question:** Are the catalog/search/exam/content endpoints public or authenticated?
- **Why it matters:** Restore validation, caching, and whether any browse-before-login screen is possible.
- **Evidence:** The axios client always sends the token when present. The middleware gates only `/dashboard` and `/complete-profile` [Verified]. Other pages call APIs regardless.
- **Options:** n/a (a fact to discover).
- **How to verify:** Backend route guards, or curl without a token against staging.
- **Blocks:** Phase 03 (cache keys and restore logic). Not blocking otherwise.

### U-06 🔴 Correct answers during an attempt
- **Question:** Does `GET /mock-test-attempts/:id` (or `start`/`resume`) include `correctAnswer`/`explanation` for IN_PROGRESS attempts?
- **Why it matters:** Exam integrity. Native traffic is easy to inspect.
- **Evidence:** The `AttemptDetails` type contains these fields. The runner strips them (`attemptDetailsToRunnerData`).
- **Options:** Backend omits them until SUBMITTED/EXPIRED (recommended) / accept the risk.
- **How to verify:** Inspect a staging response for an in-progress attempt.
- **Blocks:** Phase 10 (release sign-off). Not blocking development.

### U-07 🟠 Image hosting
- **Question:** Image hosts (category, question, current-affairs, avatars), HTTPS, typical sizes, and is there a resize/thumbnail service?
- **Why it matters:** Memory, data use, Android cleartext policy.
- **Evidence:** `next.config.js` `images.unoptimized: true`. No `remotePatterns`. Image URLs come from API fields.
- **Options:** Thumbnail params / CDN / accept originals with caching.
- **How to verify:** Sample API responses on staging.
- **Blocks:** Phase 03 (perf acceptance). Phase 10 (cleartext must be off).

### U-08 🟠 Fate of mock/orphan features
- **Question:** Should Analytics (`/analytics`, dummy data), Study Materials (static), the 8 coming-soon features, `/test` (legacy), and `/profile` vs `/dashboard?tab=profile` appear in the app?
- **Why it matters:** Avoid porting fake data.
- **Evidence:** `components/AIAnalyticsDashboard.tsx` imports `lib/mockData.ts`. `/study-materials` uses static arrays. See `route-inventory.md`.
- **Update (2026-11):** Web removed Courses / Concept Videos / Bookmarks coming-soon routes; **My Subscriptions** is a real page. Mobile Phase 16 removes those three placeholders and ships read-only Subscriptions. Analytics / Study Materials / Mentorship etc. stay deferred.
- **Options:** Coming-soon placeholders (recommended) / omit / build later with real APIs.
- **How to verify:** Product decision.
- **Blocks:** Phase 02 (More tab contents); Phase 16 cleanup.

### U-09 🟢 Profile completion / onboarding
- **Question:** Is `POST /user/complete-profile` live? Is any onboarding intended after first login?
- **Evidence:** `/complete-profile` page exists but nothing links to it [Verified].
- **Options:** Omit (recommended) / add an onboarding step.
- **How to verify:** Backend routes + product.
- **Blocks:** None (default is to omit).

### U-10 🟢 Pre-login content
- **Question:** Should the app show any marketing/exam showcase before sign-in (web `/` MarketingHome)?
- **Evidence:** `components/home/MarketingHome.tsx`, which is server-rendered for guests.
- **Options:** Sign-in screen only (recommended for v1) / onboarding carousel / browse-before-login (needs U-05).
- **How to verify:** Product.
- **Blocks:** Phase 01 sign-in screen design (default: sign-in only).

### U-11 🟢 `showResultsImmediately`
- **Question:** What should this field do? The web never reads it.
- **Evidence:** Present in types. No reads [Verified by search].
- **Options:** Ignore (web parity) / hide the answer key until a release date.
- **How to verify:** Backend/product.
- **Blocks:** None (default: ignore).

### U-12 🔴 Stable legal URLs
- **Question:** The canonical public URLs for Terms, Privacy, and Refund (if any), suitable for the Play listing and the in-app browser.
- **Evidence:** Web routes `/terms`, `/privacy-policy`, and `/user-policy` exist in the repo (`components/legal/LegalDocument.tsx`) [Verified]. Production domain `https://www.ezprep.in` is inferred from `.env` redirect URIs.
- **Options:** Link to the web pages (recommended) / bundle copies.
- **How to verify:** Open the production URLs. Get legal sign-off.
- **Blocks:** Phase 02 (links). Phase 10 (Play listing).

### U-13 🟢 App Links / Universal Links
- **Question:** Should `https://www.ezprep.in/...` links open the app?
- **Why it matters:** Needs `assetlinks.json` on the web host (a web change, out of scope here).
- **Options:** Not in v1 (recommended) / later phase.
- **How to verify:** Product + web owner.
- **Blocks:** None.

### U-14 🟢 Hosting/deployment of web and API
- **Question:** Where are the web and API hosted? What are the staging URLs?
- **Evidence:** `@vercel/analytics` suggests Vercel for web [Inferred]. API URL comes from env.
- **How to verify:** Ask the owner.
- **Blocks:** Phase 00 (env values for preview builds; see U-30).

### U-15 🟢 Resume path after logout
- **Question:** Keep the web's "return to last page after re-login" (the `logoutResumePath` cookie)?
- **Options:** Drop (recommended) / keep for 7 days in AsyncStorage.
- **How to verify:** Product.
- **Blocks:** None.

### U-16 🟠 Mobile analytics and crash reporting
- **Question:** Which vendor (Sentry, Firebase Crashlytics, PostHog, none)? What consent is needed?
- **Why it matters:** Play Data Safety and production diagnostics.
- **Evidence:** The web uses only `@vercel/analytics`.
- **How to verify:** Product + privacy.
- **Blocks:** Phase 10.

### U-17 🟠 Persisting attempt state across app kill
- **Question:** Should selected answers that haven't been confirmed by a PATCH be persisted locally (AsyncStorage) to survive an app kill?
- **Evidence:** The web caches only the launch payload in sessionStorage. Answers rely on fire-and-forget PATCHes.
- **Options:** Server-only (web parity) / local pending queue persisted (recommended).
- **How to verify:** Team decision during phase 06 design. Check that PATCH is idempotent (backend).
- **Blocks:** Phase 06.

### U-18 🟠 Language preference and Malayalam font
- **Question:** Should the EN/ML choice persist per exam or globally? Does Malayalam text need a bundled font?
- **Evidence:** The web holds the toggle in component state only. Inter has no Malayalam glyphs (R-10).
- **How to verify:** Device rendering test with real ML questions. Product decision on persistence.
- **Blocks:** Phase 05.

### U-19 🟢 Tablet content width
- **Question:** The maximum content width on tablets.
- **Options:** Cap at ~720 dp centred (recommended) / full width.
- **Blocks:** None (default cap).

### U-20 🟢 Exam card density with real data
- **Question:** How many categories/exams exist? Is a 2-column grid readable?
- **How to verify:** Staging data + device review.
- **Blocks:** Phase 03 visual sign-off.

### U-21 🟢 Exam description on mobile
- **Question:** Show the exam description (hidden on web phones)?
- **Blocks:** None (default: collapsible "About").

### U-22 🟢 Orientation
- **Question:** Portrait lock app-wide?
- **Options:** Portrait (recommended for v1) / allow landscape on tablets.
- **Blocks:** Phase 00 config (default portrait).

### U-23 🔴 Brand assets
- **Question:** A source logo (SVG), a square mark, and brand-approved icon/adaptive icon/splash.
- **Evidence:** Only `public/ezprep-logo-1.png` (1380×752, heavy whitespace) exists.
- **How to verify:** Design deliverable.
- **Blocks:** Phase 10 (release). Phase 00 can use placeholders.

### U-24 🟢 Performance budgets
- **Question:** Agree on the startup, scroll, and runner budgets proposed in `performance-analysis.md`.
- **Blocks:** Phase 10 sign-off.

### U-25 🟢 Logout confirmation
- **Question:** Confirm before logout (new on mobile)?
- **Blocks:** None (default: confirm).

### U-26 🟠 Repository layout
- **Question:** A separate mobile repo (recommended) or a monorepo with the web?
- **Why it matters:** CI, sharing types, and the rule "do not modify the web app".
- **How to verify:** Owner decision.
- **Blocks:** Phase 00.

### U-27 🟢 Long-running endpoints
- **Question:** Typical latency of `submit` and `sessions/complete` for large papers.
- **Why it matters:** Timeout values. Avoiding a duplicate submit on timeout.
- **How to verify:** Staging measurements. Ask the backend whether submit is idempotent.
- **Blocks:** Phase 06 (timeouts).

### U-28 🟠 OTP specifics
- **Question:** Is the widget India-only (+91)? OTP length? Resend cooldown? Can the SMS template include an Android app hash (SMS Retriever)?
- **Evidence:** The widget is configured with `identifier: ''`. Country and length are configured in the MSG91 dashboard, not in code.
- **How to verify:** MSG91 dashboard.
- **Blocks:** Phase 01 UI.

### U-29 🔴 Application identifiers
- **Question:** Confirm the Android package name (proposed `in.ezprep.app`), the iOS bundle ID, the URL scheme (`ezprep`), the display name ("EZ Prep"), and the Play Console developer account owner.
- **Why it matters:** The package name is permanent on Play and is required for Google OAuth clients.
- **How to verify:** Owner decision. Check that the Play Console listing is available.
- **Blocks:** Phase 00 (set once). Phase 01 (Google client).

### U-30 🔴 Test environment
- **Question:** Is there a staging API? Test phone numbers / OTP bypass for QA? Test Google accounts? Seeded exams including session-wise and multilingual papers?
- **Why it matters:** Device testing, E2E, and safe attempt testing without polluting production analytics.
- **How to verify:** Backend owner.
- **Blocks:** Phase 01 acceptance and Phase 06 acceptance.

### U-31 🟠 Math rendering approach
- **Question:** Which renderer gives acceptable fidelity and performance for real question content (Mathpix markdown, LaTeX, tables, images, HTML tags)?
- **Evidence:** `components/attempt/MathText.tsx` uses `mathpix-markdown-it` with `htmlTags: true`, which is DOM-based.
- **Options:** A) A WebView with mathpix-markdown-it bundled offline. B) A native renderer (e.g. a KaTeX/MathJax-to-SVG approach). C) Server-side pre-rendered HTML/SVG (backend change).
- **How to verify:** The Phase 05 spike with ≥ 30 real questions, including tables, chemistry, and Malayalam.
- **Blocks:** Phase 05 (and so 06 and 07).

### U-32 🔴 Account deletion
- **Question:** Is there a backend account-deletion endpoint or a web deletion request page?
- **Why it matters:** Google Play requires apps that support account creation to offer account deletion in-app and through a web link.
- **Evidence:** No deletion UI or API in this repo [Verified by search].
- **How to verify:** Backend owner + Play policy review.
- **Blocks:** Phase 10.

### U-33 🟢 Sign in with Apple
- **Question:** When iOS launches with Google sign-in, is Sign in with Apple required (App Store guideline 4.8), or do phone OTP and the guideline's exceptions suffice?
- **How to verify:** Review the current App Store guidelines at the time of iOS planning.
- **Blocks:** Phase 11.

### U-Purchase ✅ In-app purchase / Razorpay on Android — **resolved for v1**
- **Resolution (owner, 2026-11):** No in-app Razorpay, Play Billing, WebView checkout, or deep-link to web checkout in the Android app for now.
- **Flow:** Locked/paid papers show an informational message only: *“This test isn't available in your account. You can purchase tests directly on our website.”* No link or Buy button. User buys on `ezprep.in` in a normal browser, then returns to the app; lists refetch so access unlocks (Phase 13). Read-only My Subscriptions may show entitlements/orders/invoices (Phase 16).
- **Evidence:** Payment-gateway docs already mark native mobile checkout out of scope for v1 (`docs/payment-gateway/executive-summary.md`, `current-architecture.md`).
- **Revisit later:** Play Billing vs Razorpay if product wants in-app purchase parity.
- **Blocks:** None. Do not install payment SDKs in phases 12–16.
