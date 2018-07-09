var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title:{type:String,require:true},
    alias:{type:String,require:true},
    page:{type:String,require:true},
})
module.exports = mongoose.model('Alias',schema);
