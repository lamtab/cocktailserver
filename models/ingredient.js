'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');

//Schema
var IngredientSchema = new mongoose.Schema({
    name: 			{ type: String, required: true },
    brand: 			{ type: String, required: false, default: ''},
    description: 	{ type: String, required: true },
    color: 			{ type: String, default: 'colorless', required: false },
    createdAt: 		{ type: Date, default: Date.now },
    updatedAt: 		{ type: Date, default: Date.now },
});

IngredientSchema.plugin(uniqueValidator);
var Ingredient = mongoose.model('Ingredient', IngredientSchema);

IngredientSchema.path('name')
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
	
IngredientSchema.pre('save', function (next) {
    var ingredient = this;
    ingredient.updatedAt = new Date();
    next();
});

module.exports = Ingredient;