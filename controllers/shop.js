const searchAlgo = require('../util/search');
const Product = require('../models/product');
const User = require('../models/user');

const ITEMS_PER_PG = 2;

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    if (product.userId.toString() !== req.user._id.toString()) {
      const error = new Error("Not Authorized!");
      error.httpStatusCode = 500;
      return next(error);
    }
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products',
      filetype: product.fileType
    });
  }).catch(err => {
    const error = new Error("No such track found in your playlist!");
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let items;
  // Math.PI is also in java
  // Math class is obtained from JS in-built packages just like Math Class in Java
  Product.find({ userId: req.user._id }).countDocuments().then(count => {
    items = count;
    return Product.find({ userId: req.user._id }).skip((page - 1) * ITEMS_PER_PG).limit(ITEMS_PER_PG);
  }).then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'PlayList',
      path: '/',
      currentPage: page,
      hasNextPage: (page < Math.ceil(items / ITEMS_PER_PG)) ? true : false,
      hasPreviousPage: (page > 1) ? true : false,
      nextPage: page + 1,
      previousPage: page - 1,
      filter: false
    });
  }).catch(err => {
    const error = new Error("Server-Error! Will be fixed soon!");
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getPlaylist = (req, res, next) => {
  User.findOne({ _id: req.user._id }).populate('playList.audioId').then(user => {
    let count = 0;
    if (user.playList) {
      const products = user.playList.map(item => {
        count++;
        let newItem = item;
        newItem.no = "no" + count;
        return newItem;
      });
      res.render('admin/playlist', {
        prods: products,
        pageTitle: 'PlayList',
        path: '/playlist'
      });
    } else {
      res.render('admin/playlist', {
        prods: [],
        pageTitle: 'PlayList',
        path: '/playlist'
      });
    }
  }).catch(err => {
    return next(new Error("Error! Plz try again!"));
  });
};

exports.addToPlaylist = (req, res, next) => {
  const audioId = req.body.audioId;
  Product.findOne({ _id: audioId, userId: req.user._id }).then(product => {
    return req.user.addToPlaylist(product);
  }).then(user => {
    res.redirect('/playlist');
  }).catch(err => {
    if (err.message === 'Already in your playlist! Can\'t add twice.') {
      return next(new Error(err.message));
    }
    next(new Error("Error! Please try again."));
    // next(new Error("Error! Plz try again."));
  });
};

exports.removeFromPlaylist = (req, res, next) => {
  const audioId = req.body.audioId;
  req.user.removeFromPlaylist(audioId).then(user => {
    res.redirect('/playlist');
  }).catch(err => {
    if (err.message === 'No such music in your playlist. Please check once again.') {
      return next(new Error(err.message));
    }
    next(new Error("Error! Please try again."));
  });
};

exports.getFilter = (req, res, next) => {
  const filteredProds = [];
  // const page = +req.query.page || 1;
  const filter = req.body.filter;
  // console.log(filter);
  Product.find({ userId: req.user._id }).then(products => {
    if (!products.length) {
      return res.redirect('/');
    }
    products.forEach(product => {
      filteredProds.push([product, searchAlgo.filter(product.title, filter)]);
    });
    filteredProds.sort((a, b) => {
      // console.log(a[1]);
      // console.log(b[1]);
      if (a[1] == b[1]) {
        if (searchAlgo.minChanges(a[0].title, filter) == searchAlgo.minChanges(b[0].title, filter)) {
          return 0;
        } else {
          return (searchAlgo.minChanges(a[0].title, filter) < searchAlgo.minChanges(b[0].title, filter)) ? -1 : 1;
        }
      } else {
        return (a[1] < b[1]) ? 1 : -1;
      }
    });
    const finalProds = [];
    const length = Math.min(filteredProds.length, ITEMS_PER_PG);
    for (let i = 0; i < length; i++) {
      finalProds.push(filteredProds[i][0]);
    }
    res.render('admin/products', {
      path: '/',
      pageTitle: 'PlayList',
      prods: finalProds,
      filter: true
    });
  }).catch(err => {
    const error = new Error("Error! No such track found!");
    error.httpStatusCode = 500;
    return next(error);
  });
};


