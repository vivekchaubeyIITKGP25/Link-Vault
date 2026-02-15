# LinkVault – Secure File & Text Sharing

LinkVault is a simple full-stack web app that allows users to share text or files securely using a private, hard-to-guess link.

The main idea behind this project was to create something lightweight and secure — where content is **not publicly searchable**, and automatically disappears after a set time.

This project was built as part of a take-home assignment and focuses on clean architecture, security basics, and usability.

## What It Can Do

* Upload either **plain text** or **one file**
* Generate a unique shareable link
* Content is accessible only via that link
* Auto-expiry (10 minutes by default)
* Optional password protection
* Optional one-time view
* Optional max view limit
* Copy-to-clipboard for shared text
* File download for uploaded files

## Tech Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express
* MongoDB (with Mongoose)
* Multer (for file uploads)
* nanoid (for unique IDs)
* Node-cron (for cleanup jobs)
* Local file storage (`uploads/` directory)

## Prerequisites

Make sure you have:

* Node.js (v18 or higher)
* MongoDB (local installation or MongoDB Atlas)
* Git

## Setup Instructions

### Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### Environment Variables

Backend setup:

```bash
cd backend
cp .env.example .env
```

Then update the `.env` file:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=<your-mongodb-uri>
UPLOAD_DIR=uploads
BACKEND_URL=http://localhost:5000
DEFAULT_EXPIRY_MINUTES=10
MAX_FILE_SIZE_MB=10
FRONTEND_URL=http://localhost:5173
```

Frontend setup:

```bash
cd ../frontend
cp .env.example .env
```

Default frontend config:

```
VITE_API_URL=http://localhost:5000/api
```

### Run the Application

Open two terminals.

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

Now open:

```
http://localhost:5173
```

## API Overview

Base URL:

```
http://localhost:5000/api
```

### Upload Content

```
POST /upload
Content-Type: multipart/form-data
```

Fields:

* `textContent` (optional)
* `file` (optional)
* `expiryDateTime` (optional)
* `password` (optional, minimum 8 characters)
* `oneTimeView` (optional boolean)
* `maxViews` (optional number)

If no expiry is provided, content automatically expires after 10 minutes.

### Get Content Info

```
GET /content/:id/info
```

### Get Content

```
GET /content/:id
Optional query: ?password=yourpassword
```

### Delete Content

```
DELETE /content/:id
```

## Implementation Notes

* IDs are generated using `nanoid` to ensure they are hard to guess.
* Expired content is cleaned periodically using `node-cron`.
* Uploaded files are stored locally in the `uploads/` directory.
* Passwords are validated before granting access.
* There is no public listing of content for privacy reasons.

## Common Issues

* MongoDB connection error → Check your URI and Atlas IP allowlist.
* Port already in use → Change the `PORT` value in backend `.env`.
* File upload fails → Make sure the `uploads/` folder exists and has write permissions.


