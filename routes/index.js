var express = require('express');
var router = express.Router();
// var csrf = require('csurf');
// var passport = require('passport');
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');

// var csrfProtection = csrf();

// router.use(csrfProtection);
/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err,docs){
      var productChunks = [];
      var chunkSize = 2;
      for(var i=0;i < docs.length;i += chunkSize){
        productChunks.push(docs.slice(i,i+chunkSize));
      }
      res.render('shop/index', { title: 'Shopping Cart HK1992',products:productChunks, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/reduce/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next){
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products:null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice:cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];

  res.render('shop/checkout', {total: cart.totalPrice,errMsg: errMsg, noError: !errMsg});
});


router.post('/checkout', isLoggedIn, function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
    "sk_test_D5HdelDaAW46ddjndjThSC13"
  );
  
  stripe.charges.create({
    amount: cart.totalPrice*100,
    currency: "VND",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Charge"
  }, function(err, charge) {
    // asynchronously called
    if(err){
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function(err, result){
      req.flash('success', 'Mua sản phẩm thành công!');
      req.session.cart = null;
      //res.redirect('/');
    });
    req.flash('success', 'Bạn đã mua sản phẩm thành công!');
    req.session.cart = null;
    res.redirect('/');
  });
});
// router.get('/', function(req, res, next) {
//   res.render('shop/index', { title: 'Shopping Cart HK1992'});
// });

// router.get('/user/signup', function(req, res, next){
//   var messages = req.flash('error');
//   res.render('user/signup', {csrfToken:req.csrfToken(),messages:messages,hasErrors:messages.length > 0});
// });

// router.post('/user/signup', passport.authenticate('local.signup', {
//   successRedirect: '/user/profile',
//   failureRedirect: '/user/signup',
//   failureFlash: true
// }));

// router.get('/user/signin', function(req, res, next){
//   var messages = req.flash('error');
//   res.render('user/signin', {csrfToken:req.csrfToken(),messages:messages,hasErrors:messages.length > 0});
// });

// router.post('/user/signin', passport.authenticate('local.signin', {
//   successRedirect: '/user/profile',
//   failureRedirect: '/user/signin',
//   failureFlash: true
// }));

// router.get('/user/profile', function(req, res, next){
//   res.render('user/profile');
// });

module.exports = router;
 
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

