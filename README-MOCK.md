Auston — Browser-only mock backend (no install)

Overview

This project includes a tiny in-browser mock backend so you can test upload / approve / list flows without installing Node, Mongo, or any server.

What was added

- mock-backend.js — intercepts fetch calls to /api/* and implements a lightweight API backed by localStorage.
- Frontend pages updated to use the mock endpoints: Admin.html, mybooks.html, login.html, register.html, dashboard.html, readbook.html.

Seeded admin

The mock backend seeds an admin account on first run if none exists:
- email: admin@auston.edu.mm
- password: Admin@123
- austonId: AUADMIN

Quick start (no install)

1. Open `login.html` in a modern browser (Chrome, Firefox, Edge, Safari). You can simply double-click the file or use `File > Open`.
2. Login as the seeded admin (credentials above) or register a new user via `register.html`.
3. Upload a book as a student via `mybooks.html` (choose a PDF). Uploaded books by students are saved with status `pending`.
4. Open `Admin.html` and login as admin to see pending uploads, approve or reject them.
5. Approved books will appear in lists (mybooks / dashboard) and can be opened (the PDF is served from the mock backend).

Notes and limitations

- Security: Tokens are simple base64 JSON strings (not secure). This is only for local demo/testing.
- Persistence: Data is stored in localStorage; clearing site data removes all seeded users/books.
- File size limits: localStorage is limited; large PDFs may fail to save. Use small test PDFs.
- Not a production backend: For real deployment you'll need a Node/Mongo backend and file storage.

How to clear demo data

- In the browser DevTools Console, you can clear the demo data with:

```js
localStorage.removeItem('mock_users_v1');
localStorage.removeItem('mock_books_v1');
localStorage.removeItem('mock_token');
```

- Or clear site storage via DevTools > Application > Clear Storage.

How to logout (quick)

- Open DevTools Console and run:

```js
localStorage.removeItem('mock_token');
location.reload();
```

Troubleshooting

- If uploads fail, try a small PDF (under a few MB).
- If you think admin wasn't seeded, run the seeded login credentials above once. If necessary, clear localStorage and refresh.

If you want a real backend next

I can replace the mock backend with a Node/Express + MongoDB implementation and include exact run instructions (this will require installing Node and Mongo locally). I already prepared server-side code earlier; tell me if you want me to add it and I will provide: server files, package.json, and step-by-step run commands.

Enjoy testing — tell me if you want any UI tweaks (logout buttons, banners, or a "Reset demo" button) and I will add them.