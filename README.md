# Fashion E-Commerce (Starter)

This repository contains a starter full-stack fashion e-commerce project (web + mobile + backend). It includes core models and API endpoints for a custom-order workflow, designer profiles, and a product catalog. Use this as a scaffold for further development.

## Folder layout

- `backend/` - Node.js + Express API with Sequelize (PostgreSQL)
- `web/` - Next.js web app (React) using Tailwind (starter)
- `mobile/` - Expo (React Native) starter app
- `docs/` - deployment and infra notes

## Running the stack locally

1. **Start the API (port 5000)**

```powershell
Set-Location "c:\Users\michelle\Desktop\potttooo\fashion_e-commence"
npm run backend:dev
```

This proxies to `backend/npm run dev`, which boots Express on `http://localhost:5000` and serves routes such as `/api/products` and `/api/designers` (see `backend/src/app.js`). Use `npm run backend:create-db` and `npm run backend:seed` once to create/seed the Postgres database, or run them manually from the `backend/` folder if you prefer.

2. **Start the web client (port 3000)**

```powershell
Set-Location "c:\Users\michelle\Desktop\potttooo\fashion_e-commence\web"
npm run dev
```

The web app points to the API via `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`). When the backend is running, requests like `/api/designers` and `/api/products` succeed and the UI no longer falls back to mock data.

See each subfolder README for detailed environment setup and additional scripts.
