# Asset Analysis

## 1. Local assets (`public/`)

| File | Size | Dimensions | Used by | Mobile treatment |
| --- | --- | --- | --- | --- |
| `ezprep-logo-1.png` | 336 KB | 1380×752 RGBA | Header, Sidebar, LoginModal (with `mix-blend-multiply`), runner header (with `scale-[1.65]` crop hack) | **Needs a new source.** The PNG has heavy whitespace, so web code scales and blends it. For mobile, get a tightly cropped logo (SVG preferred) plus a square mark for icon and splash (`U-23`). Until then, crop and export @1x/@2x/@3x PNGs ≤ 30 KB each |
| `ezprep-banner-image-1.png` | 1.1 MB | 1024×768 | `HeroSection` (marketing only) | Not needed unless a pre-login showcase is built. If used, convert to WebP/AVIF ≤ 150 KB |
| `image.png` | 124 KB | 1224×583 | **Not referenced** in code | Ignore |

There is no favicon, app icon, or splash artwork in the repo (`favicon.ico` appears only in the middleware matcher). **The mobile app icon, adaptive icon (foreground + background), and splash must be created** (`U-23`).

## 2. Icons
- `lucide-react` line icons are used throughout (76 import sites). Keeping the same vocabulary keeps visual continuity: `lucide-react-native` over `react-native-svg`.
- Google "G" mark is an inline SVG (4 paths) in `GoogleSignInButton.tsx` and `GoogleSignInPrompt.tsx`. Recreate it with `react-native-svg`, or use the official asset from the Google sign-in library and follow Google branding guidelines.

## 3. Fonts
- Inter (Latin) via `next/font/google`. Mobile: bundle Inter Regular/Medium/SemiBold/Bold (and ExtraBold if stat numbers keep weight 800) with `expo-font`. Load before hiding the splash.
- Malayalam: system fallback on web. Android has Noto Sans Malayalam, but iOS differs. Validate on device and decide on bundling (`R-10`).

## 4. Remote images

| Source field | Where shown | Size hints in web | Risk |
| --- | --- | --- | --- |
| `ApiExamCategory.imageUrl` | Every exam card in that category (80×80, `object-cover`), and search | `sizes="80px"` but `unoptimized: true`, so the **full original** downloads | **Performance:** the same image repeats per card. Originals may be large (`U-07`) |
| `ApiExamGroupCategory.imageUrl` | Marketing exams section | — | Marketing only |
| `questionText[lang].imageUrl` | Runner, answer key | `max-w-full h-auto` | Unknown dimensions. Must keep aspect ratio. Must be zoomable on small screens (diagrams) |
| `option.imageUrl` (`type: 'image'`) | Runner, answer key | `max-w-full h-auto` | Same |
| `explanation.imageUrl` | Answer key | same | Same |
| `CurrentAffairItem.imageUrl` | Swipe card (Next `Image` fill) + download | — | Possibly large infographics |
| `ApiUserProfile.avatarUrl` | Profile header 64×64 | — | Low |

**[Unknown]** Image hosts, whether they are HTTPS (`U-07`), whether a CDN or resizing service exists, and typical file sizes.

## 5. Mobile requirements
1. Use `expo-image` for all remote images: memory and disk caching, `contentFit`, placeholders, and `recyclingKey` in lists.
2. Always give images explicit dimensions or an aspect ratio. Question images need `onLoad` to read the intrinsic size, then scale to width.
3. Make question and explanation images **tap-to-zoom** (full-screen viewer). This is a mobile improvement for diagrams; confirm with product.
4. Prefetch the next question's images while the user reads the current one (profiling-driven).
5. Category images: request a thumbnail size if the backend or CDN supports it (`U-07`). Otherwise rely on the cache, since the same URL repeats.
6. Release builds must only load HTTPS images. Android blocks cleartext by default, so local dev against `http://` needs a dev-only network config.
