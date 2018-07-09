var express = require('express');
var router = express.Router();
var Product = require('../models/product');

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+ '_' +file.originalname);
        // cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
var mongoose = require('mongoose');
var mongo = require('mongodb');
var assert = require('assert');
var url = 'mongodb://localhost:27017/shoppingcart';

// uploadd ảnh


router.get('/index', function(req, res, next){
    res.render('admin/index', {admin: "ok",home:'ok'});
});
// ====================================================================Quản lý sản phẩm
// ==============================Danh sách sản phẩm
// router.get('/listProduct',function(req, res, next){
//     // res.render('admin/products/listProduct', {admin: 'ok', home: 'ok'});
//     var successMsg = req.flash('success')[0];
//     Product.find(function(err,docs){
//         var productChunks = [];
//         var chunkSize = 20;
//         for(var i=0;i < docs.length;i += chunkSize){
//           productChunks.push(docs.slice(i,i+chunkSize));
//         }
//         res.render('admin/products/listProduct', { admin: 'ok', home: 'ok', title: 'Shopping Cart HK1992', products:productChunks, successMsg: successMsg, noMessages: !successMsg});
//     });
// });

// router.get('/addProduct', function(req, res, next){
//     res.render('admin/products/addProduct', {admin: 'ok', home: 'ok', csrfToken:req.csrfToken()});
// });

// router.post('/addProduct', upload.single('file'), function(req, res, next){
//     console.log(req.file);
//     var items = {
//         imagePath:req.file.path,
//         imageResize:'',
//         title:req.body.title,
//         alias:req.body.alias,
//         description:req.body.description,
//         detail:req.body.detail,
//         price:req.body.price,
//         id_category:req.body.id_category,
//         position:req.body.position,
//     };
//     var itemalias = {
//         alias: req.body.alias,
//         title: req.body.title,
//     }
//     mongo.connect(url, function(err, db){
//         assert.equal(null, err);
//         db.collection('products').insertOne(items, function(err, result){
//             assert.equal(null, err);
//             db.close();
//         });
//         db.collection('aliass').insertOne(itemalias,function(err, result){
//             assert.equal(null, err);
//             db.close();
//         });
//     });
//     res.redirect('/admin/listProduct');
// });

// router.get('/editProduct/:id', function(req, res, next){
//     var idItem = req.params.id;
//     Product.findOne({'_id':idItem}, function(err, result){
//         res.render('admin/products/editProduct', {admin: 'ok', home: 'ok', csrfToken:req.csrfToken(), exit_id:idItem, result:result});
//     });
// });

// router.post('/editProduct', upload.single('file'), function(req, res, next){
//     var items = {
//         imagePath:req.file.path,
//         imageResize:'',
//         title:req.body.title,
//         alias:req.body.alias,
//         description:req.body.description,
//         detail:req.body.detail,
//         price:req.body.price,
//         id_category:req.body.id_category,
//         position:req.body.position,
//     };
//     var itemalias = {
//         alias: req.body.alias,
//         title: req.body.title,
//     };
//     var ids = req.body._id;
//     var alias = req.body.alias;
//     mongo.connect(url, function(err, db){
//         assert.equal(null, err);
//         db.collection('products').updateOne({'_id': objectId(ids)},{$set:item}, function(err, result){
//             assert.equal(null, err);
//             db.close();
//         });
//         db.collection('aliass').updateOne({'alias':alias}, function(err, result){
//             assert.equal(null, err);
//             db.close();
//         });
//     });
//     res.redirect('/admin/listProduct');
// });

// router.get('/deleteProduct/:id', function(req, res, next){
//     //var idItem = req.params.id;
//         console.log('ok');
// });

// ====================================================== Kết thúc models sản phẩm
module.exports = router

