# LeadFlow CRM

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-blue)

> A full-stack CRM and Lead Management System built for Sri Lankan businesses — manage leads, contacts, pipeline stages, and team performance from a single modern dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- 🔐 **JWT Authentication** — secure login with token-based sessions and auto-logout on expiry
- 📊 **Sales Dashboard** — real-time KPI cards, pipeline breakdown bar, monthly chart, top salespeople leaderboard
- 👥 **Lead Management** — full CRUD with status tracking, deal values, source attribution, and assigned salesperson
- 🗂️ **Contacts Page** — grid, list, table, and kanban views with category filtering (Employee / Partner / Customer)
- 📋 **Pipeline Timeline** — visual stage history per lead with dates, actors, and quick stage-move control
- 📝 **Notes System** — per-lead notes with author, timestamp, and Ctrl+Enter shortcut
- 🔍 **Advanced Filtering** — multi-condition filter builder with AND/OR logic, 11 operators, and active filter chips
- 📦 **Toolbar** — Views, Hide by status, Group by field, Sort, Search — all with floating panels
- 📈 **Pipeline Analytics** — Avg. Time to Close and Stage Velocity calculated from history data
- 🌍 **Sri Lankan Data** — seed data with local names, `.lk` emails, `+94` phone numbers, and province locations
- 🛡️ **Error Handling** — 17 error handling points across frontend and backend
- 📱 **Responsive** — mobile-first layout using Mantine's grid system

---

## Tech Stack

| Layer               | Technology                              |
| ------------------- | --------------------------------------- |
| **Frontend**        | React 18, Vite, React Router v6         |
| **UI Library**      | Mantine UI v7                           |
| **Icons**           | Tabler Icons React                      |
| **HTTP Client**     | Axios                                   |
| **Backend**         | Node.js, Express.js                     |
| **Database**        | PostgreSQL 14+ via `pg` (node-postgres) |
| **Authentication**  | JWT (`jsonwebtoken`), bcryptjs          |
| **State / Storage** | React useState/useMemo, localStorage    |
| **Font**            | Inter (Google Fonts)                    |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [PostgreSQL](https://www.postgresql.org/) `>= 14`
- npm `>= 9`

### Installation

**1. Clone the repository**

```bash
git clone [your-repo-url]
cd crm-app
```

**2. Set up the database**

Open pgAdmin or `psql` and create the database:

```sql
CREATE DATABASE crm_db;
```

> Tables, triggers, seed user, and seed leads are created automatically on first server start.

**3. Configure backend environment**

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

**4. Install and start the backend**

```bash
cd backend
npm install
node server.js
```

Expected output:

```
Seed user created: admin@example.com / password123
Seed leads inserted.
Database initialized.
Server running on http://localhost:5000
```

**5. Install and start the frontend**

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Environment Variables

#### `backend/.env`

```env
PORT=5000
JWT_SECRET=crm_super_secret_key_change_in_production
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=crm_db
```

#### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ Never commit `.env` files to version control. Add them to `.gitignore`.

---

## Usage

### Default Login

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@example.com` |
| Password | `password123`       |

### Quick Start

1. Open `http://localhost:5173`
2. Sign in with the default credentials above
3. Navigate to **Leads** to see the leads
4. Click any lead name to open the **Lead Detail** page with notes and pipeline timeline
5. Use the **Filter** button in the toolbar to filter by status, source, or deal value
6. Visit **Dashboard** for pipeline analytics and team performance

### Example — Create a Lead via API

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "Nuwan Perera",
    "company_name": "Ceylon Tech Solutions",
    "email": "nuwan@ceylontech.lk",
    "phone": "+94 77 123 4567",
    "lead_source": "LinkedIn",
    "assigned_to": "Kasun Fernando",
    "status": "New",
    "deal_value": 45000
  }'
