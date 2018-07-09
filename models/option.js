var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    logo:{type:String,require:true},
    favicon:{type:String,require:true},
    title:{type:String,require:true},
    slogan:{type:String,require:true},
    address:{type:String,require:true},
    addressTop:{type:String, require:true},
    codechat:{type:String, require:true},
    codefanpage:{type:String, require:true},
    hotline1:{type:String, require:true},
    hotline2:{type:String, require:true},
    lang:{type:String, require:true},
    link_face:{type:String, require:true},
    link_youtube:{type:String, require:true},
    link_gmail:{type:String, require:true},
    link_sky:{type:String, require:true},
    link_gmail:{type:String, require:true},
    seo_keyword:{type:String, require:true},
    seo_description:{type:String, require:true},
})
module.exports = mongoose.model('Option',schema);
