const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/mylist', userController.getMyList);
router.get('/mylist/check/:seriesId', userController.checkMyListStatus);
router.post('/mylist/:seriesId', userController.addToMyList);
router.delete('/mylist/:seriesId', userController.removeFromMyList);

module.exports = router;
