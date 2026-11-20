# Deployment guide (GitHub + Render + Docker)

## 1. Clean repository
- Never commit `.env` files or `node_modules`.
- Commit only `.env.example`.
- Push the monorepo to GitHub (`main` branch).

## 2. PostgreSQL
Create a PostgreSQL database (Render PostgreSQL recommended). Copy the **Internal Database URL**.

## 3. Backend Web Service (Render)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables:
  - `NODE_ENV=production`
  - `DATABASE_URL` = Render internal DB URL
  - `JWT_SECRET` = long random string (≥ 32 characters)
  - `FRONTEND_URL` = your static site URL (https://…)
  - `APP_URL` = same as FRONTEND_URL
  - Optional: `RESEND_API_KEY`, `MAIL_FROM`, `GATEWAY_URL`, `GATEWAY_LIBRARY_PATH`
- After first deploy, open Render Shell and run: `npm run migrate`

### Docker alternative
```bash
docker build -t college-cms-api ./backend
docker run -p 5000:5000 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  -e FRONTEND_URL=... \
  -e NODE_ENV=production \
  college-cms-api
```

## 4. Frontend Static Site (Render)
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api/v1`
- SPA rewrite: source `/*` → destination `/index.html` (Rewrite)

## 5. GitHub Actions
The workflow at `.github/workflows/ci-cd.yml` runs on every push/PR to `main`:
1. Spins up Postgres
2. Migrates the schema
3. Syntax-checks the API and hits `/api/v1/health` + `/docs`
4. Builds the frontend
5. On push to `main`, prints deploy readiness (pair with Render auto-deploy from GitHub)

Keep the Actions tab green.

## 6. Verify
- `GET /api/v1/health` → `{ "status": "ok", "database": "connected" }`
- Swagger UI at `/docs`
- Register → login → `/auth/me` → profile/settings
- Faculty/admin can `POST /api/v1/announcements`
- `GET /api/v1/integrations/library` returns structured offline response when gateway is unset
