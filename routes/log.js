'use strict';

var mongoose = require('mongoose');
var LogModel = mongoose.model('Log');

var Log = {
    GetAll: function(req, res) {
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        LogModel.find(function(err, Logs) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({'Logs': Logs});
            }
        });
    },

    GetById: function(req, res) {
        if(req.decoded.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Authorization Error' 
            });
        }
        LogModel.findById(req.params.id, function(err, Log) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.json({'Log': Log});
            }
        });
    },
};

module.exports = Log;
