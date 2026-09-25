export type SessionUser = { id: string; username: string; email: string };

let currentUser: SessionUser | null = null;

export function isAuthenticated() {
  return currentUser !== null;
}

export function setAuthenticated(value: boolean) {
  currentUser = value ? { id: 'local-user', username: 'demo', email: 'demo@nexus.local' } : null;
}

export function setSession(user: SessionUser) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;

}

export function clearSession() {
  currentUser = null;
}