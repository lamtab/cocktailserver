'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ingredient = mongoose.model('Ingredient');
var Cocktail = mongoose.model('Cocktail');
var valExpress = require('express-validate-requests');
var helpers = valExpress.helpers;
var bcrypt = require("bcryptjs");
var Configuration = require('../config');
var functions = require('../functions');

var statistics = {
  GetAll: function(req, res) {
    functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        var stats = {
            users: 0
        };
        User.count(function(err, c) {
            if (err) {
                return res.status(500).json(err);
            } else {
                stats.users = c;
                Ingredient.count(function(err, c) {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        stats.ingredients = c;
                        Cocktail.count(function(err, c) {
                            if(err) {
                                return res.status(500).json(err);
                            } else {
                                stats.cocktails = c;
                                return res.json({'statistics': stats});
                            }
                        });
                    }
                });
            }
        });
    },
};

module.exports = statistics;
