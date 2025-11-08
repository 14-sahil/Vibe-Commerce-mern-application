# Vibe Commerce — Full‑stack Shopping Cart (Detailed)

This is a detailed, beginner‑friendly guide for the Vibe Commerce demo app. It repeats and expands on the short README included in the project and walks you through running the project locally, inspecting the data, and troubleshooting common issues.

## Overview

Vibe Commerce is a minimal shopping cart example built to illustrate typical full‑stack patterns:

- Frontend: React + Vite (single page app with routes)
- Backend: Node.js + Express (REST API)
- Database: MongoDB (Mongoose ORM)

Core flows included:

- Browse products
- Add and remove items from a cart
- Update quantities
- Mock checkout that creates a persisted receipt

## Why this is useful

- It demonstrates how frontend and backend talk over a REST API.
- Shows basic CRUD interactions with a database.
- Easy to extend and good for interviews, exercises, and demos.

---

## Step‑by‑step: run locally (recommended)

Prerequisites:
- Node.js (LTS) installed
- Either local MongoDB installed, Docker available, or Atlas account

Paths used in examples assume the repo root is:
`C:\Users\<you>\OneDrive - iTouch Solution\Desktop\Internshall_Ecommerproject`

### 1) Get server running with local MongoDB

Open a PowerShell terminal and run:

```pwsh
cd C:\Users\<you>\OneDrive - iTouch Solution\Desktop\Internshall_Ecommerproject\server
# optionally set explicit Mongo URI for persistence
$env:MONGO_URI = 'mongodb://localhost:27017/vibe-commerce'

npm install
npm run seed    # adds 5 demo products
npm run dev     # starts nodemon and the API on port 4000
```

Watch for the console message: `Server running on 0.0.0.0:4000`.

### 2) Start the frontend

Open a second PowerShell terminal and run:

```pwsh
cd C:\Users\<you>\OneDrive - iTouch Solution\Desktop\Internshall_Ecommerproject\client
npm install
npm run dev
```

Vite will print the local URL (e.g., `http://localhost:5173` or next free port). Open it in your browser.

### 3) Use the app
- Add products to the cart, update quantities and remove items.
- Proceed to checkout (name + email) to create a receipt saved in MongoDB.

---

## Inspecting data in MongoDB Compass

1. Open MongoDB Compass.
2. Connect to `mongodb://localhost:27017` (or your Atlas URI).
3. Open database `vibe-commerce`.
4. Collections to inspect:
   - `products` — seeded items
   - `cartitems` — items added to the cart (while app running)
   - `receipts` — persisted receipts after checkout
   - `users` — optional; mock user records
5. Press **Refresh** after performing actions in the app to see the latest documents.

---

## Running with Docker (if you prefer no install)

If you have Docker Desktop, you can run MongoDB as a container. Example:

```pwsh
# run MongoDB
docker run -d --name vibe-mongo -p 27017:27017 -v mongo-data:/data/db mongo:6.0

# then start server with same commands as above, ensuring env var uses localhost
$env:MONGO_URI = 'mongodb://localhost:27017/vibe-commerce'
npm run seed
npm run dev
```

To enable change streams (Compass watch) with Docker, run MongoDB with `--replSet rs0` and run `rs.initiate()` in mongosh.

---

## Testing

- Backend tests (server folder): `npm test` — uses mongodb-memory-server.
- Frontend tests (client): `npm test` (Vitest) — component tests scaffolded.

---

## Troubleshooting common errors

- EADDRINUSE (port 4000 in use)
  - Find the PID and stop it:
  ```pwsh
  netstat -aon | findstr ":4000"
  Stop-Process -Id <PID> -Force
  ```
- Connection refused / server not reachable
  - Ensure the server terminal shows `Server running on 0.0.0.0:4000`.
  - Ensure MongoDB is running and reachable at the URI in $env:MONGO_URI.
- Compass warns about unsupported server version
  - Upgrade MongoDB or run a modern MongoDB container (docker) and point the app to it.

---

## Next improvements you can make

- Add images to products and richer product pages
- Add user authentication
- Persist cart per user
- Add CI (GitHub Actions) to run tests automatically



