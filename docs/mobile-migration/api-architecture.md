# API and Data Architecture

## 1. Client configuration

| Item | Current behavior | Evidence |
| --- | --- | --- |
| Base URL | `process.env.NEXT_PUBLIC_API_URL` (origin only, no `/api/v1`). Production: `https://api.ezprep.in` | `lib/api/client.ts`, README |
| Fallback | Raw-fetch auth paths fall back to `http://localhost:4000`, which README calls wrong. The axios client has no fallback | `LoginModal.tsx`, `googleAuth.ts`, `lib/auth.ts` |
| Library | axios instance `apiClient` with `Content-Type: application/json` | `lib/api/client.ts` |
| Request interceptor | Adds `Authorization: Bearer <localStorage.authToken>` if present | same |
| Response interceptor | On 401 (browser only): remove the token, `window.location.href = /login?redirect=…`, reject | same |
| Timeouts | **None** configured (axios default = no timeout) | [Verified] |
| Retries | **None** | [Verified] |
| Cancellation | No AbortController. Components use `cancelled`/`isMounted` flags to ignore late responses | [Verified] |
| Caching | No client cache. Server ISR caches two catalog endpoints for 24 h | `app/page.tsx`, `app/dashboard/page.tsx` |
| Polling / WebSockets | **None** | [Verified] |
| Uploads | **None.** `avatarUrl` is a string field, with no upload UI | [Verified] |
| Downloads | Current-affairs image download via `fetch` → blob → `<a download>` | `CurrentAffairsSwipeStack.tsx` |
| Optimistic updates | Answer selection updates UI before the PATCH, and PATCH failures are ignored | `MockTestRunner.tsx` |
| Pagination | Page-number based. `{ total, page, limit, totalPages, hasNextPage, hasPrevPage }` | multiple |
| Response envelope | `{ message: string, data: T, pagination?, count?, meta? }`. Modules unwrap `response.data.data`. `submit` tolerates both wrapped and unwrapped | `lib/api/*.ts` |
| Error shape | UI reads `err.response.data.message` (string) with a hardcoded fallback | multiple |
| Validation of responses | None (TypeScript types only). `search.ts` filters entries whose `id` is `'undefined'`; `coerceDescriptionPoints` tolerates legacy string | `lib/api/search.ts`, `lib/api/current-affairs.ts` |

## 2. Endpoint catalogue

"Auth" means the client sends a token. Whether the server **requires** it is mostly unknown (`U-05`). The two catalog endpoints are verified to work **without** a token, because the Next server calls them with no `localStorage`.

### Authentication

| # | Method & path | Request | Response `data` | Caller | Errors / notes | Mobile implications |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | `POST /api/v1/auth/verify-otp` | `{ accessToken: string }` (from MSG91) | `{ accessToken: string }` (+ unknown fields) | `LoginModal` (fetch) | Non-2xx → generic error | Contract reusable if mobile gets an MSG91 access token the same way (`U-01`) |
| A2 | `POST /api/v1/auth/google` | `{ code, redirectUri, codeVerifier }` | `{ accessToken }` | `completeGoogleSession` (fetch) | `message` surfaced | Web-redirect based. Native likely needs a new contract (`U-02`) |
| A3 | `POST /api/v1/user/complete-profile` | `{ fullName, email, targetExam }` | unknown | orphan page | Existence unknown (`U-09`) | Do not use |

### Catalog / discovery

