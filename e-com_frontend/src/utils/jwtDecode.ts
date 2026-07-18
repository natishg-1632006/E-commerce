/**
 * Decodes a Cognito JWT token payload without verifying the signature.
 * Verification is handled server-side. This is safe for reading claims client-side.
 */
export interface CognitoTokenPayload {
  sub?: string;
  email?: string;
  'cognito:username'?: string;
  'cognito:groups'?: string[];
  'custom:role'?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  token_use?: string;
  [key: string]: unknown;
}

/**
 * Decode a JWT token and return its payload claims.
 * Returns null if the token is malformed or cannot be parsed.
 */
export function decodeJwt(token: string): CognitoTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64URL → Base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as CognitoTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Resolve a user's role from a Cognito ID token.
 *
 * Priority order:
 *  1. `cognito:groups` claim — user's Cognito User Pool group(s)
 *     Checks for: 'admin', 'Admin', 'Admins', 'ADMIN'
 *  2. `custom:role` attribute — custom attribute set in Cognito
 *  3. Falls back to 'user'
 */
export function getRoleFromToken(idToken: string): string {
  const payload = decodeJwt(idToken);
  if (!payload) return 'user';

  // 1. Check cognito:groups first (most reliable)
  const groups = payload['cognito:groups'];
  if (Array.isArray(groups) && groups.length > 0) {
    const adminGroups = ['admin', 'Admin', 'Admins', 'ADMIN', 'administrators'];
    if (groups.some((g) => adminGroups.includes(g))) {
      return 'admin';
    }
  }

  // 2. Check custom:role attribute
  const customRole = payload['custom:role'];
  if (typeof customRole === 'string' && customRole.toLowerCase() === 'admin') {
    return 'admin';
  }

  return 'user';
}

export function getNameFromToken(idToken: string, fallbackEmail?: string): string {
  const payload = decodeJwt(idToken);
  if (!payload) {
    const fallback = fallbackEmail?.split('@')[0] || 'User';
    return fallback.charAt(0).toUpperCase() + fallback.slice(1);
  }

  let rawName = 'User';
  if (payload.name) {
    rawName = payload.name as string;
  } else if (payload.given_name || payload.family_name) {
    rawName = `${payload.given_name || ''} ${payload.family_name || ''}`.trim();
  } else if (payload.email) {
    rawName = (payload.email as string).split('@')[0];
  } else if (payload['cognito:username']) {
    const username = payload['cognito:username'] as string;
    const isUuid = /^[0-9a-fA-F-]{8,36}$/.test(username);
    if (!isUuid) {
      rawName = username;
    } else if (fallbackEmail) {
      rawName = fallbackEmail.split('@')[0];
    }
  } else if (fallbackEmail) {
    rawName = fallbackEmail.split('@')[0];
  }

  // Capitalize only the first character, keep remaining characters unchanged
  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}
