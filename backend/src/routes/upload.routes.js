const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// ✅ Frontend calls: api.get('/upload/signature')
router.get('/signature', requireAuth, uploadController.getUploadSignature);

module.exports = router;