'use strict';

var jwt = require('jsonwebtoken');
var User = require('../models/user');
var valExpress = require('express-validate-requests');
var helpers = valExpress.helpers;
var bcrypt = require("bcryptjs");
var Configuration = require('../config');
var functions  = require('../functions');

var auth = {

  login: function(req, res) {
        var username = req.body.username,
            password = req.body.password,
            userItem = {};
        var requiredParamsKeys = ["username", "password"];
        if (!helpers.checkGotAllParams(req.body, requiredParamsKeys)) {
          return res.json({'success' : false, 'message': 'Not all parameters were set'});
        }
        User.findOne({username: username},
            function(err, user) {
            if(err || !user) {
                return res.json({'success': false, 'message': 'Invalid username or password. Please try again.'});
            }
            if( user ) {
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if(err || !isMatch) {
                        return res.json({'success': false, 'message': 'Invalid username or password. Please try again.'});
                    }
                    if(isMatch) {
                        var token = jwt.sign({'user': user}, Configuration.secret, {
                          expiresInMinutes: 120 // expires in 2 hours
                        });
                        if(user.active) {
                          return res.json({'success': true, 'token': token});
                        } else {
                          return res.json({'success': false, 'message': 'Your account is not activated yet. Please be patient'});
                        }

                    }
                });
            }
        })
    },
  register: function(req, res) {
    functions.CreateLog(req,res);
        var user = new User({});

        for(var property in User.schema.paths) {
          if(!User.schema.paths[property].options.forbidden) {
            if(req.body.hasOwnProperty(property)) {
              user[property] = req.body[property];
            }
          }
        }
        
        user.save(function(err) {
            if( err ) {
                return res.json(err);
            }
            if( !err ) {
                return res.json({'success': true});
            }
        });
        
    },

  validate: function(username, password) {
      User.findOne({username: username},
            function(err, user) {
            if(err || !user) {
                return false;
            }
            if( user ) {
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if(err || !isMatch) {
                        return false;
                    }
                    if(isMatch) {
                        return true;
                    }
                });
            }
      })
  },

  validateUser: function(username) {
    User.findOne({username: username},
      function(err, user) {
      if(err || !user) {
          return err;
      }
      if( user ) {
          return user;
      }
    })
  },
}

module.exports = auth;
