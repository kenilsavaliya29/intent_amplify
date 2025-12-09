## Intent Amplify CRM – Practical Assignment

Minimal CRM + intent ingestion built with:

- Next.js App Router (JavaScript)
- MongoDB + Mongoose
- JWT auth with HTTP-only cookies

### Setup Instructions

- **Environment**
  - Create a `.env` file in the project root with:
    - `MONGODB_URI=mongodb://localhost:27017/` change it with your own mongoDB
    - `JWT_SECRET=secret key of choice`

- **Install & run**
  - `npm install`
  - `npm run dev`
  - App runs on `http://localhost:3000`

- **Initial Setup Scripts (Run in order)**
  
  **Step 1: Create Admin User**
  - Ensure MongoDB is running locally.
  - Run the admin creation script:
    ```bash
    node src/app/scripts/adminEntry.js
    ```
  - This will create a default admin user with:
    - `email: admin@gmail.com`
    - `password: admin123` 
  - If the admin user already exists, the script will skip creation.
  
  **Step 2: Seed Sample Accounts**
  - After creating the admin user, run the accounts seeding script:
    ```bash
    node src/app/scripts/seedAccounts.js
    ```
  - This will create 4 sample accounts:
    - Acme Corp (acme.com) - Manufacturing
    - Globex Inc (globex.com) - SaaS
    - Initech (initech.io) - Technology
    - Umbrella Health (umbrellahealth.org) - Healthcare
  - If accounts already exist, the script will skip duplicates.
  
  **Note**: Make sure your `.env` file has `MONGODB_URI` and `JWT_SECRET` set before running any scripts.

### Auth & Routing

- Login at `/login` → posts to `/api/auth/login`.
- On success, backend sets an HTTP-only `token` cookie (JWT with `{ userId, email }`, 7-day expiry).
- Middleware (`middleware.js`) protects:
  - `/accounts/*` and `/dashboard` → redirect to `/login` if no cookie.
  - `/login` → redirect to `/accounts` if already logged in.
- Server APIs use `requireAuth` (`lib/auth.js`) which reads:
  - `Authorization: Bearer <token>` header **or**
  - `token` cookie.

### Schema Overview (Mongoose)

- **User**
  - `email` (unique), `password` (hashed).
- **Account**
  - `name`, `domain` (unique), `industry`, `intentScore`, `createdAt`.
- **Contact**
  - `accountId` (ref Account), `name`, `email`, `title`.
- **Opportunity**
  - `accountId` (ref Account), `name`, `stage` (`NEW`, `PROPOSAL`, `CLOSED_WON`, `CLOSED_LOST`), `amount`.
- **IntentSignal**
  - `accountId` (ref Account), `signalType`, `score`, `metadata` (Object), `occurredAt`.

### Backend APIs

- **Auth**
  - `POST /api/auth/login` – email + password → validates via bcrypt, signs JWT, sets `token` cookie, returns `{ success, user }`.

- **Accounts**
  - `GET /api/accounts?q=` – JWT required; search by `name`/`domain` (case-insensitive).
  - `POST /api/accounts` – JWT required; creates account, 409 on duplicate `domain`.
  - `GET /api/accounts/:id` – JWT required; returns `{ account, contacts, opportunities, intentSignals (last 10, newest first) }`.

- **Contacts**
  - `POST /api/contacts` – JWT required; creates contact linked to an account.

- **Opportunities**
  - `POST /api/opportunities` – JWT required; creates opportunity with `name`, `stage`, `amount`.
  - `PATCH /api/opportunities/:id` – JWT required; updates only `stage`.

- **Intent ingestion**
  - `POST /api/intent`
    - Body: `{ accountDomain, signalType, score, metadata, occurredAt }`.
    - Logic:
      - Look up account by `domain`.
      - If not found → create stub account (`name = domain`, `industry = null`).
      - Save `IntentSignal`.
      - Recompute `account.intentScore` as sum of all scores for that account.

- **Dashboard**
  - `GET /api/dashboard` – JWT required; returns:
    - `totalAccounts`
    - `totalOpportunities`
    - `totalClosedWonAmount` (sum of `amount` where `stage = CLOSED_WON`)
    - `totalIntentSignals`

### Frontend Pages (CRM)

- **`/login`**
  - Simple email/password form; on success redirects to `/accounts`.

- **`/accounts`**
  - Account list table:
    - Shows `name`, `domain`, `industry`, `intentScore`.
    - Search input → calls `GET /api/accounts?q=`.
    - Row click navigates to `/accounts/[id]`.
  - Header includes link to `/dashboard` and a basic "Logout" (navigate to `/login`).

- **`/accounts/[id]`**
  - Account detail:
    - Account info (name, domain, industry, intentScore).
    - Contacts table.
    - Opportunities table with inline stage select (PATCH `/api/opportunities/:id`).
    - New opportunity form (POST `/api/opportunities`).
    - Recent intent signals list (from `GET /api/accounts/:id`).

- **`/dashboard`**
  - Simple 4-card layout displaying:
    - Total accounts
    - Total opportunities
    - Total closed-won amount
    - Total intent signals
  - Data from `GET /api/dashboard`.

### Scaling Intent Ingestion

If traffic grows, next steps to scale `/api/intent`:

- **Decouple writes from aggregation**
  - Keep `IntentSignal` inserts fast and append-only.
  - Move `intentScore` recomputation to:
    - Background worker / queue (e.g., BullMQ), or
    - Periodic batch job (e.g., cron) that recomputes or increments scores.

- **Indexing & sharding**
  - Add indexes on `accountId`, `occurredAt`, `signalType` for faster aggregation.
  - For very high scale, shard `IntentSignal` by `accountId`.

- **Pre-aggregation**
  - Maintain a separate collection/document for intent score per account and increment it instead of recounting all signals.

### What I’d Add Next With More Time

- Richer CRM UX:
  - Create/edit forms for Accounts and Contacts.
  - Sorting, pagination, and filters on the Accounts and Opportunities tables.
- Better auth:
  - Logout endpoint that clears the cookie.
  - Optional roles/permissions for sales vs admin users.
- Observability:
  - Request logging, metrics around intent ingestion latency and error rates.
- Intent intelligence:
  - Intent decay over time, signal-type weighting, and basic prioritization rules for accounts.
