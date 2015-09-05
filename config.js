var uuid = require('uuid');

module.exports = {
	'rootDir': '.',
	'modelDir': '/models/',
	'routeDir': '/routes/',
    'secret': uuid.v4(),
    'database': 'mongodb://lamtab:lambros93132*@ds035503.mongolab.com:35503/locktails'

};