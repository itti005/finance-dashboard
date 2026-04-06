Click here -->[Documentation of finance dashboard.pdf](https://github.com/user-attachments/files/26503193/Documentation.of.finance.dashboard.pdf)
# Finance Dashboard

A full-stack finance management web application built with ASP.NET Core 10 Web API and React.js.
The system supports role-based access control 
with three roles — Admin, Analyst, and Viewer — each with different levels of access to financial data.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 10 Web API |
| Database | SQLite via Entity Framework Core |
| Authentication | JWT Bearer Tokens (365 days) |
| Frontend | React.js + Vite |
| API Docs | Swagger UI |

---

## How to Run

### Prerequisites
- .NET 10 SDK
- Node.js v18+
- Visual Studio 2026

### Steps
1. Clone the repository
2. Open `FinanceDashboard.sln` in Visual Studio 2026
3. Press **Ctrl+F5** — backend and frontend both start automatically
4. Browser opens at `http://localhost:52302`

### Default Admin Login
When the application starts on a fresh database, a  Admin is created automatically. No manual setup needed.
Email:    admin@gmail.com
Password: Admin@546

### API Documentation
http://localhost:5011/swagger

---

## Roles & Access

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Transactions | ✅ | ✅ | ✅ |
| Create Transaction | ❌ | ✅ | ✅ |
| Edit / Delete Transaction | ❌ | ✅ (own only) | ✅ (any) |
| View Monthly Trends | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

### How to Test Different Roles
1. Login as Admin using the credentials above
2. Register a new user from the Login page — they get **Viewer** role by default
3. Go to **Users page** as Admin
4. Change their role to Analyst or Admin using the dropdown

---

## How It Works

### Backend Flow
Every API request goes through these layers in order:
Request → JWT Middleware → Role Check → Controller → Service → Database → Response
- **JWT Middleware** — Validates the token on every request. Invalid or missing token is rejected immediately.
- **Role Check** — Reads the role from inside the token and checks if the user has permission for that endpoint.
- **Controller** — Receives the request and validates the input. Keeps no business logic.
- **Service Layer** — All business logic lives here — filtering, calculations, ownership checks.
- **EF Core** — Translates C# queries into SQL and talks to the SQLite database.

### Frontend Flow
User Action → Axios (auto attaches JWT) → API Call → Response → UI Update
- **Axios Interceptor** — Automatically attaches the JWT token to every API request in one central place.
- **Auth Context** — Stores the logged-in user and their role globally. Any page can access it instantly.
- **Protected Routes** — Pages check the user role before rendering. Wrong role redirects automatically.
- **Role-Aware UI** — Sidebar links and action buttons are shown or hidden based on the user role.

---

## Project Structure
Frontend — Design
Folder Structure
src/
—-api/
     —-axios.js        → Single Axios instance with interceptors
     —- services.js     → All API functions organized by feature
—-context/
   —- AuthContext.jsx → Global authentication state
   —-components/
        —-Sidebar.jsx     → Role-aware navigation
          —-Layout.jsx      → Page wrapper + ProtectedRoute
—- pages/
    —- LoginPage.jsx         → Login and Register
    —- DashboardPage.jsx     → Summary cards and category breakdown
    —- TransactionsPage.jsx  → Full CRUD with filters and pagination
    —- TrendsPage.jsx        → Monthly bar chart (Analyst/Admin)
    —-UsersPage.jsx         → User management (Admin only)

Backend design
FinanceDashboard.Server/
├── Controllers/
│    ├── AuthController.cs         → Register and Login endpoints
│    ├── TransactionsController.cs → CRUD endpoints for transactions
│    ├── DashboardController.cs    → Summary and trends endpoints
│    └── UsersController.cs        → User management endpoints (Admin only)
├── Services/
│    ├── AuthService.cs            → JWT token generation and password verification
│    ├── TransactionService.cs     → Filtering, pagination, ownership checks
│    └── DashboardService.cs       → Income/expense totals and monthly trends
├── Models/
│    ├── User.cs                   → User entity with Role enum
│    └── Transaction.cs            → Transaction entity with soft delete flag
├── DTOs/
│    └── Dtos.cs                   → All request and response shapes
├── Data/
│    └── AppDbContext.cs           → EF Core DbContext with global query filter
├── Middleware/
│    └── ExceptionMiddleware.cs    → Global error handler for clean responses
├── Program.cs                     → App entry point, all services registered here
└── appsettings.json               → JWT config and database connection string

---

## Key Design Decisions

**Soft Delete** — Transactions are never permanently removed. An `IsDeleted` flag is set instead. EF Core automatically excludes these records from all queries using a Global Query Filter.

**Service Layer** — Business logic is completely separated from Controllers. Controllers are kept thin and only handle HTTP concerns.

**Auto Seed** — The first Admin account is created automatically on a fresh database so no manual setup is required.

**Axios Interceptor** — Token management is handled in one place. Every API call automatically gets the JWT token without any extra code in individual components.


