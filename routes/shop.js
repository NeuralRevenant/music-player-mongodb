const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/isAuth');
const deleteNonExistFiles = require('../middleware/deleteNonExisted');
const clearPlaylist = require('../middleware/clear_emptied_list');

const router = express.Router();

router.get('/products/:productId', isAuth, deleteNonExistFiles, shopController.getProduct);

router.post('/filter', isAuth, deleteNonExistFiles, shopController.getFilter);

router.get('/playlist', isAuth, clearPlaylist, shopController.getPlaylist);

router.post('/remove', isAuth, shopController.removeFromPlaylist);

router.post('/add-to-playlist', isAuth, shopController.addToPlaylist);

router.get('/', isAuth, deleteNonExistFiles, shopController.getProducts);

module.exports = router;
