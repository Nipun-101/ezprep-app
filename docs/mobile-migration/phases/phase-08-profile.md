# Phase 08 — Profile

## Objective
The Profile tab (web `/dashboard/profile`): the header (avatar initials, name, contact, target exam), stats (Study Streak, Tests Attempted, Average Score, Accuracy, Study Time), recent activity (paginated, with status), subject strengths, badges, and profile editing.

## Prerequisites
Phase 02 done. Independent of 03–07 (activity rows link into attempt/result routes; until 06/07 exist they open stubs).

## Source documents
`../route-inventory.md` (profile), `../api-architecture.md` (P1–P6), `../responsive-analysis.md` (profile), `../design-system.md`, `../accessibility-analysis.md`.

## Web reference (read-only)
- Routes: `/dashboard/profile` (ignore the orphan `/profile`).
- Components: `components/profile/ProfileView.tsx`, `ProfileHeader.tsx`, `ProfileStats.tsx`, `ProfileActivity.tsx`, `ProfileSubjects.tsx`, `ProfileBadges.tsx`, `ProfileEditModal.tsx`.
- Lib: `lib/api/users.ts` (`getMyProfile`, `updateMyProfile`, `UpdateUserProfilePayload`), `lib/api/analytics.ts` (`getDashboard`, `getRecentActivity`, `getSubjectTopicBreakdown`, `getBadges`), `lib/api/exams.ts` (`getExamsByCategory` for the target-exam picker).
- APIs: `GET /users/me`, `PATCH /users/me`, `GET analytics dashboard`, `recent-activity?page&limit`, `subject-topic-breakdown`, `badges` (exact paths in `api-architecture.md`).

## Verified web behavior to keep
- **Each section loads independently** with its own loading/error state.
- Activity status labels: Submitted (emerald), Expired (amber), Paused / In progress (blue), else the raw status with underscores replaced. Relative time. Empty: "No activity yet".
- Badges empty: "No badges yet". Subject strength labels map to emerald/teal/amber/red (read `ProfileSubjects.tsx` for the label set).
- **Edit Profile:** fields Full name (required), Phone (read-only: "Phone number cannot be changed here."), Email (validated with a simple regex: "Please enter a valid email address."), Target exam (picker from the flattened catalog; load failure "Could not load exam list."), City / State / Country, Bio ("Tell us a bit about your preparation journey..."). **Only changed fields are sent**; location is sent as a whole object (keeping `timezone`); clearing the target exam sends `null`; no changes → close without a request. Save error: the API message or "Failed to update profile. Please try again." Name-required error: "Full name is required."

## Target mobile routes and components
- `app/(app)/(tabs)/profile.tsx`, `app/(app)/profile-edit.tsx` (modal presentation, the keyboard-aware form).
- `src/features/profile/`: `api/profileApi.ts` + `api/analyticsApi.ts` (+ zod), `hooks/useMe.ts` (`['me']`, shared with auth restore), `useDashboardStats.ts`, `useRecentActivity.ts` (infinite), `useSubjectBreakdown.ts`, `useBadges.ts`, `useUpdateProfile.ts` (mutation → `setQueryData(['me'])`), `model/buildProfilePatch.ts` (port of `buildPayload` + `validate`), `model/activityStatus.ts`; components `ProfileHeader`, `StatsGrid`, `ActivityList`, `SubjectStrengthList`, `BadgeGrid`, `ProfileForm`, `TargetExamPicker`.

## Files to create
The above + tests: `buildProfilePatch.test.ts` (every field rule), `activityStatus.test.ts`, `ProfileScreen.test.tsx` (per-section error isolation), `ProfileForm.test.tsx` (validation, no-change close).

## Files that may be modified
`app/(app)/(tabs)/profile.tsx` (replace the placeholder), `app/(app)/_layout.tsx` (register the edit modal), `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
Auth internals (read `['me']` only; logout stays in More). Catalog internals (reuse the `useExamCatalog` hook for the picker).

## Dependencies
None new.

## Implementation tasks
1. Schemas for the user + analytics DTOs (read the web types; mark all fields optional unless always present).
2. Profile screen: a `ScrollView`/`SectionList` composed of independent sections with pull-to-refresh (refetch all).
3. Stats as a 2-column grid; format study time like the web.
4. Activity: the first page inline + "See all" or infinite in place (decide; record it). A tap on a SUBMITTED/EXPIRED item → result; PAUSED/IN_PROGRESS → the attempt route.
5. Subjects and badges lists.
6. The edit form: a native keyboard-aware form; the phone row read-only; the target exam picker in a bottom sheet with search; save with a pending state; success → back + updated header.
7. Accessibility: stats read as "label, value"; form fields labelled; errors announced.

## Requirements
- **UX:** No full-screen spinner. Skeletons per section; save disabled while saving; Android back from edit with unsaved changes → discard confirmation (new, low risk).
- **API:** Patch semantics identical to the web. Never send the phone.
- **Security:** No PII in logs. The email is validated client-side; the server is authoritative.
- **Performance:** Sections fetch in parallel; activity is paginated.
- **Testing:** As listed.

## Acceptance criteria
All sections show real data; one failing section doesn't block the others; edits persist (verified by a reload and on the web); validation matches the web.

## Manual device checklist
- [ ] Each section: loading, error (simulate), empty.
- [ ] Edit each field; clear the target exam; no-change save closes.
- [ ] The keyboard doesn't cover the focused field; next/done keys.
- [ ] Activity item navigation.
- [ ] TalkBack and large font.

## Risks
R-08 (analytics contract shapes).

## Rollback / isolation
A feature folder + 2 routes. Reverting restores the placeholder tab.

## Completion checklist
- [ ] The activity pagination decision recorded.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A user can view their profile, stats, activity, subjects, and badges, and edit their profile on the physical device, with web-identical update semantics.
