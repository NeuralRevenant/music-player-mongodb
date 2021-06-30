const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const checkStatus = require('../middleware/checkStatus');
const isAuth = require('../middleware/isAuth');

const User = require('../models/user');

const router = express.Router();

router.post('/login', checkStatus,
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email !')
            .normalizeEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    if (!user) {
                        return Promise.reject('No such user with the given email !');
                    }
                });
            }),
        body('password', 'Invalid Password!')
            .isLength({ min: 5, max: 30 })
            .isAlphanumeric()
            .trim()
    ], authController.postLogin);

router.post('/logout', isAuth, authController.postLogout);

router.post('/signup', checkStatus,
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email !')
            .normalizeEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    if (user) {
                        return Promise.reject('E-mail already exists! Please use a different one!');
                    }
                });
            }),
        body('password', 'Please enter a password with only numbers/text and atleast 5 chars long !')
            .isLength({ min: 5, max: 30 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Enter same passwords in both the fields!');
                }
                return true; //no error
            })
    ],
    authController.postSignup);

router.post('/reset', checkStatus, [
    body('email')
        .isEmail()
        .withMessage('Not a valid email id. Please check again.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(user => {
                if (!user) {
                    return Promise.reject('User not found. Enter an existing email id!');
                }
            });
        })
], authController.postReset);

router.post('/new-password', checkStatus, authController.postNewPassword);

router.get('/login', checkStatus, authController.getLogin);

router.get('/signup', checkStatus, authController.getSignup);

router.get('/reset/:token', checkStatus, authController.getNewPassword);

router.get('/reset', checkStatus, authController.getReset);


module.exports = router;