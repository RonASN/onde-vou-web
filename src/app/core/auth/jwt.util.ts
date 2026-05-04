const TOKEN_KEY = 'auth_token';
const EXPIRES_KEY = 'auth_token_exp';

const NAMEID_URI = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

export function decodeJwtId(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decoded);
    const raw = claims[NAMEID_URI] ?? claims.nameid ?? claims.sub ?? claims.id ?? claims.userId;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveExpiresAt(iso: string): void {
  localStorage.setItem(EXPIRES_KEY, iso);
}

export function getExpiresAt(): string | null {
  return localStorage.getItem(EXPIRES_KEY);
}

export function removeExpiresAt(): void {
  localStorage.removeItem(EXPIRES_KEY);
}

export function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (isNaN(t)) return false;
  return t <= Date.now();
}
