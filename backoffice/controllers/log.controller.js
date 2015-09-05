(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogController', LogController);

    LogController.$inject = ['LogService', '$rootScope', 'FlashService'];
    function LogController(LogService, $rootScope, FlashService) {
        var vm = this;

        vm.searchLog = '';
        vm.Log= null;
        vm.Logs = [];
        
        vm.SelectLog = SelectLog;
        
        initController();

        function initController() {
            loadAllLogs();
        }

        function SelectLog(item) {
            vm.Log= item;
        }

        function loadAllLogs() {
            LogService.GetAll()
                .then(function(response) {
                    if(response) {
                        vm.Logs = response.data.Logs;
                    }
                });
        }
    }

})();