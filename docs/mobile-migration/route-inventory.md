# Route Inventory

Every user-facing route in `app/`. "Auth" means what **middleware** enforces (`middleware.ts`: prefixes `/dashboard` and `/complete-profile` are protected; `/` and `/login` redirect signed-in users away). Client-side 401 handling applies everywhere an authenticated API call is made.

Mobile disposition key: **Port** = build natively; **Adapt** = same intent, different UX; **Defer** = product decision needed; **Drop** = do not build.

## Summary table

| Route | Purpose | Auth | Mobile disposition | Phase |
| --- | --- | --- | --- | --- |
| `/` | Marketing home; also handles the Google OAuth return (`?code=` / `?error=`) | Guest (signed-in → redirected) | **Adapt** → native welcome/sign-in screen. OAuth return replaced by native flow | 01 |
| `/login` | Marketing home + login modal (Google, MSG91 OTP) | Guest | **Adapt** → native sign-in screen | 01 |
| `/complete-profile` | Onboarding form (orphan) | Protected | **Drop** for now (`U-09`) | — |
| `/dashboard` | Exams grouped by category | Protected | **Port** (Home tab) | 03 |
| `/dashboard?categoryId=` | Scroll to a category (from search) | Protected | **Adapt** (scroll-to-section or category screen) | 03 |
| `/dashboard/exam/[id]` | Exam overview (stats, structure table, links to test types) | Protected | **Port** | 04 |
| `/dashboard/exam/[id]/practice` | Topic-wise tests (search, subject filter, pagination) | Protected | **Port** | 04 |
| `/dashboard/exam/[id]/full-mocks` | Full mock tests (pagination) | Protected | **Port** | 04 |
| `/dashboard/exam/[id]/sprint-tests` | Sprint tests (pagination) | Protected | **Port** | 04 |
| `/dashboard/attempt/[attemptId]` | Test runner | Protected | **Port** (full-screen modal stack) | 06 |
| `/dashboard/attempt/[attemptId]/result` | Result + answer key | Protected | **Port** | 07 |
| `/dashboard/current-affairs` | Daily swipe cards with date picker | Protected | **Port** | 09 |
| `/dashboard/profile` | Profile, stats, activity, subjects, badges, edit | Protected | **Port** (Profile tab) | 08 |
| `/dashboard/courses`, `/concept-videos`, `/bookmarks`, `/subscriptions` | Coming soon (in sidebar) | Protected | **Adapt** → one generic "Coming soon" screen, reachable from the More menu | 02 |
| `/dashboard/search`, `/tests`, `/mentorship`, `/success-stories` | Coming soon (not in sidebar) | Protected | **Drop** (no entry point) | — |
| `/analytics` | "AI Analytics", **dummy data** | **Not protected** (outside `/dashboard`) | **Defer** (`U-08`) | — |
| `/profile` | Duplicate profile without shell (orphan) | Not protected | **Drop** | — |
| `/study-materials`, `/study-materials/[id]` | Static hardcoded materials (orphan) | Not protected | **Defer** (`U-08`) | — |
| `/test` | Legacy dummy runner | Not protected | **Drop** | — |
| `/privacy-policy`, `/terms`, `/user-policy` | Legal documents | Public | **Adapt** → open the web URL in an in-app browser | 02 |
| `/terms-of-service` | Redirect → `/terms` | Public | Not needed | — |

---

## Detailed entries

### `/` — Marketing home / Google OAuth return
- **Files:** `app/page.tsx`, `components/MarketingHome.tsx`, `components/auth/GoogleOAuthReturn.tsx`, `components/auth/GoogleSignInPrompt.tsx`, `Header`, `HeroSection`, `ExamsSection`, `WhyChooseUsSection`, `TestimonialsSection`, `StatsSection`, `Footer`.
- **Query params:** `code`, `state`, `error`. If `code` or `error` is present, the page renders `GoogleOAuthReturn` instead of marketing.
- **APIs:** server-side `GET /api/v1/exam-groups/by-category` (ISR 24 h; errors swallowed to `[]`). On OAuth return: `POST /api/v1/auth/google`.
- **Behavior:** The Google One-Tap-style prompt (`GoogleSignInPrompt`) appears after 700 ms on `/` for guests unless dismissed in this session (`sessionStorage['ezprep.google.prompt.dismissed']`). The CTA buttons go to `/dashboard` when logged in and to `/login` otherwise. The header has a global `SearchBox`.
- **States:** OAuth return shows a spinner ("Signing you in with Google…"). On failure it shows an error message and a "Back to sign in" link.
- **Mobile:** Marketing content is web acquisition material. A native app should open to a **sign-in screen** for guests and to Home for signed-in users. Decide whether any marketing content (exam groups carousel) appears pre-login (`U-10`).

