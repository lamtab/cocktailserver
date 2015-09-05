'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var validator = require('validator');
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");

//Schema
var UserSchema = new mongoose.Schema({
    username: 	{ type: String, min: 5, max: 10, required: true, unique: true },
    password: 	{ type: String, min: 5, max: 10, required: true },
    firstName: 	{ type: String, required: true },
    lastName: 	{ type: String, required: true },
    email: 		{ type: String, required: true, unique: true },
    cellar: 	{ type: [{ type : Schema.Types.ObjectId, ref: 'Ingredient'}], required: false, forbidden: true },
    role: 		{ type: String, default: 'simple', forbidden: true },
    active: 	{ type: Boolean, default: false, forbidden: true },
    searchMode: { type: Number, required: true, default: 0},
    createdAt: 	{ type: Date, default: Date.now },
    updatedAt: 	{ type: Date, default: Date.now },
});
UserSchema.plugin(uniqueValidator, { message: 'is not available.' });

var User = mongoose.model('User', UserSchema);

UserSchema.path('username')
	.validate(function(value, respond) {
		if(value === 'undefined') {
			return respond(false);
		}
		respond(true);
	}, 'Username must be set')
	.validate(function( value, respond) {
		if(!validator.isAlphanumeric(value)) {
        	return respond(false);
    	}
    	respond(true);
	}, 'Username must contain only characters and numbers')
	.validate(function( value, respond) {
		if(/\s/g.test(value)) {
			return respond(false);
		}
		respond(true);
	}, 'Username cannot contain whitespaces')
	.validate(function( value, respond) {
		if(value.length === 0) {
			return respond(false);
		}
		respond(true);
	}, 'Username cannot be blank'); 

UserSchema.path('password')
	.validate(function(value, respond) {
		if(value === 'undefined') {
			return respond(false);
		}
		respond(true);
	}, 'Password must be set')
	.validate(function( value, respond) {
		if(/\s/g.test(value)) {
			return respond(false);
		}
		respond(true);
	}, 'Password cannot contain whitespaces')
	.validate(function( value, respond) {
		if(value.length === 0) {
			return respond(false);
		}
		respond(true);
	}, 'Password cannot be blank'); 

UserSchema.path('firstName')
	.validate(function(value, respond) {
		if(value === 'undefined') {
			return respond(false);
		}
		respond(true);
	}, 'Name must be set')
	.validate(function( value, respond) {
		if(!validator.isAlpha(value)) {
			return respond(false);
		}
		respond(true);
	}, 'Name must only contain letters')
	.validate(function( value, respond) {
		if(value.length === 0) {
			return respond(false);
		}
		respond(true);
	}, 'Name canno be blank'); 

UserSchema.path('lastName')
	.validate(function(value, respond) {
		if(value === 'undefined') {
			return respond(false);
		}
		respond(true);
	}, 'Surname must be set')
	.validate(function( value, respond) {
		if(!validator.isAlpha(value)) {
			return respond(false);
		}
		respond(true);
	}, 'Surname must only contain letters')
	.validate(function( value, respond) {
		if(value.length === 0) {
			return respond(false);
		}
		respond(true);
	}, 'Surname cannot be blank'); 

UserSchema.path('email')
	.validate(function( value, respond) {
		if(!validator.isEmail(value)) {
        	return respond(false);
    	}
    	respond(true);
	}, 'Invalid email format');
	
UserSchema.pre('save', function (next) {
    var user = this;
    user.updatedAt = new Date();
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
module.exports = User;