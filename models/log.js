'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema
var LogSchema = new mongoose.Schema({
    method: 		{ type: String, required: true },
    url: 			{ type: String, required: true },
    user: 			{ type: String, required: false },
    referer: 		{ type: String, required: true },
    agent: 			{ type: String, required: true },
    startTime: 		{ type: String, required: true },
    body: 			{ type: String, required: true },
    createdAt: 		{ type: Date, default: Date.now },
});

var Log = mongoose.model('Log', LogSchema);

module.exports = Log;