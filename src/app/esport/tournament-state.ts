export type Tournament = {
  game: string;
  name: string;
  description: string;
  colors: string[];
};

const tournaments: Tournament[] = [
  { game: '1. Valorant', name: 'CLUTCH MASTERS', description: 'Un mini descripción here for competitive play.', colors: ['#E44A61', '#7D334A'] },
  { game: '2. League of Legends', name: 'LA GRIETA INVOCADA', description: 'Torneo de eSports 5v5 con premios.', colors: ['#B98B43', '#4F9FB9'] },
  { game: 'Rocket League', name: 'BOOSTED CUP', description: 'Un mini descripción here para equipos.', colors: ['#5D8FDC', '#D7E8FF'] },
  { game: 'FIFA', name: 'CAMPEONATO DIGITAL', description: 'Un mini descripción here de fútbol virtual.', colors: ['#EDEDED', '#78A1D1'] },
  { game: 'CS:GO 2', name: 'FRAG FEST', description: 'Un mini descripción for tactical action.', colors: ['#EFF6FF', '#A3AEBB'] },
  { game: 'Fortnite', name: 'BATALLA CAMPAL', description: 'Un mini descripción here de battle royale.', colors: ['#F2F5FF', '#A878E8'] },
  { game: '7. Call of Duty', name: 'WARZONE CUP', description: 'Un mini descripción here for battle royale action.', colors: ['#8C9B7C', '#E2E7D8'] },
  { game: 'NBA 2K', name: 'HOOP DREAMS', description: 'Un mini descripción here for virtual basketball.', colors: ['#E94F5A', '#E8A83B'] },
  { game: 'Apex Legends', name: 'TORNEO DE LEYENDAS', description: 'Un mini descripción here de battle royale.', colors: ['#E35A5A', '#C1C6D5'] },
];

export function getTournaments() {
  return [...tournaments];
}

export function addTournament(tournament: Tournament) {
  tournaments.push(tournament);
}