```

---

## Project Structure

```
crm-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # PostgreSQL pool, schema init, seed data
│   │   ├── controllers/
│   │   │   ├── authController.js      # Login, /me
│   │   │   ├── leadController.js      # Lead CRUD
│   │   │   ├── noteController.js      # Notes CRUD
│   │   │   └── dashboardController.js # Stats, recent leads, top sales, monthly
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   └── errorHandler.js        # Global error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── leadRoutes.js          # Includes nested note routes
│   │   │   └── dashboardRoutes.js
│   │   └── app.js                     # Express app, CORS, middleware
│   ├── server.js                      # Entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/                # Topbar, AppShellLayout
    │   │   ├── leads/                 # LeadTable, LeadForm, LeadNotes,
    │   │   │                          # LeadStatusBadge, PipelineTimeline,
    │   │   │                          # DataToolbar, FilterPanel
    │   │   ├── contacts/              # ContactCard, ContactForm, ContactDetail
    │   │   ├── dashboard/             # StatCard, PipelineBar
    │   │   └── common/                # ConfirmModal, LoadingOverlay
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useLeads.js
    │   │   ├── useNotes.js
    │   │   ├── useContacts.js
    │   │   └── usePipelineHistory.js  # History storage, analytics
    │   ├── pages/
    │   │   ├── SignInPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── LeadsPage.jsx
    │   │   ├── LeadDetailPage.jsx
    │   │   └── ContactsPage.jsx
    │   ├── services/
    │   │   ├── api.js                 # Axios instance + interceptors
    │   │   ├── authService.js
    │   │   ├── leadService.js
    │   │   └── noteService.js
    │   ├── utils/
    │   │   ├── constants.js           # Statuses, sources, colors
    │   │   └── formatters.js          # formatDate, formatCurrency, formatTime
    │   ├── App.jsx                    # Routes + guards
    │   └── main.jsx                   # MantineProvider + BrowserRouter
    ├── .env
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Reference

### Authentication

| Method | Endpoint          | Description                 | Auth |
| ------ | ----------------- | --------------------------- | ---- |
| `POST` | `/api/auth/login` | Login with email + password | No   |
| `GET`  | `/api/auth/me`    | Get current user from token | Yes  |

### Leads

| Method   | Endpoint         | Description                                                           | Auth |
| -------- | ---------------- | --------------------------------------------------------------------- | ---- |
| `GET`    | `/api/leads`     | List all leads (supports `status`, `source`, `assigned_to`, `search`) | Yes  |
| `GET`    | `/api/leads/:id` | Get single lead                                                       | Yes  |
| `POST`   | `/api/leads`     | Create lead                                                           | Yes  |
| `PUT`    | `/api/leads/:id` | Update lead                                                           | Yes  |
| `DELETE` | `/api/leads/:id` | Delete lead (notes cascade)                                           | Yes  |

### Notes

| Method   | Endpoint                       | Description              | Auth |
| -------- | ------------------------------ | ------------------------ | ---- |
| `GET`    | `/api/leads/:id/notes`         | Get all notes for a lead | Yes  |
| `POST`   | `/api/leads/:id/notes`         | Add a note               | Yes  |
| `DELETE` | `/api/leads/:leadId/notes/:id` | Delete a note            | Yes  |

### Dashboard

| Method | Endpoint                      | Description                           | Auth |
| ------ | ----------------------------- | ------------------------------------- | ---- |
| `GET`  | `/api/dashboard/stats`        | Pipeline KPI counts + deal values     | Yes  |
| `GET`  | `/api/dashboard/recent-leads` | Last 5 leads added                    | Yes  |
| `GET`  | `/api/dashboard/top-sales`    | Top salespeople by won value          | Yes  |
| `GET`  | `/api/dashboard/monthly`      | Lead counts per month (last 6 months) | Yes  |

---

## Error Handling

The application has **17 error handling points** across the stack:

