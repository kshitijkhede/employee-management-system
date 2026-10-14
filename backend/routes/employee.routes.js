/**
 * Employee routes — maps HTTP endpoints to controller functions.
 * Mounted at /api/employees in server.js
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/employee.controller');

router.get('/', controller.getAllEmployees);        // list all
router.get('/:id', controller.getEmployeeById);      // view one
router.post('/', controller.createEmployee);         // add
router.put('/:id', controller.updateEmployee);       // update
router.delete('/:id', controller.deleteEmployee);    // delete

module.exports = router;
