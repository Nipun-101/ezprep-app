# EzPrep

Web app for EzPrep, the government-exam prep product. Students browse exams, take topic-wise practice and full mocks, and review results. It talks to the [EzPrep API](https://github.com/ez-prep-admin/ez-prep-api) (`ez-prep-api`). Do not commit `.env`.

Next.js 13 (App Router), React 18, TypeScript, Tailwind CSS. API calls live in `lib/api` and use `NEXT_PUBLIC_API_URL`.

Production site: `https://www.ezprep.in`. Production API: `https://api.ezprep.in`.

## Setup

The API listens on port `3000`. This app must use another port. Google sign-in and the API CORS list both expect `http://localhost:3001`.

```bash
npm install
cp .env.example .env   # or create .env from the table below
npm run dev -- -p 3001
```

Start the API first (`npm run start:dev` in `ez-prep-api`) and set its `CORS_ORIGINS` to include `http://localhost:3001`.

`next dev` with no port flag binds to `3000` and collides with the API. If `NEXT_PUBLIC_API_URL` is missing, a few sign-in calls fall back to `http://localhost:4000`, which is not this API.

Restart the dev server after changing `.env`. Next inlines `NEXT_PUBLIC_*` when the process starts.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API origin, no path. Local: `http://localhost:3000` |
| `NEXT_PUBLIC_MSG91_WIDGET_ID` | MSG91 OTP widget |
| `NEXT_PUBLIC_MSG91_TOKEN_AUTH` | MSG91 widget token (public, used in the browser) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Web OAuth client. Same value as the API `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | Where Google sends the user back. Local: `http://localhost:3001` |

Leave the Google client id empty to hide Google sign-in and keep phone OTP only.

The redirect URI must match Google Cloud and the API `GOOGLE_REDIRECT_URIS` exactly. Production uses `https://www.ezprep.in/` (trailing slash).

## Sign-in

`middleware.ts` sends visitors without a session from `/dashboard` and `/complete-profile` to `/login`, and sends a signed-in visitor away from `/` and `/login` back to the dashboard.

- Phone OTP via the MSG91 widget, then `POST /api/v1/auth/verify-otp`
- Google, then `POST /api/v1/auth/google`

The JWT is stored in `localStorage` and a cookie. The cookie is what the middleware checks. It expires after 7 days.

## What the app covers

- Home: exam groups from the API (`revalidate` 24 hours)
- Dashboard: exams grouped by category. An exam with `trending: true` shows a flame pill and a soft warm shadow
- Exam page: daily practice and full mocks, then the attempt runner and result
- Current affairs, analytics (`/analytics`), study materials, profile

Courses, concept videos, bookmarks, subscriptions, mentorship, and success stories are routes that show a coming-soon state.

## Scripts

```bash
npm run dev -- -p 3001   # local
npm run build && npm run start
npm run lint
npm run typecheck
```

`npm run start` also needs `-p 3001` when the API is already on `3000`.

## Caching

`/` and `/dashboard` set `revalidate` to `86400`. A production change in exam data, including the trending flag, can take up to 24 hours to show, or until the next deploy.

## Layout

```
app/            routes
components/     UI
lib/api/        API clients
lib/            auth, redirects, attempt helpers
middleware.ts   session gate
public/         logos and images
```
