var uuid = require('uuid');

module.exports = {
	'rootDir': '.',
	'modelDir': '/models/',
	'routeDir': '/routes/',
    'secret': uuid.v4(),
    'database': 'mongodb://lamtab:c^6WQS5t@ds035503.mongolab.com:35503/locktails'

};