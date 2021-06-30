const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const fileHelper = require('../util/file');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMsg: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const repeat = +req.body.repeat;
  const description = req.body.description;
  const audio = req.file;
  if (!audio) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title: title,
        repeat: repeat,
        description: description
      },
      errorMsg: 'Attached file is not an audio/video file! Please attach a music file.',
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title: title,
        repeat: repeat,
        description: description
      },
      errorMsg: errors.array()[0].msg
    });
  }
  // console.log(audio.mimetype);
  const product = new Product({
    title: title,
    repeat: +repeat,
    audioUrl: audio.path,
    description: description,
    fileType: audio.mimetype,
    userId: req.user//mongoose will extract the id out of obj!
  });
  product.save().then(result => {
    res.redirect('/');
  }).catch(err => {
    console.log(err);
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title: title,
        repeat: repeat,
        description: description
      },
      errorMsg: 'An Error Occurred! Plz try again!',
    });
  });
};

exports.getEditProduct = (req, res, next) => {
  const canEdit = req.query.edit;
  if (!canEdit) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    if (!product) {
      return res.redirect('/');
    }
    if (product.userId.toString() != req.user._id.toString()) {
      const error = new Error("Not Authorized!");
      error.httpStatusCode = 500;
      return next(error);
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: canEdit,
      product: product,
      errorMsg: null
    });
  }).catch(err => {
    console.log(err);
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: canEdit,
      product: product,
      errorMsg: 'An Error occurred! Plz try again!'
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedRepeat = +req.body.repeat;
  const updatedTitle = req.body.title;
  const audio = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title: updatedTitle,
        repeat: updatedRepeat,
        description: updatedDesc,
        _id: prodId
      },
      errorMsg: errors.array()[0].msg
    });
  }

  Product.findById(prodId).then(product => {
    if (product.userId.toString() !== req.user._id.toString()) {
      const error = new Error("Not Authorized!");
      // const error = new Error("Error! Try again");
      return next(error);
    }
    product.title = updatedTitle;
    product.repeat = updatedRepeat;
    product.description = updatedDesc;
    if (audio) {
      fileHelper.deleteFile(product.audioUrl);
      product.audioUrl = audio.path;
      product.fileType = audio.mimetype;
    }
    return product.save();
  }).then(product => {
    res.redirect('/');
  }).catch(err => {
    console.log(err);
    res.status(500).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title: updatedTitle,
        repeat: updatedRepeat,
        description: updatedDesc,
        _id: prodId
      },
      errorMsg: "An Error Occured! Plz try again!"
    });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    if (!product) {
      return res.redirect('/404');
    }
    if (product.userId.toString() !== req.user._id.toString()) {
      const error = new Error("Not Authorized!");
      error.httpStatusCode = 500;
      return next(error);
    }
    if (!fs.existsSync(path.join(__dirname, '..', product.audioUrl))) {
      const error = new Error("The audio track does not exist!");
      error.httpStatusCode = 404;
      return next(error);
    }
    fileHelper.deleteFile(product.audioUrl);
    Product.deleteOne({ _id: prodId, userId: req.user._id }).then(() => {
      res.redirect('/');
    }).catch(err => {
      const error = new Error("Error! Try again");
      return next(error);
    });
  }).catch(err => {
    const error = new Error("Error! Try again");
    return next(error);
  });
};

