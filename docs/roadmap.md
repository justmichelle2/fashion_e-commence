# Roadmap & Next Steps

- Add full designer portfolio UI with horizontal carousels and image lightbox.
- Implement Socket.io chat UI in web and mobile.
- Ship `/api/chat` socket transport:
	- Stand up a Socket.IO namespace (e.g. `/chat`) in `backend/src/index.js`, emit per-order rooms `order:<customOrderId>`.
	- Require auth via JWT (send token in `auth` payload) or expose a short-lived `/api/chat/:orderId/socket-token` for guests; document the handshake for clients.
	- Reuse `ChatMessage` controller logic on `message` events so REST + socket pathways stay in sync.
	- Emit `message` (new chat), `typing`, and optional `presence` events so the front end can swap polling for live updates while falling back to the existing 8s poll when the socket drops.
- Add ID verification integration (Onfido, Jumio) and KYC workflow for designers.
- Implement Stripe Connect if designers are paid directly.
- Add AI style-suggestion microservice and image-generation previews.
- Add localization and multi-language content.
- Add unit and integration tests, CI/CD pipeline, and monitoring.
