(function () {
    'use strict';

    angular
        .module('app')
        .controller('NavigationController', NavigationController);

    NavigationController.$inject = ['$location', '$rootScope', 'UserService','AuthenticationService', 'FlashService'];
    function NavigationController($location, $rootScope, UserService, AuthenticationService, FlashService) {
        var vm = this;

        (function initController() {
            
        })();
    }

})();