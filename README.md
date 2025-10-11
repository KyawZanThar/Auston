# Auston Virtual Library - Backend

This repository provides a Node.js + Express backend for the Auston virtual library. It includes user authentication (JWT), file uploads (PDF), admin approval flow, and book listing/searching via MongoDB.

## Requirements
- Node >= 16 (use nvm recommended)
- MongoDB (local or via Docker)

## Quick start

1. Install Node (nvm recommended):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
```

2. Start MongoDB (Docker):
```bash
docker run -d --rm --name auston-mongo -p 27017:27017 mongo:6.0
```

3. Install dependencies and configure env:
```bash
npm install
cp .env.example .env
# Edit .env to set JWT_SECRET and optional ADMIN_* variables
```

4. Start the server:
```bash
npm start
```

On first startup the server will auto-seed an admin user if none exists. Default admin creds (dev only):
- Email: admin@auston.edu.mm
- Password: Admin@123
(Override by setting ADMIN_EMAIL and ADMIN_PASSWORD in `.env`.)

## API Endpoints

Authentication
- POST /api/user/register
  - body: { username, email, password, austonId }
  - Email domain rules: `@st.auston.edu.mm` => student, `@auston.edu.mm` => teacher, ADMIN_EMAIL => admin
- POST /api/user/login
  - body: { email OR austonId, password }
  - returns: { token, username, email, role }
- GET /api/user/profile (authenticated)

Users (admin)
- GET /api/users (admin-only) - list users

Books
- POST /api/books/upload (authenticated)
  - multipart/form-data: title, author, description, file (PDF)
  - stores file in /uploads and creates Book with status `pending` for students
- GET /api/books?status=pending&q=search&page=1&limit=20 (authenticated)
- PATCH /api/books/approve/:id (admin-only)
- PATCH /api/books/reject/:id (admin-only)
- GET /api/books/admin/all (admin-only) - list all books
- GET /api/books/admin/download/:id (admin-only) - download PDF file

## Testing (UI)
- Start server and MongoDB
- Admin: login at /api/user/login with admin creds; copy token
- In browser console on `Admin.html` set:
```js
localStorage.setItem('token', '<ADMIN_TOKEN>');
```
- Open `Admin.html` and approve any pending books

- Student: register via /api/user/register or UI; login and store token in `mybooks.html` localStorage similarly
- Upload PDF via `mybooks.html` form

## E2E Script
A helper script is available: `tools/e2e_test.js` which will:
- create admin in `users.json` if not present (uses ADMIN_* env or defaults)
- register a student
- login student and upload `tools/sample.pdf`
- login admin and approve the uploaded book

Usage:
```bash
# ensure server is running and Mongo is up
npm install axios form-data
node tools/e2e_test.js Admin@123 Student@123
```

## Security notes
- Change `JWT_SECRET` in `.env` before deploying
- Change default admin password and don't commit secrets
- Validate files and limit sizes (currently PDF-only, 50MB)

## Next steps
- Add pagination metadata response
- Add delete endpoint with RBAC
- Add unit/integration tests

*** End of README ***
