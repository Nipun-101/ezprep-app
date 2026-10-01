# Phase 04 — Exam Hub & Test Lists

## Objective
Build the exam route (web `/dashboard/exam/[id]/*`): a header with the exam name, segmented tabs **Overview · Topic Wise · Full Mocks · Sprint Tests**, the three test lists with pagination (and search/subject filter for Topic Wise), and the **launch flow** (Start / Retake / Resume) that creates or resumes an attempt and navigates to the runner route (a stub until phase 06).

## Prerequisites
Phase 02 done (03 recommended for the entry point; a deep link works without it).

## Source documents
`../route-inventory.md` (exam routes), `../api-architecture.md` (C3, T1–T3, X1–X2), `../responsive-analysis.md` (Exam hub, lists), `../state-management.md`, `../navigation-map.md` (J3–J4).

## Web reference (read-only)
- Routes: `/dashboard/exam/[id]`, `/practice`, `/full-mocks`, `/sprint-tests`.
- Components: `app/dashboard/exam/[id]/layout.tsx`, `components/exam/ExamLayoutClient.tsx` (tabs, `useExamPage` context), `ExamHubClient.tsx`, `ExamIntro.tsx`, `PracticeTestsClient.tsx`, `PracticeTestCard.tsx`, `FullMockTestsClient.tsx`, `FullMockTestCard.tsx`, `SprintTestsClient.tsx`, `SprintTestCard.tsx`, `TestListPagination.tsx`, `useLaunchAttempt.ts`.
- Lib: `lib/api/exams.ts` (`ApiMockTest`, `UserAttemptAction`, `getMockTestsByExam`), `lib/api/full-mock-tests.ts`, `lib/api/sprint-tests.ts`, `lib/api/attempts.ts` (`startMockTestAttempt`, `resumeAttempt`), `lib/attempt-storage.ts`, `lib/exam-test-routes.ts`.
- APIs: `GET /exams/:id`, `GET /mock-tests/exam/:id?page&limit=20&search&subjectId`, `GET /full-mock-tests?examId&page&limit=12`, `GET /sprint-tests?examId&page&limit=12`, `POST /mock-test-attempts/start { mockTestId }`, `POST /mock-test-attempts/:id/resume`.

## Verified web behavior to keep
- Tab labels: "Overview", "Topic Wise", "Full Mocks", "Sprint Tests".
- Overview: stat cards Duration / Questions / Total Marks / Mode; an "Exam Structure" table (subject, questions, marks, negative marks); entry cards to the three test types.
- Topic Wise: title "Topic Wise Tests", subtitle "Master topics with focused practice tests"; a search box "Search topics..." with a **400 ms** debounce; a subject filter "All Subjects" + subjects derived from `exam.subjects` (deduped by id, sorted by name); page size 20. Empty copy: "No Practice Tests Yet" / "Practice tests for this exam will be available soon."; filtered: "No matching tests found" / "Try a different search term or subject filter."; error: "Failed to load tests. Please try again."
- Card: title (`test.title || test.topic.name`), subject name, "-N marking" badge or "No negative marking", "{n} Questions", "{m} mins", "{k} mark(s)/Q".
- Action button from `userAttemptAction` (default START): **START** "Start Practice" (teal), **RETAKE** "Retake" (amber), **RESUME** "Resume" (blue; requires `resumeAttemptId`, otherwise falls back to start). Loading labels "Starting..." / "Resuming...". Only **one launch at a time**: other cards are disabled while one is in flight.
- Launch errors: the API `message`, or "Could not start the test. Please try again." / "Could not resume the test. Please try again.", shown above the list.
- On success: cache the start/resume payload (`ezp:mockAttempt:<attemptId>`), preload the math renderer, navigate to the runner.
- Full mocks and sprint lists: same pattern, page size 12. Read their card files for exact labels.

