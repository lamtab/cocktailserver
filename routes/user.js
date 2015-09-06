'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ingredient = mongoose.model('Ingredient');
var valExpress = require('express-validate-requests');
var helpers = valExpress.helpers;
var bcrypt = require("bcryptjs");
var Configuration = require('../config');
var functions  = require('../functions');

var users = {
  Create: function(req, res) {
    functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
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
                return res.status(500).json(err);
            }
            if( !err ) {
                return res.json({});
            }
        });
        
    },
  Update: function(req, res) {
    functions.CreateLog(req,res);
        User.findOne({username: req.params.username}, function(err, user) {
            if (err) {
                return res.status(500).json(err);
            }
            if(user == null) {
                return res.status(404).json({message: 'User not found'});
            }
            
            for(var property in User.schema.paths) {
                if(!User.schema.paths[property].options.unique) {
                    if(User.schema.paths[property].options.forbidden && req.decoded.role !== 'admin') {
                        continue;
                    }
                    if(req.body.hasOwnProperty(property)) {
                      user[property] = req.body[property];
                    }
                }
            }

            user.save(function(err) {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    return res.json({});
                }
            });
        });
    },

  Delete: function(req, res) {
    functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        User.remove({
            _id: req.params.id
        }, function(err, user) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({});
            }
        });
    },

  AddIngredient: function(req, res) {
    functions.CreateLog(req,res);
        var userItem = {};
        if(req.decoded.username !== req.params.username) {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        User.findOne({'username': req.params.username}, function(err, user) {
            if (err ) {
                return res.status(500).json(err);
            }
            if(!user) {
                return res.status(404).json({'message': 'User not found'});
            }
            if(typeof(req.body.ingredient) === 'object') {
                Ingredient.findOne({name: req.body.ingredient.name, brand: req.body.ingredient.brand}, function(err, ingredient) {
                    if (err ) {
                        return res.status(500).json(err);
                    }
                    if(!ingredient) {
                        return res.status(404).json({'message': 'Ingredient doesnt exist'});
                    } else {
                        if(user.cellar.indexOf(ingredient._id) === -1) {
                            user.cellar.push(ingredient._id);
                        }
                    }
                });
            } else {
                Ingredient.findOne({name: req.body.ingredient}, function(err, ingredient) {
                    if (err ) {
                        return res.status(500).json(err);
                    }
                    if(!ingredient) {
                        return res.status(404).json({'message': 'Ingredient doesnt exist'});
                    } else {
                        if(user.cellar.indexOf(ingredient._id) === -1) {
                            user.cellar.push(ingredient._id);
                        }
                    }
                });
            }
            user.update = new Date();

            user.save(function(err) {
                if (err) {
                    return res.status(500).json(err);
                }  else {
                    return res.json({});
                }
            });

        });
    },

  DeleteIngredient: function(req, res) {
    functions.CreateLog(req,res);
        if(req.decoded.username !== req.params.username) {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        User.findOne({username: req.params.username}, function(err, user) {

            if (err ) {
                return res.status(500).json(err);
            }
            if(!user) {
                return res.status(404).json({'message': 'User not found'});
            }

            if(typeof(req.body.ingredient) === 'object') {
                Ingredient.findOne({name: req.body.ingredient.name, brand: req.body.ingredient.brand}, function(err, ingredient) {
                    if (err ) {
                        return res.status(500).json(err);
                    }
                    if(!ingredient) {
                        return res.status(404).json({'message': 'Ingredient doesnt exist'});
                    } else {
                        var index = user.cellar.indexOf(ingredient._id);
                        user.cellar.splice(index, 1);
                    }
                });
            } else {
                Ingredient.findOne({name: req.body.ingredient}, function(err, ingredient) {
                    if (err ) {
                        return res.status(500).json(err);
                    }
                    if(!ingredient) {
                        return res.status(404).json({'message': 'Ingredient doesnt exist'});
                    } else {
                        var index = user.cellar.indexOf(ingredient._id);
                        user.cellar.splice(index, 1);
                    }
                });
            }
            user.update = new Date();

            user.save(function(err) {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    return res.json({});
                }
            });
        });
    },

  GetAll: function(req, res) {
        functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                'message': 'Authorization Error' 
            });
        }
        User.find(function(err, users) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({'users':users});
            }
        });
    },

  GetByUsername: function(req, res) {
        functions.CreateLog(req,res);
        var userItem = {}, cellar = [];
        User.findOne({username: req.params.username}).populate('cellar').exec( function(err, user) {
            if (err) {
                res.status(500).json(err);
            } 
            if(user == null) {
                res.status(404).json({'message': 'User not found'});
            } else {
                if(req.decoded.role === 'admin') {
                    userItem = user;
                } else {
                    user.cellar.forEach(function(ingredient) {
                        cellar.push({
                            name: ingredient.name,
                            brand: ingredient.brand,
                            description: ingredient.description,
                            color: ingredient.color
                        });
                    });
                    userItem.username = user.username;
                    userItem.password = user.password;
                    userItem.email = user.email;
                    userItem.firstName = user.firstName;
                    userItem.lastName = user.lastName;
                    userItem.searchMode = user.searchMode;
                    userItem.cellar = cellar;
                }
                res.json({'user':userItem});
            }
        });
    },

  GetById: function(req, res) {
    functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        User.findById(req.params.id, function(err, user) {
            if (err) {
                return res.status(500).json(err);
            } 
            if(user == null) {
                res.status(404).json({'message': 'User not found'});
            } else {
                return res.json({'user':user});
            }
        });
    },
};

module.exports = users;
