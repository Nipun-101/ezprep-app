# Phase 15 — Support & feedback

## Objective
Add the web sidebar **Support** affordances to the mobile More tab: mailto support email and a **Share feedback** form that posts to `POST /api/v1/feedback`. Match web field rules and thank-you behavior. Do not revive the removed `feedback` field on `PATCH /users/me`.

## Prerequisites
- Phase 02 done (More tab).
- Independent of Phases 13–14/16. Can run in parallel with Phase 14.
- Phase 12 recommended for stable auth while testing.

## Source documents
This file; web `components/dashboard/SupportSection.tsx`, `lib/api/feedback.ts`.

## Web reference (read-only)
- `components/dashboard/SupportSection.tsx` — Support box, mailto, dialog, ratings, thank-you auto-close ~1600ms.
- `lib/api/feedback.ts` — `POST /api/v1/feedback` with optional fields only.

## API contract (verified)
- `POST /api/v1/feedback` (Bearer student JWT).
- Body (`CreateFeedbackDto`): optional
  - `text` — trimmed string, max **1000** chars
  - `userInterface` | `questions` | `fullMockTests` | `topicWisePractice` | `easeOfUse` — integers **1–5**
- Server rejects submission with **no text and no ratings**.
- Send **only filled fields** (omit zero / empty).
- Admin list/summary endpoints are out of scope.

## Mobile targets
- More screen: `app/(app)/(tabs)/more.tsx` (or shell feature components).
- `src/features/support/` (or `src/features/feedback/`): `feedbackApi.ts` + Zod, `buildFeedbackPayload`, modal UI.
- Status: `ez-prep-mobile/MOBILE_STATUS.md`.

## Verified web behavior to keep
- Support heading; mailto `support@ezprep.in` (open via `Linking.openURL('mailto:support@ezprep.in')`).
- “Share feedback” opens a modal/sheet.
- Five rating rows with labels:
  - User interface → `userInterface`
  - Questions → `questions`
  - Full mock tests → `fullMockTests`
  - Topic-wise practice → `topicWisePractice`
  - Ease of use → `easeOfUse`
- Tapping the selected star value **clears** it (toggle to 0 / unset).
- Free text up to 1000 characters.
- Send enabled iff any rating > 0 **or** trimmed text length > 0.
- On success: thank-you phase, then auto-close after ~1.6s; reset form when closed.
- On error: API `message` if string, else “Could not send your feedback. Please try again.”

## Implementation tasks
1. `feedbackApi.submitFeedback(payload)` via existing `http` helper; auth required.
2. Pure `buildFeedbackPayload(ratings, text)` — only include defined 1–5 ratings and trimmed text.
3. UI on More: Support section above or near legal/logout (match visual hierarchy of other More rows; reuse `ListItem` / theme tokens).
4. Modal or bottom sheet for the form; disable Send while in flight; prevent double submit.
5. Do not add `feedback` to profile PATCH.
6. No new native dependencies (`Linking` is already available).
7. Update `MOBILE_STATUS.md`.

## Do-not-touch boundaries
- No payments, target exams, or subscriptions work in this phase.
- Do not change API contracts.

## Dependencies
None new. OTA-safe.

## Requirements
- **UX:** Large touch targets for stars; keyboard avoids covering Send; Android back closes the sheet without submitting.
- **Security:** Do not log feedback body contents in production logs if they may contain PII; prefer non-PII error logging.
- **A11y:** Stars labelled per row; Send state announced.

## Acceptance criteria
- Mailto opens the system email app with `support@ezprep.in`.
- Feedback with only stars, only text, or both succeeds; empty cannot send.
- Thank-you shows then closes; reopening shows a fresh form.
- typecheck / lint / tests pass.

## Tests
- Unit: `buildFeedbackPayload` — omits zeros; trims text; empty → invalid / null; max length enforced client-side before send.
- Component: Send disabled when empty; toggle star clears; success path shows thanks (mock API).

## Manual device checklist
- [ ] More → Support → mailto opens mail client (or shows chooser).
- [ ] Share feedback: rate one dimension → Send → thank-you → auto-close.
- [ ] Text only → Send works.
- [ ] Clear a star by tapping it again; Send disables when nothing left.
- [ ] Long text near 1000 chars; over-limit blocked or truncated per web (web uses maxLength 1000 — match).
- [ ] Airplane mode → error copy; retry works after reconnect.
- [ ] Android back dismisses form without sending.
- [ ] Record findings in `MOBILE_STATUS.md`.

## Risks
- Mailto may no-op on devices without an email app — show a non-blocking alert with the address if `Linking.canOpenURL` fails (acceptable mobile adaptation; do not invent a fake in-app mailer).

## Rollback / isolation
Feature folder + More section. Reverting removes Support UI only.

## Completion checklist
- [ ] API + UI + tests + device checklist.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A signed-in student can email support and submit star/text feedback from More on the physical Android device, with web-identical payload rules.
