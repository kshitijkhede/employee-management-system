/**
 * Employee controller — the CRUD logic that talks to MySQL.
 * Each function is an Express handler (req, res).
 */
const db = require('../config/db');

// Basic validation helper used by create/update.
function validateEmployee(body) {
  const errors = [];
  const { name, email, department, designation, salary } = body;

  if (!name || !name.trim()) errors.push('Name is required.');
  if (!email || !email.trim()) errors.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email is not valid.');
  if (!department || !department.trim()) errors.push('Department is required.');
  if (!designation || !designation.trim()) errors.push('Designation is required.');
  if (salary === undefined || salary === null || salary === '' || isNaN(Number(salary)) || Number(salary) < 0) {
    errors.push('Salary must be a non-negative number.');
  }
  return errors;
}

// GET /api/employees  → list all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employees.', error: err.message });
  }
};

// GET /api/employees/:id  → single employee (used by the "view" screen)
exports.getEmployeeById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employee.', error: err.message });
  }
};

// POST /api/employees  → add a new employee
exports.createEmployee = async (req, res) => {
  const errors = validateEmployee(req.body);
  if (errors.length) return res.status(400).json({ message: 'Validation failed.', errors });

  const { name, email, department, designation, salary } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO employees (name, email, department, designation, salary) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), department.trim(), designation.trim(), Number(salary)]
    );
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An employee with this email already exists.' });
    }
    res.status(500).json({ message: 'Failed to create employee.', error: err.message });
  }
};

// PUT /api/employees/:id  → update an employee
exports.updateEmployee = async (req, res) => {
  const errors = validateEmployee(req.body);
  if (errors.length) return res.status(400).json({ message: 'Validation failed.', errors });

  const { name, email, department, designation, salary } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE employees SET name = ?, email = ?, department = ?, designation = ?, salary = ? WHERE id = ?',
      [name.trim(), email.trim(), department.trim(), designation.trim(), Number(salary), req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An employee with this email already exists.' });
    }
    res.status(500).json({ message: 'Failed to update employee.', error: err.message });
  }
};

// DELETE /api/employees/:id  → remove an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json({ message: 'Employee deleted successfully.', id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete employee.', error: err.message });
  }
};
