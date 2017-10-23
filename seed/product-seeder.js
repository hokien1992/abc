var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/shoppingcart');

// var products = [
// new Product({
//     imagePath:'../images/game.png',
//     title:'Game Win',
//     description:'Mongo Game !!!',
//     detail:"Detail Mongo",
//     price:12000
// }),
// new Product({
//     imagePath:'../images/game.png',
//     title:'Game Win1',
//     description:'Mongo Game !!!',
//     detail:"Detail Mongo",
//     price:12000
// }),
// new Product({
//     imagePath:'../images/game.png',
//     title:'Game Win2',
//     description:'Mongo Game !!!',
//     detail:"Detail Mongo",
//     price:12000
// }),
// new Product({
//     imagePath:'../images/game.png',
//     title:'Game Win3',
//     description:'Mongo Game !!!',
//     detail:"Detail Mongo",
//     price:12000
// })
// ];
// var done = 0;
// for (var i=0;i<products.length; i++){
//     products[i].save(function(err,result){
//         done++;
//         if(done===products.length){
//             exit();
//         }
//     });
// }
// function exit(){
//     mongoose.disconnect();
// }
// mongoose.disconnect();