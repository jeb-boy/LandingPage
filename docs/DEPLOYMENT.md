# Local Testing and Deployment Guide

## 1. Repository Safety

- Commit source code, package lockfiles, Dockerfiles, workflow files, and `.env.example` only.
- Never commit `.env` files, credentials, database dumps, or `node_modules`.
- Use strong, unique production credentials.
- Rotate any credentials or secrets previously exposed.
- Keep production secrets in the hosting provider's environment variables.

## 2. Local Development

Docker is optional. The project can currently be tested using Node.js and PostgreSQL installed locally.

### Backend

1. Open PowerShell in the `backend` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your local `.env` file.
4. Run database migrations:

   ```bash
   npm run migrate
   ```

5. Start the backend:

   ```bash
   npm start
   ```

### Frontend

1. Open another terminal in the `frontend` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

### Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/v1`
- Swagger UI: `http://localhost:5000/docs`
- Health check: `http://localhost:5000/health`
- API health check: `http://localhost:5000/api/v1/health`

Stop the development servers using `Ctrl + C`.

## 3. Planned Production Hosting

Deployment is not performed by this guide. The planned hosting arrangement is:

| Component | Hosting |
|---|---|
| Frontend | Vercel |
| Backend | Render Web Service |
| Database | Render PostgreSQL |

### Backend — Render

Configure a Web Service using the `backend` directory as its root directory.

- Build command: `npm ci`
- Start command: `npm start`
- Configure `NODE_ENV=production`.
- Set `DATABASE_URL` to the Render PostgreSQL connection string.
- Set `JWT_SECRET` to a new random value of at least 32 characters.
- Set `FRONTEND_URL` to the exact deployed Vercel frontend origin.
- Configure `APP_URL` using the deployed frontend URL.
- Configure `GATEWAY_URL` only after the partner group confirms the shared gateway.

Run database migrations before using the production API. Use a Render pre-deploy command if supported by the selected service plan; otherwise, use an appropriate controlled migration procedure.

### Frontend — Vercel

Import the project repository into Vercel and configure:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL`

Set `VITE_API_URL` to the deployed backend API base URL:

```text
https://YOUR-BACKEND-HOST/api/v1
```

The `frontend/vercel.json` file provides the SPA rewrite for React Router routes.

## 4. GitHub Actions

The current workflow runs backend checks, database migrations, API health and Swagger checks, and a frontend production build on pushes and pull requests targeting `main`.

The current deployment job uses Render deploy hooks for both backend and frontend. This does not yet match the planned Vercel frontend hosting.

Before enabling automatic deployment:

- Update the workflow to trigger the Render backend deployment.
- Configure the Vercel deployment process separately.
- Add the required repository secrets only after the deployment configuration is finalized.
- Confirm that both test jobs pass before allowing deployment.

Do not treat a skipped deployment job as proof that a public deployment succeeded.

## 5. Final Verification

Before considering the project production-ready, verify:

- `GET /health` and `GET /api/v1/health` return HTTP 200 with the database connected.
- Swagger UI loads at `/docs` and matches the deployed API.
- Registration and login work correctly.
- The HTTP-only `cms_session` cookie works in the deployed browser environment.
- Protected endpoints require authentication.
- Role-based permissions are enforced.
- Invalid UUIDs and malformed JSON return HTTP 400.
- Missing resources and routes return HTTP 404.
- Cross-module integration has at least one successful request through the actual agreed gateway.
- The offline integration case is tested.
- GitHub Actions completes successfully.
- The deployed frontend and backend work together.

## 6. Current Project Status

Deployment remains pending.

The following items must be completed or verified first:

- Confirm the partner group's shared gateway URL and successful integration.
- Review production authentication, cookie, and security settings.
- Finalize the GitHub Actions deployment workflow for Render and Vercel.
- Verify production environment variables.
- Perform final tests after deployment.
