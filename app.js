const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyparser = require('body-parser');


const hbs = require('express-handlebars');
const session = require('express-session');
const fileupload = require('express-fileupload');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const vendorRouter = require('./routes/vendor');

const app = express();

const db = require('./configration/connection');
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: `${__dirname}/views/layout/`, partialsDir: `${__dirname}/views/partials/`,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'Key', cookie: { maxAge: 600000 } }));
app.use(bodyparser.json());
app.use(fileupload());

db.connect((err) => {
  if (err) console.log(`connection errror${err}`);
  else console.log('database connected');
});

app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/vendor', vendorRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
