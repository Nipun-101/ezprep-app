import { getSafeRedirectPath } from '@/lib/safeRedirect';

const STATE_KEY = 'ezprep.google.oauth.state';
const VERIFIER_KEY = 'ezprep.google.oauth.verifier';
const REDIRECT_KEY = 'ezprep.google.oauth.redirect';
const NEXT_KEY = 'ezprep.google.oauth.next';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Redirect URIs registered in Google Cloud for EzPrep.
 * NEXT_PUBLIC_GOOGLE_REDIRECT_URI overrides these when a droplet uses another host.
 */
const REGISTERED_REDIRECTS: Record<string, string> = {
  'http://localhost:3001': 'http://localhost:3001',
  'https://www.ezprep.in': 'https://www.ezprep.in/',
  'https://ezprep.in': 'https://www.ezprep.in/',
};

export function googleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';
}

export function googleRedirectUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (typeof window === 'undefined') {
    return '';
  }
  return REGISTERED_REDIRECTS[window.location.origin] ?? '';
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(googleClientId() && googleRedirectUri());
}

export async function startGoogleSignIn(nextPath?: string): Promise<void> {
  const clientId = googleClientId();
  const redirectUri = googleRedirectUri();
  if (!clientId || !redirectUri) {
    throw new Error('Google sign-in is not configured');
  }

  const state = randomUrlSafe(32);
  const verifier = randomUrlSafe(64);
  const challenge = await sha256Base64Url(verifier);
  const next =
    nextPath ||
    (typeof window === 'undefined'
      ? '/dashboard'
      : getSafeRedirectPath(
          new URLSearchParams(window.location.search).get('redirect'),
        ));

  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(REDIRECT_KEY, redirectUri);
  sessionStorage.setItem(NEXT_KEY, next);

  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('prompt', 'select_account');
  window.location.assign(url.toString());
}

export interface StoredGoogleReturn {
  code: string;
  state: string;
  redirectUri: string;
  codeVerifier: string;
  nextPath: string;
}

type GoogleSessionResult =
  | {
      ok: true;
      accessToken: string;
      expiresIn?: number;
      nextPath: string;
    }
  | { ok: false; message: string };

let pendingSession: Promise<GoogleSessionResult> | null = null;

/**
 * One exchange per redirect, including React's extra mount in development.
 * The handoff is cleared only after the API accepts the code.
 */
export function completeGoogleSession(): Promise<GoogleSessionResult> {
  if (pendingSession) {
    return pendingSession;
  }

  const parsed = readGoogleReturn();
  if (!parsed.ok) {
    return Promise.resolve(parsed);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  pendingSession = fetch(`${apiUrl}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      code: parsed.value.code,
      redirectUri: parsed.value.redirectUri,
      codeVerifier: parsed.value.codeVerifier,
      client: 'web',
    }),
  })
    .then(async (response) => {
      const body = (await response.json().catch(() => null)) as {
        message?: unknown;
        data?: {
          accessToken?: string;
          expiresIn?: number;
        };
      } | null;

      if (!response.ok || !body?.data?.accessToken) {
        const apiMessage =
          typeof body?.message === 'string' && body.message.trim()
            ? body.message
            : 'Google sign-in could not be completed. Please try again.';
        clearGoogleHandoff();
        return { ok: false as const, message: apiMessage };
      }

      clearGoogleHandoff();
      return {
        ok: true as const,
        accessToken: body.data.accessToken,
        expiresIn: body.data.expiresIn,
        nextPath: getSafeRedirectPath(parsed.value.nextPath),
      };
    })
    .catch(() => {
      clearGoogleHandoff();
      return {
        ok: false as const,
        message: 'Google sign-in could not be completed. Please try again.',
      };
    })
    .finally(() => {
      pendingSession = null;
    });

  return pendingSession;
}

export function readGoogleReturn():
  | { ok: true; value: StoredGoogleReturn }
  | { ok: false; message: string } {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  if (oauthError) {
    clearGoogleHandoff();
    return {
      ok: false,
      message:
        oauthError === 'access_denied'
          ? 'Google sign-in was cancelled.'
          : 'Google sign-in could not be completed.',
    };
  }

  const code = params.get('code')?.trim() || '';
  const state = params.get('state')?.trim() || '';
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const codeVerifier = sessionStorage.getItem(VERIFIER_KEY) || '';
  const redirectUri = sessionStorage.getItem(REDIRECT_KEY) || '';
  const nextPath = sessionStorage.getItem(NEXT_KEY) || '/dashboard';

  if (!code) {
    return { ok: false, message: 'Google did not return a sign-in code.' };
  }
  if (!state || !expectedState || state !== expectedState) {
    clearGoogleHandoff();
    return {
      ok: false,
      message: 'Google sign-in could not be verified. Please try again.',
    };
  }
  if (!codeVerifier || !redirectUri) {
    clearGoogleHandoff();
    return {
      ok: false,
      message: 'Google sign-in expired. Please try again.',
    };
  }

  return {
    ok: true,
    value: { code, state, redirectUri, codeVerifier, nextPath },
  };
}

export function clearGoogleHandoff(): void {
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  sessionStorage.removeItem(NEXT_KEY);
}

function randomUrlSafe(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return base64Url(values);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
