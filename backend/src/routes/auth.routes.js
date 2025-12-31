const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth'); 
const authController = require('../controllers/authController');

// Debugging logs (Check your terminal when starting the server)
if (!authController.register) console.error("❌ Error: authController.register is undefined");
if (!authController.login) console.error("❌ Error: authController.login is undefined");
if (!authController.updateProfile) console.error("❌ Error: authController.updateProfile is undefined");
if (!requireAuth) console.error("❌ Error: requireAuth is undefined");

router.post('/register', authController.register);
router.post('/login', authController.login);

// Update Profile Route
router.patch('/profile', requireAuth, authController.updateProfile);

module.exports = router;