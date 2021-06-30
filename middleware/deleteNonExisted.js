const fs = require('fs');
const path = require('path');

const Product = require('../models/product');

module.exports = (req, res, next) => {
    Product.find({ userId: req.user._id }).then(products => {
        const deleteProducts = [];
        products.forEach(product => {
            if (!fs.existsSync(path.join(__dirname, '..', product.audioUrl))) {
                deleteProducts.push(product);
            }
        });
        return Product.deleteMany({ userId: req.user._id, _id: { $in: deleteProducts.map(product => product._id) } });
    }).then(products => {
        // console.log(products);
        return next();
    }).catch(err => {
        const error = new Error("Server-Side Error! Please try again.");
        error.httpStatusCode = 500;
        return next(error);
    });
};