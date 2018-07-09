var express = require('express');
var router = express.Router();
var Product = require('../../models/product');
var Catproduct = require('../../models/catproduct');
var multer  = require('multer');
var moduleAlias = require('module-alias');
var slugify = require('slugify');
var htmlToText = require('html-to-text');

// join table
var MJ = require("mongo-fast-join"),
mongoJoin = new MJ();
// end join table

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+ '_' +file.originalname);
        // cb(null, file.fieldname + '-' + Date.now())
    }
});
var fs = require('fs');
var upload = multer({ storage: storage });

var mongoose = require('mongoose');
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/shoppingcart';

// ====================================================================Quản lý sản phẩm

// ==============================Danh sách sản phẩm

router.get('/listProduct',function(req, res, next){
    var successMsg = req.flash('success')[0];
    mongo.connect(url, function(err, db) {
        mongoJoin.query( db.collection("products"),
            {}, //query statement
            {}, //fields
            {
                limit: 10000//options
            }
        ).join({
            joinCollection: db.collection("catproducts"),
            //respects the dot notation, multiple keys can be specified in this array
            leftKeys: ["id_category"],
            //This is the key of the document in the right hand document
            rightKeys: ["_id"],
            //This is the new subdocument that will be added to the result document
            newKey: "catproduct"
        }).exec(function (err, docs) {
            console.log(docs);
            if (err) throw err;
            var productChunks = [];
            var chunkSize = 20;
            for(var i=0;i < docs.length;i += chunkSize){
                productChunks.push(docs.slice(i, i+chunkSize));
                //res.render('admin/products/listProduct', { admin: 'ok', home: 'ok', title: 'Shopping Cart HK1992', products:productChunks, successMsg: successMsg, noMessages: !successMsg});
            }
            db.close();
            res.render('admin/products/listProduct', { admin: 'ok', home: 'ok', title: 'Shopping Cart HK1992', products:productChunks, successMsg: successMsg, noMessages: !successMsg});
        });
    });
});

router.get('/addProduct', function(req, res, next){
    Catproduct.find(function(err, docs){
        console.log(docs);
        res.render('admin/products/addProduct', {admin: 'ok', home: 'ok', listcat: docs, csrfToken:req.csrfToken()});
    });
});

router.post('/addProduct', upload.single('file'), function(req, res, next){
    var pathImg = req.file.path;
    var description = htmlToText.fromString(req.body.description);
    var detail = htmlToText.fromString(req.body.detail);
    var items = {
        imagePath:pathImg.replace('public', ''),
        imageResize:'',
        title:req.body.title,
        alias:req.body.alias,
        description:description,
        link:req.body.link,
        detail:detail,
        price:req.body.price,
        id_category:ObjectId(req.body.id_category),
        position:req.body.position,
    };
    var itemalias = {
        alias: req.body.alias,
        title: req.body.title,
        page: 'product',
    }
    mongo.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('products').insertOne(items, function(err, result){
            assert.equal(null, err);
            db.close();
        });
        db.collection('aliass').insertOne(itemalias,function(err, result){
            assert.equal(null, err);
            db.close();
        });
        res.redirect('/admin/listProduct');
    });
});

router.get('/editProduct/:id', function(req, res, next){
    var idItem = req.params.id;
    Product.findOne({'_id':idItem}, function(err, result){
        res.render('admin/products/editProduct', {admin: 'ok', home: 'ok', csrfToken:req.csrfToken(), exit_id:'../', result:result});
    });
});

