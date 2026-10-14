const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.post('/login', controller.login);
router.get('/me', authenticateToken, controller.getMe);

module.exports = router;
