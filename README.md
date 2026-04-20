# Insurance Platform

Insurance Platform is a full-stack web application for managing user profiles, policies, claims, amendments, reductions, and role-based administrative operations in an insurance environment.

## Team Members

- Add team member names here

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, optional Keycloak integration
- Infrastructure: Docker Compose, Nginx

## Setup Instructions

### Option 1: Local startup script on Windows

1. Open the project root:
   `insurance-platform`
2. Run:
   ```bat
   start-platform.bat
   ```
3. The script installs missing frontend and backend dependencies, then starts both apps.

### Option 2: Manual local setup

1. Backend setup:
   ```bash
   cd backend-api
   npm install
   ```
2. Frontend setup:
   ```bash
   cd ../frontend-web
   npm install
   ```
3. Configure environment files:
   - `backend-api/.env`
   - `frontend-web/.env.local`
4. Make sure the backend certificate exists at `backend-api/cert/server.pfx`.
5. Start backend:
   ```bash
   cd backend-api
   npm run dev
   ```
6. Start frontend:
   ```bash
   cd frontend-web
   npm run dev
   ```

### Option 3: Docker Compose

1. Open the project root:
   `insurance-platform`
2. Run:
   ```bash
   docker compose up --build
   ```

## Default Local URLs

- Frontend: `http://localhost:3000`
- Backend: `https://localhost:5001`
- Nginx proxy: `https://localhost`
- MongoDB: `mongodb://localhost:27017`

## Implemented Features

- Authentication with protected routes
- Own profile view at `/profile`
- Own profile edit at `/profile/edit`
- Self-service suspension for non-admin users
- Admin user list at `/admin/users`
- Admin user creation at `/admin/users/create`
- Admin user edit at `/admin/users/[id]/edit`
- Admin account status management at `/admin/account-status`
- Admin role assignment and revocation at `/admin/rbac`
- RBAC-based route protection for `/admin/*`
- Validation and API error feedback in profile and admin forms
- Last active admin safety rule to prevent platform lockout

## RBAC Summary

### Allowed for all authenticated users

- View own profile
- Edit own profile

### Allowed for non-admin roles only

- Suspend own account

### Allowed for Admin only

- View all users
- Create users
- Update other users
- Change other users' account status
- Assign or revoke roles
- Reactivate suspended accounts

## API Usage

### Profile APIs

- `GET /profile/me`
- `PUT /profile/me`
- `PUT /profile/me/suspend`

### Admin User APIs

- `GET /admin/users`
- `GET /admin/users/:userId`
- `POST /admin/users`
- `PUT /admin/users/:userId`
- `PUT /admin/users/:userId/status`

### RBAC APIs

- `GET /admin/rbac/roles`
- `PUT /admin/rbac/users/:userId/roles`

## Test Commands

Run the lightweight rule-focused tests from `backend-api`:

```bash
npm run test:profile
npm run test:rbac
```

## Screenshots

- Add screenshots for:
- Login page
- Profile page
- Edit profile page
- Admin users list
- Create user page
- Account status page
- RBAC page

## Notes

- Admin users are blocked from suspending their own account.
- Non-admin users cannot access `/admin/*`.
- The last active Admin account cannot be suspended or stripped of the `ADMIN` role.
