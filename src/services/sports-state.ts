import { apiRequest } from './api';

export type SportEventKind = 'Torneo' | 'Partido';

export type SportEvent = {
  id: string;
  kind: SportEventKind;
  name: string;
  sport: string;
  venue: string;
  date: string;
  time: string;
  format: string;
  teams: string | null;
  description: string;
  ownerId: string | null;
  isRegistered: boolean;
};

export type SportEventInput = Pick<SportEvent, 'kind' | 'name' | 'sport' | 'venue' | 'date' | 'time' | 'format' | 'teams' | 'description'>;

export function getSportEvents(): Promise<SportEvent[]> {
  return apiRequest('/api/sports/events');
}

export function createSportEvent(event: SportEventInput): Promise<SportEvent> {
  return apiRequest('/api/sports/events', { method: 'POST', body: JSON.stringify(event) });
}

export function updateSportEvent(id: string, event: SportEventInput): Promise<SportEvent> {
  return apiRequest(`/api/sports/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(event) });
}

export function deleteSportEvent(id: string): Promise<void> {
  return apiRequest(`/api/sports/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function setSportEventRegistration(id: string, registered: boolean): Promise<void> {
  return apiRequest(`/api/sports/events/${encodeURIComponent(id)}/register`, { method: registered ? 'POST' : 'DELETE' });
}

export function getRegisteredCourtIds(): Promise<string[]> {
  return apiRequest('/api/sports/courts/registrations');
}

export function setCourtRegistration(id: string, registered: boolean): Promise<void> {
  return apiRequest(`/api/sports/courts/${encodeURIComponent(id)}/register`, { method: registered ? 'POST' : 'DELETE' });
}