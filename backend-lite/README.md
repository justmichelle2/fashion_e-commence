# Lightweight API

Simple Node.js + Express server with mock data for designers and products.

## Scripts

```powershell
npm install      # install dependencies
npm run dev      # start with nodemon on http://localhost:5000
npm start        # run with node server.js
```

## Routes
-
- `GET /api/designers` → returns mock designer list.
- `GET /api/products?limit=9` → returns up to `limit` mock products (defaults to 9).
- `GET /health` → health check.

Feel free to swap the mock arrays in `server.js` for real data sources.
