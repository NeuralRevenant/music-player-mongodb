const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/add-product', isAuth,
    [
        body('title')
            .notEmpty()
            .withMessage('Please do not leave any field empty!')
            .trim(),
        body('repeat', 'Invalid repeat input Plz correct it!')
            .notEmpty()
            .isInt({ min: 1, max: 50 }),
        body('description', 'Please enter some description!')
            .notEmpty()
            .trim()
    ], adminController.postAddProduct);

router.post('/edit-product', isAuth,
    [
        body('title')
            .notEmpty()
            .withMessage('Please do not leave any field empty!')
            .trim(),
        body('repeat', 'Invalid repeat input Plz correct it!')
            .notEmpty()
            .isInt({ min: 1, max: 50 }),
        body('description', 'Please enter some description!')
            .notEmpty()
            .trim()
    ], adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
