# Finance Backend

Backend API for financial records, dashboard analytics, and role-based user management.

## Tech Stack

- Node.js + Express
- Prisma ORM
- MySQL
- JWT (HTTP-only cookie auth)
- Swagger UI (`/api-docs`)

## Core Features

- Authentication (register/login) with JWT cookie
- RBAC with roles: `VIEWER`, `ANALYST`, `ADMIN`
- User management (admin-only):
  - list users
  - create user with role/status
  - update role
  - update status
- Financial records CRUD with:
  - filtering by type/category/date range
  - pagination
  - text search (`category`, `notes`)
  - soft delete (`deletedAt`)
- Dashboard summary APIs:
  - total income
  - total expenses
  - net balance
  - category breakdown
  - recent activity
  - trends (last 6 months)
- Rate limiting
- API documentation via Swagger

## RBAC Matrix

- `VIEWER`
  - can access dashboard summary
  - cannot access records CRUD
- `ANALYST`
  - can list/create/update records
  - can access dashboard summary
- `ADMIN`
  - full records access (including soft delete)
  - full user management access
  - dashboard access

## Project Structure

- `controllers/` business logic
- `routes/` API route definitions + Swagger JSDoc
- `middlewares/` auth and logging middleware
- `prisma/` schema and migrations
- `lib/` prisma client, logger, swagger config
- `utils/` operational scripts (bootstrap admin)

## Prerequisites

- Node.js 18+
- MySQL running locally or remotely

## Environment Variables

Create `.env` in project root:

```env
DATABASE_URL="mysql://finance_user:P%40ssw0rd%4023@localhost:3306/finance_backend"
SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000

# Optional for bootstrap script
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=StrongPassword123!
```

## Installation

```bash
npm install
```

## Database Setup

1. Ensure database exists and user has access.
2. Apply migrations.
3. Generate Prisma client.

```bash
npx prisma migrate dev --name init
npx prisma generate
```

If migrations already exist in the repo, you can use:

```bash
npx prisma migrate deploy
```

## Run the App

```bash
nodemon server.js
```

Server: `http://localhost:5000`

Swagger docs: `http://localhost:5000/api-docs`

## Bootstrap First Admin

Use the utility script:

```bash
npm run bootstrap-admin
```

It will:

- promote existing user to `ADMIN` (if found), or
- create a new admin when `BOOTSTRAP_ADMIN_PASSWORD` is provided.

## API Overview

### Auth

- `POST /api/auth/user/register`
- `POST /api/auth/user/login`

### Users (Admin only)

- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`

### Records

- `GET /api/record` (ADMIN, ANALYST)
  - query params:
    - `type` (`INCOME` | `EXPENSE`)
    - `category`
    - `search`
    - `startDate` / `endDate` (inclusive)
    - `page` (default 1)
    - `limit` (default 10, max 100)
- `POST /api/record` (ADMIN, ANALYST)
- `PUT /api/record/:id` (ADMIN, ANALYST)
- `DELETE /api/record/:id` (ADMIN, soft delete)

### Dashboard

- `GET /api/dashboard/summary` (VIEWER, ANALYST, ADMIN)

## Notes on Soft Delete

Records are not physically removed on delete. Instead:

- `deletedAt` is set to current timestamp.
- List and dashboard queries exclude soft-deleted records (`deletedAt = null`).

## Rate Limiting

Global limiter is enabled:

- window: 15 minutes
- max requests: 300 per IP

## Error Handling

- Standard HTTP status codes used across controllers
- Validation responses for common invalid inputs
- Global error handler in `server.js`

## Optional Next Improvements

- Add restore endpoint for soft-deleted records
- Add unit/integration tests
- Add stronger schema validation (e.g., Zod/Joi)
