# Mini ERP + CRM Operations Portal

A full-stack operations portal to manage customers, product inventory, and sales challans. Built with Node.js, Express, React, and Prisma.

## Live Application
- **Frontend (Netlify):** https://mini-erp-crm-portal-ui.netlify.app
- **Backend API (Render):** https://mini-erp-crm-portal-bvdn.onrender.com

## Test Credentials
You can log in with any of the following pre-seeded test accounts:
- **Admin:** `admin@test.com` / `Admin@123`
- **Sales:** `sales@test.com` / `Sales@123`
- **Warehouse:** `warehouse@test.com` / `Warehouse@123`
- **Accounts:** `accounts@test.com` / `Accounts@123`

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Supabase connection string)

### Backend Setup
1. Open a terminal in the root directory.
2. Run `npm install` to install backend dependencies.
3. Copy `.env.example` to `.env` and fill in your `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` (Supabase requires both pooled and direct URLs).
4. Run `npx prisma migrate deploy` to apply migrations to the database.
5. Run `npx prisma generate` to generate the Prisma client.
6. Run `npm run seed` to seed the database with initial users and data.
7. Run `npm start` to start the server (runs on port 3000 by default).

### API Documentation
A comprehensive Postman collection is included in the repository. You can import `postman_collection.json` (located at the project root) into Postman to test all endpoints. It includes auto-saving tokens for easy authentication.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory: `cd frontend`
2. Run `npm install` to install frontend dependencies.
3. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL=http://localhost:3000` (or your backend URL).
4. Run `npm run dev` to start the Vite development server.
5. Open the local URL provided by Vite (usually `http://localhost:5173`) in your browser.

## Known Limitations / Assumptions

1. **JavaScript instead of TypeScript** — the case study listed TypeScript; plain JavaScript was used instead due to my lack of prior experience with TypeScript and the project's tight time constraints.
2. **Customer required fields** — per a strict reading of the spec, only `gstNumber` is optional on the Customer model; all other fields (including `followUpDate` and `notes`) are required at creation.
3. **Product required fields** — `location` is required on the Product model (the spec didn't mark it optional).
4. **Stock changes are movement-only** — `currentStock` cannot be edited directly via `PUT /products/:id`; it can only change through `POST /products/:id/stock-movement`, to guarantee the stock movement audit log is always accurate.
5. **Challan number generation** — uses a simple max-increment approach (`CHL-0001`, `CHL-0002`, ...); under high concurrency this has a theoretical race condition. A production system would use a database sequence instead.
6. **No Challan edit endpoint** — drafts can only be confirmed or cancelled, not modified, by design (an intentional simplification, not an oversight).
7. **No stock-reversal on cancelling a confirmed challan** — only DRAFT challans can be cancelled; the spec doesn't define behavior for reversing a CONFIRMED challan's stock impact, so this wasn't implemented.
8. **JWT stored in `sessionStorage`** on the frontend — a deliberate tradeoff (persists across refreshes, clears on tab close, more resistant to long-lived XSS token theft than `localStorage`, though less safe than an httpOnly cookie, which was out of scope for the timeline).
9. **No granular per-role endpoint restrictions** — all 4 roles (Admin, Sales, Warehouse, Accounts) can access all modules once authenticated; the spec didn't define a specific permission matrix, so authentication alone was enforced, not per-role authorization.
10. **Deployment hosting choice** — backend deployed on Render, frontend on Netlify (both explicitly acceptable per the case study's suggested options), database on Supabase.
11. **Render free-tier cold start** — the backend may take up to ~50 seconds to respond on the first request after a period of inactivity, since it's on Render's free tier which spins down when idle. This is expected behavior, not a bug.
12. **AI-assisted development** — AI tools were used for help and guidance during development to accelerate the learning process and assist with building out the modules, given my limited prior full-stack experience.
