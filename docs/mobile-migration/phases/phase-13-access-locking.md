# Phase 13 — Paper access locking (website purchase only)

## Objective
Honor API entitlement fields on exam paper lists and start attempts so locked/paid papers cannot be started in the Android app. When access is denied, show a **fixed informational message** with **no purchase actions**. After the student buys on the website, returning to the app must unlock papers via refetch.

## Owner purchase policy (locked — do not invent)

1. User browses free and paid tests in the Android app.
2. Attempting a paid/locked test shows exactly:  
   **"This test isn't available in your account. You can purchase tests directly on our website."**
3. **No** clickable link, **no** Buy / View plans button, **no** in-app Razorpay, **no** WebView/Custom Tabs checkout, **no** deep-link to web checkout.
4. User purchases independently on `ezprep.in` in a normal browser.
5. Returning to the Android app must show the test unlocked (refetch list `access`).

This **intentionally diverges** from web CTAs. Payment-gateway docs mark native checkout out of scope for v1.

## Prerequisites
- Phase 04 done (exam hub + topic / full-mock / sprint lists + start/resume/retake).
- Phase 12 **strongly recommended** first (OTP currently expires in ~15m without it). Phase 13 can technically ship without 12, but device testing will be painful.
- Backend access fields + `ENTITLEMENT_REQUIRED` already shipped.

## Source documents
`../engineering-rules.md`, this file, web access components below, API access-control / mock-test-attempts.

## Web reference (read-only — adapt, do not copy CTAs)
- `components/exam/access/paper-access.ts` — `isAccessDenied`, `isStartBlocked` (resume exception).
- `components/exam/access/PaperCardAction.tsx` — web replaces Start with View plans (**mobile: do not**).
- `components/exam/access/LockedTestBadge.tsx` — “Locked” badge (keep the concept).
- `components/exam/access/AccessErrorBanner.tsx` — web shows View plans on `ENTITLEMENT_REQUIRED` (**mobile: message only**).
- `components/exam/access/ExamAccessCta.tsx`, `ViewPlansDialog.tsx`, `OfferCallout.tsx` — **do not port**.
- `components/exam/useLaunchAttempt.ts` — reads `error.response.data.details.code`.
- List API types in `lib/api/exams.ts`, `full-mock-tests.ts`, `sprint-tests.ts` (`accessMode`, `access`).

## API contract (verified)
- Paper list/detail DTOs embed:
  - `accessMode`: `FREE` | `ENTITLED`
  - `access`: `{ allowed: boolean, reason: 'ALLOWED' | 'ENTITLEMENT_REQUIRED' | 'LEGACY_ALLOW' | 'INACTIVE' }`
- **Missing `access` ⇒ treat as allowed** (web parity).
- `POST /mock-test-attempts/start` when denied: **403** with `details.code === 'ENTITLEMENT_REQUIRED'` (message from API may differ; mobile UI uses the **owner copy** above for this code).
- Resume / submit do **not** re-check entitlement. An in-progress Resume stays available even if the paper would otherwise be locked.
- Server flag `ACCESS_ENFORCEMENT_MODE`: `LEGACY` may still allow entitled papers (`reason: 'LEGACY_ALLOW'`). Client must trust `access.allowed`, not invent local rules.
- Catalog / checkout endpoints exist but are **out of scope** for this phase.

## Mobile targets
- `src/features/tests/` — list Zod schemas, card action mapping, launch hook.
- Exam list screens under `app/(app)/exam/[examId]/` (practice, full-mocks, sprint-tests).
- Pure helpers e.g. `src/features/tests/model/paperAccess.ts` (port of `isAccessDenied` / `isStartBlocked`).
- Status: `ez-prep-mobile/MOBILE_STATUS.md`.

## Do-not-port / do-not-build
- `ViewPlansDialog`, checkout routes, billing form, Razorpay SDK.
- Exam hub “Buy all tests” CTA / teal purchase banner.
- Home/header `OfferCallout` purchase marketing.
- `GET /catalog/products*`, `POST /checkout/orders`, billing profile APIs.
- Any button or link that opens `ezprep.in` for purchase.

