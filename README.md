# Mini ERP + CRM Operations Portal

A full-stack operations portal for managing customer records, product inventory, stock movements, and sales challans.

## Live Application

- **Frontend:** https://mini-erp-crm-portal-ui.netlify.app
- **Backend API:** https://mini-erp-crm-portal-bvdn.onrender.com

## Demo Login

Use this seeded account to explore the public demo:

- **Role:** Admin
- **Email:** `admin@test.com`
- **Password:** `Admin@123`

These are public demo credentials, not private account credentials. Use them only with the deployed demo and never reuse this password for a personal or production account. The demo should contain only disposable sample data.

## Tech Stack

React, Node.js, Express, Prisma, and PostgreSQL (hosted on Supabase).

## Run Locally

1. Install backend dependencies with `npm install` from the repository root.
2. Configure the backend environment using `.env.example`.
3. Apply migrations with `npx prisma migrate deploy`, then run `npx prisma generate`.
4. Seed local demo data with `npm run seed`.
5. Start the backend with `npm start`.
6. In a second terminal, run `npm install` inside `frontend/`, configure `VITE_API_BASE_URL`, and run `npm run dev`.

Import `postman_collection.json` into Postman to explore the API.

## Important Scope Notes

- Stock levels change through stock-movement records.
- Challan numbers use a simple increment strategy; concurrent production traffic would need a safer sequence.
- Only draft challans can be cancelled.
- The current version authenticates users but does **not** enforce a granular role-to-module permission matrix. Do not treat the demo as production-ready authorization.
- The deployed backend may take time to wake after inactivity because it uses a free hosting tier.

Never enter private or production data into the public demo.

## Author

Priyansh Soni · [Portfolio](https://priyansh-soni-portfolio.netlify.app) · [GitHub](https://github.com/priyansh29-05) · [LinkedIn](https://www.linkedin.com/in/priyansh-soni-489617211/)
