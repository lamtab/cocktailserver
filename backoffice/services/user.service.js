(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$http', 'FlashService'];
    function UserService($http, FlashService) {
        var service = {};
        var serverUrl = 'http://localhost:8080'
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.AddIngredient = AddIngredient;
        service.DeleteIngredient = DeleteIngredient;

        return service;

        function GetAll() {
            return $http.get(serverUrl + '/api/user/').then(handleSuccess, handleError);
        }

        function GetById(id) {
            return $http.get(serverUrl +'/api/user/GetById/' + id).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get(serverUrl + '/api/user/GetByUsername/' + username).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post(serverUrl + '/api/user', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put(serverUrl + '/api/user/' + user.username, user).then(handleSuccess, handleError);
        }

        function Delete(id) {
            return $http.delete(serverUrl + '/api/user/' + id).then(handleSuccess, handleError);
        }

        function AddIngredient(user, ingredient) {
            return $http.put(serverUrl + '/api/user/AddIngredient/' + user._id, ingredient).then(handleSuccess, handleError);
        }

        function DeleteIngredient(user, ingredient) {
            return $http.put(serverUrl + '/api/user/DeleteIngredient/' + user._id, ingredient).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(response) {
            return response.data;
        }

        function handleError(response) {
            var message = response.data.message;
            var errors = response.data.errors;
            for (var error in errors) {
                if (errors.hasOwnProperty(error)) {
                    message += '<br/>' + errors[error].path + ' ' + errors[error].message;
                }
            }
            FlashService.Error(message);
        }
    }

})();
