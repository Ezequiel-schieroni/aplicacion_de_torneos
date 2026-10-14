# Nexus Tournaments Backend

API inicial para autenticacion y gestion de torneos usando MySQL de XAMPP/phpMyAdmin.

## Ejecutar

```bash
npm install
npm run dev
```

Servidor: `http://localhost:3000`

## Configurar phpMyAdmin

1. Inicia Apache y MySQL desde XAMPP.
2. Abre phpMyAdmin y ejecuta el archivo `database/schema.sql` en la pestaña SQL.
3. Copia `.env.example` como `.env` y ajusta usuario, password y nombre de base si hace falta.

La base por defecto se llama `nexus_tournaments`. El servidor también crea las tablas y los datos iniciales automáticamente si tiene permisos para hacerlo.

## Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/tournaments`
- `GET /api/me/registrations`
- `POST /api/tournaments/:id/register`
- `DELETE /api/tournaments/:id/register`
- `POST /api/tournaments`
- `PATCH /api/tournaments/:id`
- `DELETE /api/tournaments/:id`
- `GET /api/sports/events`
- `POST /api/sports/events`
- `PATCH /api/sports/events/:id`
- `DELETE /api/sports/events/:id`
- `POST /api/sports/events/:id/register`
- `DELETE /api/sports/events/:id/register`
- `GET /api/sports/courts/registrations`
- `POST /api/sports/courts/:id/register`
- `DELETE /api/sports/courts/:id/register`

En las rutas protegidas se usa temporalmente el header `x-user-id`. La app puede enviar `local-user` durante esta primera etapa.

## Esquema

- `users`: usuarios registrados.
- `esport_tournaments`: torneos de eSports, con `owner_id` para guardar el creador y validar quien puede editar o eliminar.
- `esport_tournament_registrations`: relaciona cada usuario con los torneos de eSports en los que esta inscripto.
- `sports_events`: torneos y partidos deportivos, con `owner_id` para asociarlos a su creador.
- `sports_event_registrations`: inscripciones de usuarios a eventos deportivos.
- `sports_court_registrations`: canchas a las que se anoto cada usuario.
- `idx_esport_tournaments_owner_id`: indice para buscar torneos de eSports por creador.

La app envía las creaciones e inscripciones a esta API; por eso los datos permanecen en MySQL al reiniciar la app. Para configurar la dirección del backend en Expo, define `EXPO_PUBLIC_API_URL` en el `.env` de la raíz. En un teléfono usa la IP local de la computadora en vez de `localhost`.

Al iniciar, el backend migra los datos de las tablas antiguas `tournaments` y `tournament_registrations` a sus nombres `esport_*`, y elimina las tablas antiguas después de copiarlos.
