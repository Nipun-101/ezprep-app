# Phase 06 — Attempt Engine (Test Runner)

## Objective
A native test runner with the same rules as the web `MockTestRunner`: load or route by attempt status, a server-anchored countdown, answer select/clear with server saves, mark for review, the question palette with statuses, section-wise papers with no-return sections, pause/resume, leave with pause, submit with confirmation, and auto-submit on time-up. It must be robust to mobile realities: backgrounding, process death, flaky networks, and hardware back.

## Prerequisites
Phases 04 and 05 done. Decisions: **U-03** (background behavior), **U-17** (local persistence of pending answers), **U-27** (submit timeouts / idempotency). Staging papers of every type, including session-wise and multilingual (U-30).

## Source documents
`../route-inventory.md` (attempt), `../api-architecture.md` (X1–X7), `../state-management.md`, `../mobile-compatibility.md` (rows for beforeunload, popstate, setInterval, sessionStorage), `../performance-analysis.md`, `../accessibility-analysis.md`, `../risk-register.md` (R-04–R-07, R-09, R-22).

## Web reference (read-only)
- Routes: `/dashboard/attempt/[attemptId]`.
- Components: `components/attempt/AttemptPageClient.tsx`, `MockTestRunner.tsx` (full), `AttemptTimer.tsx`, `QuestionRenderGuard.tsx`.
- Lib: `lib/api/attempts.ts` (types + calls), `lib/attempt-sessions.ts` (session helpers), `lib/attempt-storage.ts` (launch cache), `lib/exam-test-routes.ts` (exit path/label).
- APIs: `GET /mock-test-attempts/:id` (authoritative; does not unpause), `POST :id/resume` (unpauses), `PATCH :id/answer { questionId, selectedOptionId | null }`, `POST :id/pause`, `POST :id/submit { answers[] }`, `POST :id/sessions/complete`.

## Verified web behavior to keep (port exactly)
- **Entry** (`AttemptPageClient`): use the cached launch payload if present, otherwise `GET attempt`. `SUBMITTED`/`EXPIRED` → replace with the result. `PAUSED` → start in the paused state. Load failure → "Attempt unavailable" + "Unable to load this attempt. It may have already been submitted or expired." + go to the dashboard.
- **Title:** `mockTestData.title`, else "`{exam.name} - {topic.name}`", else the exam name. Section label: the active session name, else the subject name, else the exam name.
- **Statuses:** answered, not-answered (visited, no answer), marked, marked-answered, not-visited. The first question counts as visited on entry.
- **Answer:** tapping an option selects it; tapping the selected option clears it; "Clear Response" clears. Each change → `PATCH answer` (the web is fire-and-forget; failures are only logged).
- **Mark for Review & Next** ("Mark & Next" on small screens): marks (no unmark exists on web) and advances.
- **Previous / Next navigation.** The last-question primary button reads "Submit Test", or "Next Section" for a non-last section of session-wise papers.
- **Submit dialog:** "Submit Test?" / "Are you sure you want to submit the test?" with a summary (Answered, Not answered, Marked, Not visited), "Review Again" / submit. Next-section variant warns "You cannot return to this section after moving ahead."
- **Submit (non-session):** `POST submit` with `answers[]` = **only answered questions** `{questionId, selectedOptionId}`. Error → "Failed to submit. Please try again." (or the API message) and reopen the dialog. Busy label "Submitting your test".
- **Session complete:** if paused, resume first; `POST sessions/complete` → `paperCompleted` (results) or `nextSession` (apply the payload: questions, timer, reset to Q1). On error: resume → if the current session is IN_PROGRESS/PAUSED, retry complete once → otherwise adopt the resumed state. Final error: "Could not complete this section. Please try again." Busy label "Starting next section". **Session-wise papers send no `answers[]`, so answer PATCHes are the only record of answers.**
- **Pause:** "Pause Test" → `POST pause` → paused overlay "Test Paused" with time used (and paper time used for session-wise), "Resume Test" (→ `POST resume`, apply the payload), and the exit button (`examTestExitLabel`: "Exit to Practice" / "Exit to Full Mocks" / "Exit to Sprint Tests").
- **Leave:** back → "Leave the exam?" / "Your progress will be saved and you can resume this test later from the dashboard." / "Stay in Exam" / "Pause & Leave" ("Saving..."). Pause failure → "Could not save your progress. Please try again." Destination: `examTestListPath(examId, paperType)`.
- **Time-up:** auto-submit (or session complete), once.
- **Language toggle** when `exam.hasMultiLingualSupport` (phase 05 component).

## Target mobile routes and components
- `app/(app)/attempt/[attemptId]/index.tsx`: `fullScreenModal`, `gestureEnabled: false`, custom header.
- `src/features/attempt/`:
  - `model/runnerReducer.ts` (pure state machine: `loading | running | paused | submitting | completingSection | error | finished`; answers, marked, visited, index, session).
  - `model/sessions.ts` (port of `lib/attempt-sessions.ts`), `model/statuses.ts`, `model/submitPayload.ts`, `model/timer.ts` (deadline math: `deadline = now + timeRemaining*1000`; `secondsLeft = ceil((deadline - now)/1000)`).
  - `hooks/useAttempt.ts` (load + routing), `useAttemptTimer.ts` (deadline-based, 1 Hz tick isolated to the timer component), `useAnswerSync.ts` (pending queue), `useRunnerGuards.ts` (BackHandler + `usePreventRemove`), `useAppStateReconcile.ts`.
  - `components/RunnerHeader.tsx`, `TimerText.tsx` (the only component that re-renders every second), `QuestionView.tsx`, `OptionRow.tsx`, `ActionBar.tsx`, `PaletteSheet.tsx`, `PaletteGrid.tsx`, `SubmitDialog.tsx`, `LeaveDialog.tsx`, `PausedOverlay.tsx`, `BusyOverlay.tsx`, `SyncStatusPill.tsx`.

