# Employee Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-12-dd0031.svg?logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20Fallback-4479A1.svg?logo=mysql)](https://www.mysql.com/)

A modern, responsive full-stack **Employee Management System** built with **Angular 12**, **Node.js (Express)**, and **MySQL**. It provides complete CRUD functionality for managing workforce data with instant search, reactive validations, responsive tables/cards, and automatic zero-configuration database fallback.

---

## ✨ Features

- **Employee Directory**: Instant client-side search filtering across names, emails, departments, and designations.
- **Full CRUD Support**:
  - **Create**: Add new employees with email format, required field, and positive salary validation.
  - **Read**: Browse records in a responsive table (with auto card collapse on mobile) and view full details.
  - **Update**: Pre-filled reactive edit form with live client & server duplicate email checks.
  - **Delete**: Safe removal with confirmation prompts and non-intrusive feedback toasts.
- **Dual Database Architecture**:
  - Connects to **MySQL** connection pool with parameterized queries.
  - Includes an automatic **Persistent Local Fallback** (`backend/data/employees.json`) allowing immediate full functionality without needing an external database installed.
- **Responsive Modern UI**: Clean typography, accessible contrast, custom CSS design system, and mobile-friendly layouts.

---

## 🏗️ Project Structure

```
employee-management-system/
├── backend/                 # Node.js + Express REST API
│   ├── config/
│   │   ├── db.js            # MySQL connection pool + automatic fallback logic
│   │   └── fallbackDb.js    # Persistent JSON storage adapter
│   ├── controllers/         # CRUD controller functions
│   ├── routes/              # Express API route declarations
│   ├── db/
│   │   ├── schema.sql       # Database table definitions and seed data
│   │   └── init-db.js       # Database initialization helper
│   ├── data/                # Persistent local fallback store
│   └── server.js            # Express application entry point
├── frontend/                # Angular 12 Single Page Application
│   └── src/app/
│       ├── components/      # List, Form (Add/Edit), and Detail views
│       ├── models/          # TypeScript Employee interface
│       ├── services/        # Centralized HTTP Client service layer
│       └── environments/    # Configurable API endpoints
├── LICENSE                  # MIT License
└── README.md
```

---

## 🚀 Getting Started

### ⚡ Quick Start with Docker (Recommended)

Run the entire full-stack stack (MySQL 8.0 + Express API + Angular Production Nginx) with a single command:

```bash
docker compose up --build
```
- **Frontend App**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **MySQL Database**: `localhost:3306`

---

### Manual Setup (Without Docker)

#### Prerequisites

- **Node.js**: v14+ (Compatible with modern Node versions including Node 18, 20, and 24)
- **npm**: v6+
- *(Optional)* **MySQL** 5.7+ or 8.0+ running on port 3306

---

### 1. Backend Setup

```bash
cd backend
npm install
```

#### Database Configuration:
- **Zero-Setup Mode**: You don't need to do anything! If MySQL is not detected, the backend automatically uses the built-in persistent storage seeded with sample employees.
- **MySQL Mode**: Copy `.env.example` to `.env` and fill in your MySQL credentials:
  ```bash
  cp .env.example .env
  npm run init-db
  ```

Start the API server:
```bash
npm start
# API server runs at http://localhost:3000
```

---

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install --legacy-peer-deps
npm start
# Frontend runs at http://localhost:4200
```

> **Note for Node 17+**: If running with newer Node versions, legacy OpenSSL provider is used:
> - Windows (PowerShell): `$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start`
> - Linux/macOS: `NODE_OPTIONS=--openssl-legacy-provider npm start`

Open **[http://localhost:4200](http://localhost:4200)** in your browser.

---

## 📡 API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/employees` | Retrieve all employees (ordered by ID descending) |
| `GET` | `/employees/:id` | Retrieve a single employee by ID |
| `POST` | `/employees` | Create a new employee record |
| `PUT` | `/employees/:id` | Update an existing employee record |
| `DELETE` | `/employees/:id` | Remove an employee record |

#### Sample Payload:
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "department": "Engineering",
  "designation": "Software Engineer",
  "salary": 72000
}
```

---

## 👤 Author

**Kshitij Khede**
- GitHub: [@kshitijkhede](https://github.com/kshitijkhede)

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
