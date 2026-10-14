import { apiRequest } from '../../services/api';

export type Tournament = {
  id: string;
  game: string;
  name: string;
  description: string;
  colors: string[];
  ownerId?: string | null;
};

export function getTournaments(): Promise<Tournament[]> {
  return apiRequest('/api/tournaments');
}

export function getRegisteredTournamentIds(): Promise<string[]> {
  return apiRequest('/api/me/registrations');
}

export function createTournament(tournament: Pick<Tournament, 'game' | 'name' | 'description' | 'colors'>): Promise<Tournament> {
  return apiRequest('/api/tournaments', { method: 'POST', body: JSON.stringify(tournament) });
}

export function updateTournament(id: string, changes: Pick<Tournament, 'game' | 'name' | 'description'>): Promise<Tournament> {
  return apiRequest(`/api/tournaments/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(changes) });
}

export function removeTournament(id: string): Promise<void> {
  return apiRequest(`/api/tournaments/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function setTournamentRegistration(id: string, registered: boolean): Promise<void> {
  return apiRequest(`/api/tournaments/${encodeURIComponent(id)}/register`, { method: registered ? 'POST' : 'DELETE' });
}