## Files to create
The above + tests (see Testing).

## Files that may be modified
`app/(app)/attempt/[attemptId]/index.tsx` (replace the stub), `src/features/attempt/model/launchCache.ts` (from 04), `app/(app)/_layout.tsx` (screen options only), `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
Phase 04 list and launch logic (consume only), the phase 05 renderer API, auth internals. Results UI is phase 07: on finish, navigate to `attempt/[id]/result` (a stub if 07 isn't done) with the results seeded into the cache.

## Dependencies
Optional `@react-native-community/netinfo` (offline banner), `expo-keep-awake` (optional: keep the screen on during an attempt; product decision), `expo-screen-orientation` (if portrait isn't enforced app-wide).

## Implementation tasks
1. Port the pure helpers + reducer with unit tests **first**.
2. Load flow: cache → GET → status routing. Always reconcile with `GET attempt` after a cache hit if the cache is older than N seconds (the web uses the cache blindly).
3. **Deadline timer:** set from the server `timeRemaining` at load/resume/next-session. Recompute on every tick from `Date.now()`, so it is correct after background/sleep. Only `TimerText` subscribes to ticks. Time-up fires once via a ref guard.
4. **AppState** (per U-03): on `background`, optionally `POST pause` (best effort; mirrors `beforeunload`). On `active`, `GET attempt` → adopt `timeRemaining`/status (if SUBMITTED/EXPIRED → results; if PAUSED → paused overlay).
5. **Answer sync:** an optimistic local update; a per-question latest-value queue; send the PATCH; on failure retry with backoff while online; show the `SyncStatusPill` ("Saving…/All answers saved/Offline — answers will sync"). Before submit or session complete, **flush the queue** (await pending, bounded by a timeout); if the flush fails, show an error rather than submitting silently. Persist the queue (U-17) in AsyncStorage keyed by attempt.
6. **Guards:** `usePreventRemove` + `BackHandler` → LeaveDialog. Disable the swipe gesture. Allow programmatic exit after finish/pause-leave.
7. Palette in a bottom sheet: a grid of 5–6 columns, colour + shape/icon per status (not colour-only), counts legend, jump to question.
8. Submit/next-section dialogs with the summary. Single-flight submit. On submit success: clear the launch cache + queue, `invalidateQueries` for lists/analytics, `router.replace` to the result.
9. 401 during submit (R-09): keep local state, prompt re-login, and retry the submit after re-auth (if feasible within Auth's design; otherwise show a clear error and keep the attempt resumable).
10. Optional: keep the screen awake during the running state.
11. Accessibility: the timer announces at 5 min/1 min remaining (not every second); options are radio semantics (`accessibilityRole="radio"`, `accessibilityState.checked`).

## Requirements
- **UX:** The action bar is fixed at the bottom (safe area); the question scrolls; options have a ≥ 48 dp tap target; the selected state is visible (sky-600 accent); no accidental exit; the busy overlay blocks input during submit/section transitions.
- **API:** Exactly the web calls and payloads. Never auto-retry `submit` without an idempotency guarantee (U-27); on a timeout, `GET attempt` to check the status before retrying.
- **Security:** Don't render/log `correctAnswer`/`explanation` in the runner (U-06). Don't log answers.
- **Performance:** No full-runner re-render per second (the web's known issue); question switch < 100 ms for text-only, < 250 ms with math (release build); the palette opens < 150 ms.
- **Testing:** Unit tests for the reducer, statuses, sessions helpers, submitPayload (answered only), the timer (deadline after a simulated background), the answer queue (retry, latest-wins, flush), time-up once. Component tests for the dialogs and guards (back → dialog). Maestro: the start → answer → pause & leave → resume → submit flow.

## Acceptance criteria
- Every web behavior listed above works on the device for topic-wise, full mock, sprint, and session-wise papers.
- After 5 minutes in background, the timer matches the server (± 2 s) on return.
- In airplane mode, answers queue; on reconnect, they sync; submit flushes first.
- Killing the app mid-attempt → reopening from the list shows Resume → the state is restored from the server (+ the local queue).
- Hardware back always shows the leave dialog during a running attempt.
- Time-up auto-submits exactly once.

## Manual device checklist
- [ ] Each paper type end to end.
- [ ] Session-wise: Next Section warning, no return, the last section submits; induce a network error during complete → the recovery flow.
- [ ] Background 10 s / 5 min / screen off → the timer correct; the pause behavior per U-03.
- [ ] Airplane mode while answering → SyncStatus; reconnect → synced (verify via a resume on another device or the web).
- [ ] Rapid taps on options and submit → no duplicates.
- [ ] Back gesture, hardware back, and the header back → the leave dialog.
- [ ] TalkBack: question, options as radios, palette statuses, timer announcements.
- [ ] Large font: options don't overlap; the action bar stays usable.
- [ ] A release (preview) build passes the same checks.

## Risks
R-04, R-05, R-06, R-07, R-09, R-15, R-22.

## Rollback / isolation
A self-contained feature folder plus one route. Reverting restores the phase 04 stub. The engine logic is pure and unit-tested independently of the UI.

## Completion checklist
- [ ] U-03, U-17, U-27 decisions implemented and recorded.
- [ ] Behavior parity table above ticked item by item.
- [ ] Release-build verification done.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A user can take any EZ Prep test type to completion on the physical Android device with correct timing, no lost answers under realistic network and lifecycle conditions, and behavior matching the web rules.
