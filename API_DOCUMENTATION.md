# API Documentation: Personal Expense & Income Tracker

Comprehensive REST API reference for the Personal Expense & Income Tracker full-stack application.

---

## Authentication Base Endpoint: `/api/auth`

### 1. Register User
`POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Alex Smith",
  "email": "alex@example.com",
  "password": "Password123!",
  "currency": "LKR"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "u-1234-5678",
    "name": "Alex Smith",
    "email": "alex@example.com",
    "currency": "LKR",
    "savingsGoal": 0
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
}
```

### 2. Login User
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "u-1234-5678",
    "name": "Alex Smith",
    "email": "alex@example.com",
    "currency": "LKR"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
}
```

---

## Dashboard Endpoint: `/api/dashboard`

### Get Live Financial Summary
`GET /api/dashboard/summary?month=8&year=2026`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "month": 8,
  "year": 2026,
  "currency": "LKR",
  "summary": {
    "totalIncome": 2500.00,
    "totalExpenses": 800.00,
    "currentNetBalance": 1700.00,
    "expenseRatio": 32.0,
    "savingsAmount": 1700.00,
    "savingsGoal": 500.00
  },
  "categoryBreakdown": [
    { "name": "Food & Dining", "amount": 300.00, "percentage": 37.5, "color": "#f59e0b" },
    { "name": "Other Expenses", "amount": 250.00, "percentage": 31.25, "color": "#64748b" },
    { "name": "Transport", "amount": 150.00, "percentage": 18.75, "color": "#3b82f6" },
    { "name": "Subscriptions", "amount": 100.00, "percentage": 12.5, "color": "#8b5cf6" }
  ],
  "recentTransactions": [...]
}
```

---

## Incomes & Expenses API

### Create Income Record
`POST /api/incomes`

**Request Body:**
```json
{
  "amount": 2500.00,
  "source": "Monthly Salary",
  "date": "2026-08-01",
  "description": "August paycheck"
}
```

### Create Expense Record
`POST /api/expenses`

**Request Body:**
```json
{
  "amount": 50.00,
  "categoryId": "cat-food-id",
  "date": "2026-08-16",
  "description": "Lunch with team",
  "paymentMethod": "Credit Card"
}
```

---

## Subscriptions & Budgets

### Create Subscription
`POST /api/subscriptions`

```json
{
  "name": "Netflix",
  "amount": 15.00,
  "billingCycle": "MONTHLY",
  "nextPaymentDate": "2026-09-01",
  "status": "ACTIVE"
}
```

### Set Category Budget Target
`POST /api/budgets`

```json
{
  "categoryId": "cat-food-id",
  "amount": 400.00,
  "month": 8,
  "year": 2026
}
```
