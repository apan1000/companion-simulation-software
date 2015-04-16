// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('ArenaCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout,$location) {

  $scope.combo = 1;
  $scope.maxTimer = 100;
  $scope.battle = false;
  $scope.timer = 0;
  $scope.rightMoment = "";
  var rate = 20;
  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);

//var myVar2=setInterval(function () {reduceTime()}, 1000);

$scope.startCombat = function() {
  $scope.combo = 1;
  $scope.battle = true;
  reduceTime(); //START MORTAL COMBAT
}


function reduceTime() {
  if ($scope.timer < $scope.maxTimer){
    //console.log($scope.timer);
    $scope.timer = $scope.timer + 1;

    if ($scope.timer <= 90 && $scope.timer >= 70){
        $scope.rightMoment = "progress-bar-success";
      }
      else{
        $scope.rightMoment = "";
      }
      
  }
  else
  {
    rate = Math.floor((Math.random() * 10) + 10);
    takeDmg();
    $scope.timer = 0;
  }

  if($scope.battle){
    $timeout( function(){ reduceTime(); }, rate);
  }
}

  // Get pokemon data
  var getPokemon = function() {
    // console.log("pokemon: "+$scope.user.pokemon);
    if($scope.user.pokemon === 'egg') {
      $scope.pokemon.sprite = 'images/egg_jump.gif';
    }
    else {
      console.log("WE GOT A MONSTER");
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

  var takeDmg = function() {
    $scope.combo = 1;
    var random2 = Math.floor((Math.random() * 10) + 1);
    $scope.pokemon.curHp = Math.max(0,$scope.pokemon.curHp-Math.floor(($scope.temp_monster.attack*random2)/$scope.pokemon.defense));

    if ($scope.pokemon.curHp<=0){
      userRef.update({ //Gör väldigt många calls i consolen när den dör
              pokemon: 'egg',
              lvl: 0
            });
      window.location.href = '#/home';
    }
  }

  $scope.attackEnemy = function() {

    var randomMonster = Math.floor((Math.random() * 718) + 1);
    var randomAtk1 = Math.floor((Math.random() * 10) + 1);
    var randomAtk2 = Math.floor((Math.random() * 10) + 1);

    if ($scope.temp_monster.curHp === 0) {
      return
    } else {

      if ($scope.timer <= 90 && $scope.timer >= 70){
        $scope.combo += 1;
      }
      else{
        $scope.combo = 1;
      }

      $scope.temp_monster.curHp = Math.max(0,$scope.temp_monster.curHp-Math.floor(($scope.pokemon.attack*randomAtk1*$scope.combo)/$scope.temp_monster.defense));
      $scope.pokemon.curHp = Math.max(0,$scope.pokemon.curHp-Math.floor(($scope.temp_monster.attack*randomAtk2)/$scope.pokemon.defense));
      if ($scope.temp_monster.curHp<=0) {
        $scope.battle = false;
        $scope.pokemon.exp += 30;
        $scope.pokemon.hp += Math.floor(Math.random()*21)-10; //Add or subtract hp, very exciting
        userRef.child("pokemon").update({
              exp: $scope.pokemon.exp,
              hp: $scope.pokemon.hp,
            });
        console.log($scope.pokemon);
        $scope.pokemon.curHp = $scope.pokemon.hp;
      }
      rate = Math.floor((Math.random() * 10) + 10);
      $scope.timer = 0;
    }

    if ($scope.pokemon.curHp<=0){
        $scope.battle = false;
        userRef.update({ //Gör väldigt många calls i consolen när den dör
                pokemon: 'egg',
                lvl: 0
              });
        window.location.href = '#/home';
    }

  }

  var getSpecificPokemon = function(monster_id) {
    
    Companion.pokemon.get({id:monster_id}, function(data){
        $scope.temp_monster = data;
        getSprite($scope.temp_monster);
        $scope.temp_monster.curHp = $scope.temp_monster.hp;
        console.log($scope.temp_monster);
      }, function(data){
        $scope.status = "Could not find a new enemy";
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
    var url = $location.url();
    if(url === "/fields"){
      console.log(url);
      $scope.user = snapshot.val();
      console.log($scope.user);
      getPokemon();
      var random = Math.floor((Math.random() * 718) + 1);
      getSpecificPokemon(random);
    }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

});
