# Phase 02 — App Shell & Navigation

## Objective
Build the signed-in navigation skeleton: bottom tabs (Home · Current Affairs · Profile · More), the More screen (coming-soon entries, legal links, app version, logout), a reusable coming-soon screen, the current-affairs "new" badge slot, and the shared state primitives used by every later screen.

## Prerequisites
Phase 01 done (guarded `(app)` group). U-08 (which coming-soon entries to list; default: the 4 the web sidebar shows: Courses, Concept Videos, Bookmarks, Subscriptions). U-12 (legal URLs).

## Source documents
`../navigation-map.md`, `../route-inventory.md`, `../responsive-analysis.md` (shell), `../design-system.md`, `../accessibility-analysis.md`, `../mobile-architecture.md` §4.

## Web reference (read-only)
- Routes: `/dashboard` layout, the sidebar coming-soon routes (`/dashboard/{courses,concept-videos,bookmarks,subscriptions}`). The non-sidebar ones (`/dashboard/{search,tests,mentorship,success-stories}`) are dropped; see `route-inventory.md`. Also the legal routes.
- Components: `components/dashboard/DashboardLayout.tsx`, `Sidebar.tsx`, `DashboardHeader.tsx`, `ComingSoon.tsx`, `components/legal/LegalDocument.tsx` (to confirm the URLs only).
- Hooks: `hooks/useCurrentAffairsNotification.ts`, `lib/current-affairs-seen.ts` (badge logic, wired here as a slot; data in 09).
- APIs: none new.

## Target mobile routes and components
- `app/(app)/(tabs)/_layout.tsx` (tabs with lucide icons, labels, a badge on Current Affairs), `index.tsx` (Home placeholder until 03), `current-affairs.tsx` (placeholder until 09), `profile.tsx` (placeholder until 08), `more.tsx`.
- `app/(app)/coming-soon/[feature].tsx` (title + description per feature key; copy from `ComingSoon.tsx` usage).
- `src/components/ui`: `ListItem`, `SectionHeader`, `ConfirmDialog`, `Badge`, `Skeleton`, `InlineAlert`, `OfflineBanner`.
- `src/constants/comingSoon.ts` (feature keys, titles, icons).
- `src/services/linking.ts` (`openLegal(kind)` via `expo-web-browser`).

## Files to create
The files above + tests for `more.tsx` (logout confirm) and `coming-soon/[feature].tsx` (unknown key → not-found state).

## Files that may be modified
`app/(app)/_layout.tsx` (stack screens registration), `app/(app)/(tabs)/index.tsx` (placeholder), `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
Auth internals (use `useAuth().signOut` only). No catalog or attempt data.

## Dependencies
`lucide-react-native` (optional per strategy; otherwise `@expo/vector-icons`), `expo-web-browser`.

## Implementation tasks
1. A tabs layout styled with theme tokens: active teal-600, inactive slate-500, safe-area bottom, labels always visible.
2. The More screen sections: **Explore** (coming-soon features), **Legal** (Terms, Privacy Policy, User Policy), **Account** (Logout with confirmation), footer with the app version/build.
3. The coming-soon screen. Unknown feature key → an `EmptyState` with a back action.
4. Badge slot on the Current Affairs tab, driven by a `useCurrentAffairsBadge()` stub returning `false` (implemented in 09).
5. Shared primitives listed above, each with a11y roles/labels.
6. Android back: on a non-Home tab → Home tab first, then exit (match native expectations; document it).
7. `+not-found` for unknown deep links → "Page not found" + Go Home.

## Requirements
- **UX:** Tab switch under 100 ms; the tab state is preserved; pull-to-refresh is not applicable yet.
- **API:** None.
- **Security:** Legal links open only the allowlisted `https://www.ezprep.in/*` URLs.
- **Performance:** Lazy tabs (`lazy: true`).
- **Testing:** Component tests for More (logout confirm → `signOut` called) and coming-soon routing.

## Acceptance criteria
All four tabs are reachable; coming-soon entries open; legal pages open in the in-app browser; logout works from More; TalkBack announces tabs with their selected state.

## Manual device checklist
- [ ] Tabs, icons, and labels on a small phone and a large phone. Gesture-nav and 3-button nav.
- [ ] Hardware back behavior on each tab.
- [ ] Legal pages load. Back returns to the app.
- [ ] Large font: tab labels don't clip.
- [ ] Logout confirm → sign-in. Back doesn't return into the app.

## Risks
R-12 (porting mock features). Keep them placeholders.

## Rollback / isolation
The shell only. Reverting it returns to the phase 01 placeholder Home.

## Completion checklist
- [ ] U-08 and U-12 decisions recorded.
- [ ] Primitives documented in code (props) and used by More.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A signed-in user can move between the four tabs, open coming-soon and legal pages, and log out, with native back behavior and accessibility verified on the device.
