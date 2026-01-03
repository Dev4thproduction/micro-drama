const express = require('express');
const router = express.Router();
// Ensure allowRoles/requireAuth matches your middleware export
const { requireAuth, allowRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const contentController = require('../controllers/contentController'); // ✅ ADDED THIS IMPORT

// Apply admin check to all routes
// Assuming allowRoles returns an array of middleware
router.use(requireAuth);
if (allowRoles) {
    router.use(...(Array.isArray(allowRoles(['admin'])) ? allowRoles(['admin']) : [allowRoles(['admin'])]));
}

// --- DASHBOARD & ANALYTICS ---
router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// --- USER MANAGEMENT ---
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.patch('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/create-admin', adminController.createAdmin);


// --- MODERATION ---
router.get('/series/pending', adminController.listPendingSeries);
router.get('/episodes/pending', adminController.listPendingEpisodes);
router.post('/episodes/:episodeId/approve', adminController.approveEpisode);
router.patch('/reject-episode/:episodeId', adminController.rejectEpisode);

// --- SUBSCRIPTIONS ---
router.get('/subscriptions', adminController.getSubscribers);
router.post('/users/:userId/subscription', adminController.toggleSubscription);

// --- CMS: CONTENT MANAGEMENT (Series, Seasons, Episodes) ---
router.get('/series', contentController.getAllSeries);

// Seasons
router.get('/series/:seriesId/seasons', contentController.getSeasons);
router.post('/series/:seriesId/seasons', contentController.createSeason);

// Episodes
router.get('/series/:seriesId/episodes', contentController.getAdminEpisodes);
router.post('/series/:seriesId/episodes', contentController.createEpisode);

// Edit/Delete Episodes
router.patch('/episodes/:id', contentController.updateEpisode);
router.delete('/episodes/:id', contentController.deleteEpisode);

module.exports = router;