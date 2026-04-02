# 💰 Professional Finance Dashboard

A robust, secure, and highly-scalable financial tracking dashboard built with **Node.js, Express, and MySQL**. This project implements Enterprise-grade **Role-Based Access Control (RBAC)** and advanced financial analytics.

---

## 🏗️ Architecture & Backend Design

The application follows the **MVC (Model-View-Controller)** design pattern to ensure a clean separation of concerns:

- **Models**: Business logic and raw database interactions (MySQL2).
- **Views**: Dynamic interface rendering using EJS templates.
- **Controllers**: Request handling and orchestrating data flow.
- **Middlewares**: Tactical security layers (Authentication, RBAC, Status Checks).

### Key Backend Features:
- **Role Based Access Controlled Authentication**: Precise permissions for `Viewer`, `Analyst`, and `Admin` roles.
- **Session Management**: Secure state persistence using `express-session`.
- **Global Status Enforcement**: A dedicated middleware (`checkStatus`) performs real-time database lookups on every request to instantly terminate sessions for deactivated users.
- **Secure Password Hashing**: Utilizes `bcryptjs` for industry-standard credential protection.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v16+)
- **MySQL** (Server running locally or remote)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=finance_dashboard
SESSION_SECRET=your_super_secret_key
PORT=3000
```

### 3. Database Initialization
Execute the provided SQL scripts:
- `schema.sql`: Sets up the tables and relational constraints.
- `seed.sql`: Populates the initial roles and a super-admin account.

### 4. Run the App
```bash
npm install
npm run dev
```

---

## 🔐 Access Control Matrix

| Permission | Viewer | Analyst | Admin |
| :--- | :---: | :---: | :---: |
| View Basic Dashboard | ✅ | ✅ | ✅ |
| View Financial Records | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Create Records | ❌ | ❌ | ✅ |
| Edit/Delete Records | ❌ | Ownership-Based | ✅ |
| User Management | ❌ | ❌ | ✅ |

---

## 📊 API & Insights Engine

The project features a dedicated **Analytics Hub** that processes raw financial data into actionable insights:

- **Anomaly Detection**: Backend logic identifies categorical spending spikes $>50\%$ MoM.
- **Trend Forecasting**: Calculates 3-month Simple Moving Averages for projected performance.
- **Reporting**: Native CSV generation allowing analysts to export raw data for external auditing.

---

## 🧪 Error Handling & Reliability

The application implements a **Centralized Error Handling** middleware in `app.js`. 
- **Consistency**: All API errors return a standardized JSON structure: `{ success: false, error: "Human Readable Message" }`.
- **Validation**: Strict server-side validation on all `POST/PUT` operations prevents malformed data or negative currency amounts from entering the ledger.
- **Database Safety**: Uses Connection Pooling to manage resources efficiently and prevent leakages.

---

## 💡 Thoughtfulness & Trade-offs
- **Server-Side Rendering (SSR)**: Chose EJS for rapid development and SEO-ready HTML delivery without the overhead of a heavy frontend framework.
- **Session-Based Auth**: Optimized for security; allowed us to implement the "Global Kill Switch" for inactive users that JWTs cannot easily handle without Revocation Lists.
- **Filter & Search Records**: Implemented server-side filtering and search to allow Analysts and Admins to quickly find records by **date, type, category, or amount**. This approach handles large datasets efficiently and reduces frontend load, avoiding performance bottlenecks with client-side rendering.  