### `/login`
- **Files:** `app/login/page.tsx`, `components/auth/LoginModal.tsx`, `GoogleSignInButton.tsx`.
- **Query params:** `redirect`, a safe in-app return path (validated by `lib/safeRedirect.ts`).
- **UI:** A modal over the marketing home. It has the logo, "Log in to Ez Prep", **Continue with Google**, and **Continue with mobile number**, which mounts the MSG91 widget into `#msg91-otp-widget`. The Terms and Privacy links sit below. Close or Escape goes to `/`. Body scroll is locked.
- **APIs:** MSG91 widget (external) → `POST /api/v1/auth/verify-otp` with `{ accessToken }`.
- **States:** "Verifying your account..." spinner. A destructive `Alert` titled "Could not verify" shows widget or backend errors. A user cancel shows no error.
- **Edge cases:** If a token already exists on mount, the page re-saves it and redirects (`router.replace(resolvePostLoginPath())`). The OTP digit count, resend, and phone validation are all inside the MSG91 widget, not in EZ Prep code.
- **Mobile:** Native sign-in screen. See `mobile-authentication.md`.

### `/complete-profile` (orphan)
- **Files:** `app/complete-profile/page.tsx`.
- **Form:** fullName (required), email (required, HTML `type=email`), targetExam (optional `<select>` of hardcoded strings). It uses `alert()` for errors and has a "Skip for now" option.
- **API:** `POST /api/v1/user/complete-profile` (raw fetch with a bearer token; it logs the response to the console).
- **Reachability:** No code navigates here. **[Inferred]** It is a leftover onboarding step that Profile edit has superseded.

### `/dashboard` — Exams by category
- **Files:** `app/dashboard/page.tsx` (server, ISR 24 h), `DashboardLayout`, `DashboardExamsContent`, `CategorySection`, `ExamCardDashboard`.
- **API:** `GET /api/v1/exams/by-category` (server-side, no token; errors → `[]`).
- **Query params:** `categoryId`. After 50 ms the page smooth-scrolls to `#dashboard-category-<id>`, then `router.replace('/dashboard')` strips the param.
- **UI:** For each category, a heading "Popular Exams from {category.name}" and a responsive grid (2 to 7 columns) of exam cards. Each card shows the **category image** (exams have no own image) and the exam title. `trending: true` adds an animated "Trending" pill and a violet shadow.
- **Empty:** "Exam listings will be available soon." There is no distinct error state, because errors are swallowed into empty.
- **Business rule:** Exam data can be up to 24 h stale on the web (README "Caching").
- **Navigation:** tap card → `/dashboard/exam/{exam.id}`.

### `/dashboard/exam/[id]` — Exam layout + Overview
- **Files:** `app/dashboard/exam/[id]/layout.tsx` → `ExamLayoutClient` (context provider `useExamPage`), `page.tsx` → `ExamHubClient`, `ExamIntro`.
- **API:** `GET /api/v1/exams/{id}` once per layout mount. The result is shared via context with the child tabs.
- **Layout UI:** "Back to Dashboard" button. On mobile the exam name sits in the header row. Below is a horizontal scrollable tab bar: **Overview · Topic Wise · Full Mocks · Sprint Tests** (links; active tab scrolled into view).
- **Overview UI:** `ExamIntro` (desktop only, `hidden md:block`), then 4 stat cards (Duration formatted `Xh Ymin`, Questions, Total Marks, Mode = Session-wise / Mixed). An "Exam Structure" table lists subject, questions, marks/Q, negative, and session time (session time only if session-wise). Three link cards go to the test types.
- **States:** a spinner while loading. The error is "Failed to load exam. Please try again." with no retry button. The structure empty state reads "Structure for this exam will be available soon."
- **Mobile:** The table becomes a list of subject rows. The tab bar becomes a native top-tab or segmented control inside the exam stack.

