import { getCurrentUser } from '../auth-state';

export type Tournament = {
  id: string;
  game: string;
  name: string;
  description: string;
  colors: string[];
  ownerId?: string;
};

const tournaments: Tournament[] = [
  { id: 'default-1', game: '1. Valorant', name: 'CLUTCH MASTERS', description: 'Un mini descripción here for competitive play.', colors: ['#E44A61', '#7D334A'] },
  { id: 'default-2', game: '2. League of Legends', name: 'LA GRIETA INVOCADA', description: 'Torneo de eSports 5v5 con premios.', colors: ['#B98B43', '#4F9FB9'] },
  { id: 'default-3', game: 'Rocket League', name: 'BOOSTED CUP', description: 'Un mini descripción here para equipos.', colors: ['#5D8FDC', '#D7E8FF'] },
  { id: 'default-4', game: 'FIFA', name: 'CAMPEONATO DIGITAL', description: 'Un mini descripción here de fútbol virtual.', colors: ['#EDEDED', '#78A1D1'] },
  { id: 'default-5', game: 'CS:GO 2', name: 'FRAG FEST', description: 'Un mini descripción for tactical action.', colors: ['#EFF6FF', '#A3AEBB'] },
  { id: 'default-6', game: 'Fortnite', name: 'BATALLA CAMPAL', description: 'Un mini descripción here de battle royale.', colors: ['#F2F5FF', '#A878E8'] },
  { id: 'default-7', game: '7. Call of Duty', name: 'WARZONE CUP', description: 'Un mini descripción here for battle royale action.', colors: ['#8C9B7C', '#E2E7D8'] },
  { id: 'default-8', game: 'NBA 2K', name: 'HOOP DREAMS', description: 'Un mini descripción here for virtual basketball.', colors: ['#E94F5A', '#E8A83B'] },
  { id: 'default-9', game: 'Apex Legends', name: 'TORNEO DE LEYENDAS', description: 'Un mini descripción here de battle royale.', colors: ['#E35A5A', '#C1C6D5'] },
];

const registeredTournamentIdsByUser: Record<string, string[]> = {};

function getCurrentRegistrations() {
  const userId = getCurrentUser()?.id ?? 'anonymous';
  registeredTournamentIdsByUser[userId] ??= [];
  return registeredTournamentIdsByUser[userId];
}

export function getTournaments() {
  return [...tournaments];
}

export function addTournament(tournament: Tournament) {
  tournaments.push(tournament);
}

export function updateTournament(id: string, changes: Pick<Tournament, 'game' | 'name' | 'description'>) {
  const tournament = tournaments.find((item) => item.id === id);
  if (tournament && tournament.ownerId === getCurrentUser()?.id) {
    Object.assign(tournament, changes);
  }
}

export function removeTournament(id: string) {
  const index = tournaments.findIndex((item) => item.id === id && item.ownerId === getCurrentUser()?.id);
  if (index >= 0) {
    tournaments.splice(index, 1);
  }
}

export function getRegisteredTournamentIds() {
  return [...getCurrentRegistrations()];
}

export function toggleTournamentRegistration(id: string) {
  const registeredTournamentIds = getCurrentRegistrations();
  const index = registeredTournamentIds.indexOf(id);
  if (index >= 0) {
    registeredTournamentIds.splice(index, 1);
    return false;
  }
  registeredTournamentIds.push(id);
  return true;
}