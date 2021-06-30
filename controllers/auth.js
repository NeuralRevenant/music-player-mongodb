const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: ''
    }
}));

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMsg: null,
        oldData: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMsg: null,
        oldData: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMsg: errors.array()[0].msg,
            oldData: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email: email }).then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMsg: 'Invalid email or password.',
                oldData: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }
        bcrypt.compare(password, user.password).then(isEqual => {
            if (isEqual) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.session.save(err => {
                    if (err) {
                        throw new Error("Error! Try again.");
                    }
                    res.redirect('/');
                });
            } else {
                res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMsg: 'Invalid email or password.',
                    oldData: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
        }).catch(err => {
            const error = new Error("Error! Try again later!");
            error.httpStatusCode = 500;
            return next(error);
        });
    }).catch(err => {
        const error = new Error("Error! Try again later!");
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postSignup = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMsg: errors.array()[0].msg,
            oldData: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }
    bcrypt.hash(password, 12).then(hashPassword => {
        const user = new User({
            email: email,
            password: hashPassword,
            playList: []
        });
        return user.save();
    }).then(result => {
        res.redirect('/login');
    }).catch(err => {
        const error = new Error("Error! Try again later!");
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            throw new Error("Error! Try again");
        }
        res.redirect('/login');
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMsg: null
    });
};

exports.postReset = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).render('error', {
            pageTitle: 'Error',
            path: '/error',
            isAuthenticated: false,
            errorMsg: errors.array()[0].msg
        });
    }
    let currentUser;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            // console.log(err);
            return res.status(500).render('error', {
                pageTitle: 'Error',
                path: '/error',
                isAuthenticated: false,
                errorMsg: "An error occurred. Please try again!"
            });
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email }).then(user => {
            currentUser = user;
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 10 * 60 * 1000;
            return user.save();
        }).then(user => {
            currentUser = user;
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: '',
                subject: 'Reset Password',
                html: `<div>
                        <p>Click this <a href="https://music-player2.herokuapp.com/reset/${token}">link</a> to set a new password. Link expires in 10 mins.</p>
                        <h3>Kindly ignore this messsage if it's not for you.</h3>
                        </div>`
            }).catch(err => {
                (async function () {
                    if (currentUser.resetToken || currentUser.resetTokenExpiration) {
                        currentUser.resetToken = undefined;
                        currentUser.resetTokenExpiration = undefined;
                        await currentUser.save();
                    }
                    const error = new Error("Mail could not be sent! Plz try again!");
                    error.httpStatusCode = 500;
                    return next(error);
                })();
            });
        }).catch(err => {
            (async function () {
                if (currentUser.resetToken || currentUser.resetTokenExpiration) {
                    currentUser.resetToken = undefined;
                    currentUser.resetTokenExpiration = undefined;
                    await currentUser.save();
                }
                const error = new Error("Error! Try again later!");
                error.httpStatusCode = 500;
                return next(error);
            })();
        });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
        if (!user) {
            return res.render('error', {
                pageTitle: 'Error!',
                path: '/error',
                isAuthenticated: false,
                errorMsg: "Token Expired! Try Again."
            });
        }

        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            userId: user._id.toString(),
            passwordToken: token
        });
    }).catch(err => {
        const error = new Error("Error! Try again later!");
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    }).then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    }).then(hashPassword => {
        resetUser.password = hashPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login');
    }).catch(err => {
        const error = new Error("Error! Please Try again.");
        error.httpStatusCode = 500;
        return next(error);
    });
};
