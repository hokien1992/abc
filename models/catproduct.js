var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    imagePath:{type:String,require:true},
    imageResize:{type:String,require:true},
    title:{type:String,require:true},
    alias:{type:String,require:true},
    description:{type:String,require:true},
    id_category:{type:Number,require:true},
    position:{type:Number,require:true},
})
module.exports = mongoose.model('Catproduct',schema);
