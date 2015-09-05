(function () {
    'use strict';

    angular
        .module('app')
        .factory('FlashService', FlashService);

    FlashService.$inject = ['$rootScope', '$timeout', '$sce'];
    function FlashService($rootScope, $timeout, $sce) {
        var service = {};
        var timeout = null;

        service.Success = Success;
        service.Error = Error;

        initService();

        return service;

        function initService() {
            $rootScope.$on('$locationChangeStart', function () {
                clearFlashMessage();
            });
        }

        function clearFlashMessage() {
            var flash = $rootScope.flash;
            if (flash) {
                if (!flash.keepAfterLocationChange) {
                    delete $rootScope.flash;
                } else {
                    // only keep for a single location change
                    flash.keepAfterLocationChange = false;
                }
            }
        }

        function Success(message, keepAfterLocationChange) {
            $timeout.cancel(timeout);
            clearFlashMessage();
            $rootScope.flash = {
                message: $sce.trustAsHtml(message),
                type: 'success', 
                keepAfterLocationChange: keepAfterLocationChange
            };
            
            timeout = $timeout(clearFlashMessage, 2000);
        }

        function Error(message, keepAfterLocationChange) {
            $timeout.cancel(timeout);
            clearFlashMessage();
            $rootScope.flash = {
                message: $sce.trustAsHtml(message),
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };

            timeout = $timeout(clearFlashMessage, 4000);
        }
    }

})();