| # | Method & path | Request | Response `data` | Caller | Cache | Mobile implications |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | `GET /api/v1/exam-groups/by-category` | — | `ApiExamGroupCategory[]` `{id,name,shortName,imageUrl,description,examGroups[{id,name,shortName,isActive,…}]}` + `count` | `MarketingHome` (server) | ISR 24 h | Only for a pre-login showcase, if any (`U-10`) |
| C2 | `GET /api/v1/exams/by-category` | — | `ApiExamCategory[]` `{id,name,shortName,imageUrl,description,exams[{id,title,fullName,duration,totalQuestions,totalMarks,testsCount,subjectsCount,trending?}]}` | Dashboard (server), `ProfileEditModal` (client) | ISR 24 h | Long staleTime (hours) + pull-to-refresh |
| C3 | `GET /api/v1/exams/{examId}` | — | `ApiExamDetail` `{id,name,description?,duration?,totalQuestions?,totalMarks?,subjects?[{subject,name?,numberOfQuestions,marksPerQuestion,hasNegativeMarking,negativeMarksPerQuestion,sessionTime?}],isSessionWise,hasMultiLingualSupport,isActive}` | `ExamLayoutClient` | none | Cache per examId and share across exam tabs |
| C4 | `GET /api/v1/search?q=` | `q` trimmed, non-empty | `{ categories: SearchCategoryDTO[], exams: SearchExamDTO[] }` + `meta` | `SearchBox` | none | Debounce 300 ms, cancel stale requests |

### Test listings (user-specific: carry `userAttemptAction`)

| # | Method & path | Params | Response | Caller | Mobile implications |
| --- | --- | --- | --- | --- | --- |
| T1 | `GET /api/v1/mock-tests/exam/{examId}` | `page, limit(20), search?, subjectId?` | `{ data: ApiMockTest[], pagination }` | `PracticeTestsClient` | Infinite list. Invalidate after an attempt ends (action flips START→RETAKE/RESUME) |
| T2 | `GET /api/v1/full-mock-tests` | `examId, page, limit(12)` | `{ data: ApiFullMockTest[], pagination }` | `FullMockTestsClient` | same |
| T3 | `GET /api/v1/sprint-tests` | `examId, page, limit(12)` | `{ data: ApiSprintTest[], pagination }` | `SprintTestsClient` | same |

Common test fields: `id, title|null, description|null, totalQuestions, durationInMinutes, exam, marksPerQuestion, negativeMarking, passingScore|null, allowRetake, shuffleOptions, showResultsImmediately, isActive, createdAt, updatedAt, userAttemptAction: 'START'|'RETAKE'|'RESUME', resumeAttemptId?`. Topic-wise adds `subject{id,name}, topic{id,name}, generationMode`. Full mock adds `totalMarks?, isSessionWise, subjectConfig[]`.

### Attempts (the core engine)

| # | Method & path | Request | Response `data` | Caller | Notes |
| --- | --- | --- | --- | --- | --- |
| X1 | `POST /api/v1/mock-test-attempts/start` | `{ mockTestId }` (used for all paper types) | `StartAttemptData { attemptId, mockTestData, questions[] }` | `useLaunchAttempt` | Errors surface `message` |
| X2 | `GET /api/v1/mock-test-attempts/{id}/resume` | — | `ResumeAttemptData` = Start + `timeElapsed, timeRemaining, pauseCount, timeConsumed, sessions?, currentSessionIndex?` | launch, runner Resume, recovery | **Unpauses** the server clock |
| X3 | `GET /api/v1/mock-test-attempts/{id}` | — | `AttemptDetails { attemptId, status, test, questions[] (with correctAnswer/isCorrect/marksAwarded/explanation), score, submittedAt, correct/incorrect/unanswered, isPassed, totalScore?, timeElapsed?, timeRemaining?, timeTaken?, isSessionWise?, sessions?, currentSessionIndex? }` | runner load, result page | Authoritative. Does **not** unpause. **[Unknown]** whether correct answers are returned while IN_PROGRESS (`U-06`, security) |
| X4 | `PATCH /api/v1/mock-test-attempts/{id}/answer` | `{ questionId, selectedOptionId: string|null }` | ignored | runner | `null` clears. Fire-and-forget |
| X5 | `POST /api/v1/mock-test-attempts/{id}/pause` | — | `PauseAttemptData { attemptId, testTitle, status, timeConsumed, totalTimeConsumed?, timeRemaining, pausedAt, pauseCount }` | runner pause, exit, `beforeunload` (keepalive) | |
| X6 | `POST /api/v1/mock-test-attempts/{id}/submit` | `{ answers: [{questionId, selectedOptionId}] }` | `SubmitAttemptResult { attemptId, score, totalScore, passingScore, passed, correctAnswers, incorrectAnswers, unansweredQuestions, submittedAt, timeTaken, questionResults[] }` (wrapped or not) | runner (non-session papers) | Sends **all** current answers |
| X7 | `POST /api/v1/mock-test-attempts/{id}/sessions/complete` | — | `CompleteSessionResult { paperCompleted, sessions, currentSessionIndex, nextSession?: ResumeAttemptData, results?: SubmitAttemptResult }` | runner (session-wise) | Must be running (resume first if paused) |

