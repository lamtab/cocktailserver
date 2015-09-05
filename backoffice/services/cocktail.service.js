(function () {
    'use strict';

    angular
        .module('app')
        .factory('CocktailService', CocktailService);

    CocktailService.$inject = ['$http', 'FlashService'];
    function CocktailService($http, FlashService) {
        var service = {};
        var serverUrl = 'http://localhost:8080'
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByName = GetByName;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.AddIngredient = AddIngredient;
        service.DeleteIngredient = DeleteIngredient;

        return service;

        function GetAll() {
            return $http.get(serverUrl + '/api/cocktail/').then(handleSuccess, handleError);
        }

        function GetById(id) {
            return $http.get(serverUrl +'/api/cocktail/GetById/' + id).then(handleSuccess, handleError);
        }

        function GetByName(name) {
            return $http.get(serverUrl + '/api/cocktail/GetByName/' + name).then(handleSuccess, handleError);
        }

        function Create(cocktail) {
            return $http.post(serverUrl + '/api/cocktail', cocktail).then(handleSuccess, handleError);
        }

        function Update(cocktail) {
            return $http.put(serverUrl + '/api/cocktail/' + cocktail._id, cocktail).then(handleSuccess, handleError);
        }

        function Delete(id) {
            return $http.delete(serverUrl + '/api/cocktail/' + id).then(handleSuccess, handleError);
        }

        function AddIngredient(cocktail, ingredient) {
            return $http.put(serverUrl + '/api/cocktail/AddIngredient/' + cocktail._id, {'ingredient':ingredient}).then(handleSuccess, handleError);
        }

        function DeleteIngredient(cocktail, ingredient) {
            return $http.put(serverUrl + '/api/cocktail/DeleteIngredient/' + cocktail._id, {'ingredient':ingredient}).then(handleSuccess, handleError);
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
