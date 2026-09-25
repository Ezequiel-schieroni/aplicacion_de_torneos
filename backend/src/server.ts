import cors from 'cors';
import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataPath = join(process.cwd(), 'data', 'data.json');

type User = { id: string; email: string; password: string };
type Tournament = { id: string; game: string; name: string; description: string; colors: string[]; ownerId: string | null };
type Database = { users: User[]; tournaments: Tournament[] };

type AuthenticatedRequest = Request & { userId?: string };

function createInitialDatabase(): Database {
  return {
    users: [{ id: 'local-user', email: 'demo@nexus.local', password: 'demo' }],
    tournaments: [
      { id: 'default-1', game: 'Valorant', name: 'CLUTCH MASTERS', description: 'Torneo competitivo de Valorant.', colors: ['#E44A61', '#7D334A'], ownerId: null },
      { id: 'default-2', game: 'League of Legends', name: 'LA GRIETA INVOCADA', description: 'Torneo de eSports 5v5 con premios.', colors: ['#B98B43', '#4F9FB9'], ownerId: null },
      { id: 'default-3', game: 'Rocket League', name: 'BOOSTED CUP', description: 'Torneo para equipos.', colors: ['#5D8FDC', '#D7E8FF'], ownerId: null },
    ],
  };
}

function readDatabase(): Database {
  if (!existsSync(dataPath)) {
    const initial = createInitialDatabase();
    mkdirSync(dirname(dataPath), { recursive: true });
    writeFileSync(dataPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(dataPath, 'utf8')) as Database;
}

function writeDatabase(database: Database) {
  mkdirSync(dirname(dataPath), { recursive: true });
  writeFileSync(dataPath, JSON.stringify(database, null, 2));
}

function requireUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const userId = request.header('x-user-id');
  if (!userId) {
    response.status(401).json({ error: 'Falta el header x-user-id.' });
    return;
  }
  request.userId = userId;
  next();
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body as Partial<User>;
  const database = readDatabase();
  const user = database.users.find((item) => item.email === email && item.password === password);
  if (!user) {
    response.status(401).json({ error: 'Credenciales invalidas.' });
    return;
  }
  response.json({ user: { id: user.id, email: user.email } });
});

app.post('/api/auth/register', (request, response) => {
  const { email, password } = request.body as Partial<User>;
  if (!email || !password) {
    response.status(400).json({ error: 'Email y password son obligatorios.' });
    return;
  }
  const database = readDatabase();
  if (database.users.some((item) => item.email === email)) {
    response.status(409).json({ error: 'El usuario ya existe.' });
    return;
  }
  const user = { id: randomUUID(), email, password };
  database.users.push(user);
  writeDatabase(database);
  response.status(201).json({ user: { id: user.id, email: user.email } });
});

app.get('/api/tournaments', (_request, response) => {
  response.json(readDatabase().tournaments);
});

app.post('/api/tournaments', requireUser, (request: AuthenticatedRequest, response) => {
  const { game, name, description, colors } = request.body as Partial<Tournament>;
  if (!game || !name || !description) {
    response.status(400).json({ error: 'game, name y description son obligatorios.' });
    return;
  }
  const database = readDatabase();
  const tournament: Tournament = { id: randomUUID(), game, name, description, colors: colors ?? ['#22E6D7', '#397A9B'], ownerId: request.userId ?? null };
  database.tournaments.push(tournament);
  writeDatabase(database);
  response.status(201).json(tournament);
});

app.patch('/api/tournaments/:id', requireUser, (request: AuthenticatedRequest, response) => {
  const database = readDatabase();
  const tournament = database.tournaments.find((item) => item.id === request.params.id);
  if (!tournament) {
    response.status(404).json({ error: 'Torneo no encontrado.' });
    return;
  }
  if (tournament.ownerId !== request.userId) {
    response.status(403).json({ error: 'Solo el creador puede editar este torneo.' });
    return;
  }
  const { game, name, description } = request.body as Partial<Tournament>;
  Object.assign(tournament, { game: game ?? tournament.game, name: name ?? tournament.name, description: description ?? tournament.description });
  writeDatabase(database);
  response.json(tournament);
});

app.delete('/api/tournaments/:id', requireUser, (request: AuthenticatedRequest, response) => {
  const database = readDatabase();
  const tournament = database.tournaments.find((item) => item.id === request.params.id);
  if (!tournament) {
    response.status(404).json({ error: 'Torneo no encontrado.' });
    return;
  }
  if (tournament.ownerId !== request.userId) {
    response.status(403).json({ error: 'Solo el creador puede eliminar este torneo.' });
    return;
  }
  database.tournaments = database.tournaments.filter((item) => item.id !== tournament.id);
  writeDatabase(database);
  response.status(204).send();
});

app.use((_error: Error, _request: Request, response: Response, _next: NextFunction) => {
  response.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(port, () => {
  console.log(`Nexus backend running at http://localhost:${port}`);
});
