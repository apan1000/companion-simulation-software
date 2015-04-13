// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('UserCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope) {

  var ref = new Firebase("https://companion-simulation.firebaseio.com");

  if ($routeParams.user) {
    var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$routeParams.user);
  } else {
    var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);
  }

  $scope.hatchEgg = function() {
    if($scope.user.pokemon === 'egg') {
      var pokeID = Math.floor((Math.random() * 718) + 1);
      console.log("Random id will be: "+ pokeID);
      // Get pokemon
      Companion.pokemon.get({id:pokeID}, function(data){
        var parts = data.sprites[0].resource_uri.split("/");
        var spriteUri = parts[parts.length - 2];
        // Get sprite url
        Companion.sprite.get({uri:spriteUri}, function(spriteData){
          $scope.status = "";
          var spriteUrl =  'http://pokeapi.co' + spriteData.image;
          console.log(spriteUrl);

          // Set companion
          var evolutionsArray = [];
          for (var i = 0; i < data.evolutions.length; i++) {
            evolutionsArray.push(data.evolutions[i]);
          }
          var typesArray = [];
          for (var i = 0; i < data.types.length; i++) {
            typesArray.push(data.types[i].name);
          }
          // The new companion the user is given
          companion = {
            attack:data.attack,
            defense:data.defense,
            evolutions:evolutionsArray,
            exp:0,
            happiness:data.happiness,
            height:data.height,
            hp:data.hp,
            name:data.name,
            id:pokeID,
            lvl:1,
            sp_atk:data.sp_atk,
            sp_def:data.sp_def,
            speed:data.speed,
            sprite:spriteUrl,
            types:typesArray,
            weight:data.weight
          };
          // Set user pokemon as companion
          ref.child("users").child($rootScope.user.uid).update({
            pokemon: companion
          });
          // getPokemon();
          }, function(spriteData){
            $scope.status = "There was an error";
            $scope.sprite = 'http://i.imgur.com/D9sYjvH.jpg';
          });

        
        }, function(data){
          $scope.status = "There was an error hatching the egg";
      });
    }
  }

  // Get pokemon data, set $scope.pokemon and $scope.sprite
  var getPokemon = function() {
    $scope.status = "Loading...";
    if($scope.user.pokemon === 'egg') {
      $scope.sprite = 'images/egg_jump.gif';
      $scope.status = "";
    }
    else {
      $scope.pokemon = $scope.user.pokemon;
      $scope.sprite = $scope.pokemon.sprite;
      // Companion.pokemon.get({id:$scope.user.pokemon}, function(data){
      //     $scope.pokemon = data;
      //     // console.log($scope.pokemon);
      //     getSprite();
      //     getAttacks();
      //   }, function(data){
      //     $scope.status = "There was an error";
      // });
    }
  }

  var getAttacks = function() {
    $scope.moves = $scope.pokemon.moves;
    $scope.attacks = $scope.moves.slice(0,1,2,3);
    // console.log("Attacks:"+$scope.attacks);
  }

  // Get the sprite of $scope.pokemon and set it as $scope.sprite NOT USED ATM!!!
  var getSprite = function() {
    var parts = $scope.pokemon.sprites[0].resource_uri.split("/");
    var spriteUri = parts[parts.length - 2];

    Companion.sprite.get({uri:spriteUri}, function(data){
      $scope.status = "";
      $scope.sprite =  'http://pokeapi.co' + data.image;
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

});
