const express = require('express');
const router = express.Router();

// ✅ FIX 1: Destructure 'requireAuth' from the middleware object
const { requireAuth } = require('../middleware/auth'); 

const { 
  getMySubscription, 
  subscribe, 
  cancelSubscription,
  resumeSubscription 
} = require('../controllers/subscriptionController');

// ✅ FIX 2: Use 'requireAuth' instead of 'auth' in all routes
router.get('/my-subscription', requireAuth, getMySubscription);
router.post('/subscribe', requireAuth, subscribe);
router.post('/cancel', requireAuth, cancelSubscription);
router.post('/resume', requireAuth, resumeSubscription);

module.exports = router;