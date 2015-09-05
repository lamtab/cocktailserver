'use strict';

var express = require('express');
var router = express.Router();
var statistics = require('./statistics.js');
var Log = require('./log.js');
var auth = require('./auth.js');
var user = require('./user.js');
var ingredient = require('./ingredient.js');
var cocktail = require('./cocktail.js');

/*
 * Routes that can be accessed by any one
 */
router.post('/login', auth.login);
router.post('/register', auth.register);

/*
 * Routes that can be accessed only by authenticated users
 */
router.put('/api/user/:username', user.Update);
router.put('/api/user/AddIngredient/:username', user.AddIngredient);
router.put('/api/user/DeleteIngredient/:username', user.DeleteIngredient);
router.get('/api/user/GetByUsername/:username', user.GetByUsername);

router.get('/api/ingredient/GetByName/:name', ingredient.GetByName);
router.get('/api/ingredient/', ingredient.GetAll);

router.post('/api/cocktail/Propose/', cocktail.Propose);
router.get('/api/cocktail/GetByName/:name', cocktail.GetByName);
router.get('/api/cocktail/', cocktail.GetAll);

/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/logs/', Log.GetAll);
router.get('/api/logs/GetById/:id', Log.GetById);

router.get('/api/statistics', statistics.GetAll);

router.post('/api/user/', user.Create);
router.get('/api/user/', user.GetAll);
router.get('/api/user/GetById/:id', user.GetById);
router.delete('/api/user/:id', user.Delete);

router.post('/api/ingredient/', ingredient.Create);
router.put('/api/ingredient/:id', ingredient.Update);
router.get('/api/ingredient/GetById/:id', ingredient.GetById);
router.delete('/api/ingredient/:id', ingredient.Delete);

router.post('/api/cocktail/', cocktail.Create);
router.put('/api/cocktail/:id', cocktail.Update);
//router.put('/api/cocktail/AddIngredient/:id', cocktail.AddIngredient);
//router.put('/api/cocktail/DeleteIngredient/:id', cocktail.DeleteIngredient);
router.get('/api/cocktail/GetById/:id', cocktail.GetById);
router.delete('/api/cocktail/:id', cocktail.Delete);

module.exports = router;
