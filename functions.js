'use strict';

var Base64 = require('./Base64');
var xssFilters = require('xss-filters');
var auth = require('./routes/auth');
var mongoose = require('mongoose');
var LogModel = mongoose.model('Log');

exports.getDataFromReq = function(role, body, forbidden) {
  var obj = {};

  for(var property in body) {
        if(body.hasOwnProperty(property)) {
          if(forbidden.indexOf(property) && role !== 'admin') {
            continue;
          }
          if(typeof(body[property]) === 'object') {
            obj[property] = this.getDataFromReq(body[property]);
          } else {
            obj[property] = body[property];
          }
        }
  }
  return obj;
}

exports.xssFilter = function(body) {

  for (var property in body) {
    if(typeof(body[property]) === 'object') {
      this.xssFilter(body[property]);
    } else {
      body[property] = xssFilters.inHTMLData(body[property]);
    }

  }
}

exports.CreateLog = function(req, res) {
  var log = new LogModel({
      method: req.method,
      url: req.url,
      user: (typeof(req.decoded) !== 'undefined') ? req.decoded.username : ' ',
      referer: req.headers.referer,
      agent: req.headers['user-agent'],
      startTime: req._startTime,
      body: JSON.stringify(req.body)
  });
  log.save(function(err) {
      if(err) {
          console.log(err);
      }
  });
}

exports.isAuthenticated = function(req, res, next) {
    var authData = Base64.decode(req.headers['authorization']).split(':');
    if(auth.validate(authData[0], authData[1])) {
      return true;
    }
    return res.status(401).send({ 
                success: false, 
                message: 'Unauthorized access.' 
            });
}
exports.isAllowed = function(req, res, next) {
    var authData = Base64.decode(req.headers['authorization']).split(':');
    var user = auth.validateUser(authData[0]);
    if(user._id == req.params.id) {
      return true;
    }
    return res.status(403).send({ 
                success: false, 
                message: 'Forbidden.' 
            });
}
exports.isAdmin = function(req, res) {
    if(req.decoded.role !== "admin") { 
      return res.status(403).send({ 
                success: false, 
                message: 'Forbidden.' 
            });
    }
}

exports.arrayDiff = function(A,B) {
  var diff = 0, diffWeighted = 0;
  var i = 0, j = 0, n = A.length, m = B.length;
  for(i = 0; i < n; i++) {
    for(j = 0; j < m; j++) {
      if(A[i].name == B[j].name) {
        break;
      }
    }
    if(j === m) {
      diff++;
      diffWeighted += A[i].weight;
    }
  }
  return { 'diffPerc': diff / n, 'diffAbs': diff, 'diffWeighted': diffWeighted };
}

exports.arrayDiffPrecise = function(A,B) {
  var diff = 0, diffWeighted = 0;
  var i = 0, j = 0, n = A.length, m = B.length;
  for(i = 0; i < n; i++) {
    for(j = 0; j < m; j++) {
      if(A[i]._id == B[j]._id) {
        break;
      }
    }
    if(j === m) {
      diff++;
      diffWeighted += A[i].weight;
    }
  }
  result = { 'diffPerc': diff / n, 'diffAbs': diff, 'diffWeighted': diffWeighted };
  return result;
}