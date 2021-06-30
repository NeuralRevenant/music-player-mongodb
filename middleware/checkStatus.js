module.exports = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.render('error', {
            pageTitle: 'Error',
            path: '/error',
            errorMsg: "Already signed in! Please log out first!",
            isAuthenticated: true
        });
    }
    next();
}