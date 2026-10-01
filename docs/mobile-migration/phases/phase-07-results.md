# Phase 07 — Results & Answer Key

## Objective
The result screen for a finished attempt, reached right after submit (results seeded from the submit response) or later by deep link or history (loaded from `GET attempt`). It shows the score ring, correct/wrong/skipped counts, accuracy, time taken, section-wise scores for multi-section papers, and the answer key with explanations and a section filter.

## Prerequisites
Phases 05 and 06 done (06 provides the navigation after submit; 07 can be built in parallel against fixtures from a submitted staging attempt).

## Source documents
`../route-inventory.md` (result route), `../api-architecture.md` (X3, X6, X7 result shapes), `../design-system.md` (score colours), `../performance-analysis.md` (answer key), `../accessibility-analysis.md`.

## Web reference (read-only)
- Routes: `/dashboard/attempt/[attemptId]/result`; also the in-place results after submit in `AttemptPageClient`.
- Components: `components/attempt/AttemptResultClient.tsx`, `MockTestResults.tsx`, `ScoreRing.tsx`, `AnswerKeyList.tsx`.
- Lib: `lib/api/attempts.ts` (result types, `AttemptDetails`), `lib/exam-test-routes.ts`.
- APIs: `GET /mock-test-attempts/:id` (for SUBMITTED/EXPIRED it includes the answers/explanations needed for the key; verify the fields used in `AttemptResultClient`).

## Verified web behavior to keep
- Load states: an error → "Result unavailable" + the message ("Unable to load this attempt. Please try again.") + Back to Dashboard. Status IN_PROGRESS/PAUSED → "Attempt still in progress" with a Dashboard button and a Resume (go to the attempt) button.
- Header: "Back to Exam" (ML: "പരീക്ഷയിലേക്ക്"), the language select when supported; the title "Test Completed" (ML: "ടെസ്റ്റ് പൂർത്തിയായി").
- Score ring colour by percentage: ≥ 80 `#10b981`, ≥ 60 `#14b8a6`, ≥ 40 `#f59e0b`, ≥ 20 `#f97316`, else `#ef4444`; full marks → green. Counts: Correct / Wrong / Skipped.
- Accuracy = correct ÷ attempted (0 if none). `totalScore` falls back to `totalQuestions × marksPerQuestion`; `timeTaken` falls back to wall-clock time (read `MockTestResults.tsx` for the exact fallbacks).
- "Section-wise score" only when sections > 1 (cards on mobile, a table on desktop).
- "Answer Key" (ML: "ഉത്തരക്കുറിപ്പ്") with a section filter (all / per section; headings when all); each item shows the question, options with correct/selected marking, and the explanation. The web renders it progressively (6 items per 40 ms).
- Footer: "Back to Dashboard" and "More Sprint Tests" (sprint → the sprint list) or "More Practice Tests" (→ the exam overview).
- `showResultsImmediately` is ignored (U-11).

## Target mobile routes and components
- `app/(app)/attempt/[attemptId]/result.tsx`. The header back goes to the exam (not the runner).
- `src/features/results/`: `model/score.ts` (colour, accuracy, fallbacks, section aggregation), `hooks/useAttemptResult.ts` (use the cache seeded by 06, else GET), `components/ScoreRing.tsx` (react-native-svg), `ResultSummary.tsx`, `SectionScores.tsx`, `AnswerKeyList.tsx` (a virtualised `FlatList`), `AnswerKeyItem.tsx` (uses phase 05 `QuestionContent`), `SectionFilter.tsx`.

## Files to create
The above + tests: `score.test.ts` (all thresholds, full marks, zero attempted, fallbacks), `ResultScreen.test.tsx` (error, in-progress, data), `AnswerKeyItem.test.tsx` (correct/selected/skipped markings).

## Files that may be modified
`app/(app)/attempt/[attemptId]/result.tsx` (replace the stub, if created in 06), `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
The runner engine (consume its seeded data only), the renderer internals.

## Dependencies
`react-native-svg` (already present).

## Implementation tasks
1. Port the score math as pure functions + tests.
2. `useAttemptResult`: the seeded cache key `['attemptResult', id]` → else `GET attempt` → if not finished → the in-progress state.
3. The summary screen: the ring (animated fill optional; respect reduce motion), counts, accuracy, time, total score.
4. Section scores when > 1 section.
5. The answer key: `FlatList` (`initialNumToRender` ~6, `windowSize` tuned), the section filter as chips, correctness shown with icon + colour + text ("Correct answer", "Your answer").
6. The language toggle shared with phase 05 (persist per U-18).
7. Footer actions per the web. Android back → the exam list (per `examTestListPath`), not the runner.

## Requirements
- **UX:** The summary appears instantly after submit (seeded); the answer key loads lazily below.
- **API:** Tolerate a missing explanation/section. A shape mismatch → the error state, not a crash.
- **Security:** Results are user data; don't log them.
- **Performance:** A 100+ question answer key scrolls smoothly in a release build; math items render lazily.
- **Testing:** As listed.

## Acceptance criteria
Results match the web for the same attempt (score, counts, accuracy, sections, key). Deep link `ezprep://attempt/<id>/result` works. Back never re-enters the runner.

## Manual device checklist
- [ ] Results right after submit, for each paper type.
- [ ] Reopen via deep link / after an app restart.
- [ ] An in-progress attempt id → the in-progress state with Resume.
- [ ] A long answer key: scroll performance; section filter.
- [ ] EN/ML toggle.
- [ ] TalkBack: the score summary is read as a sentence; key items expose correctness in text.
- [ ] Large font.

## Risks
R-15, R-03 (math in the key).

## Rollback / isolation
A feature folder + one route. Reverting leaves the runner navigating to a stub.

## Completion checklist
- [ ] A side-by-side comparison with the web result for ≥ 3 attempts.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A user sees accurate results and a usable answer key for any finished attempt on the physical device, matching the web's numbers.
