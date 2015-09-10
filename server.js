#!/bin/env node

var express             = require('express');
var http                = require('http');
var fs                  = require('fs');
var jwt                 = require('jsonwebtoken');
var morgan              = require('morgan');
var cors                = require('cors');
var parseurl            = require('parseurl');
var logger              = require('morgan');
var cookieParser        = require('cookie-parser');
var methodOverride      = require('method-override');
var uuid                = require('uuid');
var xssFilters          = require('xss-filters');
var bodyParser          = require('body-parser');
var mongoose            = require('mongoose');
var bcrypt              = require("bcryptjs");

var Log                 = require('./models/log');
var User                = require('./models/user');
var Ingredient          = require('./models/ingredient');
var Cocktail            = require('./models/cocktail');
var Configuration       = require('./config');

/**
 *  Define the application.
 */
var CocktailAPI = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.IP;
        self.port      = process.env.PORT || 8080;
        // default to a 'localhost' configuration:
        /*self.connection_string = '127.0.0.1:27017/test';
        // if OPENSHIFT env variables are present, use the available connection info:
        if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
          self.connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
          process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
          process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
          process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
          process.env.OPENSHIFT_APP_NAME;
        }*/
        self.connection_string = Configuration.database;
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = require('./routes');
    };


    /**
     *  Initialize the DV (mongoDB)
     */
    self.initializeDB = function() {
        mongoose.connect(self.connection_string);
    };

    /**
     *  Initialize the Router
     */
    self.initializeRouter = function() {
        self.router = express.Router();
        self.router.use(function(req, res, next) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];
            if (token) {
                jwt.verify(token, self.app.get('superSecret'), function(err, decoded) {      
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
    }

    /**
     *  Add cors to server
     */
    self.addCors = function() {
        self.app.use(cors());
        self.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "http://155633060.linuxzone49.grserver.gr");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
            if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                return res.end();
            } else {
                return next();
            }
        });
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();

        self.app = express();
        self.app.set('superSecret', Configuration.secret);
        self.app.use(logger('combined'));
        self.app.use(cookieParser());
        self.app.use(bodyParser.urlencoded({ extended: false }));
        self.app.use(bodyParser.json());
        self.app.use(morgan('dev'));
        self.app.use(methodOverride('X-HTTP-Method-Override'));

        self.addCors();
        self.initializeRouter();
        self.app.use('/api', self.router);
        self.app.models = require('./models');
        self.app.use('/', self.routes);
    };


    /**
     *  Initializes the application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.initializeDB();
        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        /*http.createServer(self.app).listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });*/
//Heroku Fix
        self.app.get('/', function(request, response) {
            var result = 'App is running'
            response.send(result);
        }).listen(self.port, function() {
            console.log('App is running, server is listening on port ', self.port);
        });
    };

};   /*  Application.  */



/**
 *  main():  Main code.
 */
var zapp = new CocktailAPI();
zapp.initialize();
zapp.start();

