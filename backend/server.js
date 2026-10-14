/**
 * Employee Management System — Express entry point.
 * Sets up middleware, mounts the employee API, and starts the server.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employee.routes');
const authRoutes = require('./routes/auth.routes');
const authenticateToken = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());              // allow the Angular dev server (port 4200) to call this API
app.use(express.json());      // parse JSON request bodies

// ---- Health check ----
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Employee Management API' });
});

// ---- Authentication Routes (Public / Login) ----
app.use('/api/auth', authRoutes);

// ---- Employee Routes (Protected by JWT) ----
app.use('/api/employees', authenticateToken, employeeRoutes);

// ---- 404 fallback ----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`[server] Employee Management API running on http://localhost:${PORT}`);
});

module.exports = app;
