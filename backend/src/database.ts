import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise';

import { hashPassword } from './password.js';

export type User = { id: string; username: string; email: string; passwordHash: string };
export type Tournament = { id: string; game: string; name: string; description: string; colors: string[]; ownerId: string | null };
export type TournamentRow = RowDataPacket & { id: string; game: string; name: string; description: string; colors: string | string[]; owner_id: string | null };

const config = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'nexus_tournaments',
};

export const database: Pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });

export async function initializeDatabase() {
  const bootstrap = await mysql.createConnection({ host: config.host, port: config.port, user: config.user, password: config.password });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();

  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(80) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS tournaments (
      id VARCHAR(36) PRIMARY KEY,
      game VARCHAR(120) NOT NULL,
      name VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      colors JSON NOT NULL,
      owner_id VARCHAR(36) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tournaments_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_tournaments_owner_id (owner_id),
      INDEX idx_tournaments_created_at (created_at)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS tournament_registrations (
      user_id VARCHAR(36) NOT NULL,
      tournament_id VARCHAR(36) NOT NULL,
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, tournament_id),
      CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_registrations_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      INDEX idx_registrations_tournament_id (tournament_id)
    ) ENGINE=InnoDB
  `);

  await database.execute('INSERT IGNORE INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)', ['local-user', 'demo', 'demo@nexus.local', hashPassword('demo')]);
  const [countRows] = await database.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM tournaments');
  if ((countRows[0] as { count: number }).count === 0) {
    const seed = [
      ['default-1', 'Valorant', 'CLUTCH MASTERS', 'Torneo competitivo de Valorant.', JSON.stringify(['#E44A61', '#7D334A'])],
      ['default-2', 'League of Legends', 'LA GRIETA INVOCADA', 'Torneo de eSports 5v5 con premios.', JSON.stringify(['#B98B43', '#4F9FB9'])],
      ['default-3', 'Rocket League', 'BOOSTED CUP', 'Torneo para equipos.', JSON.stringify(['#5D8FDC', '#D7E8FF'])],
    ];
    for (const tournament of seed) {
      await database.execute('INSERT INTO tournaments (id, game, name, description, colors, owner_id) VALUES (?, ?, ?, ?, ?, NULL)', tournament);
    }
  }
}

export function mapTournament(row: TournamentRow): Tournament {
  return { id: row.id, game: row.game, name: row.name, description: row.description, colors: typeof row.colors === 'string' ? JSON.parse(row.colors) as string[] : row.colors, ownerId: row.owner_id };
}
