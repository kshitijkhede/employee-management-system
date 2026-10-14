# Comprehensive Technical Documentation: Employee Management System

> **Author:** Kshitij Khede  
> **Repository:** [https://github.com/kshitijkhede/employee-management-system](https://github.com/kshitijkhede/employee-management-system)  
> **Architecture:** Full-Stack Single Page Application (Angular 12 + Node.js/Express + MySQL / Local Fallback)  
> **License:** MIT License  

---

## Table of Contents
1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [What, Why, and How (Core Engineering Philosophy)](#2-what-why-and-how-core-engineering-philosophy)
3. [Technology Stack & Package Encyclopedia](#3-technology-stack--package-encyclopedia)
4. [Core Architectural Concepts & Design Patterns](#4-core-architectural-concepts--design-patterns)
5. [Frontend Deep-Dive (Angular 12 SPA)](#5-frontend-deep-dive-angular-12-spa)
6. [Backend Deep-Dive (Node.js & Express REST API)](#6-backend-deep-dive-nodejs--express-rest-api)
7. [Database Design & Dual-Storage Architecture](#7-database-design--dual-storage-architecture)
8. [Exhaustive Command Reference & Command Dictionary](#8-exhaustive-command-reference--command-dictionary)
9. [Step-by-Step Setup, Deployment & Execution Guide](#9-step-by-step-setup-deployment--execution-guide)
10. [Alternative Technologies, Trade-offs & Future Enhancements](#10-alternative-technologies-trade-offs--future-enhancements)

---

## 1. Executive Summary & High-Level Architecture

### 1.1 Project Summary
The **Employee Management System (EMS)** is an enterprise-grade full-stack web application developed to streamline organizational workforce administration. It provides administrative personnel with an intuitive interface to register new employees, inspect workforce rosters, filter and query records in real-time, modify employment details, and remove records safely with confirmation dialogs.

The application adheres to clean architecture principles by separating the visual user interface (presentation layer) from business logic (controller layer) and persistent storage (database layer).

### 1.2 System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              CLIENT-SIDE (PORT 4200)                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             Angular 12 SPA                                  |  |
|  |  +--------------------+  +----------------------+  +---------------------+  |  |
|  |  | EmployeeListComponent|  | EmployeeFormComponent|  |EmployeeDetailComp   |  |  |
|  |  | (Roster & Search)  |  | (Add & Edit Form)    |  | (Single View)       |  |  |
|  |  +---------+----------+  +----------+-----------+  +----------+----------+  |  |
|  |            \                        |                         /             |  |
|  |             +-----------------------+------------------------+              |  |
|  |                                     |                                       |  |
|  |                         +-----------v-----------+                           |  |
|  |                         |    EmployeeService    |                           |  |
|  |                         |  (HttpClient / RxJS)  |                           |  |
|  +-------------------------+-----------+-----------+---------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | HTTP REST Requests (JSON)
                                         | CORS Enabled
                                         v
+-----------------------------------------------------------------------------------+
|                              SERVER-SIDE (PORT 3000)                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           Express.js REST API                               |  |
|  |                                                                             |  |
|  |  server.js (Middleware Pipeline: cors, express.json, logging, 404 router)   |  |
|  |                                     |                                       |  |
|  |                     employee.routes.js (/api/employees)                     |  |
|  |                                     |                                       |  |
|  |                   employee.controller.js (CRUD Handlers)                    |  |
|  |                                     |                                       |  |
|  |                         config/db.js (Proxy Layer)                          |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                     +-------------------+-------------------+
                     |                                       |
           (If MySQL is running)                   (If MySQL unavailable)
                     v                                       v
+------------------------------------+   +------------------------------------------+
|          MySQL Database            |   |           Persistent Local DB            |
|       (employee_db.employees)      |   |       (backend/data/employees.json)      |
|  Host: localhost:3306              |   |  Built-in Zero-Config Fallback Storage   |
+------------------------------------+   +------------------------------------------+
```

---

## 2. What, Why, and How (Core Engineering Philosophy)

To fully comprehend this codebase, every engineering choice must be understood through the lens of **What** is being accomplished, **Why** that solution was chosen, and **How** it is executed.

### 2.1 Decoupled Full-Stack Architecture
* **What**: The frontend (Angular) and backend (Express) live in isolated directories (`frontend/` and `backend/`) and communicate solely through asynchronous HTTP/JSON API contracts.
* **Why**: Monolithic server-rendered templates (like PHP or JSP) tightly couple page generation with server logic. By decoupling, the backend can serve web browsers, mobile apps, or third-party integrations interchangeably. Furthermore, frontend and backend teams can develop, test, and deploy independently.
* **How**: The Angular frontend runs on port `4200`, Express runs on port `3000`. Express includes the `cors()` middleware to permit cross-origin requests from the client.

### 2.2 Client-Side Live Search & Filtering
* **What**: As the administrator types into the search box, the table immediately updates without reloading the page or sending new queries to the server.
* **Why**: Instant feedback improves productivity. For small to medium employee directories (hundreds to thousands of records), client-side filtering avoids unnecessary server round-trips and database strain.
* **How**: A TypeScript getter property `filteredEmployees` in `employee-list.component.ts` intercepts the raw employee list and applies `Array.prototype.filter()` against `name`, `email`, `department`, and `designation`.

### 2.3 Dual-State Form Component (Create vs. Edit)
* **What**: A single Angular component (`EmployeeFormComponent`) handles both creating a new employee and modifying an existing one.
* **Why**: The fields, validations, and UI layout for creating and editing are identical. Creating two separate components would cause code duplication and maintenance hazards.
* **How**: The component inspects the active route using Angular's `ActivatedRoute.snapshot.paramMap.get('id')`. If an `id` is present, it toggles `isEditMode = true`, fetches the record, and populates the form via `form.patchValue()`. On submission, it conditionally calls `service.update()` instead of `service.create()`.

### 2.4 Graceful Database Degradation (Dual-Storage Strategy)
* **What**: The backend connects to MySQL if available; if not, it automatically and transparently switches to a local persistent JSON database without crashing or erroring.
* **Why**: Traditional enterprise projects fail instantly when cloned by developers who do not have a local MySQL service installed, configured, and running. This creates high setup friction. The dual-storage pattern guarantees **zero-setup execution** while remaining 100% production-ready for MySQL.
* **How**: `config/db.js` attempts a handshake with MySQL with a strict timeout. If the connection fails, it routes queries to `config/fallbackDb.js`, which implements the exact same Promise query interface (`[rows, fields] = await db.query(sql, params)`).

---

## 3. Technology Stack & Package Encyclopedia

This section explains every single tool, language, runtime, library, and package utilized across the repository.

### 3.1 Runtime & Language Specifications

| Tool / Technology | Version | Purpose in this Project |
| :--- | :--- | :--- |
| **Node.js** | v14+ (v24 compatible) | Asynchronous event-driven JavaScript runtime engine that executes server-side code and powers build tools. |
| **TypeScript** | ~4.3.5 | Statically typed superset of JavaScript used across Angular. Provides compilation-time error detection, strict typing for models, and IDE autocompletion. |
| **JavaScript (ES6+)** | Modern | Language used in Node.js/Express backend (Promises, async/await, arrow functions, destructuring). |
| **HTML5 & CSS3** | Standard | Semantic markup and custom modern CSS variables for styling without heavy external CSS frameworks. |

---

### 3.2 Backend Dependencies (`backend/package.json`)

#### Production Dependencies (`dependencies`):
1. **`express` (`^4.19.2`)**:
   * *What it is*: Fast, unopinionated, minimalist web framework for Node.js.
   * *Role in EMS*: Handles incoming HTTP requests, matches them against registered routes (`/api/employees`), parses JSON payloads, and sends JSON responses.
2. **`mysql2` (`^3.11.0`)**:
   * *What it is*: High-performance MySQL client for Node.js with support for Promises and prepared statements.
   * *Role in EMS*: Establishes connection pools to MySQL, executes parameterized SQL queries, and prevents SQL injection vulnerabilities.
3. **`cors` (`^2.8.5`)**:
   * *What it is*: Express middleware that configures Cross-Origin Resource Sharing headers.
   * *Role in EMS*: Allows the browser on `http://localhost:4200` (Angular) to make HTTP requests to `http://localhost:3000` (Express) without being blocked by browser Same-Origin Policy.
4. **`dotenv` (`^16.4.5`)**:
   * *What it is*: Zero-dependency module that loads environment variables from a `.env` file into Node's `process.env`.
   * *Role in EMS*: Separates database credentials (host, user, password, port) from code, adhering to 12-Factor App methodology.

#### Development Dependencies (`devDependencies`):
1. **`nodemon` (`^3.1.4`)**:
   * *What it is*: Tool that monitors directory files and automatically restarts the Node server upon code modifications.
   * *Role in EMS*: Enhances developer velocity during backend debugging and development (`npm run dev`).

---

### 3.3 Frontend Dependencies (`frontend/package.json`)

#### Core Angular Framework Packages:
1. **`@angular/core` (`~12.2.0`)**:
   * The fundamental engine of Angular. Provides component decorators (`@Component`), dependency injection (`@Injectable`), lifecycle hooks (`OnInit`), and the Angular rendering pipeline.
2. **`@angular/common` (`~12.2.0`)**:
   * Common Angular directives and pipes like `*ngIf`, `*ngFor`, `currency`, `date`, and `lowercase`.
3. **`@angular/common/http` (`~12.2.0`)**:
   * Provides `HttpClientModule` and `HttpClient`, enabling typed, observable-based HTTP requests (`get`, `post`, `put`, `delete`).
4. **`@angular/forms` (`~12.2.0`)**:
   * Provides `ReactiveFormsModule`, `FormBuilder`, `FormGroup`, `FormControl`, and built-in validators (`Validators.required`, `Validators.email`, `Validators.min`).
5. **`@angular/router` (`~12.2.0`)**:
   * Provides single-page navigation, mapping URL paths to components, extracting path parameters (`:id`), and route redirects.
6. **`@angular/platform-browser` & `@angular/platform-browser-dynamic` (`~12.2.0`)**:
   * Boots and renders the Angular application within DOM-based desktop and mobile web browsers.
7. **`zone.js` (`~0.11.4`)**:
   * Execution context library that intercepts asynchronous browser tasks (clicks, timers, HTTP responses) and notifies Angular to run change detection.
8. **`rxjs` (`~6.6.0`)**:
   * Reactive Extensions for JavaScript. Handles asynchronous streams via `Observable`, `subscribe`, and event transformations.
9. **`tslib` (`^2.3.0`)**:
   * Runtime library containing TypeScript helper functions used when compiled JavaScript targets older specifications.

#### Build Tools & Development Dependencies:
1. **`@angular/cli` (`~12.2.0`)**:
   * Official command-line interface for scaffolding, building, serving, and testing Angular applications.
2. **`@angular-devkit/build-angular` (`~12.2.0`)**:
   * Webpack-based build system responsible for bundling, minifying, tree-shaking, and Ahead-of-Time (AOT) compilation.
3. **`@angular/compiler-cli` (`~12.2.0`)**:
   * Compiles Angular templates into efficient executable JavaScript instructions.

---

## 4. Core Architectural Concepts & Design Patterns

### 4.1 Single Page Application (SPA) vs. Multi-Page Application (MPA)
* Traditional MPAs request a brand new HTML document from the server on every link click, causing full-page reloads and white flashes.
* This project is an **SPA**: the initial request loads a single shell document (`index.html`) along with compiled JavaScript bundles. When the user navigates between `/`, `/add`, `/edit/1`, and `/view/1`, the Angular Router intercepts the browser URL, destroys unneeded view components, and mounts new components dynamically into `<router-outlet>` without reloading the page.

### 4.2 Reactive Forms (Model-Driven Approach)
Angular provides two approaches to forms: **Template-Driven** and **Reactive**.
* This project utilizes **Reactive Forms** (`ReactiveFormsModule`).
* **Why**: Reactive forms define the form model programmatically in TypeScript (`FormBuilder.group({...})`). This enables predictable immutability, synchronous unit testing, dynamic validator addition, and fine-grained control over touch states (`markAllAsTouched()`).

### 4.3 Observables vs. Promises
* Native browser `fetch` and JavaScript Promises handle single asynchronous values that cannot be cancelled once initiated.
* Angular's `HttpClient` returns **RxJS Observables**. Observables represent declarative asynchronous data streams that can be cancelled (unsubscribed), retried, debounced, combined with other streams, and mapped over time.

### 4.4 Connection Pooling in Relational Databases
* Opening a TCP connection to MySQL requires a three-way network handshake, authentication verification, and memory allocation. Opening and closing connections for every single HTTP request degrades server throughput under load.
* In `config/db.js`, `mysql2.createPool({ connectionLimit: 10 })` maintains a ready pool of 10 open connections. When an API request arrives, it borrows an idle connection, executes the query, and instantly returns it to the pool for the next user.

---

## 5. Frontend Deep-Dive (Angular 12 SPA)

### 5.1 Project Directory Breakdown
```
frontend/src/
├── app/
│   ├── components/
│   │   ├── employee-detail/    # Inspect single employee details
│   │   ├── employee-form/      # Unified Add/Edit employee form
│   │   └── employee-list/      # Searchable, filterable employee table
│   ├── models/
│   │   └── employee.ts         # TypeScript data contract
│   ├── services/
│   │   └── employee.service.ts # HTTP network communication layer
│   ├── app-routing.module.ts   # URL route declarations
│   ├── app.component.html      # Root master template with header/footer
│   ├── app.component.ts        # Root component logic
│   └── app.module.ts           # Root dependency injection container
├── environments/
│   ├── environment.ts          # Local development API endpoint
│   └── environment.prod.ts     # Production deployment API endpoint
├── index.html                  # Entry HTML host page
├── main.ts                     # Application bootstrap entry point
├── polyfills.ts                # Browser compatibility shims
└── styles.css                  # Global design system & theme variables
```

### 5.2 The Employee Model (`models/employee.ts`)
Defines the strict TypeScript data structure matching the database entity:
```typescript
export interface Employee {
  id?: number;              // Optional for new records before DB assignment
  name: string;            // Employee full name
  email: string;           // Unique corporate email address
  department: string;      // Assigned department (e.g., Engineering)
  designation: string;     // Job title (e.g., Software Engineer)
  salary: number;          // Compensation figure
  created_at?: string;     // ISO timestamp of creation
  updated_at?: string;     // ISO timestamp of last modification
}
```

### 5.3 The Employee Service Layer (`services/employee.service.ts`)
Encapsulates all REST network calls, insulating components from HTTP configuration:
* `getAll(): Observable<Employee[]>` -> `GET /api/employees`
* `getById(id: number): Observable<Employee>` -> `GET /api/employees/:id`
* `create(employee: Employee): Observable<Employee>` -> `POST /api/employees`
* `update(id: number, employee: Employee): Observable<Employee>` -> `PUT /api/employees/:id`
* `delete(id: number): Observable<{ message: string; id: number }>` -> `DELETE /api/employees/:id`

### 5.4 Components Breakdown

#### 1. `EmployeeListComponent`
* **Template**: Renders header controls, a search input bound via `[(ngModel)]="searchTerm"`, an "+ Add Employee" action button, and a responsive table.
* **Logic**:
  - `ngOnInit()` invokes `loadEmployees()` which subscribes to `employeeService.getAll()`.
  - Getter `filteredEmployees` performs case-insensitive substring matching on all fields.
  - `deleteEmployee()` triggers a safety confirmation modal (`confirm(...)`). If confirmed, it dispatches the delete request, updates local array state via `filter()`, and flashes a 3-second success message.
* **Responsive Card Fallback**: Via CSS media queries (`@media (max-width: 768px)`), table rows collapse into vertical cards so the UI remains pristine on mobile phones.

#### 2. `EmployeeFormComponent`
* **Dual Operation**: Detects whether the route is `/add` or `/edit/:id`.
* **Validation Rules**:
  - `name`: Required, max 100 characters.
  - `email`: Required, valid email pattern.
  - `department`: Required.
  - `designation`: Required.
  - `salary`: Required, non-negative (`Validators.min(0)`).
* **Error Handling**: Captures server validation errors (such as HTTP 409 Duplicate Email) and renders user-friendly alerts.

#### 3. `EmployeeDetailComponent`
* Reads the employee `id` from the URL parameters via `route.snapshot.paramMap.get('id')`.
* Retrieves the single employee record and presents a profile card featuring created and updated timestamps, department badges, and formatted currency.

---

## 6. Backend Deep-Dive (Node.js & Express REST API)

### 6.1 Server Entry Point (`backend/server.js`)
Establishes the middleware pipeline:
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());              // Enable Cross-Origin requests
app.use(express.json());      // Parse request body JSON

app.use('/api/employees', employeeRoutes); // Mount modular employee routes
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
```

### 6.2 Route Declarations (`backend/routes/employee.routes.js`)
Maps incoming HTTP methods to controller logic:
* `router.get('/', controller.getAllEmployees);`
* `router.get('/:id', controller.getEmployeeById);`
* `router.post('/', controller.createEmployee);`
* `router.put('/:id', controller.updateEmployee);`
* `router.delete('/:id', controller.deleteEmployee);`

### 6.3 Controller Handlers (`backend/controllers/employee.controller.js`)

1. **Input Validation Helper (`validateEmployee`)**:
   Runs server-side assertions on all fields before touching the database. Validates non-empty strings, regex email format, and numerical positive salary.
2. **`getAllEmployees`**:
   Executes `SELECT * FROM employees ORDER BY id DESC`. Returns array of employees.
3. **`getEmployeeById`**:
   Executes parameterized query `SELECT * FROM employees WHERE id = ?`. If empty, returns HTTP 404 (`Employee not found.`).
4. **`createEmployee`**:
   Validates inputs, executes `INSERT INTO employees (...) VALUES (?, ?, ?, ?, ?)`. If MySQL throws `ER_DUP_ENTRY`, responds with HTTP 409 Conflict. Returns created record with HTTP 201 Created.
5. **`updateEmployee`**:
   Executes `UPDATE employees SET ... WHERE id = ?`. Verifies `result.affectedRows > 0`.
6. **`deleteEmployee`**:
   Executes `DELETE FROM employees WHERE id = ?`. Returns confirmation response.

---

## 7. Database Design & Dual-Storage Architecture

### 7.1 Relational Schema (`backend/db/schema.sql`)

```sql
CREATE DATABASE IF NOT EXISTS employee_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)   NOT NULL,
  email       VARCHAR(150)   NOT NULL UNIQUE,
  department  VARCHAR(100)   NOT NULL,
  designation VARCHAR(100)   NOT NULL,
  salary      DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Field Explanations:
* `id INT AUTO_INCREMENT PRIMARY KEY`: Unique integer identifier indexed via B-Tree for fast O(1) lookups.
* `email VARCHAR(150) UNIQUE`: Guarantees no two employees share the same corporate email.
* `salary DECIMAL(12, 2)`: Exact fixed-point numerical representation to avoid floating-point rounding inaccuracies in financial data.
* `created_at` & `updated_at`: Automated audit timestamps maintained natively by the database engine.

### 7.2 Zero-Config Local Fallback Database (`backend/config/fallbackDb.js`)
When developers run the application without installing MySQL:
* `fallbackDb.js` implements the exact MySQL Promise interface: `query(sql, params)`.
* It loads initial seed data matching `schema.sql` (Aarav Sharma, Diya Nair, Rohan Verma, Ishita Rao).
* All insertions, edits, and deletions are saved to `backend/data/employees.json` so data persists across server restarts.
* Transparent proxy in `config/db.js` ensures controller code requires zero modifications.

---

## 8. Exhaustive Command Reference & Command Dictionary

This section provides a complete dictionary of every command utilized to build, run, configure, and maintain the system.

### 8.1 Node.js & Package Management Commands

| Command | Exact Meaning and Purpose |
| :--- | :--- |
| `npm install` | Reads `package.json` in the current folder, downloads all listed dependencies into `node_modules`, and creates a `package-lock.json`. |
| `npm install --legacy-peer-deps` | Instructs npm to ignore strict peer-dependency version conflicts between older framework packages (Angular 12) and newer npm versions. |
| `npm start` | Executes the pre-defined `"start"` script in `package.json` (runs `node server.js` in backend, or `ng serve` in frontend). |
| `npm run dev` | Executes the development script utilizing `nodemon` for automatic server reloading upon file saves. |
| `npm run init-db` | Executes `node db/init-db.js`, which reads `db/schema.sql` and executes table creation against MySQL automatically. |
| `npx ng build` | Compiles the Angular application into static HTML, CSS, and JS bundles saved in `frontend/dist/`. |
| `npx ng serve` | Launches the local Webpack dev server, compiles bundles in memory, watches for changes, and serves on port 4200. |

### 8.2 Environment Variable & Compatibility Flags

| Command / Flag | Exact Meaning and Purpose |
| :--- | :--- |
| `$env:NODE_OPTIONS="--openssl-legacy-provider"` | **PowerShell flag**: In Node 17+, Node upgraded from OpenSSL 1.1.1 to OpenSSL 3.0, disabling older cryptographic hash algorithms (like MD4) used in Webpack 5/Angular 12. This flag reenables legacy algorithms, preventing `ERR_OSSL_EVP_UNSUPPORTED` build errors. |
| `export NODE_OPTIONS=--openssl-legacy-provider` | **Linux / macOS equivalent** of the above OpenSSL legacy provider command. |

### 8.3 Git Version Control Commands

| Command | Exact Meaning and Purpose |
| :--- | :--- |
| `git status` | Displays the status of the working directory and staging area, highlighting modified, staged, or untracked files. |
| `git add -A` | Stages all changes (new files, modifications, and deletions) across the entire working tree for the next commit. |
| `git commit -m "message"` | Records staged snapshots to the repository history with an explanatory message. |
| `git checkout --orphan <name>` | Creates a completely new, independent branch with zero parent commits and a clean history. |
| `git branch -M main` | Renames the current branch forcibly to `main`. |
| `git push origin main` | Transmits local commits on branch `main` to the remote repository named `origin`. |
### 8.4 Docker & Containerization Commands

| Command | Exact Meaning and Purpose |
| :--- | :--- |
| `docker compose up --build` | Builds local images for `backend` and `frontend`, pulls `mysql:8.0`, sets up networks and persistent volumes, and boots the entire full-stack application. |
| `docker compose down` | Gracefully stops and tears down running containers, networks, and internal links without deleting persistent database volumes. |
| `docker compose down -v` | Tears down containers AND removes the persistent named volume (`mysql_data`), resetting the database to factory seed data. |
| `docker compose logs -f` | Streams real-time live logs from all three containers (`ems-frontend-ui`, `ems-backend-api`, `ems-mysql-db`) simultaneously. |

---

## 9. Step-by-Step Setup, Deployment & Execution Guide

### Option A: Automated Multi-Container Deployment with Docker (Recommended)

To run the complete production-grade stack (MySQL 8.0 + Express API + Production Angular Nginx) with zero host dependencies installed:

```bash
docker compose up --build
```

- **Frontend Application**: [http://localhost:4200](http://localhost:4200)
- **Backend REST API**: [http://localhost:3000](http://localhost:3000)
- **MySQL Database**: `localhost:3306`

---

### Option B: Manual Host Setup (Without Docker)

#### Phase 1: Clone the Repository
```bash
git clone https://github.com/kshitijkhede/employee-management-system.git
cd employee-management-system
```

#### Phase 2: Launch the Backend API
```bash
cd backend
npm install
npm start
```
* The server will boot on `http://localhost:3000`.
* If MySQL is running, it connects automatically.
* If MySQL is not running, it initializes the local fallback database.

#### Phase 3: Launch the Frontend Client
In a second terminal window:
```bash
cd frontend
npm install --legacy-peer-deps

# For Node 17+ on Windows PowerShell:
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start

# For Node 17+ on Linux/macOS:
export NODE_OPTIONS=--openssl-legacy-provider && npm start
```

#### Phase 4: Access the System
Open your web browser and navigate to:
```
http://localhost:4200
```

---

## 10. Alternative Technologies, Trade-offs & Future Enhancements

### 10.1 Comparative Technology Evaluation

| Architectural Layer | Chosen in EMS | Viable Alternatives | Trade-offs & Comparison |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Angular 12** | React.js, Vue.js, Svelte | Angular provides a complete battery-included framework (Routing, Forms, HttpClient, Dependency Injection) out of the box. React requires assembling external libraries (React Router, Axios, Formik), while Vue provides a lighter curve. |
| **Styling Solution** | **Vanilla CSS3** | Tailwind CSS, Bootstrap, Angular Material | Vanilla CSS keeps the bundle size minuscule and provides full custom styling control without third-party design dependencies. Tailwind accelerates rapid styling, while Angular Material provides pre-built accessible UI widgets. |
| **Backend Framework** | **Express.js** | NestJS, Fastify, Koa | Express is the most battle-tested Node framework with minimal overhead. NestJS provides Angular-like TypeScript architecture (controllers, modules, providers) which is ideal for large enterprise backend codebases. |
| **Database Engine** | **MySQL** | PostgreSQL, MongoDB, SQLite | MySQL is a world standard for structured relational data and ACID compliance. PostgreSQL provides advanced JSON indexing and GIS types. MongoDB is schemaless (better for unstructured documents). |
| **Database Access** | **Raw SQL (`mysql2`)** | Prisma, TypeORM, Sequelize | Raw SQL provides total transparency, zero ORM overhead, and fine-tuned control over queries. ORMs (like Prisma) offer auto-generated TypeScript types and automatic schema migrations. |

### 10.2 Implemented & Recommended Enhancements

1. **Containerization with Docker** *(✅ Implemented)*:
   - Added `Dockerfile` for backend (Node 18 Alpine), multi-stage `Dockerfile` with Nginx for frontend, and root `docker-compose.yml` orchestrating MySQL 8.0, Express, and Angular.
2. **Authentication & RBAC** *(Recommended Next Step)*:
   - Integrate **JSON Web Tokens (JWT)** with HTTP-only cookies and bcrypt password hashing.
   - Implement Role-Based Access Control (`Admin`, `Manager`, `Employee`) with Angular Route Guards (`CanActivate`).
3. **Server-Side Pagination & Sorting** *(Recommended for Large Datasets)*:
   - For datasets exceeding 10,000 employees, transition from client-side filtering to SQL pagination using `LIMIT` and `OFFSET`.
4. **Automated Testing Suite** *(Recommended for CI/CD)*:
   - Frontend unit tests via Jasmine & Karma for components and services.
   - Backend integration tests via Jest and Supertest for REST API endpoints.

---
*Documentation compiled and verified for Employee Management System.*
