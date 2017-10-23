// var passport = require('passport');

// var LocalStrategy = require('passport-local').Trategy;
var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req, email, password, done){
    req.checkBody('email', 'Email không đúng định dạng').notEmpty().isEmail();
    req.checkBody('password', 'Password phải >=4 ký tự').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({'email': email},function(err, user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message:'Email đã sử dụng!'});
        }
        var newUser = new User(); 
        newUser.email = email;
        newUser.password = password;
        newUser.save(function(err, result){
            if(err){
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Định dạng Email không phải!').notEmpty().isEmail();
    req.checkBody('password', 'Sai password').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user){
        console.log(user);
        console.log(err);
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message:'Tài khoản không đúng!'});
        }
        if(user.password!=password){
            return done(null, false, {message: 'Sai password!'});
        }
        return done(null, user);
    });
}));
