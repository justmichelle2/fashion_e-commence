# Web (Next.js)

This app proxies all `/api/*` requests to the Express backend through Next.js rewrites. For local development, start the backend (port 5000 by default) and then run `npm run dev` from `web/`.

Environment variables:

- `NEXT_PUBLIC_API_URL` — the base URL for the backend (defaults to `http://localhost:5000`).
- `API_URL` — optional fallback for CI when `NEXT_PUBLIC_API_URL` isn’t set.

The `next.config.js` rewrite keeps browser calls on the same origin so SWR hooks like `fetch('/api/products')` “just work” in dev and prod.
