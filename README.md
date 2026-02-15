# LinkVault

We built LinkVault to share text or files with private links that expire.
I kept the flow simple: upload once, copy link, and let cleanup remove old data.

## Setup Instructions

### 1 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 2 Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3 Configure backend env

```bash
cd backend
cp .env.example .env
```

Set these values in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/linkvault
UPLOAD_DIR=uploads
BACKEND_URL=http://localhost:5000
DEFAULT_EXPIRY_MINUTES=10
MAX_FILE_SIZE_MB=10
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
```

### 4 Configure frontend env

```bash
cd ../frontend
cp .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5 Run both apps

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## API Overview

Base URL: `http://localhost:5000/api`

### Auth

- `POST /auth/register` - create account
- `POST /auth/login` - login and receive JWT
- `POST /auth/forgot-password` - create reset token
- `POST /auth/reset-password` - set new password with token
- `GET /auth/me` - current user (`Authorization: Bearer <token>`)

### Content

- `POST /upload` - upload text or a file (auth required)
- `GET /content/recent` - latest 2 items for logged-in user
- `GET /content/history` - full item history for logged-in user
- `GET /content/:id/info` - metadata and password requirement
- `GET /content/:id` - retrieve content (`?password=...` if protected)
- `DELETE /content/:id` - owner deletes content

Upload rules:

- We accept either `textContent` or `file`, not both.
- I support `expiryDateTime` or fallback expiry minutes.
- Optional fields: `password`, `oneTimeView`, `maxViews`.

## Design Decisions

- We used MongoDB + Mongoose because content can be either text or file metadata in one document.
- I used `nanoid(10)` for short, hard-to-guess share IDs.
- We store files on local disk under `uploads/<uniqueId>/` for simple deployment.
- I kept auth JWT-based so the frontend stays stateless.
- We used `optionalAuth` on read routes so owners and public viewers can use the same link.
- I used a cron cleanup job every 5 minutes to remove expired records and files together.
- We track one-time access with `ownerPreviewUsed` and `recipientViewUsed` to avoid ambiguous behavior.

## Assumptions And Limitations

- We assume a single backend instance with local storage.
- I assume MongoDB is reachable before server startup.
- Password-protected content is checked server-side, but `contents.password` is currently stored in plain text.
- Forgot-password does not send real email; in non-production I return the reset token in API response.
- File type filtering is open by default, and there is no malware scan.
- Rate limiting and audit logs are not implemented yet.
- Expiry cleanup runs on a schedule, so deletion is near-real-time, not instant.

Schema reference: `database_schema.md`.