// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('UserCtrl', function ($scope,$routeParams,$firebaseObject,Companion) {

  var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/user1"/*+$routeParams.user*/);

  // Get pokemon data
  var getPokemon = function() {
    $scope.status = "Loading...";
    console.log("pokemon: "+$scope.user.pokemon);
    if($scope.user.pokemon === 'egg') {
      $scope.sprite = 'http://cdn.bulbagarden.net/upload/c/cd/Poketch_Egg.png';
      $scope.status = "";
    }
    else {
      Companion.pokemon.get({id:$scope.user.pokemon}, function(data){
          $scope.pokemon = data;
          console.log($scope.pokemon);
          getSprite();
          getAttacks();
        }, function(data){
          $scope.status = "There was an error";
      });
    }
  }

  var getAttacks = function() {
    $scope.moves = $scope.pokemon.moves;
    $scope.attacks = $scope.moves.slice(0,1,2,3);
    console.log("Attacks:"+$scope.attacks);
    
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

  // Attach an asynchronous callback to read the data at our posts reference and get user
  userRef.on("value", function(snapshot) {
    $scope.user = snapshot.val();
    console.log($scope.user);
    getPokemon();
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  
  

  // $scope.getDishPrice = function(dish) {
  // 	return Dinner.getDishPrice(dish);
  // }
  
  // $scope.getIngredientAmount = function(ingredient) {
  // 	return Number((ingredient.MetricQuantity*Dinner.getNumberOfGuests()).toFixed(2));
  // }

});
