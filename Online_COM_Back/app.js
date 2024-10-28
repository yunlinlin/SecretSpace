require('dotenv').config()
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let itemRouter = require('./routes/item');
let feedbackRouter = require('./routes/feedback');
let activityRouter = require('./routes/activity');
let imageRouter = require('./routes/image');
let appointRouter = require('./routes/appoint');
let uploadRouter = require('./routes/upload');
let searchRouter = require('./routes/search');
let adminRouter = require('./routes/admin');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/item', itemRouter);
app.use('/feedback', feedbackRouter);
app.use('/activity', activityRouter);
app.use('/image', imageRouter);
app.use('/appoint', appointRouter);
app.use('/upload', uploadRouter);
app.use('/search', searchRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.send(err.status, err.message);
  // res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;