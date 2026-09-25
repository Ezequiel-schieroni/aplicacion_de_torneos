# Nexus Tournaments Backend

API inicial para autenticacion y gestion de torneos. Los datos se guardan localmente en `data/data.json` mientras se prepara una base de datos real.

## Ejecutar

```bash
npm install
npm run dev
```

Servidor: `http://localhost:3000`

## Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/tournaments`
- `POST /api/tournaments`
- `PATCH /api/tournaments/:id`
- `DELETE /api/tournaments/:id`

En las rutas protegidas se usa temporalmente el header `x-user-id`. La app puede enviar `local-user` durante esta primera etapa.
