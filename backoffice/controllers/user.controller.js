(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['UserService', 'AuthenticationService', '$rootScope', 'FlashService'];
    function UserController(UserService, AuthenticationService, $rootScope, FlashService) {
        var vm = this;

        vm.searchUser = '';
        
        vm.user= null;
        vm.users = [];
        vm.operation ="Create";
        
        vm.SubmitForm =SubmitForm;
        vm.SelectUser = SelectUser;
        vm.ClearUser = ClearUser;
        
        vm.Create =Create;
        vm.Update =Update;
        
        initController();

        function initController() {
            loadAllUsers();
        }

        function SelectUser(item) {
            vm.user= item;
            vm.operation="Update";
        }

        function ClearUser() {
            vm.user= null;
            vm.operation="Create";
        }
        
        function loadAllUsers() {
            var message, error;
            UserService.GetAll()
                .then(function(response) {
                    if(response) {
                        vm.users = response.users;
                    }
                });
        }

        function SubmitForm() {
            if(vm.operation == "Create") {
                vm.Create();
            }
            if(vm.operation == "Update") {
                vm.Update();
            }
        }

        function Update() {
            var message, error;
            vm.dataLoading = true;
            UserService.Update(vm.user)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('User Succesfully updated');
                    }
                    vm.dataLoading = false;
                });
        }

        function Create() {
            var message, error;
            vm.dataLoading = true;
            UserService.Create(vm.user)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Registration successful');
                        loadAllUsers();
                    }
                    vm.dataLoading = false;
                });
        }
    }

})();