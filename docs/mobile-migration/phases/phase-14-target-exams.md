# Phase 14 — Multi-target exams

## Objective
Replace the single `targetExam` profile field UX with the web’s **ordered multi-target exams** (max 5): Home “Your target exams” section, exam-hub star toggle, results prompt modal, and profile chips / manage picker. Behavior must match the website; do not invent limits or prompt rules.

## Prerequisites
- Phase 02 (shell / Home) and Phase 08 (profile) done.
- Independent of payments (13/16). Can run in parallel with Phase 15.
- Phase 12 recommended for stable sessions during device testing.

## Source documents
This file; `../engineering-rules.md`; web target-exam sources below.

## Web reference (read-only)
- `lib/target-exams.ts` — `orderCategoriesByTargets`, `findExamInCategories`.
- `lib/hooks/useTargetExams.ts`, `components/providers/TargetExamsProvider.tsx`.
- `components/dashboard/TargetExamsSection.tsx` — Home row + empty prompt + edit.
- `components/target-exams/TargetExamPicker.tsx` — searchable multi-select, reorder, `n/5`.
- `components/target-exams/TargetExamPromptModal.tsx` — results prompt; **only “Not now”** dismisses (Esc/overlay/X do not count).
- `components/exam/ExamLayoutClient.tsx` — star toggle (“Add to my targets” / “In your targets”; full list → “Target list is full”).
- `components/attempt/AttemptResultClient.tsx` — delayed prompt after SUBMITTED/EXPIRED.
- `components/profile/ProfileEditModal.tsx`, `ProfileHeader.tsx` — chips + manage (no single `<select>`).
- `lib/api/users.ts` — `MAX_TARGET_EXAMS = 5`, target-exam API helpers.

## API contract (verified)
All require student Bearer JWT. Prefix `/api/v1`.

| Method | Path | Body / query | Notes |
| --- | --- | --- | --- |
| `PUT` | `/users/me/target-exams` | `{ examIds: string[] }` | Replace ordered list; first = primary; empty clears |
| `POST` | `/users/me/target-exams/:examId` | — | Append; no-op if already present; **409** when already 5 |
| `DELETE` | `/users/me/target-exams/:examId` | — | Remove; new first becomes primary |
| `GET` | `/users/me/target-exams/prompt?examId=` | — | `{ shouldPrompt: boolean }` |
| `POST` | `/users/me/target-exams/:examId/dismiss-prompt` | — | Counts toward dismissal cap |

Server constants (`ez-prep-api` `src/users/target-exams.constants.ts`):
- `MAX_TARGET_EXAMS = 5`
- `MAX_TARGET_EXAM_PROMPT_DISMISSALS = 3`
- `TARGET_EXAM_PROMPT_COOLDOWN_MS = 14 days`

Profile `GET /users/me` returns `targetExams[]` and `targetExam` as primary (`targetExams[0]`). Legacy `PATCH /users/me` with `targetExam` still works but **prefer** the dedicated routes. Mobile profile edit must stop relying on single-select-only UX.

Prompt is false when: already targeted, list full, inactive exam, dismissed within 14 days, or dismissed 3 times (server decides — client only calls the endpoint).

## Mobile targets
- `src/features/profile/` — extend `profileApi` / `useMe`; replace `TargetExamPicker` single-select; profile header chips; edit “Manage target exams”.
- New or extended: `src/features/target-exams/` (or under profile) — provider/hook mirroring web `TargetExamsProvider`, optimistic star mutations with rollback.
- Home: `src/features/catalog/` or shell — `TargetExamsSection` + `orderCategoriesByTargets` on catalog categories.
- Exam hub header: star toggle on `app/(app)/exam/[examId]/` layout.
- Results: prompt after delay on `app/(app)/attempt/[attemptId]/result.tsx` (Phase 07 route).
- Status: `ez-prep-mobile/MOBILE_STATUS.md`.

