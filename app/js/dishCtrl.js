// Dinner controller that we use whenever we want to display detailed
// information for one dish
dinnerPlannerApp.controller('DishCtrl', function ($scope,$routeParams,Dinner) {
  
  // TODO in Lab 5: you need to get the dish according to the routing parameter
  // $routingParams.paramName
  // Check the app.js to figure out what is the paramName in this case

	$scope.status = "Loading dish...";
	Dinner.dish.get({id:$routeParams.dishId},function(data){
    	$scope.dish = data;
    	$scope.status = "";
	},function(data){
     	$scope.status = "There was an error";
   	});

 	$scope.getDishPrice = function(dish) {
 		return Dinner.getDishPrice(dish);
	}

  $scope.getNumberOfGuests = function() {
    return Dinner.getNumberOfGuests();
  }

  $scope.getTotalMenuPrice = function() {
    return Dinner.getTotalMenuPrice();
  }
  
  $scope.getIngredientAmount = function(ingredient) {
  	return Number((ingredient.MetricQuantity*Dinner.getNumberOfGuests()).toFixed(2));
  }

  $scope.getIngredientPrice = function(ingredient) {
  	return $scope.getIngredientAmount(ingredient);
  }

});
