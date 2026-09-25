import cors from 'cors';
import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { type RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { database, initializeDatabase, mapTournament, type Tournament, type TournamentRow, type User } from './database.js';
import { hashPassword, verifyPassword } from './password.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);
type AuthenticatedRequest = Request & { userId?: string };

async function requireUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const userId = request.header('x-user-id');
  if (!userId) {
    response.status(401).json({ error: 'Falta el header x-user-id.' });
    return;
  }
  const [users] = await database.execute<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    response.status(401).json({ error: 'Usuario no valido.' });
    return;
  }
  request.userId = userId;
  next();
}

async function findTournament(id: string) {
  const [rows] = await database.execute<TournamentRow[]>('SELECT id, game, name, description, colors, owner_id FROM tournaments WHERE id = ?', [id]);
  return rows[0];
}

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_request, response) => {
  await database.query('SELECT 1');
  response.json({ status: 'ok', database: 'mysql' });
});

app.post('/api/auth/login', async (request, response) => {
  const { identifier, password } = request.body as { identifier?: string; password?: string };
  if (!identifier || !password) {
    response.status(400).json({ error: 'Usuario/email y contraseña son obligatorios.' });
    return;
  }
  const [rows] = await database.execute<RowDataPacket[]>('SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1', [identifier, identifier]);
  const user = rows[0] as Pick<User, 'id' | 'username' | 'email' | 'passwordHash'> & { password_hash: string } | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    response.status(401).json({ error: 'Credenciales invalidas.' });
    return;
  }
  response.json({ user: { id: user.id, username: user.username, email: user.email } });
});

app.post('/api/auth/register', async (request, response) => {
  const { username, email, password } = request.body as { username?: string; email?: string; password?: string };
  if (!username || !email || !password) {
    response.status(400).json({ error: 'Nombre de usuario, email y contraseña son obligatorios.' });
    return;
  }
  const [existingRows] = await database.execute<RowDataPacket[]>('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
  if (existingRows.length > 0) {
    response.status(409).json({ error: 'El usuario ya existe.' });
    return;
  }
  const user = { id: randomUUID(), username, email, passwordHash: hashPassword(password) };
  await database.execute('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)', [user.id, user.username, user.email, user.passwordHash]);
  response.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
});

app.get('/api/tournaments', async (_request, response) => {
  const [rows] = await database.query<TournamentRow[]>('SELECT id, game, name, description, colors, owner_id FROM tournaments ORDER BY created_at ASC');
  response.json(rows.map(mapTournament));
});

app.get('/api/me/registrations', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const [rows] = await database.execute<RowDataPacket[]>('SELECT tournament_id FROM tournament_registrations WHERE user_id = ? ORDER BY registered_at ASC', [userId]);
  response.json(rows.map((row) => row.tournament_id));
});

app.post('/api/tournaments/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const tournamentId = String(request.params.id);
  const [tournaments] = await database.execute<RowDataPacket[]>('SELECT id FROM tournaments WHERE id = ?', [tournamentId]);
  if (tournaments.length === 0) {
    response.status(404).json({ error: 'Torneo no encontrado.' });
    return;
  }
  await database.execute('INSERT IGNORE INTO tournament_registrations (user_id, tournament_id) VALUES (?, ?)', [userId, tournamentId]);
  response.status(201).json({ registered: true, tournamentId });
});

app.delete('/api/tournaments/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  await database.execute('DELETE FROM tournament_registrations WHERE user_id = ? AND tournament_id = ?', [userId, String(request.params.id)]);
  response.status(204).send();
});

app.post('/api/tournaments', requireUser, async (request: AuthenticatedRequest, response) => {
  const { game, name, description, colors } = request.body as Partial<Tournament>;
  if (!game || !name || !description) {
    response.status(400).json({ error: 'game, name y description son obligatorios.' });
    return;
  }
  const tournament: Tournament = { id: randomUUID(), game, name, description, colors: colors ?? ['#22E6D7', '#397A9B'], ownerId: request.userId ?? null };
  await database.execute('INSERT INTO tournaments (id, game, name, description, colors, owner_id) VALUES (?, ?, ?, ?, ?, ?)', [tournament.id, tournament.game, tournament.name, tournament.description, JSON.stringify(tournament.colors), tournament.ownerId]);
  response.status(201).json(tournament);
});

app.patch('/api/tournaments/:id', requireUser, async (request: AuthenticatedRequest, response) => {
  const row = await findTournament(String(request.params.id));
  if (!row) {
    response.status(404).json({ error: 'Torneo no encontrado.' });
    return;
  }
  if (row.owner_id !== request.userId) {
    response.status(403).json({ error: 'Solo el creador puede editar este torneo.' });
    return;
  }
  const { game, name, description } = request.body as Partial<Tournament>;
  await database.execute('UPDATE tournaments SET game = ?, name = ?, description = ? WHERE id = ?', [game ?? row.game, name ?? row.name, description ?? row.description, row.id]);
  response.json(mapTournament((await findTournament(row.id)) as TournamentRow));
});

app.delete('/api/tournaments/:id', requireUser, async (request: AuthenticatedRequest, response) => {
  const row = await findTournament(String(request.params.id));
  if (!row) {
    response.status(404).json({ error: 'Torneo no encontrado.' });
    return;
  }
  if (row.owner_id !== request.userId) {
    response.status(403).json({ error: 'Solo el creador puede eliminar este torneo.' });
    return;
  }
  await database.execute('DELETE FROM tournaments WHERE id = ?', [row.id]);
  response.status(204).send();
});

app.use((_error: Error, _request: Request, response: Response, _next: NextFunction) => {
  response.status(500).json({ error: 'Error interno del servidor.' });
});

initializeDatabase()
  .then(() => app.listen(port, () => console.log(`Nexus backend running at http://localhost:${port}`)))
  .catch((error: unknown) => {
    console.error('No se pudo conectar a MySQL:', error);
    process.exitCode = 1;
  });
