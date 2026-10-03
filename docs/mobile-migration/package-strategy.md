# Package Strategy

Conservative by default: Expo first-party → React Native primitives → small focused libraries. Add a package only in the phase that needs it. Versions are **not pinned here**. Use `npx expo install <pkg>` so versions match the Expo SDK chosen in phase 00.

Legend: **Native code?** = contains native modules. **Expo Go?** = works in Expo Go. **Dev build?** = requires a development build.

## 1. Core (phase 00)

| Package | Purpose | Why needed | Alternatives | Native code? | Expo Go? | Dev build? | Maintenance risk | Optional? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `expo` | SDK runtime | Platform | bare RN | yes | ✅ | — | Low | No |
| `expo-router` | File-based navigation, deep links | Mandated | React Navigation directly | yes (via deps) | ✅ | — | Low | No |
| `react-native-screens`, `react-native-safe-area-context` | Router deps, safe areas | Required by router | — | yes | ✅ | — | Low | No |
| `react-native-gesture-handler` | Gestures (sheets, swipe stack) | Router + CA swipe | RN PanResponder | yes | ✅ | — | Low | No |
| `react-native-reanimated` | UI-thread animations | Swipe stack, sheet, trending pill | RN `Animated` | yes | ✅ | — | Low | No |
| `expo-status-bar`, `expo-system-ui`, `expo-splash-screen`, `expo-constants`, `expo-linking` | Shell basics | Standard | — | yes | ✅ | — | Low | No |
| `expo-font` + `@expo-google-fonts/inter` | Inter font | Brand parity | Bundle TTFs manually | yes / no | ✅ | — | Low | No |
| `expo-dev-client` | Development builds | Native modules (Google sign-in, maybe MSG91) and parity with release | Expo Go (insufficient later) | yes | — | yes | Low | No |
| `typescript` | Types | Mandated | — | no | — | — | Low | No |

## 2. Data and storage (phase 00)

| Package | Purpose | Why needed | Alternatives | Native? | Expo Go? | Dev build? | Risk | Optional? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@tanstack/react-query` | Server-state cache, retries, invalidation, refetch on focus | ~20 endpoints with loading/error/retry, cross-screen invalidation after attempts, pull-to-refresh, catalog caching. A hand-rolled cache would be more code and more bugs | SWR; custom hooks | no | ✅ | — | Low | No |
| `zod` | Runtime validation of API responses and env | Security rule "validate untrusted API data". Types inferred from schemas | valibot; manual guards | no | ✅ | — | Low | No |
| `expo-secure-store` | Token storage | Security rule | `react-native-keychain` | yes | ✅ | — | Low | No |
| `@react-native-async-storage/async-storage` | Non-sensitive prefs (CA last-seen date, last language) | Small KV needs | `expo-sqlite/kv-store`, MMKV | yes | ✅ | — | Low | No |
| HTTP: **built-in `fetch`** | Transport | A small wrapper with timeout and error normalisation is enough | `axios` (web parity, extra dependency) | — | — | — | — | — |

## 3. UI (phase 00 / when first needed)

| Package | Purpose | Why | Alternatives | Native? | Expo Go? | Dev build? | Risk | Optional? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `react-native-svg` | Score ring, Google mark, icons | Vector drawing | Images | yes | ✅ | — | Low | No |
| `lucide-react-native` | Icon parity with web (lucide) | Keeps the visual vocabulary | `@expo/vector-icons` (bundled; different icon set) | no (uses svg) | ✅ | — | Low–Med | **Yes** |
| `expo-image` | Remote images with caching | Category, question, CA images | RN `Image` | yes | ✅ | — | Low | No |
| `expo-web-browser` | Legal pages, external links in-app | Legal single source of truth | `Linking.openURL` | yes | ✅ | — | Low | No |
| `@gorhom/bottom-sheet` | Palette sheet, pickers | Smooth, gesture-driven sheets | RN `Modal` with a custom sheet | no (uses reanimated/gesture-handler) | ✅ | — | Medium (major-version churn) | **Yes**: start with `Modal`; adopt only if needed |
| `expo-haptics` | Tap feedback | Polish | none | yes | ✅ | — | Low | **Yes** |

## 4. Feature-specific (add in the named phase only)

| Package | Phase | Purpose | Native? | Expo Go? | Dev build? | Risk | Optional? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `@react-native-google-signin/google-signin` | 01 | Native Google sign-in (Credential Manager) | yes | ❌ | **yes** | Low–Med (free tier vs paid tier; check license terms at adoption time) | Conditional on `U-02` |
| MSG91 React Native SDK (exact package TBD) | 01 | OTP send/verify | unknown | unknown | likely | **Unknown** (`U-01`) | Conditional |
| `react-native-webview` | 05 | Math rendering host (if the spike chooses WebView) | yes | ✅ | — | Low | Conditional on the spike |
| Native math renderer (candidate TBD during spike) | 05 | Math without WebView | varies | varies | varies | Med–High | Conditional |
| `@react-native-community/netinfo` | 06 | Offline messaging in the runner | yes | ✅ | — | Low | **Yes** |
| `@react-native-community/datetimepicker` | 09 | CA date picker | yes | ✅ | — | Low | **Yes** (a custom sheet calendar is fine) |
| `expo-file-system` + `expo-sharing` | 09 | Share/save CA image | yes | ✅ | — | Low | **Yes** |
| `date-fns` | 09 | Date formatting | no | ✅ | — | Low | **Yes** (`Intl` may suffice) |
| Crash reporting (e.g. `@sentry/react-native`) | 10 | Production diagnostics | yes | ❌ | yes | Low | Decision `U-16` |

## 5. Tooling (phase 00, dev dependencies)

| Package | Purpose |
| --- | --- |
| `eslint` + `eslint-config-expo` | Lint |
| `prettier` (+ `eslint-config-prettier`) | Formatting |
| `jest-expo` + `jest` | Unit/component test runner |
| `@testing-library/react-native` | Component tests |
| `msw` *(optional)* or hand-written fetch mocks | API/service tests |
| Maestro (CLI, not an npm dep) | E2E flows on the physical device / emulator |

## 6. Explicitly not recommended (now)

| Package | Reason |
| --- | --- |
| NativeWind / Tailwind for RN | Would let developers copy web class strings, which works against the "redesign, don't transliterate" rule. Adds Babel/Metro config. Theme tokens + `StyleSheet` are enough |
| Redux / Zustand / Jotai | No cross-feature client state that justifies a store (see `state-management.md`) |
| `react-hook-form` | One small form (profile edit) |
| `axios` | `fetch` + wrapper is enough. Revisit only if interceptors grow complex |
| UI kits (React Native Paper, Tamagui, Gluestack) | Large surface and opinionated theming. The design system is small and custom |
| `@shopify/flash-list` | Only if profiling shows FlatList problems |
| `@react-navigation/material-top-tabs` + `react-native-pager-view` | Only if the exam segmented tabs need swipe-between-tabs (phase 04 decision) |
| `google-auth-library`, `@supabase/supabase-js` | Server/unused |
