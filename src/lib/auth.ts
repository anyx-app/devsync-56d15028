export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser | null;
  access_token: string;
}

const STORAGE_KEY = 'anyx.auth.session';

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('auth-session-change', { detail: session }));
}

export async function signOut() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('auth-session-change', { detail: null }));
}