### `/dashboard/exam/[id]/practice` — Topic Wise tests
- **Files:** `PracticeTestsClient`, `PracticeTestCard`, `TestListPagination`, `useLaunchAttempt`.
- **API:** `GET /api/v1/mock-tests/exam/{examId}?page&limit=20&search&subjectId`.
- **Controls:** a search input (400 ms debounce, resets to page 1) and a subject `<select>` built from `exam.subjects`, de-duplicated and sorted by name, shown only if there are any subjects. Numbered pagination with ellipses is hidden when `totalPages <= 1`. Page and filter changes scroll to the section top.
- **Card:** title (`test.title || test.topic.name`), subject name, a negative marking badge (`-{n} marking`) or "No negative marking", question count, duration, marks/Q. The action button follows `userAttemptAction`: **START** "Start Practice" (teal), **RETAKE** "Retake" (amber), **RESUME** "Resume" (blue).
- **Launch rule (`useLaunchAttempt`):** Only one launch can run at a time. Other cards are disabled while one is acting. RESUME with a `resumeAttemptId` calls `GET .../resume`. Anything else calls `POST .../start`. On success the page preloads Mathpix, caches the payload in `sessionStorage`, and pushes `/dashboard/attempt/{attemptId}`. On error it shows `err.response.data.message` or "Could not start the test. Please try again."
- **Empty:** "No Practice Tests Yet" vs "No matching tests found" (when filters are active).
- **URL state:** none. Filters and page are component state only, so they are lost on navigation.

### `/dashboard/exam/[id]/full-mocks`
- **Files:** `FullMockTestsClient`, `FullMockTestCard`.
- **API:** `GET /api/v1/full-mock-tests?examId&page&limit=12`.
- **Card:** title (`title || exam.name || 'Full Mock Test'`), "Session-wise/Mixed · N subjects", a badge, questions, duration, total marks, N sections. If negative marking applies it notes "Negative marking applies per subject". The action labels are "Start Mock" / "Retake" / "Resume".
- No search or filter. Launch rules are the same as practice.

### `/dashboard/exam/[id]/sprint-tests`
- **Files:** `SprintTestsClient`, `SprintTestCard`.
- **API:** `GET /api/v1/sprint-tests?examId&page&limit=12`.
- **Card:** title (`title?.trim() || exam.name || 'Sprint Test'`), description or "One timer for the whole paper", a "Sprint" badge. The action labels are "Start Sprint" / "Retake" / "Resume".

### `/dashboard/attempt/[attemptId]` — Test runner
- **Files:** `AttemptPageClient`, `MockTestRunner`, `AttemptTimer`, `MathpixBoundary`, `MathText`, `lib/attempt-sessions.ts`, `lib/attempt-storage.ts`, `lib/exam-test-routes.ts`.
- **Load:** `GET /api/v1/mock-test-attempts/{id}` is authoritative and does not unpause.
  - `SUBMITTED`/`EXPIRED` → `router.replace(.../result)`.
  - Otherwise the page maps the details to runner data. The timer starts from `details.timeRemaining`, or `computeAttemptSecondsLeft`. If the status is `PAUSED` the runner starts paused.
  - On a network failure it falls back to the `sessionStorage` cached launch payload. With no cache it shows "Attempt unavailable".
