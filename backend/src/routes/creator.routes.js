const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const creatorController = require('../controllers/creatorController');

router.use(requireAuth);

// Content
router.post('/series', creatorController.createSeries);
router.get('/content', creatorController.listContent);

// Episodes
router.post('/series/:seriesId/episodes', creatorController.createEpisode);
router.get('/series/:seriesId/episodes', creatorController.listEpisodes);

// Categories (This is what you need)
router.get('/categories', creatorController.getCategories);
router.post('/categories', creatorController.createCategory);
router.delete('/categories/:id', creatorController.deleteCategory);
// ... existing routes
router.put('/series/:seriesId', creatorController.updateSeries); // <--- Add this PUT route
router.delete('/series/:seriesId', creatorController.deleteSeries);

module.exports = router;