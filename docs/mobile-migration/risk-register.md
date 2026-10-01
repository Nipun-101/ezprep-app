# Risk Register

Likelihood (L) and Impact (I): H / M / L. Owner is a role, not a person.

| ID | Risk | L | I | Phase | Mitigation | Related unknown | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | **Google sign-in cannot reuse the web PKCE/redirect contract**. Native sign-in needs a backend change | H | H | 01 | Ship phone OTP first. Agree on an `idToken` contract early. Isolate Google behind a feature flag | U-02 | Mobile lead + Backend |
| R-02 | **MSG91 OTP has no working native path** with the current widget configuration | M | H | 01 | Spike the MSG91 RN SDK in week 1. Fallback: backend send/verify endpoints | U-01, U-28 | Mobile lead + Backend |
| R-03 | **Math rendering** (mathpix-markdown-it is DOM-only) is slow, inaccurate, or unstable on device | H | H | 05 | Dedicated spike with real questions. Compare a WebView renderer vs a native renderer. Set performance budgets. Fallback: plain text + images | U-31 | Mobile lead |
| R-04 | **Timer drift / wrong remaining time** after backgrounding, sleep, or app kill | M | H | 06 | Deadline-based timer from the server `timeRemaining`/`startedAt`. Reconcile with `GET attempt` on foreground | U-03 | Mobile |
| R-05 | **Lost answers**: fire-and-forget PATCH fails silently on a flaky mobile network | M | H | 06 | Per-question pending queue with retry, flushed before submit or section completion. Non-session submit sends the answered `answers[]` (a backstop). **Session-wise `sessions/complete` sends no answers, so PATCHes are the only record.** Offline banner | U-17 | Mobile |
| R-06 | **Hardware back / gestures exit an attempt** without pause | M | M | 06 | `usePreventRemove` + `BackHandler`, gestures disabled, leave dialog with "Pause & Leave" | — | Mobile |
| R-07 | **Correct answers visible to the client during an attempt** (security/integrity) | M | M | 06 | Do not render or log them. Ask the backend to omit them until submit | U-06 | Backend |
| R-08 | **Undocumented API contracts** (no OpenAPI). Mobile breaks on shape changes | M | M | all | zod schemas at the boundary, tolerant parsing, contract fixtures. Request API docs | U-05 | Mobile + Backend |
| R-09 | **Token expiry unknown, no refresh**. Users get signed out mid-attempt | M | H | 01, 06 | Confirm the TTL. Before submit, a 401 should keep local answers and prompt re-auth, then retry the submit | U-04 | Backend |
| R-10 | **Malayalam rendering**: Inter has no Malayalam glyphs. The system fallback may look inconsistent or clip | M | M | 05 | Test on device. Bundle Noto Sans Malayalam if needed | U-18 | Mobile + Design |
| R-11 | **Large/unoptimised images** (1.1 MB banner, remote images of unknown size) hurt memory and data use | M | M | 03, 05, 09 | expo-image with caching and sized containers. Request thumbnails | U-07 | Mobile + Backend |
| R-12 | **Porting mock/orphan features** (analytics dummy data, static study materials) wastes effort or ships fake data | M | M | 02 | Coming-soon placeholders until product confirms | U-08 | Product |
| R-13 | **Google Play policy / Data Safety** (phone number, account data, account deletion requirement) | M | H | 10 | Prepare Data Safety answers, privacy policy URL, and an **account deletion** path (Play requires one for apps with account creation) | U-12, U-32 | Product + Backend |
| R-14 | **Web-to-mobile visual drift** because there are no Figma tokens (tokens come from Tailwind classes) | M | L | 00, all | `design-system.md` tokens as the single theme source. Visual review per phase | — | Design |
| R-15 | **Rendering performance** of long answer keys / large papers (100+ questions) | M | M | 05, 07 | Virtualised lists, memoised question rows, measured budgets | U-24 | Mobile |
| R-16 | **SHA-1/keystore misconfiguration** breaks Google sign-in in release only | M | H | 01, 10 | Register debug, EAS upload, and Play app-signing SHA-1s. Test sign-in on the Play internal track | U-02 | Mobile |
| R-17 | **EXPO_PUBLIC_* misuse** leaks a secret into the bundle | L | H | 00 | Env schema allowlist. Review checklist. No server keys in EAS public env | — | Mobile |
| R-18 | **Single-device testing** misses low-end/other-OEM issues | M | M | 10 | Add an emulator matrix (low RAM, small screen, Android 10/14/15) + Play pre-launch report | — | QA |
| R-19 | **iOS surprises later** (Google iOS client, Apple sign-in requirement if other social logins exist, App Store review) | M | M | 11 | Keep platform code isolated. Note that App Store guideline 4.8 may require Sign in with Apple when Google login is offered | U-33 | Product |
| R-20 | **Backend changes become a hidden dependency** blocking mobile phases | M | H | 01, 06 | Track backend asks in `unknowns.md`. Raise them in phase 00 | — | Mobile lead |
| R-21 | **No analytics/crash reporting** means production issues are invisible | M | M | 10 | Decide on a vendor before the Play release | U-16 | Product |
| R-22 | **Session-wise papers** (no-return sections + recovery flow) are complex and easy to get wrong | M | H | 06 | Port the pure helpers with unit tests first. Test with real session-wise papers on staging | U-30 | Mobile |
