'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ingredient = mongoose.model('Ingredient');
var Cocktail = mongoose.model('Cocktail');
var valExpress = require('express-validate-requests');
var helpers = valExpress.helpers;
var functions  = require('../functions');

var cocktail = {
    Propose: function(req, res) {
        functions.CreateLog(req,res);
        var closest = [], aDiff, diff = 1, i = 0, temp = 0, pos, cocktailCollection = [], ingredientCollection = [];
        User.findOne({'username' : req.body.username}).populate('cellar').exec(function(err, user) {
            if(err) {
                return res.status(500).json(err);
            }
            if(user == null) {
                return res.status(404).json({'message': 'User doesn\'t exist'});
            }
            
            Cocktail.find().populate('ingredients').exec(function(err, cocktails) {
                if (err) {
                    return res.status(500).json(err);
                }
                cocktails.forEach(function(cocktail) {
                    if(user.searchMode == 0) {
                        aDiff = functions.arrayDiffPrecise(cocktail.ingredients, user.cellar);
                    } else {
                        aDiff = functions.arrayDiff(cocktail.ingredients, user.cellar);
                    }
                    for(i = 0; i < closest.length; i++) {
                        if(temp < closest[i].metrics.diffPerc) {
                            temp = closest[i].metrics.diffPerc;
                            pos = i;
                        }
                    }

                    if(closest.length < 4) {
                        closest.push({'cocktail' : cocktail, 'metrics' : aDiff});
                    } else {
                        if(aDiff.diffPerc < closest[pos].metrics.diffPerc) {
                            closest.splice(pos, 1);
                            closest.push({'cocktail' : cocktail, 'metrics' : aDiff});
                        }
                    }
                });
                closest.forEach(function(item) {
                    item.cocktail.ingredients.forEach(function(ingredient) {
                        ingredientCollection.push({
                            name: ingredient.name,
                            brand: ingredient.brand,
                            description: ingredient.description,
                            color: ingredient.color,
                            quantity: item.cocktail.quantities[item.cocktail.ingredients.indexOf(ingredient)]
                        });
                    });
                    cocktailCollection.push({
                        name: item.cocktail.name,
                        description: item.cocktail.description,
                        recipe: item.cocktail.recipe,
                        ingredients: ingredientCollection
                    });
                    ingredientCollection = [];
                });
                return res.json({'cocktails': closest});
            });
        });
    },

    Create: function(req, res) {
        functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        var ingredients = [];
        var quantities = [];

        var collection = 
            (typeof(req.body.ingredients) !== 'undefined') ? req.body.ingredients : [];
        if(collection.length > 0) {
            if(typeof(collection[0]) === 'object') {
                collection.forEach(function(item) {
                    ingredients.push(item._id);
                });
            }
            else {
                ingredients = collection;
            }
        }
        for(var i = 0; i < req.body.quantities.length; i++) {
            quantities.push(req.body.quantities[i]);
        }
        
        var cocktail = new Cocktail({
            name: req.body.name,
            recipe: req.body.recipe,
            ingredients: ingredients,
            quantities: quantities
        });
        if(typeof(req.body.description) !== 'undefined') {
                cocktail.description = req.body.description;
        }
        cocktail.save(function(err) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({'cocktail': cocktail});
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
        
        var ingredients = [];
        var quantities = [];
        var collection = 
            (typeof(req.body.ingredients) !== 'undefined') ? req.body.ingredients : [];
        if(collection.length > 0) {
            if(typeof(collection[0]) === 'object') {
                collection.forEach(function(item) {
                    ingredients.push(item._id);
                });
            }
            else {
                ingredients = collection;
            }
        }
        for(var i = 0; i < req.body.quantities.length; i++) {
            quantities.push(req.body.quantities[i]);
        }
        Cocktail.findById(req.params.id, function(err, cocktail) {
            if(err) {
                return res.status(500).json(err);
            }
            if (!cocktail) {
                return res.status(404).json({'message': 'Cocktail doesnt exist'});
            }
            for (var property in req.body) {
                if(req.body.hasOwnProperty(property)) {
                    cocktail[property] = req.body[property];
                }
            }
            cocktail.ingredients = ingredients;
            cocktail.quantities = quantities;

            cocktail.save(function(err) {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    return res.json({'cocktail': cocktail});
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
        Cocktail.remove({
            _id: req.params.id
        }, function(err, cocktail) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({});
            }
        });
    },

    GetAll: function(req, res) {
        functions.CreateLog(req,res);
        var cocktailCollection = [], ingredientCollection = [];
        Cocktail.find().exec(function(err, cocktails) {
            if (err) {
                return res.status(500).json(err);
            } else {
                if(req.decoded.role === 'admin') {
                    cocktailCollection = cocktails;
                } else {
                    cocktails.forEach(function(cocktail) {
                        /*cocktail.ingredients.forEach(function(ingredient) {
                            ingredientCollection.push({
                                name: ingredient.name,
                                description: ingredient.description,
                                color: ingredient.color,
                                quantity: cocktail.quantities[cocktail.ingredients.indexOf(ingredient)]
                            });
                        });*/
                        cocktailCollection.push({
                            name: cocktail.name,
                            description: cocktail.description,
                            recipe: cocktail.recipe,
                            ingredients: cocktail.ingredients
                        });
                        ingredientCollection = [];
                    });
                }
                return res.json({'cocktails': cocktailCollection});
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
        Cocktail.findById(req.params.id, function(err, cocktail) {
            if (err) {
                return res.status(500).json(err);
            } 
            if(!cocktail) {
                return res.status(404).json({'message': 'Cocktail doesn\'t exist'});
            } else {
                return res.json({'cocktail': cocktail});
            }
        });
    },

    GetByName: function(req, res) {
        functions.CreateLog(req,res);
        var cocktailItem = {}, ingredientCollection = [];
        Cocktail.findOne({'name' : req.params.name}).populate('ingredients').exec(function(err, cocktail) {
            if (err) {
                return res.status(500).json(err);
            }
            if(!cocktail) {
                return res.status(404).json({'message': 'Cocktail doesn\'t exist'});
            } else {
                if(req.decoded.role == 'admin') {
                    cocktailItem = cocktail;
                } else {
                    cocktail.ingredients.forEach(function(ingredient) {
                        ingredientCollection.push({
                            name: ingredient.name,
                            brand: ingredient.brand,
                            description: ingredient.description,
                            color: ingredient.color,
                            quantity: cocktail.quantities[cocktail.ingredients.indexOf(ingredient)]
                        });
                    });
                    cocktailItem.name = cocktail.name;
                    cocktailItem.description = cocktail.description;
                    cocktailItem.recipe = cocktail.recipe;
                    cocktailItem.ingredients = ingredientCollection;
                }
                return res.json({'cocktail': cocktailItem});
            }
        });
    },

    /*AddIngredient: function(req, res) {
        functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden' 
            });
        }
        var requiredParamsKeys = ["ingredient"], ingredient;
        if (!helpers.checkGotAllParams(req.body, requiredParamsKeys)) {
            return res.json({'success': false, 'message': 'Not all parameters were set.'});
        }
        var cocktail = Cocktail.findById(req.params.id, function(err, cocktail) {

            if (err || !cocktail) {
                return res.json(err);
            }
            ingredient = req.body.ingredient;
            if(typeof(ingredient === 'object')) {
                cocktail.ingredients.push(ingredient._id);
            } else {
                cocktail.ingredients.push(ingredient);
            }
            
            cocktail.save(function(err) {
                if (err) {
                    return res.json(err);
                } else {
                    return res.json({'success': true, 'cocktail': cocktail});
                }
            });

        });
    },

    DeleteIngredient: function(req, res) {
        functions.CreateLog(req,res);
        if(req.decoded.role !== 'admin') {
            return res.status(403).send({ 
                success: false, 
                message: 'Forbidden' 
            });
        }
        var requiredParamsKeys = ["ingredient"], ingredient, index;
        if (!helpers.checkGotAllParams(req.body, requiredParamsKeys)) {
            return res.json({'success': false, 'message': 'Not all parameters were set.'});
        }
        var cocktail = Cocktail.findById(req.params.id, function(err, cocktail) {
            if(err || !cocktail) {
                return res.json(err);
            }
            ingredient = req.body.ingredient;
            if(typeof(ingredient === 'object')) {
                index = cocktail.ingredients.indexOf(ingredient._id);
            } else {
                index = cocktail.ingredients.indexOf(ingredient);
            }
            
            cocktail.ingredients.splice(index, 1);
            
            cocktail.save(function(err) {
                if (err) {
                    return res.json(err);
                } else {
                    return res.json({'success': true, 'cocktail': cocktail});
                }
            });
        });
    }*/
};

module.exports = cocktail;
