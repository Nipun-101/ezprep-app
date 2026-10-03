# Phase 10 — Release Hardening & Google Play

## Objective
Make the Android app production-ready and publish it: security and privacy review, performance and accessibility passes against the agreed budgets, crash reporting, production build configuration, signing, store listing, Data Safety, account deletion compliance, then the internal → closed → production tracks.

## Prerequisites
Phases 00–09 done (or deliberately scoped out and recorded). Decisions: **U-06** (answers withheld), **U-16** (crash/analytics vendor), **U-23** (brand assets), **U-24** (budgets), **U-32** (account deletion), **U-12** (legal URLs), **U-29** (package name final). A Play Console developer account.

## Source documents
`../security-analysis.md`, `../performance-analysis.md`, `../accessibility-analysis.md`, `../asset-analysis.md`, `../risk-register.md`, `../testing-strategy.md` §5, `../engineering-rules.md` §3.

## Web reference (read-only)
Only `app/privacy-policy`, `app/terms`, `app/user-policy` (for the URLs) and `public/ezprep-logo-1.png` (if no better source is provided). No APIs added.

## Target mobile changes
- `app.config.ts` production values: the final icon/adaptive icon/splash, `versionCode` via EAS auto-increment, `android.permissions` minimal (audit merged manifest permissions, e.g. remove any unneeded `READ_EXTERNAL_STORAGE`/`SYSTEM_ALERT_WINDOW`), `allowBackup` decision (exclude SecureStore data; SecureStore keys don't survive a backup restore anyway), no cleartext.
- Crash reporting integration (U-16) with PII scrubbing and the token-redaction rules.
- An account deletion entry (More → Account → Delete account), per the U-32 outcome (an in-app flow calling the backend, or a link to the web deletion page).
- `eas.json` production profile; EAS Submit config for the Play internal track.

## Files to create
`store/` (listing texts, screenshots, feature graphic), `docs/release-checklist.md` (mobile repo), `docs/data-safety.md` (answers + rationale), crash-reporting setup files.

## Files that may be modified
`app.config.ts`, `eas.json`, `src/services/logger.ts` (crash sink), the More screen (account deletion), assets, `../MOBILE_STATUS.md`. Bug fixes in any feature **only** for release blockers, each recorded.

## Do-not-touch boundaries
No new features. No backend or web changes (the deletion endpoint/page is a backend/web deliverable tracked in U-32).

## Dependencies
The crash-reporting SDK (U-16), `expo-updates` only if OTA updates are adopted (a decision: if yes, configure channels and runtime versions; document the policy that OTA must not change native behavior or bypass store review rules).

## Implementation tasks
1. **Security review** against `engineering-rules.md` §3: grep the bundle for secrets (`EXPO_PUBLIC_*` list), verify there are no tokens in logcat for all flows, a release build has no dev menu, HTTPS only, the WebView settings (phase 05), the merged-manifest permission audit, exported components, the `allowBackup` decision.
2. **Privacy:** the Data Safety form (phone number, name, email, app activity, crash logs), the privacy policy URL, the account deletion web URL, the in-app deletion path.
3. **Performance:** measure the budgets (U-24) in the production build on the physical device + a low-end emulator: cold start, Home scroll, runner question switch, answer key scroll, memory. Fix regressions.
4. **Accessibility pass:** TalkBack through all journeys (J1–J10), largest font, contrast checks on the brand colours (teal-500 text on white may fail AA; use teal-600/700 for text).
5. **Resilience:** airplane-mode and slow-network (throttled) runs of all journeys; token expiry; app kill during an attempt.
6. **Google sign-in production SHA-1** (the Play app signing key) registered; verify on the internal track.
7. Store listing: title, short and full description, screenshots (phone + 7"/10" if tablets are supported), feature graphic, category, contact email, content rating questionnaire, target audience.
8. Internal track → testers → closed track (if required for new personal developer accounts: Play currently requires a closed test with a minimum number of testers for a period before production; verify the current rule) → production staged rollout.
9. Release notes + the versioning policy (semver `version`, auto `versionCode`).

## Requirements
- **UX:** Final icons and splash; no placeholder copy; coming-soon screens are acceptable.
- **API:** The production API URL; no staging remnants.
- **Security:** All items in task 1 pass. U-06 resolved or explicitly risk-accepted by the owner.
- **Performance:** The budgets in `performance-analysis.md` are met or variances accepted.
- **Testing:** Full Maestro suite green on the release build; the Play pre-launch report reviewed.

## Acceptance criteria
A production AAB signed by EAS, uploaded via EAS Submit, passing Play review on the internal and then production track, with crash reporting live and no P0/P1 issues open.

## Manual device checklist
- [ ] A fresh install from the Play internal track: sign in (OTP + Google), every journey J1–J10.
- [ ] An upgrade install over the previous internal build keeps the session.
- [ ] Logcat review: no tokens, OTPs, or PII.
- [ ] TalkBack + largest font complete pass.
- [ ] Airplane / slow 3G pass.
- [ ] Account deletion path works end to end.

## Risks
R-13, R-16, R-18, R-21, R-07.

## Rollback / isolation
Staged rollout (e.g. 10% → 50% → 100%) with halt capability. Keep the previous AAB available. If OTA is adopted, a rollback via republishing the previous update.

## Completion checklist
- [ ] The security, privacy, performance, and a11y reports are attached in `MOBILE_STATUS.md`.
- [ ] The Data Safety form and listing are submitted.
- [ ] The production rollout is started.

## Definition of done
EZ Prep for Android is live on Google Play, meets the security rules, budgets, and accessibility checks, and has crash reporting in place.
