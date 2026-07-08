# Reality Contest Platform

A secure, multi-portal reality contest and tournament platform featuring robust Role-Based Access Control (RBAC), multi-stage quiz logic, and biometric verification workflows.

---

## 🛠️ Port Allocations & Services

The platform consists of three independent servers:

| Service | Port | Target Roles | URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | `10000` | System APIs, database seeders, auth sessional middleware | `http://localhost:10000` |
| **Member Frontend** | `10001` | Contestant, Sponsor, Judge, and Public Participants | `http://localhost:10001` |
| **Admin Dashboard** | `10002` | Admin and Super Admin | `http://localhost:10002` |

---

## 👥 Platform Role Hierarchy & Workflows

```
         Super Admin
              │
              ▼
        Creates Admin
              │
              ▼
    Admin creates Contestant
              │
              ▼
    Contestant creates Contest
              │
      ┌───────┴───────┐
      ▼               ▼
Assign Judges   Add Sponsors
      │               │
      ▼               ▼
Judge Reviews   Sponsor Promotes
      │               │
      └───────┬───────┘
              ▼
      Contest Published
              │
              ▼
     Public Users Join
              │
              ▼
     Entries Submitted
              │
              ▼
    Judge Reviews Entries
              │
              ▼
     Winners Declared
              │
              ▼
    Rewards Distributed
```

### 1. Super Admin
The ultimate system controller with full administrative capabilities.
- **Permissions:**
  - Create, edit, and suspend/delete `Admin` and `Super Admin` accounts.
  - View all users.
  - Manage categories, platform configurations, wallets, KYC requests, and notifications.
  - View analytics.
- **Access Rule:** Super Admin is the **only** role that can create other `Admin` or `Super Admin` accounts.

### 2. Admin
Created only by a Super Admin to perform standard administrative operations.
- **Permissions:**
  - Create and manage `Contestant`, `Judge`, and `Sponsor` accounts.
  - Manage contests and stages.
  - Review and verify contestant submissions.
  - View reports, handle support tickets, and publish notifications.
- **Access Restrictions:** Cannot create admins, cannot create Super Admins, cannot delete Super Admins, and cannot modify system-wide platform configurations.

### 3. Contestant (Creator / Public Participant)
The creators and active competitors on the platform.
- **Permissions:**
  - Register publicly, complete profiles, and submit KYC documents.
  - Create contests, edit their own contests, and invite Judges and Sponsors to participate.
  - Monitor contest participant directories, analytics, and declare contest winners.
- **Access Restrictions:** Cannot access the Admin Dashboard (Port 10002) or manage other contestants.

### 4. Judge
Subject matter experts assigned to score and comment on contest submissions.
- **Permissions:**
  - Log in to the member portal, view assigned contests, and review submission entries.
  - Allocate scores, leave comments, and approve/reject entries.
- **Access Restrictions:** Cannot create contests, manage users, or access the Admin Dashboard.

### 5. Sponsor
Brand representatives providing financial support for contests.
- **Permissions:**
  - Complete company profiles, upload branding assets, and subscribe to sponsorship packages.
  - Manage promotions and view payment history.
- **Access Restrictions:** Cannot create contests or access the Admin Dashboard.

---

## 🔒 Access Control & Safety Guidelines

### Cross-Portal Redirection Guard
- **Port 10002 (Admin Dashboard):** Guarded by `ProtectedRoute`. If any non-admin (`Contestant`, `Judge`, `Sponsor`) attempts access, they are automatically redirected to `http://localhost:10001`.
- **Port 10001 (Member Portal):** Guarded by authorization sagas. If an `Admin` or `Super Admin` logs in, they are immediately redirected to the admin portal on `http://localhost:10002`.

### Administrative User Directory Safety
Managed in **[UsersDirectory.jsx](file:///c:/Users/ADMIN/Desktop/BLG-%20sponcer/admin-dashboard/src/pages/UsersDirectory.jsx)** and **[AdminController.ts](file:///c:/Users/ADMIN/Desktop/BLG-%20sponcer/backend/src/controllers/AdminController.ts)**:
- **Separated Role Pages:** Users are split into distinct management views depending on their roles.
- **Self-Action Restriction:** Logged-in users are hidden from the tables and search indexes. Any attempts to edit, delete, or suspend one's own account are blocked on the UI and rejected with a `ForbiddenError` on the backend.
- **Privilege Separation:** Standard Admins cannot view or manage other Admin or Super Admin records.

### Stage & Question Building Permissions
- **Stages:** Managed by **Admins** and **Super Admins** inside the Stage Management interface.
- **Questions & Categories:** Managed **only by Super Admins** inside the Quiz Builder. Backend routing validates that the caller possesses the `Super Admin` role for category actions.

---

## 🚀 Running the Services

Start the development environments via local terminal shells:

```bash
# 1. Start Backend API (Port 10000)
cd backend
npm run dev

# 2. Start Member Portal (Port 10001)
cd frontend
npm run dev

# 3. Start Admin Dashboard (Port 10002)
cd admin-dashboard
npm run dev
```
