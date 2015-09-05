(function () {
    'use strict';

    angular
        .module('app')
        .controller('CocktailController', CocktailController);

    CocktailController.$inject = ['CocktailService', 'IngredientService', '$rootScope', 'FlashService'];
    function CocktailController(CocktailService, IngredientService, $rootScope, FlashService) {
        var vm = this;

        vm.searchCocktail = '';
        vm.searchIngredient = '';
        
        vm.cocktail = null;
        vm.cocktails = [];
        vm.ingredient = null;
        vm.ingredients = [];
        vm.quantities = [];
        vm.operation ="Create";
        
        vm.SubmitForm =SubmitForm;
        vm.SelectCocktail = SelectCocktail;
        vm.ClearCocktail = ClearCocktail;

        vm.Create = Create;
        vm.Update = Update;
        vm.Delete = Delete;
        vm.AddIngredient = AddIngredient;
        vm.DeleteIngredient = DeleteIngredient;
        
        initController();

        function initController() {
            loadAllCocktails();
            loadAllIngredients();
        }

        function SelectCocktail(item) {
            vm.cocktail= item;
            vm.quantities = item.quantities;
            vm.operation="Update";
            CocktailService.GetByName(item.name)
                .then(function (response) {
                    if(response) {
                        vm.cocktail.ingredients = response.cocktail.ingredients;
                    }
                });
        }
        
        function ClearCocktail() {
            vm.cocktail= null;
            vm.quantities = [];
            vm.operation="Create";
        }
        
        function loadAllCocktails() {
            CocktailService.GetAll()
                .then(function(response) {
                    if(response) {
                        vm.cocktails = response.cocktails;
                    }
                });
        }
        function loadAllIngredients() {
            IngredientService.GetAll()
                .then(function (response) {
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
            vm.cocktail.quantities = vm.quantities;
            vm.dataLoading = true;
            CocktailService.Update(vm.cocktail)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Cocktail Succesfully updated');
                    }
                    vm.dataLoading = false;
                });
        }

        function Create() {
            vm.cocktail.quantities = vm.quantities;
            vm.dataLoading = true;
            CocktailService.Create(vm.cocktail)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Cocktail Succesfully Created');
                        vm.cocktails.push(vm.cocktail);
                        ClearCocktail();
                        loadAllCocktails();
                    }
                    vm.dataLoading = false;
                });
        }

        function Delete(cocktail) {
            var index;
            vm.dataLoading = true;
            CocktailService.Delete(cocktail._id)
                .then(function (response) {
                    if (response) {
                        FlashService.Success('Cocktail Succesfully Deleted');
                        index = vm.cocktails.indexOf(cocktail);
                        vm.cocktails.splice(index, 1);
                        ClearCocktail();
                    }
                    vm.dataLoading = false;
                });
        }
        function AddIngredient(ingredient) {
            if(typeof(vm.cocktail.ingredients) == 'undefined') {
                vm.cocktail.ingredients = [];
            }
            vm.cocktail.ingredients.push(ingredient);
        }

        function DeleteIngredient(ingredient) {
            var index = vm.cocktail.ingredients.indexOf(ingredient);
            vm.cocktail.ingredients.splice(index, 1);
            vm.quantities.splice(index, 1);
        }
    }

})();