router.post('/editProduct', upload.single('file'), function(req, res, next){
    var description = htmlToText.fromString(req.body.description);
    var detail = htmlToText.fromString(req.body.detail);
    var items = {
        imagePath:req.file.path,
        imageResize:'',
        title:req.body.title,
        alias:req.body.alias,
        description:description,
        detail:detail,
        link:req.body.link,
        price:req.body.price,
        id_category: ObjectId(req.body.id_category),
        position: req.body.position,
    };
    var itemalias = {
        alias: req.body.alias,
        title: req.body.title,
        page: 'product',
    };
    var ids = req.body._id;
    var alias = req.body.alias;
    
    mongo.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('products').update({ '_id': ObjectId(ids)}, { $set:items }, function(err, result){
            assert.equal(null, err);
            db.close();
        });
        db.collection('aliass').update({alias:alias}, { $set:itemalias }, function(err, result){
            assert.equal(null, err);
            db.close();
        });
        res.redirect('/admin/listProduct');
    });
});
router.get('/deleteProduct/:id', function(req, res, next){
    var ids = req.params.id;
    Product.find({'_id':ids},function(err, result){
        var itemalias = result.alias;
        mongo.connect(url, function(err, db){
            assert.equal(null, err);
            db.collection('products').deleteOne({ '_id': ObjectId(ids)}, function(err, docs){
                assert.equal(null, err);
                if (err) throw err;
                try {
                    fs.unlinkSync('public'+ result[0].imagePath);
                } catch (err) {
                    console.log(err);
                }
                fs.unlink("notes.md", function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Notes.md removed");
                    }
                });
                db.close();
            });
            db.collection('aliass').deleteOne({alias:itemalias}, function(err, result){
                assert.equal(null, err);
                db.close();
            });
            res.redirect('/admin/listProduct');
        });
    });
});
// ============================================================Danh mục sản phẩm
router.get('/listCatProduct',function(req, res, next){
    // res.render('admin/products/listProduct', {admin: 'ok', home: 'ok'});
    var successMsg = req.flash('success')[0];
    Catproduct.find(function(err,docs){
        var productChunks = [];
        var chunkSize = 30;
        for(var i=0;i < docs.length;i += chunkSize){
          productChunks.push(docs.slice(i,i+chunkSize));
        }
        res.render('admin/products/listCatProduct', { admin: 'ok', home: 'ok', title: 'Shopping Cart HK1992', products:productChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});

router.get('/addCatProduct', function(req, res, next){
    res.render('admin/products/addCatProduct', {admin: 'ok', home: 'ok', csrfToken:req.csrfToken()});
});

router.post('/addCatProduct', upload.single('file'), function(req, res, next){
    //console.log(req.file);
    //var title = slugify(req.body.title);
    var pathImg = req.file.path;
    var description = htmlToText.fromString(req.body.description);
    var detail = htmlToText.fromString(req.body.detail);
    console.log(detail);
    var items = {
        imagePath:pathImg.replace('public', ''),
        imageResize:'',
        title:req.body.title,
        alias:req.body.alias,
        description:description,
        detail:detail,
        price:req.body.price,
        id_category:req.body.id_category,
        position:req.body.position,
    };
    var itemalias = {
        alias: req.body.alias,
        title: req.body.title,
        page:'catproduct',
    }
    mongo.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('catproducts').insertOne(items, function(err, result){
            assert.equal(null, err);
            db.close();
        });
        db.collection('aliass').insertOne(itemalias,function(err, result){
            assert.equal(null, err);
            db.close();
        });
    });
    res.redirect('/admin/listCatProduct');
});

router.get('/editCatProduct/:id', function(req, res, next){
    var idItem = req.params.id;
    Product.findOne({'_id':idItem}, function(err, result){
        res.render('admin/products/editCatProduct', {admin: 'ok', home: 'ok', csrfToken:req.csrfToken(), exit_id:'../', result:result});
    });
});

router.post('/editCatProduct', upload.single('file'), function(req, res, next){
    var description = htmlToText.fromString(req.body.description);
    var detail = htmlToText.fromString(req.body.detail);
    var items = {
        imagePath:req.file.path,
        imageResize:'',
        title:req.body.title,
        alias:req.body.alias,
        description:description,
        detail:detail,
        price:req.body.price,
        id_category: 0,
        position: 0,
    };
    //console.log(items);
    var itemalias = {
        alias: req.body.alias,
        title: req.body.title,
        page:'catproduct',
    };
    var ids = req.body._id;
    var alias = req.body.alias;
    
    //console.log(ids);
    //console.lod(req);
    mongo.connect(url, function(err, db){
        
        assert.equal(null, err);
        db.collection('catproducts').update({ '_id': ObjectId(ids)}, { $set:items }, function(err, result){
            // var filePath = 'c:/book/discovery.docx'; 
            // fs.unlinkSync(filePath);

            assert.equal(null, err);
            db.close();
        });
        db.collection('aliass').update({alias:alias}, { $set:itemalias }, function(err, result){
            assert.equal(null, err);
            db.close();
        });
        res.redirect('/admin/listCatProduct');
    });
});
router.get('/deleteCatProduct/:id', function(req, res, next){
    var ids = req.params.id;
    Product.find({'_id':ids},function(err, result){
        console.log(result[0].imagePath);
        var itemalias = result.alias;
        mongo.connect(url, function(err, db){
            assert.equal(null, err);
            db.collection('catproducts').deleteOne({ '_id': ObjectId(ids)}, function(err, docs){
                //console.log(docs);
                assert.equal(null, err);
                //if(err) { throw err; };
                if (err) throw err;
                try {
                    fs.unlinkSync('public'+ result[0].imagePath);
                } catch (err) {
                    console.log(err);
                }
                fs.unlink("notes.md", function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Notes.md removed");
                    }
                });
                db.close();
            });
            db.collection('aliass').deleteOne({alias:itemalias}, function(err, result){
                assert.equal(null, err);
                db.close();
            });
            res.redirect('/admin/listCatProduct');
        });
    });
});
// ====================================================== Kết thúc models sản phẩm
module.exports = router