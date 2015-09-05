(function () {
    'use strict';

    angular
        .module('app')
        .factory('IngredientService', IngredientService);

    IngredientService.$inject = ['$http', 'FlashService'];
    function IngredientService($http, FlashService) {
        var service = {};
        var serverUrl = 'http://localhost:8080'
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByName = GetByName;
        return service;


        function Create(ingredient) {
            return $http.post(serverUrl + '/api/ingredient', ingredient).then(handleSuccess, handleError);
        }

        function Update(ingredient) {
            return $http.put(serverUrl + '/api/ingredient/' + ingredient._id, ingredient).then(handleSuccess, handleError);
        }

        function Delete(id) {
            return $http.delete(serverUrl + '/api/ingredient/' + id).then(handleSuccess, handleError);
        }
        function GetAll() {
            return $http.get(serverUrl + '/api/ingredient/').then(handleSuccess, handleError);
        }

        function GetById(id) {
            return $http.get(serverUrl +'/api/ingredient/GetById/' + id).then(handleSuccess, handleError);
        }

        function GetByName(name) {
            return $http.get(serverUrl + '/api/ingredient/GetByName/' + name).then(handleSuccess, handleError);
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
