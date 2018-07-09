var express = require('express');
var router = express.Router();
var Options = require('../../models/option');

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
        cb(null, './public/upload/option');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+ '_' +file.originalname);
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

router.get('/updateOption', function(req, res, next){
    var idItem = ObjectId("5a04f42dc2810309b4e760af");
    Options.findOne({'_id':idItem}, function(err, result){
        //console.log(result);
        res.render('admin/option', {admin: 'ok', home: 'ok', csrfToken:req.csrfToken(), exit_id:'', result:result});
    });
});

router.post('/updateOption', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), function(req, res, next){
    //console.log(req.files);
    if(fs.exists('logo')){
        var logos = req.files.logo[0].path.replace('public', '');
    }else{
        var logos = req.body.logo;
    }
    if(fs.exists('favicon')){
        var favicons = req.files.favicon[0].replace('public', '');
    }else{
        var favicons = req.body.favicon;
    }
    var addressTops = htmlToText.fromString(req.body.addressTop);
    var addresss = htmlToText.fromString(req.body.address);
    var items = {
        logo:logos,
        favicon:favicons,
        title:req.body.title,
        slogan:req.body.slogan,
        address:addresss,
        addressTop:addressTops,
        codechat:req.body.codechat,
        codefanpage:req.body.codefanpage,
        link_face:req.body.link_face,
        link_youtube:req.body.link_youtube,
        link_gmail:req.body.link_gmail,
        link_twiter:req.body.link_twiter,
        seo_keyword:req.body.seo_keyword,
        seo_description:req.body.seo_description,
    };
    mongo.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('options').update({ '_id': ObjectId('5a04f42dc2810309b4e760af')}, { $set:items }, function(err, result){
            console.log(result);
            assert.equal(null, err);
            db.close();
            res.redirect('/admin/updateOption');
        });
        
    });
});
router.get('/deleteimage/:any', function(req, res, next){
    var images = req.params.any;
    //console.log(images);
    Options.find({'_id':'5a04f42dc2810309b4e760af'},function(err, result){
        mongo.connect(url, function(err, db){
            console.log(result);
            assert.equal(null, err);
            if (err) throw err;
            try {
                if(images=='logo'){
                    fs.unlinkSync('public'+ result[0].logo);
                }
                if(images=='favicon'){
                    fs.unlinkSync('public'+ result[0].favicon);
                }
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
            var items = {
                logo:'',
                favicon:''
            }
            mongo.connect(url, function(err, db){
                assert.equal(null, err);
                db.collection('options').update({ '_id': ObjectId('5a04f42dc2810309b4e760af')}, { $set:items }, function(err, result){
                    console.log(result);
                    assert.equal(null, err);
                    db.close();
                    res.redirect('/admin/updateOption');
                });
            });
            db.close();
            //res.redirect('/admin/updateOption');
        });
    });
});

// ====================================================== Kết thúc models sản phẩm
module.exports = router