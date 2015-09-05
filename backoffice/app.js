(function () {
    'use strict';
    angular
        .module('app', ['ngRoute', 'ngCookies', 'colorpicker.module', 'mgcrea.ngStrap', 'angularUtils.directives.dirPagination'])
        .config(config)
        .run(run);
    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'views/users.html',
            controller: 'UserController',
            controllerAs: 'vm'
        })
        .when('/login',{
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            controllerAs: 'vm'
        })
        .when('/users',{
            templateUrl: 'views/users.html',
            controller: 'UserController',
            controllerAs: 'vm'
        })
        .when('/ingredients',{
            templateUrl: 'views/ingredients.html',
            controller: 'IngredientController',
            controllerAs: 'vm'
        })
        .when('/cocktails',{
            templateUrl: 'views/cocktails.html',
            controller: 'CocktailController',
            controllerAs: 'vm'
        })
        .when('/logs',{
            templateUrl: 'views/logs.html',
            controller: 'LogController',
            controllerAs: 'vm'
        })
        .otherwise({ redirectTo: '/' });
    }
    run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    function run($rootScope, $location, $cookieStore, $http) {
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['x-access-token'] = $rootScope.globals.currentUser.token; // jshint ignore:line
            $http.defaults.headers.common['Authorization'] = $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var restrictedPage = $.inArray($location.path(), ['/login']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
        });
    }
})();
