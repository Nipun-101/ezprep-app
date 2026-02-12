/**
 * Authentication utility functions
 */

/**
 * Helper function to set a cookie
 */
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  const maxAge = days * 24 * 60 * 60; // Convert days to seconds
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Helper function to remove a cookie
 */
function removeCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Set auth token in both localStorage and cookie
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
  setCookie('authToken', token, 7); // Cookie expires in 7 days
}

/**
 * Remove auth token from both localStorage and cookie
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  removeCookie('authToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Make authenticated API request
 */
export async function makeAuthenticatedRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    // Redirect to login if no token
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No authentication token found');
  }

  // Build full URL if endpoint is relative
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized - Token expired');
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Decode JWT token (client-side)
 * Note: This does NOT verify the token - verification should be done server-side
 */
export function decodeToken(token: string): any {
  try {
    // For the simple base64 encoding used in the mock implementation
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  return decoded.exp < Math.floor(Date.now() / 1000);
}

/**
 * Logout user
 */
export function logout(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}
