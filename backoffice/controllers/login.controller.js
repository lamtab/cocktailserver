(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', '$rootScope', 'UserService','AuthenticationService', 'FlashService'];
    function LoginController($location, $rootScope, UserService, AuthenticationService, FlashService) {
        var vm = this;
        vm.errors = [];
        vm.login = login;

        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
        })();

        function login() {
            var message, error;
            vm.dataLoading = true;
            AuthenticationService.Login(vm.username, vm.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials(response.token, vm.username, vm.password);
                    $location.path('/');
                } else {
                    vm.error = response.message;
                    vm.errors = response.errors;
                    message = vm.error;
                    for (error in vm.errors) {
                        if (vm.errors.hasOwnProperty(error)) {
                            message += '<br/>' + vm.errors[error].path + ' ' + vm.errors[error].message;
                        }
                    }
                    FlashService.Error(message);
                }
            });
            vm.dataLoading = false;
        };

        $rootScope.$on('$viewContentLoaded', function(event) {
            $('.view-animate-login').addClass('show');
        });
    }
})();