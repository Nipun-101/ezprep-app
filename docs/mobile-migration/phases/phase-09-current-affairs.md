# Phase 09 — Current Affairs

## Objective
The Current Affairs tab (web `/dashboard/current-affairs`): daily cards for a selected date in a swipeable stack, date navigation (no future dates), refresh, a completion state, the "new today" tab badge, and saving or sharing a card image.

## Prerequisites
Phase 02 done (it provides the tab and the badge slot). Independent of 03–08.

## Source documents
`../route-inventory.md` (current affairs), `../api-architecture.md` (K1), `../state-management.md` (seen date), `../mobile-compatibility.md` (pointer events, blob download), `../performance-analysis.md`, `../accessibility-analysis.md`.

## Web reference (read-only)
- Components: `components/current-affairs/CurrentAffairsView.tsx`, `CurrentAffairsSwipeStack.tsx`; badge in `components/dashboard/Sidebar.tsx`.
- Hooks/lib: `hooks/useCurrentAffairsNotification.ts`, `lib/current-affairs-seen.ts` (`toDateKey`, `hasUnseenCurrentAffairsToday`, `markCurrentAffairsSeen`; localStorage `ezp:currentAffairsLastSeenDate`), `lib/api/current-affairs.ts`.
- API: `GET current-affairs?date=YYYY-MM-DD&limit=100&activeOnly` (exact params in `api-architecture.md` K1).

## Verified web behavior to keep
- The date key is the **local** date (`YYYY-MM-DD`). Future dates are blocked.
- Load error: "Could not load current affairs. Please try again."; status text "Loading cards…" / "No updates for this date"; empty: "Nothing here yet"; a Refresh action.
- The stack shows up to **3** cards; a horizontal drag beyond **96 px** dismisses (right overlay "Got it", left "Skip"; **both just dismiss**; nothing is sent to the server); the axis locks after 8 px so vertical scroll inside a card works; a progress bar (read/total).
- Card: an optional image (4:5, contain, dark backdrop) with a **Download image** button; else a gradient header strip; title, description bullet points, an optional "Memory trick" box.
- Completion: "Daily streak secured" / "Headlines handled. You're ahead of the curve." / "That's today's knowledge boost done. Come back tomorrow to keep your edge." (read the file for the remaining actions, e.g. review again).
- Badge: shown when the stored seen-date ≠ today, **regardless of whether there is content** [Verified: purely date-based]. Opening the page marks today as seen.

## Target mobile routes and components
- `app/(app)/(tabs)/current-affairs.tsx`.
- `src/features/current-affairs/`: `api/currentAffairsApi.ts` (+ zod), `hooks/useCurrentAffairs.ts` (`['currentAffairs', dateKey]`), `model/dateKey.ts`, `model/seen.ts` (AsyncStorage `ezp:currentAffairsLastSeenDate`), `stores/CurrentAffairsSeenProvider.tsx` (feeds the tab badge), `components/SwipeStack.tsx` (gesture-handler + reanimated), `CurrentAffairCard.tsx`, `DateBar.tsx` (prev/next day, date picker), `CompletionCard.tsx`, `ProgressBar.tsx`, `SwipeButtons.tsx` (accessible alternatives: "Skip" / "Got it" buttons).
- `src/services/share.ts` (download to cache via `expo-file-system`, then `expo-sharing`; or save to the gallery only if product requires it, which needs a media permission, so avoid it).

## Files to create
The above + tests: `dateKey.test.ts` (timezone, future guard), `seen.test.ts`, `swipeDecision.test.ts` (threshold/axis pure function), `CurrentAffairsScreen.test.tsx`.

## Files that may be modified
`app/(app)/(tabs)/_layout.tsx` (connect the real badge), `src/stores` index, `../MOBILE_STATUS.md`.

## Do-not-touch boundaries
Other tabs, the shell primitives' APIs.

## Dependencies
`expo-file-system`, `expo-sharing` (optional), `@react-native-community/datetimepicker` (optional; a custom calendar sheet is acceptable), `date-fns` (optional).

## Implementation tasks
1. Pure date helpers + seen logic (ported). Mark as seen when the tab gains focus (`useFocusEffect`). Re-evaluate the badge on app foreground and at midnight rollover (AppState active).
2. Query with `staleTime` ~5 min; pull-to-refresh / the Refresh button.
3. SwipeStack on the UI thread (reanimated): pan with an axis lock at 8 px, threshold 96 dp, exit animation ~280 ms, overlays fading with the drag. The top card's content is scrollable vertically.
4. Accessible alternatives: visible Skip / Got it buttons (or a11y actions) so swiping isn't required.
5. Date bar: previous/next day; next is disabled at today; the picker max date = today.
6. Image share: download to the cache with a sanitised filename `current-affair-{date}-{id}.{ext}` → share sheet; errors → a toast.
7. Completion card with a "review again" action (if the web has one) that resets the stack.

## Requirements
- **UX:** Swipes at 60 fps; haptic on dismiss (optional); images use a placeholder and are cached; vertical scroll and horizontal swipe don't conflict.
- **API:** `limit=100` like the web; tolerate missing image/title/points.
- **Security:** Image URLs are HTTPS only; share only the image file (no tokens or URLs with auth).
- **Performance:** Render only 3 cards; prefetch the next card's image.
- **Testing:** As listed. A Maestro swipe flow.

## Acceptance criteria
Cards for today and past dates load; swipe and buttons dismiss; future dates are impossible; the badge appears on a new day and clears on opening the tab; image share works.

## Manual device checklist
- [ ] Swipe left/right, a partial swipe springs back, vertical scroll inside a long card.
- [ ] Date change, today limit, a past date with no cards.
- [ ] The badge: set the device date forward a day (or clear storage) → the badge shows; opening the tab clears it.
- [ ] Share an image to WhatsApp/Files.
- [ ] TalkBack: the buttons replace the swipe; the card content reads in order.
- [ ] Low-end device scroll/swipe smoothness (emulator).

## Risks
R-11 (image sizes), R-18 (gesture perf on low-end devices).

## Rollback / isolation
A feature folder + one tab screen + a badge provider. Reverting restores the placeholder tab and the stub badge.

## Completion checklist
- [ ] Copy matches the web.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A user can read daily current affairs by swiping or with buttons, change dates, share images, and see the new-today badge, verified on the physical device.
