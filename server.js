// server.js

// BASE SETUP
// =============================================================================
var express             = require('express');
var jwt                 = require('jsonwebtoken');
var morgan              = require('morgan');
var cors                = require('cors');
var expressValidator    = require('express-validator');
var exphbs              = require('express-handlebars');
var parseurl            = require('parseurl');
var logger              = require('morgan');
var cookieParser        = require('cookie-parser');
var methodOverride      = require('method-override');
var session             = require('express-session');
var uuid                = require('uuid');
var valExpress          = require('express-validate-requests');
var xssFilters          = require('xss-filters');
var bodyParser          = require('body-parser');
var mongoose            = require('mongoose');
var Error               = require('./errors.js');
var Configuration       = require('./config');
var app                 = express();
var middle              = valExpress.middleware;
var helpers             = valExpress.helpers;
var unless              = require('express-unless');
var bcrypt              = require("bcryptjs");

var Log                 = require('./models/log');
var User                = require('./models/user');
var Ingredient          = require('./models/ingredient');
var Cocktail            = require('./models/cocktail');

var functions           = require('./functions');

mongoose.connect(Configuration.database);
app.set('superSecret', Configuration.secret);

app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({
  secret: uuid.v4(),
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}))


app.use(function(req, res, next){
    var     err = req.session.error,
            msg = req.session.notice,
            success = req.session.success;
   
    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    functions.xssFilter(req.body);

    if (err) {
        res.locals.error = err;
    }
    if (msg) {
        res.locals.notice = msg;
    }
    if (success) {
        res.locals.success = success;
    }

    next();
});

app.use(cors());
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  } else {
    return next();
  }
});

var port = 22442;
var router = express.Router();
router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
            if (err) {
                res.status(401).json({ 'message': 'You have been signed out! Please login to continue.' });    
            } else {
                req.decoded = decoded.user;   
                next();
            }
        });
    } else {
        res.status(401).send({ 
            message: 'Please login to continue.' 
        });
    }
});

app.use('/api', router);
app.models = require('./models');

app.use('/', require('./routes'));

app.listen(port);
console.log('Cocktails Server listening on port ' + port);

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});