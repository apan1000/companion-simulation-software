// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('UserCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout) {
  $scope.user = Companion.getUser();

  var ref = new Firebase("https://companion-simulation.firebaseio.com");

  if ($routeParams.user) {
    var otherUserRef = ref.child('users/'+$routeParams.user);
  } else {
    var userRef = ref.child('users/'+Companion.getUser().uid);
  }

  // Gives user a new pokémon
  $scope.hatchEgg = function() {
    if($scope.user.pokemon.name === 'egg') {
      Companion.getNewPokemon();
      $scope.nicknameSuccess = false;
      $scope.showNickname = true;
    }
  }

  // Sets a new name to user's pokemon
  $scope.addNickname = function(newNickname) {
    console.log("Nickname: ",newNickname);
    $scope.user.pokemon.name = newNickname;
    $scope.showNickname = false;
    $scope.showAddNickname = false;
    $scope.nicknameSuccess = true;
    Companion.setUser($scope.user);
  }

  // Hides the create nickname popup
  $scope.hideNickname = function() {
    $scope.showNickname = false;
  }

  // Hides the nickname success popup
  $scope.hideNicknameSuccess = function() {
    $scope.nicknameSuccess = false;
  }

  // var getAttacks = function() {
  //   $scope.moves = $scope.user.pokemon.moves;
  //   $scope.attacks = $scope.moves.slice(0,1,2,3);
  //   // console.log("Attacks:"+$scope.attacks);
  // }

  // Get the sprite of $scope.user.pokemon and set it as $scope.sprite NOT USED ATM!!!
  var getSprite = function() {
    var parts = $scope.user.pokemon.sprites[0].resource_uri.split("/");
    var spriteUri = parts[parts.length - 2];

    Companion.sprite.get({uri:spriteUri}, function(data){
      $scope.status = "";
      $scope.user.pokemon.sprite =  'http://pokeapi.co' + data.image;
    }, function(data){
      $scope.status = "There was an error";
      $scope.user.pokemon.sprite = 'http://i.imgur.com/D9sYjvH.jpg';
    });
  }

  // Attach an asynchronous callback to get user when changed
  $scope.$on("userChanged", function() {
    console.log("User changed, setting scope.user!");
    $timeout(function() {
      $scope.user = Companion.getUser();
    });
  });

  if ($routeParams.user) {
    otherUserRef.on("value", function(snapshot) {
      $timeout(function() {
        $scope.otherUser = snapshot.val();
        console.log("otherUser:",$scope.otherUser);
      });
    });
  }

});
