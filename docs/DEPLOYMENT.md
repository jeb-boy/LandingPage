# Local testing and deployment guide

## 1. Repository safety
- Commit source code, lockfiles, Dockerfiles, workflow files, and `.env.example` only.
- Never commit `.env`, credentials, `node_modules`, or database dumps.
- Rotate any real credential that was ever committed or shared.

## 2. Local run (recommended before deployment)
1. Install Docker Desktop and start it.
2. From the repository root run `docker compose up --build`.
3. Open the frontend at `http://localhost:5173`.
4. Open Swagger UI at `http://localhost:5000/docs`.
5. Check `http://localhost:5000/health` and `http://localhost:5000/api/v1/health`.
6. Stop with `docker compose down`. Use `docker compose down -v` only if you intend to delete the local database volume.

## 3. Render services (deployment is not performed by this guide)
Create a PostgreSQL database, a backend Web Service, and a frontend Static Site.

Backend Web Service: root directory `backend`; build command `npm ci`; start command `npm start`; pre-deploy command `npm run migrate` if the plan supports it. Set `NODE_ENV=production`, `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and `FRONTEND_URL` to the exact deployed frontend origin. Configure `GATEWAY_URL` only after the partner group confirms the shared gateway.

Frontend Static Site: root directory `frontend`; build command `npm ci && npm run build`; publish directory `dist`; set `VITE_API_URL` to `https://YOUR-BACKEND-HOST/api/v1`. Add the SPA rewrite `/*` to `/index.html`.

## 4. GitHub Actions deployment hooks
The workflow runs backend checks, PostgreSQL migrations, API health/Swagger checks, and a frontend production build on pushes and pull requests to `main`. To enable automatic Render deploys after both test jobs pass, add these repository Actions secrets:
- `RENDER_BACKEND_DEPLOY_HOOK` — backend service deploy hook URL.
- `RENDER_FRONTEND_DEPLOY_HOOK` — frontend service deploy hook URL.

Without both secrets, the deployment job explicitly reports that deployment was skipped. No public deployment is made automatically until these hooks are configured.

## 5. Final verification
- `GET /health` and `GET /api/v1/health` return HTTP 200 with database connected.
- Swagger UI loads at `/docs` and matches the live API.
- Register/login return a JWT and set the HTTP-only `cms_session` cookie.
- `/api/v1/auth/me` and `/api/v1/users/*` require authentication.
- Only faculty/admin can create or edit announcements; only admin can delete.
- Invalid UUIDs and malformed JSON return 400; missing resources/routes return 404.
- Cross-module integration has one successful call through the actual agreed gateway and a tested offline case.
- GitHub Actions is green and the deployed site is kept online until grades are released.
