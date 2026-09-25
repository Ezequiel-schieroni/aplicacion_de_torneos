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
- `POST /api/tournaments`
- `PATCH /api/tournaments/:id`
- `DELETE /api/tournaments/:id`

En las rutas protegidas se usa temporalmente el header `x-user-id`. La app puede enviar `local-user` durante esta primera etapa.

## Esquema

- `users`: usuarios registrados.
- `tournaments`: torneos, con `owner_id` para validar quien puede editar o eliminar.
- `idx_tournaments_owner_id`: indice para buscar torneos por creador.