## Implementation tasks
1. Zod: user profile includes `targetExams: { id, name }[]` and optional primary `targetExam`. Keep `buildProfilePatch` from sending a conflicting single target once multi-manage exists (profile edit uses PUT list / manage sheet).
2. Shared hook/provider: load targets from `['me']`; expose `examIds`, `add`, `remove`, `replace`, `isTarget`, `isFull`; optimistic updates + `setQueryData(['me'])` + rollback on failure (web parity).
3. Home: “Your target exams” row with Edit; dismissible empty “Pick your target exams” when none; skeleton + Retry on error; reorder categories via `orderCategoriesByTargets`.
4. Picker modal: category-grouped searchable multi-select; show `n/5`; reorder up/down; save via `PUT /users/me/target-exams`.
5. Exam hub: star in header; toggle add/remove; when full and not already targeted, show “Target list is full” (no silent failure).
6. Results: after SUBMITTED/EXPIRED, wait ~1.5s, call `GET .../prompt?examId=`; if true, show modal “Preparing for {exam}?” with “Add to my target exams” / “Not now”. Only **Not now** calls dismiss-prompt. Android back / backdrop dismiss must **not** call dismiss-prompt (match web Esc/overlay/X).
7. Profile header: show chips for targets (primary first). Edit screen: remove single exam `<select>`; chips + open manage picker.
8. No new native dependencies.
9. Update `MOBILE_STATUS.md`.

## Do-not-touch boundaries
- Do not change attempt engine scoring.
- Do not implement purchase/locks (Phase 13) or feedback (Phase 15) here.
- Do not invent a sixth target or client-side dismissal counting.

## Dependencies
None new. OTA-safe.

## Requirements
- **UX:** Touch-friendly reorder; 44dp targets; keyboard search in picker.
- **API:** Do not invent endpoints. Prefer dedicated target-exam routes over `PATCH targetExam`.
- **Testing:** Cap, ordering, dismiss rules covered by unit tests.

## Acceptance criteria
- User can set up to 5 ordered targets; primary is first; Home reflects them and reorders categories.
- Star on exam hub add/remove works; full list shows the web copy.
- Results prompt appears only when API says so; Not now dismisses; other closes do not.
- Profile shows chips; edit manages the list without the old single select.
- Changes visible on web for the same account after refresh.
- typecheck / lint / tests pass.

## Tests
- Unit: `orderCategoriesByTargets` (empty targets, stable sort, earlier targets win).
- Unit: full-list guard / draft add when `length === 5`.
- Unit: prompt dismiss helper — only explicit Not now path calls API (if extracted).
- Component: picker shows `n/5` and blocks add when full.
- Component: results prompt — Not now triggers dismiss mutation; requesting close without Not now does not.

## Manual device checklist
- [ ] Home with zero targets: empty prompt; Edit opens picker; save 1–5 exams.
- [ ] Reorder targets; confirm primary (first) drives profile primary display.
- [ ] Categories on Home reorder so categories containing earlier targets rise.
- [ ] Exam hub star add / remove; at 5, adding another shows “Target list is full”.
- [ ] Submit a test for a non-target exam → prompt after delay → Add works; Not now → prompt stops reappearing per server rules (cooldown / cap — spot-check).
- [ ] Close prompt via Android back without Not now → does **not** count as dismissal (re-open result or re-trigger path if feasible).
- [ ] Profile chips + manage from edit.
- [ ] TalkBack: star labelled; picker selection count announced.
- [ ] Record findings in `MOBILE_STATUS.md`.

## Risks
- Optimistic star races — queue mutations like web.
- Old mobile builds still PATCHing single `targetExam` — server keeps primary in sync; new UI must not fight concurrent PATCH.

## Rollback / isolation
Provider + UI. Reverting restores single-target Phase 08 picker (API still accepts both).

## Completion checklist
- [ ] Home, exam star, results prompt, profile chips/picker.
- [ ] Tests + device checklist.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A student can manage up to five ordered target exams on Android with the same rules as the website, including the results prompt dismissal semantics.
