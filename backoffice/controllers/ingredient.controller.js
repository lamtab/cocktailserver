(function () {
    'use strict';

    angular
        .module('app')
        .controller('IngredientController', IngredientController);

    IngredientController.$inject = ['IngredientService', '$rootScope', 'FlashService'];
    function IngredientController(IngredientService, $rootScope, FlashService) {
        var vm = this;

        vm.searchIngredient = '';
        vm.itemsByPage=15;
        vm.ingredient= null;
        vm.ingredients = [];
        vm.operation ="Create";
        
        vm.SubmitForm =SubmitForm;
        vm.SelectIngredient = SelectIngredient;
        vm.ClearIngredient = ClearIngredient;

        vm.Create = Create;
        vm.Update = Update;
        vm.Delete = Delete;
        
        initController();

        function initController() {
            loadAllIngredients();
        }

        function SelectIngredient(item) {
            vm.ingredient= item;
            vm.operation="Update";
        }

        function ClearIngredient() {
            vm.ingredient= null;
            vm.operation="Create";
        }
        
        function loadAllIngredients() {
            IngredientService.GetAll()
                .then(function(response) {
                    if(response) {
                        vm.ingredients = response.ingredients;
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
            vm.dataLoading = true;
            IngredientService.Update(vm.ingredient)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Ingredient Succesfully updated');
                    }
                    vm.dataLoading = false;
                });
        }

        function Create() {
            vm.dataLoading = true;
            IngredientService.Create(vm.ingredient)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Ingredient created');
                        loadAllIngredients();
                        ClearIngredient();
                    }
                    vm.dataLoading = false;
                });
        }

        function Delete(ingredient) {
            var message, error, index;
            vm.dataLoading = true;
            IngredientService.Delete(ingredient._id)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Ingredient deleted');
                        loadAllIngredients();
                        index = vm.ingredients.indexOf(ingredient);
                        vm.ingredients.splice(index, 1);
                        ClearIngredient();
                    }
                    vm.dataLoading = false;
                });
        }
    }

})();