Attempt question shape: `{ _id, questionText: { en: {text, imageUrl|null}, ml: {...} }, optionType?, options: [{ id, type:'text'|'image', en, ml, imageUrl|null }], subject, topic?, difficultyLevel?, sessionOrder?, selectedOption? }`. Text fields hold **Mathpix markdown** (LaTeX + HTML tags).

Session shape: `{ subject, name?, order, durationInMinutes, startIndex, endIndex, questionIds?, questionCount?, status: LOCKED|IN_PROGRESS|PAUSED|SUBMITTED|EXPIRED, startedAt?, submittedAt?, timeConsumed }`.

### Profile & analytics

| # | Method & path | Request | Response `data` | Caller |
| --- | --- | --- | --- | --- |
| P1 | `GET /api/v1/users/me` | — | `ApiUserProfile` (id, name, email, phoneNumber, role, isActive, isDeleted, membershipTier, badgesEarnedCount, bio?, avatarUrl?, dateOfBirth?, gender?, location?, targetExam?{id,name}, targetExamDate?, subscription, preferences, interactions, createdAt, updatedAt) | `ProfileView` |
| P2 | `PATCH /api/v1/users/me` | `UpdateUserProfilePayload` (only changed fields; `targetExam: string|null`) | `ApiUserProfile` | `ProfileEditModal` |
| P3 | `GET /api/v1/analytics/dashboard` | — | `{ streak, testsSummary, scoreAnalytics, accuracy, timeInvestment, subjectPerformance[], examPerformance[] }` | `ProfileStats` |
| P4 | `GET /api/v1/analytics/recent-activity` | `page(1), limit(10)` | `{ data: RecentActivityItem[], pagination }` | `ProfileActivity` |
| P5 | `GET /api/v1/analytics/subject-topic-breakdown` | — | `{ subjects: SubjectBreakdown[] }` | `ProfileSubjects` |
| P6 | `GET /api/v1/analytics/badges` | — | `{ badges[], earnedCount, totalCount }` | `ProfileBadges` |

### Content

| # | Method & path | Params | Response | Caller |
| --- | --- | --- | --- | --- |
| K1 | `GET /api/v1/current-affairs` | `page(1), limit(100), activeOnly(true), date?(YYYY-MM-DD), search?` | `{ data: CurrentAffairItem[], pagination }`. Item: `id, title, description?: string[] (legacy string), memoryTrick?, date, imageUrl?, sortOrder, isActive, …` | `CurrentAffairsView` |

### External services (not EZ Prep API)

| Service | Use | Mobile implication |
| --- | --- | --- |
| `https://verify.msg91.com/otp-provider.js` | OTP widget script | Not usable in RN; see `U-01` |
| `https://accounts.google.com/o/oauth2/v2/auth` | Google authorize | Replace with native Google sign-in (`U-02`) |
| Remote image hosts (`imageUrl` fields) | Category, question, option, explanation, current-affairs, avatar images | Hosts unknown (`U-07`); needs HTTPS for release builds |
| Vercel Analytics | Page views | Not applicable; mobile analytics TBD (`U-16`) |

## 3. Data flow (target concept for mobile)

```mermaid
flowchart LR
  SCREEN[Screen component] --> HOOK[feature hook<br/>useExamTests(examId)]
  HOOK --> RQ[TanStack Query cache]
  RQ --> SVC[feature api module<br/>getMockTestsByExam]
  SVC --> HTTP[http client<br/>base URL · timeout · auth header · 401 handler · error normalisation]
  HTTP --> SEC[(SecureStore token)]
  HTTP --> API[(EZ Prep API)]
  SVC --> ZOD[zod schema parse] --> HOOK
```

See [`mobile-architecture.md`](mobile-architecture.md) for layer rules.
