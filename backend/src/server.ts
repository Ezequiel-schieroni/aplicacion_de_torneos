import cors from 'cors';
import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { type RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { database, initializeDatabase, mapSportEvent, mapTournament, type SportEvent, type SportEventRow, type Tournament, type TournamentRow, type User } from './database.js';
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
  const [rows] = await database.execute<TournamentRow[]>('SELECT id, game, name, description, colors, owner_id FROM esport_tournaments WHERE id = ?', [id]);
  return rows[0];
}

async function findSportEvent(id: string, userId: string) {
  const [rows] = await database.execute<SportEventRow[]>(
    `SELECT e.id, e.kind, e.name, e.sport, e.venue, e.event_date, e.event_time, e.event_format, e.teams, e.description, e.owner_id,
      CASE WHEN r.user_id IS NULL THEN 0 ELSE 1 END AS is_registered
     FROM sports_events e
     LEFT JOIN sports_event_registrations r ON r.event_id = e.id AND r.user_id = ?
     WHERE e.id = ?`,
    [userId, id],
  );
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
  const [rows] = await database.query<TournamentRow[]>('SELECT id, game, name, description, colors, owner_id FROM esport_tournaments ORDER BY created_at ASC');
  response.json(rows.map(mapTournament));
});

app.get('/api/me/registrations', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const [rows] = await database.execute<RowDataPacket[]>('SELECT tournament_id FROM esport_tournament_registrations WHERE user_id = ? ORDER BY registered_at ASC', [userId]);
  response.json(rows.map((row) => row.tournament_id));
});

app.post('/api/tournaments/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const tournamentId = String(request.params.id);
  const [tournaments] = await database.execute<RowDataPacket[]>('SELECT id FROM esport_tournaments WHERE id = ?', [tournamentId]);
  if (tournaments.length === 0) {
    response.status(404).json({ error: 'Torneo no encontrado.' });
    return;
  }
  await database.execute('INSERT IGNORE INTO esport_tournament_registrations (user_id, tournament_id) VALUES (?, ?)', [userId, tournamentId]);
  response.status(201).json({ registered: true, tournamentId });
});

app.delete('/api/tournaments/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  await database.execute('DELETE FROM esport_tournament_registrations WHERE user_id = ? AND tournament_id = ?', [userId, String(request.params.id)]);
  response.status(204).send();
});

app.post('/api/tournaments', requireUser, async (request: AuthenticatedRequest, response) => {
  const { game, name, description, colors } = request.body as Partial<Tournament>;
  if (!game || !name || !description) {
    response.status(400).json({ error: 'game, name y description son obligatorios.' });
    return;
  }
  const tournament: Tournament = { id: randomUUID(), game, name, description, colors: colors ?? ['#22E6D7', '#397A9B'], ownerId: request.userId ?? null };
  await database.execute('INSERT INTO esport_tournaments (id, game, name, description, colors, owner_id) VALUES (?, ?, ?, ?, ?, ?)', [tournament.id, tournament.game, tournament.name, tournament.description, JSON.stringify(tournament.colors), tournament.ownerId]);
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
  await database.execute('UPDATE esport_tournaments SET game = ?, name = ?, description = ? WHERE id = ?', [game ?? row.game, name ?? row.name, description ?? row.description, row.id]);
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
  await database.execute('DELETE FROM esport_tournaments WHERE id = ?', [row.id]);
  response.status(204).send();
});

app.get('/api/sports/events', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const [rows] = await database.execute<SportEventRow[]>(
    `SELECT e.id, e.kind, e.name, e.sport, e.venue, e.event_date, e.event_time, e.event_format, e.teams, e.description, e.owner_id,
      CASE WHEN r.user_id IS NULL THEN 0 ELSE 1 END AS is_registered
     FROM sports_events e
     LEFT JOIN sports_event_registrations r ON r.event_id = e.id AND r.user_id = ?
     ORDER BY e.created_at DESC`,
    [userId],
  );
  response.json(rows.map(mapSportEvent));
});

