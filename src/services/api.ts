import { getCurrentUser } from '../app/auth-state';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = getCurrentUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (user) {
    headers['x-user-id'] = user.id;
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? 'No se pudo completar la solicitud.');
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}