const express = require('express');
const { requireAuth } = require('../middleware/auth'); // Ensure you have this middleware
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// ✅ Define the routes mapping to controller functions
router.get('/my-subscription', subscriptionController.getMySubscription);
router.post('/subscribe', subscriptionController.subscribe);
router.post('/cancel', subscriptionController.cancelSubscription);

module.exports = router;