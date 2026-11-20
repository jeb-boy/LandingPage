# College Management System API

## Requirements
- Node.js 20+
- PostgreSQL 14+

## Local setup
1. Create a PostgreSQL database named `college_cms`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, a random `JWT_SECRET` (32+ characters), and `FRONTEND_URL`.
3. Run `npm install`.
4. Run `npm run migrate` to create the schema.
5. Run `npm run dev`.
6. Check `http://localhost:5000/api/v1/health` and `http://localhost:5000/docs`.

## Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/forgot-password` (requires Resend configuration)
- `POST /api/v1/auth/reset-password`

Authenticated profile and preferences:
- `GET/PATCH /api/v1/users/profile`
- `GET/PUT /api/v1/users/settings`

Passwords are hashed with bcrypt. Sessions use an HTTP-only cookie. Never commit `.env` or production secrets.
