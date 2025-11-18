# Deployment Notes

This document covers high-level steps to deploy the backend and frontend.

Backend (recommended):
- Containerize the backend (Dockerfile exists). Use AWS ECS/Fargate or EKS.
- Use RDS (Postgres) for the database; set `DATABASE_URL` accordingly.
- Store secrets in AWS Secrets Manager or Parameter Store.
- Use S3 for image storage; configure environment variables.
- For realtime chat, use a managed Redis (ElastiCache) if scaling Socket.io.

Web:
- Build Next.js and host on Vercel or as a static build behind CDN.
- Set environment variables for API endpoint and Stripe publishable key.

Mobile:
- Use Expo to build for iOS/Android or eject to bare workflow.
- Configure FCM/APNs credentials for push notifications.

Payment:
- Use Stripe with multi-currency support. Keep secret keys server-side only.

AI features:
- Provide API endpoints that call external AI services (OpenAI, Stability) server-side.
- Keep models and keys secret and rate-limit requests.
