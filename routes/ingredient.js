'use strict';

var mongoose = require('mongoose');
var Ingredient = mongoose.model('Ingredient');
var functions  = require('../functions');

var ingredient = {
    Create: function(req, res) {
        functions.CreateLog(req,res);
        var ingredient = new Ingredient({});
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        for(var property in Ingredient.schema.paths) {
            if(req.body.hasOwnProperty(property)) {
              ingredient[property] = req.body[property];
            }
        }
        ingredient.save(function(err) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({'ingredient': ingredient});
            }
        });
        
    },

    Update: function(req, res) {
        functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        Ingredient.findById(req.params.id, function(err, ingredient) {

            if (err) {
                return res.status(500).json(err);
            }

            for(var property in Ingredient.schema.paths) {
                if(req.body.hasOwnProperty(property)) {
                  ingredient[property] = req.body[property];
                }
            }

            ingredient.save(function(err) {
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
        Ingredient.remove({
            _id: req.params.id
        }, function(err, ingredient) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({});
            }
        });
    },

    GetAll: function(req, res) {
        functions.CreateLog(req,res);
        var ingredientCollection = [];
        Ingredient.find(function(err, ingredients) {
            if (err) {
                return res.status(500).json(err);
            } else {
                if(req.decoded.role === 'admin') {
                    ingredientCollection = ingredients;
                } else {
                    ingredients.forEach(function(ingredient) {
                        ingredientCollection.push({
                            name: ingredient.name,
                            brand: ingredient.brand,
                            description: ingredient.description,
                            color: ingredient.color
                        });
                    });
                }
                return res.json({'ingredients': ingredientCollection});
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
        Ingredient.findById(req.params.id, function(err, ingredient) {
            if (err) {
                return res.status(500).json(err);
            }  
            if(!ingredient) {
                return res.status(404).json({'message': 'Ingredient not found'});
            } else {
                return res.json({'ingredient': ingredient});
            }
        });
    },

    GetByName: function(req, res) {
        functions.CreateLog(req,res);
        var ingredientItem = {};
        Ingredient.findOne({'name' : req.params.name}, function(err, ingredient) {
            if (err) {
                return res.status(500).json(err);
            }
            if(!ingredient) {
                return res.status(404).json({'message': 'Ingredient not found'});
            } else {
                if(req.decoded.role === 'admin') {
                    ingredientItem = ingredient;
                } else {
                    ingredientItem.name = ingredient.name;
                    ingredientItem.description = ingredient.description;
                    ingredientItem.color = ingredient.color;
                }
                return res.json({'ingredient': ingredientItem});
            }
        });
    },
};

module.exports = ingredient;
