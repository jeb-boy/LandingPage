# College Management System (Landing + Auth)

Monorepo: React (Vite) frontend, Express REST API, PostgreSQL, OpenAPI/Swagger, Docker, and GitHub Actions CI.

## Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: bcrypt password hashes + JWT in HTTP-only cookies
- Roles: `student`, `faculty`, `admin`
- Docs: Swagger UI at `/docs` (from `openapi.yaml`)
- CI: GitHub Actions (test + migrate + health check on every push)
- Deploy target: Render (or any Docker host)

## Quick local start
### Database
```bash
# create DB college_cms, then:
cd backend
cp .env.example .env   # set DATABASE_URL and a real JWT_SECRET (≥32 chars)
npm install
npm run migrate
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Docker Compose (API + Postgres)
```bash
docker compose up --build
# then run migrations once:
docker compose exec api node db/migrate.js
```

## API highlights
- `GET /api/v1/health` — live DB check
- Auth: register, login, logout, me, forgot/reset password
- Users: profile, password change, settings (authenticated)
- Announcements: public list/detail; create/update for faculty+admin; delete for admin
- `GET /api/v1/integrations/library` — cross-module call via gateway with offline handling

## Deployment
See `docs/DEPLOYMENT.md`. Keep secrets out of Git. Actions workflow lives in `.github/workflows/ci-cd.yml`.

## Scope notes
- Password-reset email requires Resend (`RESEND_API_KEY`, `MAIL_FROM`).
- Cross-module integration is wired; set `GATEWAY_URL` when the partner module is available and update `docs/AGREEMENTS_LOG.md`.


## Final-stage validation notes
- API health: `GET /health` and `GET /api/v1/health`.
- Swagger UI: `/docs`.
- Login/register return a JWT and also set the `cms_session` HTTP-only cookie used by the current frontend.
- Run the local stack with `docker compose up --build`; frontend is on port 5173 and API is on port 5000.
- The GitHub Actions workflow runs checks on pushes/PRs to `main`. Render deployment hooks must be added as repository Actions secrets before automatic deployment is enabled.
- The cross-module Library call is not considered complete until a real successful gateway request and an offline test are recorded in `docs/AGREEMENTS_LOG.md`.
- Do not commit `.env` or `node_modules`.