- **No shell.** The runner is full screen with its own header: logo, title, "Q n/N · section", timer, and an EN/ML language select if `exam.hasMultiLingualSupport`.
- **Question view:** "Question No n", difficulty pill, stem (Mathpix markdown + optional image), and options (text with math, or image). Tapping the selected option again **clears** it.
- **Actions:** Prev, Save & Next (navigation only; answers save on select), Mark for Review & Next, Clear Response. The palette (desktop sidebar / mobile right sheet) shows a legend with counts, a numbered grid, Pause/Resume, and Submit.
- **Question status rules:** `answered`, `not-answered` (visited but no answer), `marked`, `marked-answered`, `not-visited`. Mark-for-review is local only and **cannot be unmarked** in the current UI. **[Verified]** `handleMarkForReview` only adds.
- **Answer persistence:** `PATCH .../answer` is fire-and-forget on every select or clear. Failures are only logged.
- **Pause:** `POST .../pause`. A full-screen overlay shows time used, time remaining, and the paper total for session-wise papers, with "Resume Test" and "Exit to {Practice|Full Mocks|Sprint Tests}".
- **Resume:** `GET .../resume` returns fresh questions/sessions/time. The page merges answers and resets to Q1 with visited `{0}`.
- **Submit, non-session:** a confirm dialog ("Answered n / Not Answered m", "Review Again") → `POST .../submit` with **all** answers → results render in place (no navigation).
- **Session-wise papers:** The submit label is "Next Section" until the last section. The dialog shows an "Exam Summary" with counts and the warning "You cannot return to this section after moving ahead." The page calls `POST .../sessions/complete`, which returns either `paperCompleted + results` or `nextSession`. On error it runs a recovery sequence: resume, check the session status, retry complete, otherwise adopt the resumed state. If paused, it resumes first.
- **Time up:** auto-submit, or auto-complete the section.
- **Leaving:** browser back is trapped (`history.pushState` + `popstate`) and shows a "Leave the exam?" dialog → "Pause & Leave" (pause API, then go to the exam's list for that paperType). `beforeunload` shows a native prompt and sends a `keepalive` pause request.
- **Submitting overlay:** "Submitting your test" / "Starting next section", with "Please don't close this page."
- **Mobile:** This is the most critical and most complex screen. See phase 06.

### `/dashboard/attempt/[attemptId]/result`
- **Files:** `AttemptResultClient`, `MockTestResults`, `AnswerKeyList`, `ScoreRing`, `QuestionRenderGuard`.
- **API:** `GET /api/v1/mock-test-attempts/{id}`.
- **Rules:** If the status is not `SUBMITTED`/`EXPIRED`, the page shows "Attempt still in progress" with Resume. `timeTaken` falls back to wall clock (`submittedAt - startedAt`). `totalScore` falls back to `totalQuestions × marksPerQuestion`.
- **UI:** a back button ("Back to Exam"), a language select, and a score ring colored by percentage (≥80 green, ≥60 teal, ≥40 amber, ≥20 orange, else red; full marks forces green). Next come "Test Completed", a PASSED/FAILED pill (only if `passingScore !== null`), the title, Correct/Wrong/Skipped tiles, accuracy % (correct ÷ attempted), and time taken. Papers with more than one section get a section-wise score table (mobile shows cards) and a section filter on the answer key. Each answer key question shows its status icon, number, difficulty, stem, options (correct highlighted green, user's wrong answer red), and explanation. The footer has "Back to Dashboard" and "More Sprint Tests" (sprint) or "More Practice Tests" (other).
- **Note:** `showResultsImmediately` exists on test types but is **not read** by any web UI (`U-11`).
- **Rendering:** The answer key renders progressively, 6 questions every 40 ms (batching), inside an error boundary per question.

### `/dashboard/current-affairs`
- **Files:** `CurrentAffairsView`, `CurrentAffairsSwipeStack`, `lib/current-affairs-seen.ts`, `hooks/useCurrentAffairsNotification.ts`.
- **API:** `GET /api/v1/current-affairs?date=YYYY-MM-DD&limit=100&page=1&activeOnly=true`.
- **Rules:** The date is the **local** calendar date. Future dates are blocked (next-day disabled; calendar disables future days). Opening today marks it seen in `localStorage['ezp:currentAffairsLastSeenDate']`, which clears the sidebar red dot.
- **UI:** "Exit to Dashboard", the hero, prev/next day buttons, a calendar popover, and a "Today" button when not on today. The header reads "Today's Current Affairs" or a formatted date, with a card count and Refresh. The swipe stack shows up to 3 cards. Swiping right ("Mark as read") or left ("Skip") past 96 px dismisses a card, and there are equivalent buttons. A progress bar counts "n of N read". Cards can show an image (downloadable), a title, bullet points, and a "Memory trick" box. The finish state says "Daily streak secured…" **[Verified]** Read/skip state is not sent to the server.
- **States:** loading spinner, error with Retry, and an empty state ("Nothing here yet").

### `/dashboard/profile`
- **Files:** `ProfileView`, `ProfileHeader`, `ProfileStats`, `ProfileActivity`, `ProfileSubjects`, `ProfileBadges`, `ProfileEditModal`.
- **APIs:** `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `GET /api/v1/analytics/dashboard`, `GET /api/v1/analytics/recent-activity?page&limit=10`, `GET /api/v1/analytics/subject-topic-breakdown`, `GET /api/v1/analytics/badges`, plus `GET /api/v1/exams/by-category` for the target exam picker.
- **Independent loading:** Each widget loads, errors, and retries on its own. The profile has a skeleton.
- **Activity:** each item links to `/result` (SUBMITTED/EXPIRED) or to the runner (otherwise). Prev/next pagination.
- **Edit modal validation:** name required; email optional but regex-validated; bio ≤ 500 chars; phone read-only; location city/state/country; target exam picker (`null` clears it). Only changed fields go in the PATCH. With no changes, Save just closes.
- **Mobile:** Profile tab. Edit becomes a pushed form screen or a sheet. Logout lives here too, because the web sidebar's logout has no direct native equivalent.

### Coming soon routes
`ComingSoon` shows an icon, title, description, and a "Coming Soon" pill. Sidebar entries: Courses, Concept Videos, My Bookmarks, My Subscriptions. **[Verified]** `navigationItems` also has `comingSoon: true` flags, but the sidebar ignores them.

### Legal routes
Long static documents with section navigation (`LegalDocument`). Mobile should open `https://www.ezprep.in/{privacy-policy|terms|user-policy}` in an in-app browser rather than duplicate the content, so it stays a single source of truth (`U-12`: confirm the production URLs are stable).
