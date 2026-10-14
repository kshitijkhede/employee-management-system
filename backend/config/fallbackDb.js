/**
 * Lightweight persistent JSON-backed database fallback.
 * Allows the Employee Management System to run seamlessly without an active MySQL server.
 * Fully compatible with the mysql2 Promise pool interface: db.query(sql, params) -> [rows / result]
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'employees.json');

const SEED_DATA = [
  {
    id: 1,
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 72000.0,
    created_at: '2026-10-14 10:00:00',
    updated_at: '2026-10-14 10:00:00',
  },
  {
    id: 2,
    name: 'Diya Nair',
    email: 'diya.nair@example.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    salary: 68000.0,
    created_at: '2026-10-14 10:00:00',
    updated_at: '2026-10-14 10:00:00',
  },
  {
    id: 3,
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    department: 'Finance',
    designation: 'Financial Analyst',
    salary: 75000.0,
    created_at: '2026-10-14 10:00:00',
    updated_at: '2026-10-14 10:00:00',
  },
  {
    id: 4,
    name: 'Ishita Rao',
    email: 'ishita.rao@example.com',
    department: 'Marketing',
    designation: 'Marketing Lead',
    salary: 70000.0,
    created_at: '2026-10-14 10:00:00',
    updated_at: '2026-10-14 10:00:00',
  },
];

class FallbackDb {
  constructor() {
    this.employees = [];
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile, 'utf8');
        this.employees = JSON.parse(raw);
      } else {
        this.employees = [...SEED_DATA];
        this.save();
      }
    } catch (err) {
      console.warn('[fallback-db] Error loading file, using seed data:', err.message);
      this.employees = [...SEED_DATA];
    }
  }

  save() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(dataFile, JSON.stringify(this.employees, null, 2), 'utf8');
    } catch (err) {
      console.error('[fallback-db] Error saving file:', err.message);
    }
  }

  async getConnection() {
    return {
      release: () => {},
    };
  }

  async query(sql, params = []) {
    const trimmed = sql.trim().toUpperCase();

    // 1. SELECT all: SELECT * FROM employees ORDER BY id DESC
    if (trimmed.startsWith('SELECT * FROM EMPLOYEES') && trimmed.includes('ORDER BY')) {
      const sorted = [...this.employees].sort((a, b) => b.id - a.id);
      return [sorted, []];
    }

    // 2. SELECT one by id: SELECT * FROM employees WHERE id = ?
    if (trimmed.startsWith('SELECT * FROM EMPLOYEES WHERE ID = ?')) {
      const targetId = Number(params[0]);
      const found = this.employees.find((e) => e.id === targetId);
      return [found ? [{ ...found }] : [], []];
    }

    // 3. INSERT: INSERT INTO employees (name, email, department, designation, salary) VALUES (?, ?, ?, ?, ?)
    if (trimmed.startsWith('INSERT INTO EMPLOYEES')) {
      const [name, email, department, designation, salary] = params;
      const emailLower = email.toLowerCase();
      if (this.employees.some((e) => e.email.toLowerCase() === emailLower)) {
        const err = new Error(`Duplicate entry '${email}' for key 'employees.email'`);
        err.code = 'ER_DUP_ENTRY';
        throw err;
      }
      const maxId = this.employees.length > 0 ? Math.max(...this.employees.map((e) => e.id)) : 0;
      const newId = maxId + 1;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const newRecord = {
        id: newId,
        name,
        email,
        department,
        designation,
        salary: Number(salary),
        created_at: now,
        updated_at: now,
      };
      this.employees.push(newRecord);
      this.save();
      return [{ insertId: newId, affectedRows: 1 }, []];
    }

    // 4. UPDATE: UPDATE employees SET name = ?, email = ?, department = ?, designation = ?, salary = ? WHERE id = ?
    if (trimmed.startsWith('UPDATE EMPLOYEES')) {
      const [name, email, department, designation, salary, id] = params;
      const targetId = Number(id);
      const index = this.employees.findIndex((e) => e.id === targetId);
      if (index === -1) {
        return [{ affectedRows: 0 }, []];
      }
      const emailLower = email.toLowerCase();
      if (this.employees.some((e) => e.id !== targetId && e.email.toLowerCase() === emailLower)) {
        const err = new Error(`Duplicate entry '${email}' for key 'employees.email'`);
        err.code = 'ER_DUP_ENTRY';
        throw err;
      }
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      this.employees[index] = {
        ...this.employees[index],
        name,
        email,
        department,
        designation,
        salary: Number(salary),
        updated_at: now,
      };
      this.save();
      return [{ affectedRows: 1 }, []];
    }

    // 5. DELETE: DELETE FROM employees WHERE id = ?
    if (trimmed.startsWith('DELETE FROM EMPLOYEES WHERE ID = ?')) {
      const targetId = Number(params[0]);
      const index = this.employees.findIndex((e) => e.id === targetId);
      if (index === -1) {
        return [{ affectedRows: 0 }, []];
      }
      this.employees.splice(index, 1);
      this.save();
      return [{ affectedRows: 1 }, []];
    }

    console.warn('[fallback-db] Unhandled query pattern:', sql);
    return [[], []];
  }
}

module.exports = new FallbackDb();
