# Personal Expense & Income Tracker

A modern, responsive full-stack personal finance web application featuring real-time net balance calculations, multi-currency support, recurring subscription tracking, category budgets, dynamic financial insights, interactive charts, and secure JWT multi-user authentication.

Fully optimized for production deployment on **Vercel** with **Neon Serverless PostgreSQL (Free Tier)**.

---

## Key Features

- 💵 **Real-Time Financial Awareness**: Live recalculation of **Current Net Balance (`Total Income - Total Expenses`)**, Total Income, Total Expenses, Savings, and Expense Ratio (%) whenever transactions are added, edited, or deleted.
- 🌍 **Multi-Currency Support**: Instant currency switcher for **LKR (Rs.)**, **USD ($)**, **EUR (€)**, and **GBP (£)** across all dashboard metrics and transactions.
- 📊 **Dynamic Visualizations**: Recharts Donut chart for Expense Breakdown, Bar chart for Monthly Income vs Expenses, and Line chart for Balance trends.
- 📱 **Subscriptions Tracker**: Track recurring SaaS, streaming, and utility memberships with billing cycle projections and upcoming renewal alerts.
- 🎯 **Category Budget Management**: Set category spending caps and receive immediate over-budget warning badges (e.g., *⚠️ Exceeded Food budget by Rs. 5,000*).
- 💡 **AI Financial Insights Engine**: Automated variance analysis comparing current vs previous month spending, subscription burden ratio, and savings velocity.
- 🔒 **Secure Authentication**: JWT token authentication with bcrypt password hashing and complete user isolation.

---

## Recommended Free Tier Setup (Vercel + Neon Postgres)

### 1. Database Setup (Neon PostgreSQL)
1. Sign up for a free account at **[Neon.tech](https://neon.tech)**.
2. Create a new PostgreSQL project named `expense-tracker`.
3. Copy your project connection strings:
   - **Pooled connection string** (ends in `-pooler.neon.tech`) -> Use as `DATABASE_URL`.
   - **Direct connection string** (direct database host) -> Use as `DIRECT_URL`.

### 2. Local Development Setup
1. Clone the repository and install root dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` in backend:
   ```bash
   cp .env.example backend/.env
   ```
3. Run database migrations & seed default categories:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Start both Backend & Frontend local dev servers:
   ```bash
   # From root directory:
   npm run dev:backend
   npm run dev:frontend
   ```
5. Open your browser at `http://localhost:3000`.

---

## Docker Compose Execution

Run the complete full-stack environment locally with PostgreSQL in containers:

```bash
docker compose up --build
```

- **Frontend Client**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:4000/api`
- **Swagger Documentation**: `http://localhost:4000/api/docs`

---

## Deploying to Vercel Production

1. Push your code to GitHub/GitLab.
2. Import your repository into **Vercel**.
3. Set the following Environment Variables in your Vercel Project Settings:
   - `DATABASE_URL`: Your Neon Pooled Postgres connection string
   - `DIRECT_URL`: Your Neon Direct Postgres connection string
   - `JWT_SECRET`: A secure random string (minimum 32 characters)
4. Click **Deploy**. Vercel will execute `npm run vercel-build` automatically and serve the production site!

---

## Testing

Run unit tests for backend calculations and frontend components:

```bash
npm run test
```

---

## License

MIT License - free for personal and commercial use.
