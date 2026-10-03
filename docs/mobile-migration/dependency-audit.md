# Dependency Audit

Source: `package.json` (all packages are in `dependencies`; there is no `devDependencies` section). Import counts come from grepping `app/`, `components/`, `lib/`, `hooks/`, `middleware.ts`.

**Compatibility key:** ✅ works in RN as-is · 🟡 concept reusable, package not · ❌ incompatible / irrelevant · ⚪ unused on web

## 1. React / Next / build

| Package | Purpose | Used? | RN compatibility | Retain concept? | Replacement | Complexity | Expo-native alternative |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `next` 13.5.1 | Framework, routing, ISR, middleware, image, font | Yes | ❌ | Routing → yes | Expo Router | — | Expo Router |
| `react` 18.2 / `react-dom` | UI | Yes | `react` ✅ (the version is set by the Expo SDK); `react-dom` ❌ | Yes | React Native | — | — |
| `typescript` 5.2 | Types | Yes | ✅ | Yes | Version set by the Expo template | Low | — |
| `@types/*` | Types | Yes | Partially | — | Template-provided | Low | — |
| `@next/swc-wasm-nodejs` | Next compiler fallback | Build | ❌ | No | — | — | — |
| `eslint` 8 + `eslint-config-next` | Lint | Yes | 🟡 | Yes | `eslint-config-expo` | Low | Yes |
| `tailwindcss`, `postcss`, `autoprefixer`, `tailwindcss-animate` | Styling | Yes | ❌ | Tokens only | `StyleSheet` + theme tokens (NativeWind is the alternative, not recommended; see package-strategy) | Medium (re-styling) | — |

## 2. UI

| Package | Purpose | Used by feature code? | RN | Replacement | Complexity |
| --- | --- | --- | --- | --- | --- |
| `@radix-ui/react-*` (27 packages) | shadcn primitives | Only via `components/ui/{button,card,badge,select,sheet,input,alert-dialog,popover,label,dialog,calendar,alert,input-otp}` | ❌ (DOM) | RN `Pressable`/`Modal`/bottom sheet primitives | Medium |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Class composition | Yes | ❌ | Variant objects in TS | Low |
| `lucide-react` | Icons (76 imports) | Yes | 🟡 | `lucide-react-native` (needs `react-native-svg`) or `@expo/vector-icons` | Low |
| `sonner`, `@radix-ui/react-toast` | Toasts | ⚪ | — | None needed initially | — |
| `vaul` | Drawer | ⚪ | ❌ | Bottom sheet if needed | — |
| `cmdk` | Command palette | ⚪ | ❌ | — | — |
| `embla-carousel-react` | Carousel | ⚪ | ❌ | `FlatList horizontal` | — |
| `react-resizable-panels` | Resizable layout | ⚪ | ❌ | — | — |
| `recharts` | Charts | ⚪ (only `ui/chart.tsx`) | ❌ | Not needed (no charts in feature UI) | — |
| `react-day-picker` | Calendar | Yes (current affairs) | ❌ | `@react-native-community/datetimepicker` or a custom sheet calendar | Low |
| `input-otp` | OTP slots | Only dead `AuthModal` | ❌ | Native OTP input (`TextInput` with `textContentType="oneTimeCode"` / `autoComplete="sms-otp"`) if EZ Prep renders its own OTP UI | Low |
| `next-themes` | Theme switch | ⚪ | ❌ | `useColorScheme` later | — |

## 3. State / data / forms

| Package | Purpose | Used? | RN | Retain? | Replacement |
| --- | --- | --- | --- | --- | --- |
| `axios` | HTTP | Yes (`lib/api/client.ts`, 2 components for `isAxiosError`) | ✅ | Concept yes | Thin `fetch` wrapper (preferred; see package-strategy) or axios |
| `react-hook-form`, `@hookform/resolvers` | Forms | ⚪ (`ui/form.tsx` only) | ✅ | No | Plain state |
| `zod` | Validation | ⚪ | ✅ | **Yes**: use it to validate API responses (security rule) | `zod` |
| `date-fns` | Date formatting | Yes (current affairs only: `format`, `isToday`) | ✅ | Yes, if needed | `date-fns`, or `Intl` + small helpers (Hermes supports `Intl.DateTimeFormat`) |

## 4. Auth / backend / analytics

| Package | Purpose | Used? | RN | Notes |
| --- | --- | --- | --- | --- |
| `google-auth-library` | Server-side Google auth (Node) | ⚪ **never imported** | ❌ Node-only | Belongs in the backend. Never ship it in a client |
| `@supabase/supabase-js` | Supabase client | ⚪ **never imported** | ✅ technically | Not part of the product. Do not add |
| `@vercel/analytics` | Page analytics | Yes | ❌ | Mobile analytics TBD (`U-16`) |

## 5. Content rendering

| Package | Purpose | Used? | RN | Replacement | Complexity |
| --- | --- | --- | --- | --- | --- |
| `mathpix-markdown-it` | Render Mathpix markdown (LaTeX + HTML) to DOM via MathJax SVG | Yes (runner, answer key; dynamically imported) | ❌ DOM-bound | Phase 05 spike: WebView host for the same library vs native math renderer vs server-rendered output | **High** |

## 6. Categorisation summary

| Category | Packages |
| --- | --- |
| React/Next | next, react, react-dom, @next/swc-wasm-nodejs, eslint-config-next |
| UI | @radix-ui/*, lucide-react, cva, clsx, tailwind-merge, sonner, vaul, cmdk, embla, react-resizable-panels, recharts, react-day-picker, input-otp, next-themes |
| State / data | axios, react-hook-form, @hookform/resolvers, zod, date-fns |
| Auth | (none in client besides fetch); google-auth-library (unused, server) |
| Storage | (browser APIs only) |
| Analytics | @vercel/analytics |
| Build | typescript, tailwindcss, postcss, autoprefixer, tailwindcss-animate, eslint |
| Testing | **none** |
| Browser-only | next, react-dom, @radix-ui/*, mathpix-markdown-it, vaul, cmdk, embla, react-resizable-panels, recharts, react-day-picker, input-otp, next-themes, sonner, @vercel/analytics |
| Node/server-only | google-auth-library, @next/swc-wasm-nodejs |
| Potentially RN-compatible | axios, zod, date-fns, react-hook-form, @supabase/supabase-js |
| Definitely incompatible | Everything DOM/CSS-bound above |

## 7. Observations

- **[Verified]** About half the declared dependencies are never imported by feature code. This comes from the shadcn/bolt scaffold. The mobile app should start from a minimal dependency set.
- **[Verified]** No test or format tooling exists to inherit. The mobile repo sets these up fresh (phase 00).
- The mobile app uses **Yarn** (per the project brief). The web app uses npm. They are separate projects, so there is no conflict.
