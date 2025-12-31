const express = require('express');
const router = express.Router();
const browseController = require('../controllers/browseController');
const { optionalAuth } = require('../middleware/auth');
// This matches: /browse/series/:seriesId/episodes
router.get('/series/:id/episodes', optionalAuth, browseController.getSeriesEpisodes);

module.exports = router;