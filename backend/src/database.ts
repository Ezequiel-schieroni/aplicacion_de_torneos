import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise';

import { hashPassword } from './password.js';

export type User = { id: string; username: string; email: string; passwordHash: string };
export type Tournament = { id: string; game: string; name: string; description: string; colors: string[]; ownerId: string | null };
export type TournamentRow = RowDataPacket & { id: string; game: string; name: string; description: string; colors: string | string[]; owner_id: string | null };
export type SportEvent = { id: string; kind: 'Torneo' | 'Partido'; name: string; sport: string; venue: string; date: string; time: string; format: string; teams: string | null; description: string; ownerId: string | null; isRegistered: boolean };
export type SportEventRow = RowDataPacket & { id: string; kind: 'Torneo' | 'Partido'; name: string; sport: string; venue: string; event_date: string; event_time: string; event_format: string; teams: string | null; description: string; owner_id: string | null; is_registered: number | boolean };

const config = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'nexus_tournaments',
};

export const database: Pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });

async function migrateLegacyTournamentTables() {
  const [rows] = await database.execute<RowDataPacket[]>(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (?, ?)',
    [config.database, 'tournaments', 'tournament_registrations'],
  );
  const legacyTables = new Set(rows.map((row) => String(row.TABLE_NAME)));

  if (legacyTables.has('tournaments')) {
    await database.query(
      'INSERT IGNORE INTO esport_tournaments (id, game, name, description, colors, owner_id, created_at) SELECT id, game, name, description, colors, owner_id, created_at FROM tournaments',
    );
  }
  if (legacyTables.has('tournament_registrations')) {
    await database.query(
      `INSERT IGNORE INTO esport_tournament_registrations (user_id, tournament_id, registered_at)
       SELECT r.user_id, r.tournament_id, r.registered_at
       FROM tournament_registrations r
       INNER JOIN esport_tournaments t ON t.id = r.tournament_id`,
    );
    await database.query('DROP TABLE tournament_registrations');
  }
  if (legacyTables.has('tournaments')) {
    await database.query('DROP TABLE tournaments');
  }
}

export async function initializeDatabase() {
  const bootstrap = await mysql.createConnection({ host: config.host, port: config.port, user: config.user, password: config.password });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();

  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(80) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS esport_tournaments (
      id VARCHAR(36) PRIMARY KEY,
      game VARCHAR(120) NOT NULL,
      name VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      colors JSON NOT NULL,
      owner_id VARCHAR(36) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_esport_tournaments_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_esport_tournaments_owner_id (owner_id),
      INDEX idx_esport_tournaments_created_at (created_at)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS esport_tournament_registrations (
      user_id VARCHAR(36) NOT NULL,
      tournament_id VARCHAR(36) NOT NULL,
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, tournament_id),
      CONSTRAINT fk_esport_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_esport_registrations_tournament FOREIGN KEY (tournament_id) REFERENCES esport_tournaments(id) ON DELETE CASCADE,
      INDEX idx_esport_registrations_tournament_id (tournament_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS sports_events (
      id VARCHAR(36) PRIMARY KEY,
      kind VARCHAR(20) NOT NULL,
      name VARCHAR(180) NOT NULL,
      sport VARCHAR(80) NOT NULL,
      venue VARCHAR(180) NOT NULL,
      event_date VARCHAR(120) NOT NULL,
      event_time VARCHAR(20) NOT NULL,
      event_format VARCHAR(80) NOT NULL,
      teams VARCHAR(255) NULL,
      description TEXT NOT NULL,
      owner_id VARCHAR(36) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_sports_events_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_sports_events_owner_id (owner_id),
      INDEX idx_sports_events_created_at (created_at)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS sports_event_registrations (
      user_id VARCHAR(36) NOT NULL,
      event_id VARCHAR(36) NOT NULL,
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, event_id),
      CONSTRAINT fk_sports_event_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_sports_event_registrations_event FOREIGN KEY (event_id) REFERENCES sports_events(id) ON DELETE CASCADE,
      INDEX idx_sports_event_registrations_event_id (event_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS sports_court_registrations (
      user_id VARCHAR(36) NOT NULL,
      court_id VARCHAR(60) NOT NULL,
      entered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, court_id),
      CONSTRAINT fk_sports_court_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,
  ];

  for (const statement of tableStatements) {
    await database.query(statement);
  }

  await migrateLegacyTournamentTables();
  await database.execute('INSERT IGNORE INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)', ['local-user', 'demo', 'demo@nexus.local', hashPassword('demo')]);
  const [countRows] = await database.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM esport_tournaments');
  if ((countRows[0] as { count: number }).count === 0) {
    const seed = [
      ['default-1', 'Valorant', 'CLUTCH MASTERS', 'Torneo competitivo de Valorant.', JSON.stringify(['#E44A61', '#7D334A'])],
      ['default-2', 'League of Legends', 'LA GRIETA INVOCADA', 'Torneo de eSports 5v5 con premios.', JSON.stringify(['#B98B43', '#4F9FB9'])],
      ['default-3', 'Rocket League', 'BOOSTED CUP', 'Torneo para equipos.', JSON.stringify(['#5D8FDC', '#D7E8FF'])],
    ];
    for (const tournament of seed) {
      await database.execute('INSERT INTO esport_tournaments (id, game, name, description, colors, owner_id) VALUES (?, ?, ?, ?, ?, NULL)', tournament);
    }
  }
}

export function mapTournament(row: TournamentRow): Tournament {
  return { id: row.id, game: row.game, name: row.name, description: row.description, colors: typeof row.colors === 'string' ? JSON.parse(row.colors) as string[] : row.colors, ownerId: row.owner_id };
}

export function mapSportEvent(row: SportEventRow): SportEvent {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    sport: row.sport,
    venue: row.venue,
    date: row.event_date,
    time: row.event_time,
    format: row.event_format,
    teams: row.teams,
    description: row.description,
    ownerId: row.owner_id,
    isRegistered: Boolean(row.is_registered),
  };
}
