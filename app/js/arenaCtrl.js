// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('ArenaCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope) {

  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);

  // Get pokemon data
  var getPokemon = function() {
    $scope.status = "Loading...";
    // console.log("pokemon: "+$scope.user.pokemon);
    if($scope.user.pokemon === 'egg') {
      $scope.sprite = 'images/egg_jump.gif';
      $scope.status = "";
    }
    else {
      $scope.status = "";
      $scope.pokemon = $scope.user.pokemon;
      $scope.pokemon.curHp = $scope.pokemon.hp;
      // Companion.pokemon.get({id:$scope.user.pokemon}, function(data){
      //     $scope.status = "";
      //     $scope.pokemon = data;
      //     console.log("YOUR POKEMON: "+$scope.pokemon);
      //     $scope.pokemon.curHp = $scope.pokemon.hp;
      //     getSprite($scope.pokemon);
      //   }, function(data){
      //     $scope.status = "There was an error";
      // });
    }
  }

  $scope.attackEnemy = function() {

    var randomMonster = Math.floor((Math.random() * 500) + 1);
    var randomPoke = Math.floor((Math.random() * 500) + 1);
    var random1 = Math.floor((Math.random() * 10) + 1);
    var random2 = Math.floor((Math.random() * 10) + 1);

    if ($scope.temp_monster.hp === 0) {
      return
    } else {
      $scope.temp_monster.hp = Math.max(0,$scope.temp_monster.hp-Math.floor(($scope.pokemon.attack*random1)/$scope.temp_monster.defense));
      $scope.pokemon.curHp = Math.max(0,$scope.pokemon.curHp-Math.floor(($scope.temp_monster.attack*random2)/$scope.pokemon.defense));
      if ($scope.temp_monster.hp<=0) {
        $scope.pokemon.exp += 30;
        $scope.pokemon.hp += Math.floor(Math.random()*21)-10; //Add or subtract hp, very exciting
        userRef.child("pokemon").update({
              exp: $scope.pokemon.exp,
              hp: $scope.pokemon.hp
            });
        console.log($scope.pokemon);
        //getSpecificPokemon(randomMonster);
        $scope.pokemon.curHp = $scope.pokemon.hp;
      }
    }

    if ($scope.pokemon.curHp<=0){
        console.log("Random id will be: "+ randomPoke);

        userRef.update({ //Gör väldigt många calls i consolen när den dör
                pokemon: 'egg',
                lvl: 0
              });
        window.location.href = '#/home';
    }

  }

  var getSpecificPokemon = function(monster_id) {
    
    /*
    console.log("GET_MONSTER");
    var temp_monster = Companion.getMonster(monster_id);

    temp_monster.then(function(result) {
       $scope.temp_monster = result;
       console.log("data.name"+$scope.temp_monster.name);
    });
    */
    Companion.pokemon.get({id:monster_id}, function(data){
        $scope.temp_monster = data;
        console.log($scope.temp_monster);
        getSprite($scope.temp_monster);
        //console.log("TEMP_MONSTER_IMG: "+temp_monster.species);

      }, function(data){
        $scope.status = "There was an error";
    });
  }

  // Get the sprite of $scope.pokemon and set it as $scope.sprite
  var getSprite = function(monster) {

    var parts = monster.sprites[0].resource_uri.split("/");
    var spriteUri = parts[parts.length - 2];
    //monster.new_sprite = 'LOL';

    Companion.sprite.get({uri:spriteUri}, function(data){
      monster.new_sprite = 'http://pokeapi.co' + data.image;
      console.log("SPRITE DATA "+monster.new_sprite);
    }, function(data){
      monster.new_sprite = 'http://imgur.com/gallery/geH3T';
      $scope.status = "There was an error";
    });
  }

  // Attach an asynchronous callback to read the data at our posts reference and get user
  userRef.on("value", function(snapshot) {
    $scope.user = snapshot.val();
    console.log($scope.user);
    getPokemon();
    var random = Math.floor((Math.random() * 718) + 1);
    getSpecificPokemon(random);
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

});
