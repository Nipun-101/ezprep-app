/** Shared cookie names for auth (Edge-safe: no client APIs). */

/** Legacy JWT-in-cookie name. Still accepted by middleware during migration. */
export const AUTH_TOKEN_COOKIE = 'authToken';

/** Non-JWT presence marker for Edge middleware (preferred). */
export const AUTH_SESSION_COOKIE = 'authSession';

export const LOGOUT_RESUME_PATH_COOKIE = 'logoutResumePath';
