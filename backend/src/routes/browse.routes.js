const express = require('express');
const router = express.Router();
const browseController = require('../controllers/browseController');
const { optionalAuth } = require('../middleware/auth');

// ✅ NEW: Discover/Search Route (Matches /api/browse?q=...)
router.get('/', optionalAuth, browseController.getDiscover);

// ✅ NEW: Home Data Route
router.get('/home', optionalAuth, browseController.getHome);

// Series Episodes
router.get('/series/:id/episodes', optionalAuth, browseController.getSeriesEpisodes);

module.exports = router;