## Target mobile routes and components
- `app/(app)/exam/[examId]/_layout.tsx`: loads the exam (`['exam', id]`), header title = exam name, segmented tabs (decision: a custom top tab bar via Expo Router `Tabs` with `tabBarPosition`/custom `tabBar`, or a segmented control + `router.replace`; record it).
- `index.tsx` (Overview), `practice.tsx`, `full-mocks.tsx`, `sprint-tests.tsx`.
- `app/(app)/attempt/[attemptId]/index.tsx` (**stub** showing the attempt id + "Runner arrives in phase 06" + a back action).
- `src/features/tests/`: `api/testsApi.ts` (+ zod), `hooks/useExam.ts`, `useTopicTests.ts` (`useInfiniteQuery`), `useFullMocks.ts`, `useSprintTests.ts`, `useLaunchAttempt.ts`; `model/attemptAction.ts` (pure mapping action → label/variant/handler); `model/examTestRoutes.ts` (port of `lib/exam-test-routes.ts` → mobile routes); `components/TestCard.tsx` (shared, variant per paper type), `SubjectFilterSheet.tsx`, `ExamStats.tsx`, `ExamStructureList.tsx`.
- `src/features/attempt/model/launchCache.ts`: in-memory map + AsyncStorage `ezp:mockAttempt:<id>` (non-sensitive, see U-17); cleared on submit.

## Files to create
The files above + tests: `attemptAction.test.ts`, `examTestRoutes.test.ts`, `useLaunchAttempt.test.tsx` (single-flight, error copy), `TopicTestsScreen.test.tsx` (empty/filtered-empty/error), `testsApi.test.ts` (pagination schema).

## Files that may be modified
`app/(app)/exam/[examId]/index.tsx` (replace the phase 03 stub), `app/(app)/_layout.tsx` (register the attempt route, `presentation: 'fullScreenModal'`), `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
Catalog feature internals (navigate only). Runner logic (phase 06). Rendering (phase 05).

## Dependencies
None required. Optional: `@react-navigation/material-top-tabs` + `react-native-pager-view` if swipeable tabs are chosen (record the rationale).

## Implementation tasks
1. Schemas: `ApiExam` (+ subjects, structure rows), `ApiMockTest` (+ `userAttemptAction`, `resumeAttemptId`), full-mock and sprint DTOs, the pagination envelope.
2. The exam layout with tabs. The header back returns to the previous screen.
3. Overview: 2×2 stat grid, the structure as a vertical list (not a table), collapsible "About" if a description exists (U-21).
4. Topic Wise: a search input (400 ms debounce, cancel stale), a subject filter as a bottom sheet/picker; `useInfiniteQuery` with load-more on scroll (replaces numbered pagination; same `limit=20`); filter changes reset to page 1.
5. Full Mocks / Sprint: infinite lists with `limit=12`.
6. `useLaunchAttempt`: single-flight across the screen, error banner, `queryClient.setQueryData(['attemptLaunch', id], payload)` + launch cache, `router.push('/attempt/[id]')`.
7. Invalidate the list queries on screen focus after returning from an attempt (`useFocusEffect` → `invalidateQueries(['tests', *, examId])`). The web doesn't refetch; this fixes stale action buttons.
8. Pull-to-refresh on all lists.

## Requirements
- **UX:** The tab switch keeps each list's scroll position; the filter sheet is closable via back; the launch button shows a spinner; other cards are visibly disabled.
- **API:** Exact query params/page sizes as the web. Don't retry `start` automatically (it creates attempts). `resume` unpauses the server timer, so call it only on an explicit user action.
- **Security:** Never render `correctAnswer` from any list or launch payload (U-06). Don't log launch payloads.
- **Performance:** `FlatList` with `keyExtractor`, memoised cards, `onEndReachedThreshold` ~0.5.
- **Testing:** As listed.

## Acceptance criteria
All tabs load real data; search and filter work; infinite scroll stops at the last page; Start creates an attempt and opens the runner stub; Resume calls resume; Retake starts new; a double tap launches only once; the list action updates after returning.

## Manual device checklist
- [ ] Each tab: loading, data, empty, error (airplane mode), pull-to-refresh.
- [ ] Topic search: type quickly; clear; filter + search combined; the filtered-empty copy.
- [ ] Start → stub → back → the card now shows Resume (after the refetch).
- [ ] Rapid double-tap on Start → one attempt (check on the backend or by the attempt id).
- [ ] Hardware back from each tab → previous screen (not the previous tab), as decided.
- [ ] TalkBack reads the card summary and button label.

## Risks
R-08 (contract drift), R-15 (long lists).

## Rollback / isolation
`features/tests` + exam routes. The runner stub isolates phase 06. Reverting restores the phase 03 exam stub.

## Completion checklist
- [ ] The tab implementation decision recorded.
- [ ] Copy matches the web (diff checked against the source files).
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
From an exam, a user can browse all test types and start, resume, or retake a test, landing on the attempt route with the launch payload cached, verified on the device.
