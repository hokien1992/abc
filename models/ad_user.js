var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var ad_userSchema = new Schema({
    username: {type:String, require: true},
    password: {type: String, require: true},
    email: {type: String, require: true},
});

ad_userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

ad_userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Ad_user', ad_userSchema);