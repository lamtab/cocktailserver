var uuid = require('uuid');

module.exports = {
	'rootDir': '/Applications/MAMP/htdocs/CocktailServer',
	'modelDir': '/models/',
	'routeDir': '/routes/',
    'secret': uuid.v4(),
    'database': 'mongodb://lamtab:lambros93132*@ds035503.mongolab.com:35503/locktails'

};