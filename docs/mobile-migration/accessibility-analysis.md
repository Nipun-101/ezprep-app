# Accessibility and Mobile UX Analysis

## 1. Current web state

| Area | Finding | Evidence |
| --- | --- | --- |
| Labels | 15 `aria-label`s in feature code (close buttons, CA nav, swipe buttons). Many icon-only buttons lack labels: hamburger menu, search clear, palette grid button, exam back arrow on mobile, profile edit close | grep |
| Form labels | `<label>` used in profile edit and complete-profile, but mostly **not associated** (`htmlFor` only in complete-profile) | `ProfileEditModal.tsx` |
| Dialog semantics | Radix dialogs give focus trap and roles. The custom `LoginModal` sets `role="dialog" aria-modal aria-labelledby`. `ProfileEditModal` has no dialog role | |
| Keyboard | Escape closes login and search. Arrow keys in search. No visible focus styles on many custom buttons (`focus:outline-none` on inputs with a ring replacement) | |
| Disabled states | Consistent `disabled:opacity-50/60`, `pointer-events-none` on disabled cards | |
| Form errors | Inline error text/boxes. Not linked to fields (`aria-describedby` absent) | |
| Contrast | Many `text-gray-400` / `text-gray-300` on white (e.g. `text-xs text-gray-300` in the search empty state, `text-gray-400` helper text). **[Inferred]** these fail WCAG AA 4.5:1 for small text | |
| Color-only meaning | Palette status relies on color, partly mitigated by the legend and counts. Answer key uses icons plus color (good) | |
| Touch targets | Mobile runner buttons h-11/h-12 (44–48 px, good). Palette cells h-10 (40 px). Some icon buttons p-1.5 around 16 px icons (~28 px, too small) | |
| Motion | `prefers-reduced-motion` respected for trending only | `globals.css` |
| Language | `<html lang="en">`. Malayalam content not tagged `lang="ml"` | `app/layout.tsx` |
| Viewport | `maximum-scale=5` (zoom allowed) | `app/layout.tsx` |

## 2. Native requirements

| Topic | Requirement |
| --- | --- |
| Screen reader | Every `Pressable` gets `accessibilityRole` and `accessibilityLabel` (icon-only buttons in particular). Options in the runner: `accessibilityRole="radio"`, `accessibilityState={{ checked }}`, label = option text (plain-text fallback of math). Palette cells: "Question 12, answered, marked for review" |
| Status not by color alone | Palette cells add a small glyph (check/flag/dot) or rely on the accessible label. Answer key keeps icons |
| Touch targets | Minimum 48×48 dp on Android (44 pt iOS). Use `hitSlop` for small icons. Palette cells ≥ 44 |
| Font scaling | Support the OS font scale. Cap at about 1.3–1.5× in dense chrome (timer, palette) with `maxFontSizeMultiplier`, but never in question text |
| Contrast | Muted text ≥ gray-500 on white for body sizes. Validate brand teal on white for text (teal-600 for text, teal-500 for fills) |
| Keyboard-aware forms | Sign-in phone/OTP and Profile edit use a keyboard-avoiding scroll container. "Next"/"Done" return keys. Correct `keyboardType` (`phone-pad`, `number-pad`, `email-address`) and `autoComplete` (`tel`, `sms-otp`, `email`, `name`) |
| Safe areas | `react-native-safe-area-context` everywhere. The runner's fixed bottom bar and header must respect insets and Android gesture navigation |
| Android back | Defined per screen: closes sheet/modal → goes back → on the runner opens the "Leave the exam?" dialog → on root tabs exits the app (default). Never silently drops an in-progress attempt |
| Status/navigation bars | `expo-status-bar` style per screen (light content on teal/gradient headers, dark elsewhere). Edge-to-edge on Android with correct inset handling |
| Orientation | Portrait lock app-wide initially (`U-22`). Tablet landscape is a later decision |
| Loading feedback | Every async action shows immediate feedback: button spinner + label ("Starting...", "Saving...", "Verifying your account..."). Skeletons for profile and lists |
| Double taps | Disable buttons while mutations run (web does this for launch, submit, pause, save). Guard `start`, `submit`, `sessions/complete` with an in-flight ref (as `completingRef` does) |
| Confirmation flows | Keep all web confirmations: submit test, next section (irreversible), leave exam. Logout should also confirm on mobile (new, low-risk improvement, needs product OK, `U-25`) |
| Haptics | Optional light haptic on option select / swipe dismiss (`expo-haptics`), off if the system disables it |
| Reduce motion | Check `AccessibilityInfo.isReduceMotionEnabled()` and disable the trending loop and swipe flourish |
| Language tagging | Set `accessibilityLanguage="ml"` (iOS) for Malayalam content where supported |
