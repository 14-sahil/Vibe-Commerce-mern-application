# Vibe Commerce — Beginner friendly README

Vibe Commerce is a compact full‑stack shopping cart demo built for learning. It shows how a React frontend (Vite) talks to an Express backend with MongoDB (Mongoose). The app demonstrates browsing products, signing in, adding items to a cart (signed-in users), and performing a mock checkout that saves a styled receipt.

Why use this project
- Minimal and easy to read — good for beginners learning full‑stack concepts
- Implements common flows: products list, cart, checkout, receipts, and auth
- Ready to run locally with simple PowerShell commands

Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

Quick start (Windows / PowerShell)
1. Open a PowerShell terminal and start MongoDB (or run it in Docker). If using local MongoDB the default URI used is `mongodb://localhost:27017/vibe-commerce`.

2. Start the backend (server)
```pwsh
cd 'C:\Users\<you>\OneDrive - iTouch Solution\Desktop\Internshall_Ecommerproject\server'
# optional: persist to a specific MongoURI
$env:MONGO_URI = 'mongodb://localhost:27017/vibe-commerce'
npm install
npm run seed    # adds 5 demo products
npm run dev     # starts the API on port 4000
```
Watch for: `Server running on 0.0.0.0:4000`

3. Start the frontend (client)
```pwsh
cd 'C:\Users\<you>\OneDrive - iTouch Solution\Desktop\Internshall_Ecommerproject\client'
npm install
npm run dev
```
Vite will print the local URL (e.g. `http://localhost:5173`). Open it in your browser.

Basic usage (3 steps)
1. Sign up / Sign in at `/auth`. Only signed-in users can add items to cart or checkout.
2. Browse products on the home page and click "Add to Cart" (when signed in).
3. Go to `/checkout` and choose a dummy payment option (UPI QR / Card / COD). Click Place Order to create a receipt. The receipt shows product names, unit prices, qty and total and is persisted to MongoDB.

Inspect data (MongoDB Compass)
1. Open MongoDB Compass and connect to `mongodb://localhost:27017`.
2. Open the `vibe-commerce` database.
3. Collections:
   - `products` — seeded demo items
   - `cartitems` — items in user carts (scoped to signed in users)
   - `receipts` — persisted receipts after checkout
   - `users` — user accounts created via signup

Testing
- Backend tests: run `npm test` in the `server` folder (uses in‑memory MongoDB for speed).
- Frontend tests: run `npm test` in the `client` folder (Vitest for components).

Troubleshooting (quick tips)
- If port 4000 is busy: find and stop the process
```pwsh
netstat -aon | findstr ":4000"
Stop-Process -Id <PID> -Force
```
- If the frontend fails to load, check which port Vite used (it prints the URL) and ensure no firewall blocks localhost.
- If server cannot connect to MongoDB, verify MongoDB is running and the `MONGO_URI` environment variable points to the correct host/port.

Notes & next steps
- This demo uses a dummy payment flow for illustration (UPI QR is a placeholder). Do not use for real payments.
- Currently only signed-in users can add to cart and checkout. If you want guest carts, we can add localStorage-based guest cart merging on sign-in.
- Ideas to extend: per‑user cart persistence, richer product data, image upload, payment provider integration, or CI tests.

If you'd like, I can add a printable receipt page, guest-cart support, or an automated smoke test that signs up, adds items, and checks out.

Enjoy exploring the project — open the frontend URL printed by Vite and try signing up and making a mock purchase!




