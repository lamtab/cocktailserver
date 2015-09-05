(function () {
    'use strict';

    angular
        .module('app')
        .factory('LogService', LogService);

    LogService.$inject = ['$http', 'FlashService'];
    function LogService($http, FlashService) {
        var service = {};
        var serverUrl = 'http://localhost:8080'
        service.GetAll = GetAll;
        service.GetById = GetById;
        return service;


        function GetAll() {
            return $http.get(serverUrl + '/api/logs').then(handleSuccess, handleError);
        }

        function GetById(id) {
            return $http.get(serverUrl +'/api/logs/GetById/' + id).then(handleSuccess, handleError);
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
