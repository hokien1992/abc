// var passport = require('passport');

// var LocalStrategy = require('passport-local').Trategy;
var passport = require('passport');
var User = require('../models/user');
var Ad_user = require('../models/ad_user');//login
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

// =========================================================ad_user
passport.serializeUser(function(ad_user, done){
    done(null, ad_user.id);
});

passport.deserializeUser(function(id, done){
    ad_user.findById(id, function(err, ad_user){
        done(err, ad_user);
    });
});

// passport.use('local.register', new LocalStrategy({
//     ad_usernameField: 'username',
//     passwordField: 'password',
//     passReqToCallback: true
// },function(req, username, password, done){
//     req.checkBody('username', 'username không đúng định dạng').notEmpty().isusername();
//     req.checkBody('password', 'Password phải >=4 ký tự').notEmpty().isLength({min:4});
//     var errors = req.validationErrors();
//     if(errors){
//         var messages = [];
//         errors.forEach(function(error){
//             messages.push(error.msg);
//         });
//         return done(null, false, req.flash('error', messages));
//     }

//     ad_user.findOne({'username': username},function(err, ad_user){
//         if(err){
//             return done(err);
//         }
//         if(ad_user){
//             return done(null, false, {message:'username đã sử dụng!'});
//         }
//         var newad_user = new ad_user(); 
//         newad_user.username = username;
//         newad_user.password = password;
//         newad_user.save(function(err, result){
//             if(err){
//                 return done(err);
//             }
//             return done(null, newad_user);
//         });
//     });
// }));

passport.use('local.login', new LocalStrategy({
    ad_usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    req.checkBody('username', 'Không được bỏ trống tài khoản').notEmpty();
    req.checkBody('password', 'Mật khẩu không đúng').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Ad_user.findOne({'username': username}, function(err, ad_user){
        /*console.log(ad_user);
        console.log(err);*/
        if(err){
            return done(err);
        }
        if(!ad_user){
            return done(null, false, {message:'Tài khoản không đúng!'});
        }
        if(ad_user.password!=password){
            return done(null, false, {message: 'Sai password!'});
        }
        return done(null, ad_user);
    });
}));
