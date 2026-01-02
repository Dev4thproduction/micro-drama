const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth'); // ✅ MUST have optionalAuth
const contentController = require('../controllers/contentController');

const router = express.Router();

// --- PUBLIC ---
router.get('/home', contentController.getHomeContent);
router.get('/browse', contentController.searchContent);

// ✅ Apply optionalAuth (Allows backend to see if user is subscribed)
router.get('/series/:seriesId', optionalAuth, contentController.getSeriesDetails);

// ✅ Apply optionalAuth (Allows Guests to watch Ep 1-2, blocks others)
router.get('/episodes/:episodeId', optionalAuth, contentController.getEpisodeDetails);

// --- PROTECTED ---
router.get('/series', requireAuth, contentController.searchContent); 
router.get('/series/:seriesId/episodes', requireAuth, contentController.listPublishedEpisodes);

router.put('/episodes/:id', requireAuth, contentController.updateEpisode);
router.delete('/episodes/:id', requireAuth, contentController.deleteEpisode);

module.exports = router;