## Implementation tasks
1. Extend Zod for topic-wise, full-mock, and sprint list items with optional `accessMode` and `access`. Use `.passthrough()` carefully; do not strip unknown fields the UI needs.
2. Port `isAccessDenied` / `isStartBlocked` as pure functions (resume + `resumeAttemptId` ⇒ not blocked).
3. Card UI: when start is blocked, show a **Locked** badge (visual parity with web badge). Replace Start/Retake with a non-navigating control **or** keep a disabled/grey control that on press shows the owner message (Alert or inline). **No** secondary “View plans” action.
4. Launch path: if somehow start is still called and API returns `ENTITLEMENT_REQUIRED`, show the same owner message (parse `details.code` from `ApiError` body the same way web reads `error.response.data.details.code`). Do not show a purchase button.
5. Unlock after website purchase:
   - Refetch paper list queries on screen **focus** (Expo Router / React Navigation `useFocusEffect`).
   - On `AppState` → `active`, invalidate the exam’s paper list query keys (topic / full-mock / sprint) so `access.allowed` updates without reinstall.
6. Do not add commerce env vars. No new native dependencies.
7. Update More/coming-soon only if needed for consistency — **Subscriptions screen rewrite is Phase 16**, not this phase.
8. Update `MOBILE_STATUS.md`.

## Requirements
- **UX:** Message text must match the owner string exactly. No URLs in the alert.
- **API:** Trust server `access`; never compute entitlement client-side from product catalogs.
- **Security:** No secrets. Do not log PII from paper payloads beyond what logging already allows.
- **Performance:** Focus refetch should use existing React Query keys; avoid N+1 catalog probes like web’s `examHasDeniedPaper` full pagination scan unless already required — mobile does **not** need the exam-wide Buy CTA, so skip that probe.

## Acceptance criteria
- Free papers (`access.allowed !== false`) still Start / Retake / Resume as today.
- Locked papers show Locked; Start/Retake do not open the runner; message matches owner copy; no purchase CTA.
- Resume on an in-progress attempt still works when the paper would otherwise be locked.
- Forced start 403 `ENTITLEMENT_REQUIRED` shows the same message.
- After buying on the website (same account), returning to the app (or refocusing the list) shows Start/Retake without reinstall.
- `yarn typecheck`, `yarn lint`, `yarn test` pass.

## Tests
- Unit: `isAccessDenied` / `isStartBlocked` matrix (missing access, allowed false, RESUME + resumeAttemptId, RETAKE denied).
- Unit: entitlement error mapping → owner copy when `details.code === 'ENTITLEMENT_REQUIRED'`; other errors keep existing copy.
- Component: locked card renders badge and does not invoke start mutation; no “View plans” / link nodes.
- Optional integration: mocked list with denied access; mocked start 403.

## Manual device checklist
- [ ] Open an exam with at least one free and one locked paper (use a known production/test account). Confirm Locked badge and message copy with no links/buttons to purchase.
- [ ] Resume an in-progress attempt on a paper that is entitled/locked for new starts — Resume still works.
- [ ] Attempt Start on locked paper — runner does not open; message shown.
- [ ] Buy access on `ezprep.in` in Chrome/system browser (same user). Return to app (or leave exam list and come back). Paper unlocks without reinstall.
- [ ] Airplane mode on list: existing error/empty behavior unchanged.
- [ ] Hardware back from exam lists unchanged.
- [ ] TalkBack: locked state announced; message readable.
- [ ] Record findings in `MOBILE_STATUS.md`.

## Risks
- `ACCESS_ENFORCEMENT_MODE=LEGACY` may leave `allowed: true` with `LEGACY_ALLOW` — UI must not invent locks.
- Stale React Query cache after web purchase — mitigated by focus + AppState invalidation.
- Phase 12 not done → short OTP sessions complicate the buy-on-web round trip.

## Rollback / isolation
Feature helpers + list/card changes. Reverting restores previous Start-always behavior (API may still 403).

## Completion checklist
- [ ] Zod + helpers + UI + focus/AppState refetch.
- [ ] No purchase CTAs or checkout code introduced.
- [ ] Tests + device checklist.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
Locked papers are blocked in-app with the website-only purchase message; after a website purchase, the same account sees unlocked Start/Retake on the physical Android device.
