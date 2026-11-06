# Phase 16 — My Subscriptions (read-only) + More cleanup

## Objective
1. Replace the More **My Subscriptions** coming-soon placeholder with a **read-only** screen matching web `/dashboard/subscriptions`: active access (entitlements), order history, and invoices (including PDF share/download).
2. Remove obsolete More coming-soon entries that the web deleted: **Courses**, **Concept Videos**, **My Bookmarks**.

**No purchase UI.** Students buy on the website (Phase 13 policy). This screen only reflects what they already own. Do not add Buy / View plans / checkout.

## Prerequisites
- Phase 02 done.
- Phase 13 recommended first (shared commerce vocabulary / empty states; not a hard code dependency).
- Phase 12 recommended for stable sessions.

## Source documents
This file; web `components/subscriptions/SubscriptionsClient.tsx`; `lib/api/entitlements.ts`, `orders.ts`, `invoices.ts`, `scope-labels.ts`; `lib/commerce-money.ts`.

## Web reference (read-only)
- Route: `/dashboard/subscriptions` → `SubscriptionsClient`.
- Three independent sections with isolated errors (Promise.allSettled pattern).
- Access cards grouped by order; scope labels resolved via exam / exam-group / mock-test lookups (`resolveScopeLabel`).
- Dates: start–expiry, “Lifetime”, “Starts {date}” for future starts.
- Orders: page size 20, “Show more”; status pills; amounts in paise → rupees; GST line via `gstBreakdownLine`.
- Invoices: list + PDF download; “Invoice is being prepared” for paid orders still missing an invoice.
- **No student refund control.**

## API contract (verified)
All require student Bearer JWT unless noted. Prefix `/api/v1`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/me/entitlements?includeInactive=false` | Active entitlements by default |
| `GET` | `/me/orders?page&limit` | Newest first; limit capped (web uses 20) |
| `GET` | `/me/orders/:id` | Optional detail for grouping labels |
| `GET` | `/me/invoices` | Invoice list |
| `GET` | `/me/invoices/:id/pdf` | PDF bytes (`Content-Disposition: attachment`) |

When `COMMERCE_ENABLED` is false on the server, commerce me-routes may return **404** with `details.code === 'COMMERCE_DISABLED'`. Show a calm empty/disabled state (**no** purchase CTA). Catalog `commerceEnabled` is optional context — do not call checkout APIs.

Money: integer **paise**. Port `formatPaiseAsRupees`, `gstBreakdownLine`, `formatDurationPreset` from `lib/commerce-money.ts` into mobile pure helpers (do not invent tax math).

## Mobile targets
- Route: replace coming-soon for subscriptions — e.g. `app/(app)/subscriptions.tsx` (or keep path under More navigation). Register in `app/(app)/_layout.tsx`.
- `src/features/subscriptions/`: APIs + Zod, hooks, section UI, money helpers, scope label resolution (reuse catalog/exam fetch patterns already in the app; do not duplicate heavy transforms).
- `src/constants/comingSoon.ts` — remove courses, concept-videos, bookmarks, subscriptions; delete or narrow the coming-soon route if unused.
- More tab: link **My Subscriptions** to the real screen; drop removed entries.
- PDF: use existing `expo-file-system` + `expo-sharing` (already installed). Authenticated download → cache file → `shareAsync` / open. Do not add a PDF native renderer unless Expo already covers it.
- Status: `ez-prep-mobile/MOBILE_STATUS.md`.

## Do-not-port / do-not-build
- Checkout, billing form, Razorpay, View plans, OfferCallout.
- Admin order/refund UIs.
- Recurring “subscription” billing language that implies auto-renew — web copy is one-time access; prefer “Access” / order terminology consistent with web UI labels on this page.

## Implementation tasks
1. Zod schemas for entitlements, orders (page envelope), invoices.
2. Hooks with independent loading/error/empty per section; pull-to-refresh refetches all.
3. Access section: group/display like web; resolve scope titles (exam name etc.) with existing APIs or batch lookups used by web `resolveScopeLabel` — read that helper and port minimally.
4. Orders: first page + “Show more” / infinite style consistent with other mobile lists (record the choice in `MOBILE_STATUS.md`).
5. Invoices: download/share PDF; pending card when paid order has no invoice yet (web copy).
6. Handle `COMMERCE_DISABLED` and network errors without purchase buttons.
7. More cleanup: remove Courses / Concept Videos / Bookmarks / subscriptions-from-comingSoon; wire Subscriptions to the real route; update any deep-link allowlists if coming-soon keys are referenced.
8. No new native modules. OTA-safe on current runtime.
9. Update `MOBILE_STATUS.md`.

## Requirements
- **UX:** Touch-first lists; no hover; section isolation (one failing section does not blank the others).
- **Security:** PDF download uses Bearer auth; do not log order PII unnecessarily; invoice files in cache only.
- **API:** Do not invent endpoints or client-side price calculation beyond display formatting.

## Acceptance criteria
- More → My Subscriptions shows real entitlements/orders/invoices for an account that purchased on web.
- Empty account: clear empty states, not crashes.
- Commerce disabled / 404 code: non-purchase messaging.
- PDF share works on device (Files / drive / etc.).
- Courses / Concept Videos / Bookmarks gone from More.
- typecheck / lint / tests pass.

## Tests
- Unit: `formatPaiseAsRupees`, `gstBreakdownLine` (CGST+SGST vs IGST), `formatDurationPreset`.
- Unit: access-card grouping helper if extracted.
- Component: section error isolation (mock one rejection).
- Component: More menu no longer lists deleted coming-soon keys; Subscriptions navigates to the real screen.

## Manual device checklist
- [ ] Account with no purchases: three empty/error-safe sections.
- [ ] Account with entitlements after website purchase: access cards show correct titles/dates/Lifetime.
- [ ] Orders list + Show more (if >20).
- [ ] Invoice row → share/open PDF.
- [ ] Paid order without invoice yet → “Invoice is being prepared” (if data available).
- [ ] Airplane mode → per-section errors; pull-to-refresh recovers.
- [ ] More: Subscriptions opens real screen; Courses / Concept Videos / Bookmarks absent; legal / logout / delete account still work.
- [ ] Hardware back from Subscriptions returns to More.
- [ ] Record findings in `MOBILE_STATUS.md`.

## Risks
- Scope label resolution may need extra GETs — cache with React Query; avoid unbounded fan-out.
- PDF binary handling differs from web Blob download — keep auth headers; write to cache directory only.
- `COMMERCE_DISABLED` vs empty entitlements — distinguish via error code when possible.

## Rollback / isolation
Feature folder + More constants. Reverting can restore a subscriptions coming-soon entry only if product asks; prefer keeping the real screen.

## Completion checklist
- [ ] Read-only subscriptions screen + PDF share.
- [ ] More cleanup.
- [ ] Tests + device checklist.
- [ ] `MOBILE_STATUS.md` updated.

## Definition of done
A student can review website-purchased access, orders, and invoices in the Android app without any in-app purchase path, and obsolete coming-soon More entries are gone.
