
var express = require('express');
var router = express.Router();
var csrf = require('csurf');
// var passport = require('passport');

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
var Option = require('../models/option')
// ======================================================== mongodb
var mongoose = require('mongoose');
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/shoppingcart';
// =====================================join table
var MJ = require("mongo-fast-join"),
mongoJoin = new MJ();
// =====================================end join table

// ======================================================== ckeditor
var bodyParser = require('body-parser');
var multer  =   require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
// =======================================================end ckeditor
// ============================ckeditor
var storage = multer.diskStorage({
  destination: 'public/upload/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, Math.floor(Math.random()*9000000000) + 1000000000 + path.extname(file.originalname))
    })
  }
})
var upload = multer({ storage: storage });
// ============================end ckeditor


// ===============================ckeditor
router.get('/files', function (req, res) {
  const images = fs.readdirSync('public/upload')
  var sorted = []
  for (let item of images){
      if(item.split('.').pop() === 'png'
      || item.split('.').pop() === 'jpg'
      || item.split('.').pop() === 'jpeg'
      || item.split('.').pop() === 'svg'){
          var abc = {
                "image" : "/upload/"+item,
                "folder" : '/'
          }
          sorted.push(abc)
      }
  }
  res.send(sorted);
})

router.post('/upload', upload.array('flFileUpload', 12), function (req, res, next) {
    res.redirect('back');
});

router.post('/delete_file', function(req, res, next){
  var url_del = 'public' + req.body.url_del
  console.log(url_del)
  if(fs.existsSync(url_del)){
    fs.unlinkSync(url_del)
  }
  res.redirect('back')
});
// ================================end ckeditor

// var csrfProtection = csrf();

// router.use(csrfProtection);


/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  // Option.findOne({ '_id': '5a04f42dc2810309b4e760af' },function(err, opt){
  //   console.log(opt);
  //   res.render('shop/index', { title: 'Shopping Cart HK1992', opt:opt, successMsg: successMsg, noMessages: !successMsg});
  // });
  // mongo.connect(url, function(err, db) {
  //   var dboption = db.collection('options').find( { "_id": "5a04f42dc2810309b4e760af" } );
  //   console.log(dboption);
  // });

  Product.find(function(err,docs){
      var productChunks = [];
      var chunkSize = 4;
      for(var i=0;i < docs.length;i += chunkSize){
        productChunks.push(docs.slice(i,i+chunkSize));
      }
      Option.findOne({ '_id': '5a04f42dc2810309b4e760af' },function(err, opt){
        console.log(opt);
        res.render('shop/index', { title: 'Shopping Cart HK1992', products:productChunks, opt:opt, successMsg: successMsg, noMessages: !successMsg});
      });
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
      paymentId: charge.id,
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
// ========================================================================================= page product

router.get('/alias', function(req, res, next){

});

// =========================================================================================end page product

module.exports = router;
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}