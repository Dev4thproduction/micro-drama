const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// My List (Bookmarks)
router.get('/mylist', userController.getMyList);
router.get('/mylist/check/:seriesId', userController.checkMyListStatus);
router.post('/mylist/:seriesId', userController.addToMyList);
router.delete('/mylist/:seriesId', userController.removeFromMyList);

// Watch History
router.get('/history', userController.getWatchHistory);
router.post('/history', userController.addToWatchHistory);

module.exports = router;
