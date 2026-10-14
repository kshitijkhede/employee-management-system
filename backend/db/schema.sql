-- ============================================================
--  Employee Management System - Database schema
--  Run this once to create the database and the employees table.
--
--    mysql -u root -p < db/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS employee_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  department  VARCHAR(100)  NOT NULL,
  designation VARCHAR(100)  NOT NULL,
  salary      DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional seed data so the table-based UI is not empty on first run.
INSERT INTO employees (name, email, department, designation, salary) VALUES
  ('Aarav Sharma',   'aarav.sharma@example.com',   'Engineering', 'Software Engineer',      72000.00),
  ('Diya Nair',      'diya.nair@example.com',      'Human Resources', 'HR Manager',         68000.00),
  ('Rohan Verma',    'rohan.verma@example.com',    'Finance',     'Financial Analyst',      75000.00),
  ('Ishita Rao',     'ishita.rao@example.com',     'Marketing',   'Marketing Lead',         70000.00)
ON DUPLICATE KEY UPDATE email = VALUES(email);
