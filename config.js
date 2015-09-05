var uuid = require('uuid');

module.exports = {
	'rootDir': '/Applications/MAMP/htdocs/CocktailServer',
	'modelDir': '/models/',
	'routeDir': '/routes/',
    'secret': uuid.v4(),
    'database': 'mongodb://localhost/Cocktails'

};