app.post('/api/sports/events', requireUser, async (request: AuthenticatedRequest, response) => {
  const body = request.body as Partial<SportEvent>;
  if ((body.kind !== 'Torneo' && body.kind !== 'Partido') || !body.name || !body.sport || !body.venue || !body.date || !body.time || !body.format || !body.description) {
    response.status(400).json({ error: 'Completa los datos obligatorios del evento.' });
    return;
  }

  const event: SportEvent = {
    id: randomUUID(),
    kind: body.kind,
    name: body.name,
    sport: body.sport,
    venue: body.venue,
    date: body.date,
    time: body.time,
    format: body.format,
    teams: body.teams?.trim() || null,
    description: body.description,
    ownerId: request.userId as string,
    isRegistered: true,
  };
  await database.execute(
    'INSERT INTO sports_events (id, kind, name, sport, venue, event_date, event_time, event_format, teams, description, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [event.id, event.kind, event.name, event.sport, event.venue, event.date, event.time, event.format, event.teams, event.description, event.ownerId],
  );
  await database.execute('INSERT INTO sports_event_registrations (user_id, event_id) VALUES (?, ?)', [event.ownerId, event.id]);
  response.status(201).json(event);
});

app.patch('/api/sports/events/:id', requireUser, async (request: AuthenticatedRequest, response) => {
  const id = String(request.params.id);
  const row = await findSportEvent(id, request.userId as string);
  if (!row) {
    response.status(404).json({ error: 'Evento deportivo no encontrado.' });
    return;
  }
  if (row.owner_id !== request.userId) {
    response.status(403).json({ error: 'Solo quien creó este evento puede editarlo.' });
    return;
  }

  const body = request.body as Partial<SportEvent>;
  const kind = body.kind ?? row.kind;
  if (kind !== 'Torneo' && kind !== 'Partido') {
    response.status(400).json({ error: 'El tipo de evento no es válido.' });
    return;
  }
  await database.execute(
    'UPDATE sports_events SET kind = ?, name = ?, sport = ?, venue = ?, event_date = ?, event_time = ?, event_format = ?, teams = ?, description = ? WHERE id = ?',
    [kind, body.name ?? row.name, body.sport ?? row.sport, body.venue ?? row.venue, body.date ?? row.event_date, body.time ?? row.event_time, body.format ?? row.event_format, body.teams === undefined ? row.teams : body.teams, body.description ?? row.description, id],
  );
  response.json(mapSportEvent((await findSportEvent(id, request.userId as string)) as SportEventRow));
});

app.delete('/api/sports/events/:id', requireUser, async (request: AuthenticatedRequest, response) => {
  const [rows] = await database.execute<RowDataPacket[]>('SELECT owner_id FROM sports_events WHERE id = ?', [String(request.params.id)]);
  if (rows.length === 0) {
    response.status(404).json({ error: 'Evento deportivo no encontrado.' });
    return;
  }
  if ((rows[0] as { owner_id: string | null }).owner_id !== request.userId) {
    response.status(403).json({ error: 'Solo quien creó este evento puede eliminarlo.' });
    return;
  }
  await database.execute('DELETE FROM sports_events WHERE id = ?', [String(request.params.id)]);
  response.status(204).send();
});

app.post('/api/sports/events/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const eventId = String(request.params.id);
  const [events] = await database.execute<RowDataPacket[]>('SELECT id FROM sports_events WHERE id = ?', [eventId]);
  if (events.length === 0) {
    response.status(404).json({ error: 'Evento deportivo no encontrado.' });
    return;
  }
  await database.execute('INSERT IGNORE INTO sports_event_registrations (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
  response.status(201).json({ registered: true, eventId });
});

app.delete('/api/sports/events/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  await database.execute('DELETE FROM sports_event_registrations WHERE user_id = ? AND event_id = ?', [userId, String(request.params.id)]);
  response.status(204).send();
});

app.get('/api/sports/courts/registrations', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const [rows] = await database.execute<RowDataPacket[]>('SELECT court_id FROM sports_court_registrations WHERE user_id = ? ORDER BY entered_at ASC', [userId]);
  response.json(rows.map((row) => row.court_id));
});

app.post('/api/sports/courts/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  const courtId = String(request.params.id);
  if (!/^[a-z0-9-]{1,60}$/i.test(courtId)) {
    response.status(400).json({ error: 'La cancha no es válida.' });
    return;
  }
  await database.execute('INSERT IGNORE INTO sports_court_registrations (user_id, court_id) VALUES (?, ?)', [userId, courtId]);
  response.status(201).json({ registered: true, courtId });
});

app.delete('/api/sports/courts/:id/register', requireUser, async (request: AuthenticatedRequest, response) => {
  const userId = request.userId as string;
  await database.execute('DELETE FROM sports_court_registrations WHERE user_id = ? AND court_id = ?', [userId, String(request.params.id)]);
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
