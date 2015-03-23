// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('UserCtrl', function ($scope,$routeParams,$firebaseObject,Companion) {

  var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$routeParams.user);

  // Attach an asynchronous callback to read the data at our posts reference and get user
  userRef.on("value", function(snapshot) {
    $scope.user = snapshot.val();
    console.log($scope.user);
    getPokemon();
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  var getPokemon = function() {
    $scope.status = "Loading...";
    console.log("pokemon: "+$scope.user.pokemon);
    Companion.pokemon.get({id:$scope.user.pokemon}, function(data){
        $scope.pokemon = data;
        console.log($scope.pokemon);
        getSprite();
      }, function(data){
        $scope.status = "There was an error";
    });
  }

  // Get the sprite of $scope.pokemon and set it as $scope.sprite
  var getSprite = function() {
    console.log('spriteUri: '+$scope.pokemon.sprites[0].resource_uri);

    var parts = $scope.pokemon.sprites[0].resource_uri.split("/");
    var spriteUri = parts[parts.length - 2];

    console.log('Processed spriteUri: '+spriteUri);

    Companion.sprite.get({uri:spriteUri}, function(data){
      $scope.status = "";
      $scope.sprite =  'http://pokeapi.co/' + data.image;
    }, function(data){
      $scope.status = "There was an error";
      $scope.sprite = 'http://i.imgur.com/D9sYjvH.jpg';
    });
  }
  
  

  // $scope.getDishPrice = function(dish) {
  // 	return Dinner.getDishPrice(dish);
  // }
  
  // $scope.getIngredientAmount = function(ingredient) {
  // 	return Number((ingredient.MetricQuantity*Dinner.getNumberOfGuests()).toFixed(2));
  // }

});