var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
// start ket noi mongodb
//1.lay ra thu vien mongoose
var mongoose = require('mongoose');
//2.tao Schema
//ket noi mongoose
var session = require('express-session');//tao seession
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);



var index = require('./routes/index');
var userRoutes = require('./routes/user');
var ad_userRoutes = require('./routes/ad_user');
///==========================backend
var adminRoutes = require('./routes/admin');
var productRoutes = require('./routes/admin/products');
var optionRoutes = require('./routes/admin/option');
//var users = require('./routes/users');

var app = express();
mongoose.connect('localhost:27017/shoppingcart');
require('./config/passport');


app.engine('.hbs',expressHbs({defaultLayout:'layout',extname:'.hbs'}));
app.set('view engine', '.hbs');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
// tao session
app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180*60*1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


app.use(function(req, res, next){
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/', index);
app.use('/user', userRoutes);
app.use('/', ad_userRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', productRoutes);
app.use('/admin', optionRoutes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
