'use strict';

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var validator = require('validator');
var Schema = mongoose.Schema;

//Schema
var CocktailSchema = new mongoose.Schema({
	name:  			{ type: String, required: true, unique: true },
    ingredients: 	{type: [{ type : Schema.Types.ObjectId, ref: 'Ingredient'}], required: false },
    quantities: 	[{ type: String, required: false}],
    description: 	{ type: String, required: false },
    recipe: 		{ type: String, required: true },
    createdAt: 		{ type: Date, default: Date.now },
    updatedAt: 		{ type: Date, default: Date.now },
    img:  			{ data: Buffer, contentType: String }
});
CocktailSchema.plugin(uniqueValidator);
var Cocktail = mongoose.model('Cocktail', CocktailSchema);

CocktailSchema.path('name')
	.validate(function(value, respond) {
		if(value === 'undefined') {
			return respond(false);
		}
		respond(true);
	}, 'Name must be set')
	.validate(function( value, respond) {
		if(value.length === 0) {
			return respond(false);
		}
		respond(true);
	}, 'Name cannot be blank'); 

CocktailSchema.path('ingredients')
	.validate(function(value, respond) {
		if(value === 'undefined') {
			return respond(false);
		}
		respond(true);
	}, 'Ingredients must be set')
	.validate(function(value, respond) {
		var that = this;
		if(that.ingredients.length === 0) {
			return respond(true);
		}
		var key = that.ingredients.pop();
		if(that.ingredients.indexOf(key) !== -1) {
			return respond(false);
		}
		that.ingredients.push(key);
		respond(true);
		
	}, 'Ingredient already exists in cocktail');

CocktailSchema.pre('save', function (next) {
    var cocktail = this;
    cocktail.updatedAt = new Date();
    next();
});

module.exports = Cocktail;