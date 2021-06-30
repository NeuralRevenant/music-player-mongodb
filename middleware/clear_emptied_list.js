const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const deleteList = [];
    User.findOne({ _id: req.user._id }).populate('playList.audioId').then(user => {
        user.playList.forEach((item, ind, arr) => {
            if (!item.audioId?.audioUrl) {
                deleteList.push(item);
            } else if (!fs.existsSync(path.join(__dirname, '..', item.audioId.audioUrl))) {
                deleteList.push(item);
            }
        });
        return req.user.clearPlaylist(deleteList);
    }).then(result => {
        return next();
    }).catch(err => next(new Error("Error! Please try again.")));
};