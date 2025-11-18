# Backend (Express + Sequelize)

Run locally:

1. Start Postgres (docker-compose up -d db) or use local Postgres.
2. Copy `.env.example` to `.env` and fill values.
3. npm install
4. npm run dev

API endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/products
- POST /api/products (designer)
- POST /api/custom-orders (customer)
- POST /api/custom-orders/:id/respond (designer)

Database: Sequelize will sync models automatically in development.

Quick start with Docker Compose (recommended)
1. From the project root start Postgres + Adminer:

```powershell
cd "C:\Users\michelle\Desktop\all folders\fashion e-commence"
docker-compose up -d
```

2. Confirm the DB is running (Adminer UI: http://localhost:8080, login with postgres/postgres)

3. From the `backend` folder copy the example env, install and prepare the DB:

```powershell
cd backend
cp .env.example .env    # or copy manually on Windows
npm install
npm run create-db      # creates the database if missing
npm run seed           # seeds sample users/products
npm run check-env      # verifies connection using node pg client
npm run dev            # start dev server (it will auto-select an available port)
```

### Smoke tests

You can verify the auth stack without manually starting the server by running:

```powershell
npm run smoke:register
npm run smoke:profile           # requires the dev server or API to be running
```

`smoke:register` boots its own disposable server, while `smoke:profile` targets a running instance (default `http://localhost:5000/api`, override by passing the base URL as the first argument, e.g. `node scripts/profileUpdateTest.js http://localhost:3000/api`). The profile check creates a temporary user, exercises `PATCH /api/auth/me`, and cleans up afterward so you can validate the new profile workflow quickly.

Notes:
- The compose file exposes Postgres on localhost:5432 with user/password `postgres`/`postgres` and database `fashiondb` to match the backend defaults.
- If you already run Postgres locally, stop it or change the ports in `docker-compose.yml` or the `DATABASE_URL` in `backend/.env`.