| Layer    | Mechanism                        | Purpose                                        |
| -------- | -------------------------------- | ---------------------------------------------- |
| Backend  | Global `errorHandler` middleware | Catches all unhandled errors → 500 JSON        |
| Backend  | `authMiddleware`                 | Missing/expired token → 401                    |
| Backend  | `authController`                 | Wrong credentials → 401                        |
| Backend  | `leadController`                 | Missing lead name → 400, not found → 404       |
| Backend  | `noteController`                 | Empty content → 400, fallback author           |
| Backend  | `db.js` pool listener            | DB connection loss → logged, server stays up   |
| Backend  | `server.js` startup              | DB unreachable → clean exit with message       |
| Frontend | `api.js` response interceptor    | 401 → auto-logout + redirect to `/login`       |
| Frontend | `App.jsx` route guards           | Unauthenticated → redirect to login            |
| Frontend | `SignInPage`                     | Wrong credentials → red alert                  |
| Frontend | `LeadDetailPage`                 | Load failure → full-page alert                 |
| Frontend | `LeadForm`                       | Save failure → error inside modal              |
| Frontend | `LeadNotes`                      | Load/save failure → alert + Retry button       |
| Frontend | `DashboardPage`                  | `Promise.allSettled` → partial load on failure |
| Frontend | `LeadsPage`                      | Delete failure → dismissible alert             |
| Frontend | `usePipelineHistory`             | Corrupted localStorage → empty fallback        |

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit

```bash
git commit -m "feat: add your feature description"
```

4. Push to your fork

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request against the `main` branch

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | Use for                             |
| ----------- | ----------------------------------- |
| `feat:`     | New feature                         |
| `fix:`      | Bug fix                             |
| `docs:`     | Documentation only                  |
| `style:`    | Formatting, no logic change         |
| `refactor:` | Code restructure, no feature change |
| `chore:`    | Build process, dependencies         |

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) [YEAR] [YOUR NAME]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## Contact

- Email: yeshikabandara@gmail.com
- GitHub: yeshi-2001 https://share.google/Q8JyAKNsfiyOCfnAE

---

## Known Limitations

- No multi-user role support — only a single admin account is seeded; there is no role-based access control (RBAC)
- Assignees are hardcoded in the filter dropdown (`Sarah Chen`, `Mike Torres`, `Priya Nair`) and not dynamically pulled from a users table
- No pagination — all leads are loaded at once, which may affect performance with large datasets
- Pipeline history is seeded automatically on first visit; manual history edits are not supported
- No email notifications or reminders for lead follow-ups
- The date filter on the Dashboard (All Time / Last 30 Days / This Month) is UI-only and does not filter the actual data
- No file/attachment support on leads or notes
- Contacts are auto-created from leads but cannot be independently created from the Contacts page form in all cases

---

## Reflection

Developing this CRM and Lead Management System helped me improve my full-stack development skills using React, Node.js, Express, and PostgreSQL. During the project, I learned how to build reusable UI components, manage APIs, implement authentication, and handle real-world business logic such as pipeline tracking and lead management. One of the main challenges was managing complex filtering and pipeline history updates, but solving those problems improved my understanding of frontend-backend integration and application architecture. Overall, this project gave me valuable hands-on experience in building scalable and user-friendly web applications.

One major challenge I faced during this project was implementing the advanced filtering system for the Leads page. The filter panel needed to support multiple conditions, different operators, and AND/OR logic while keeping the UI responsive and easy to use. Initially, managing all the filter states and applying them correctly caused bugs and performance issues. To solve this, I redesigned the filtering logic using reusable functions and React's useMemo hook to optimize performance. After testing different scenarios and fixing edge cases, I was able to create a stable and flexible filtering system that works smoothly for users.

---

## Acknowledgements

- [Mantine UI](https://mantine.dev/) — React component library
- [Tabler Icons](https://tabler-icons.io/) — Icon set
- [node-postgres](https://node-postgres.com/) — PostgreSQL client for Node.js
- [Vite](https://vitejs.dev/) — Frontend build tool
- [Express.js](https://expressjs.com/) — Backend framework
