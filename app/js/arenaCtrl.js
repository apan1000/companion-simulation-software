// User controller that we use whenever we want to display detailed
// information about a user
companionApp.controller('ArenaCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout,$location) {

  $scope.combo = 1;
  $scope.maxTimer = 100;
  $scope.battle = false;
  $scope.timer = 0;
  $scope.turnBased = true;
  $scope.ready = false;
  var rate = 500;
  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);

  $scope.getHpPercentage = function() {
    return $scope.user.pokemon.curHp/$scope.user.pokemon.hp*100;
  }

  $scope.getEnemyHpPercentage = function() {
    if ($scope.temp_monster) {
      return $scope.temp_monster.curHp/$scope.temp_monster.hp*100;
    }
  }

  function reduceTime() {
    if ($scope.timer < $scope.maxTimer){
      $scope.timer = $scope.timer + 20;
    }
    else
    {
      rate = 500;
      takeDmg();
      $scope.timer = 0;
    }

    if($scope.battle){
      $timeout( function(){ reduceTime(); }, rate);
    }
  }

  var takeDmg = function() {
    $scope.combo = 1;
    var random2 = Math.floor((Math.random() * 5) + 3);
    $scope.yourDmg = 0;
    $scope.enemyDmg = Math.floor(($scope.temp_monster.attack*random2)/$scope.user.pokemon.defense);
    $scope.user.pokemon.curHp = Math.max(0,$scope.user.pokemon.curHp-$scope.enemyDmg);
    $scope.user.pokemon.happiness = Math.max(0,$scope.user.pokemon.happiness-5);

    $scope.showMessage = true;
      
    $timeout(function() {
      $scope.showMessage = false;
    }, 1000);
    // Update user
    Companion.setUser($scope.user);

    // If user's pokémon is dead
    if ($scope.user.pokemon.curHp<=0){
        $scope.myMonsterAni = "animated fadeOutUp";
        $scope.battle = false;
        $timeout( function(){ battleLost(); }, 2000);
      }
  }

  var battleWon = function(){

    $scope.combo = 1;
    $scope.battle = false;
    $scope.ready = false;
    $scope.user.pokemon.curExp += Math.floor(($scope.temp_monster.exp)*0.5);
    $scope.user.wins += 1;
    $scope.user.score += 2;
    $scope.user.pokemon.happiness += 5;

    if (Math.random()*5>1){
      console.log("ITEM DROP");

      var rand = Math.round(Math.random()*2);
      $scope.user.items[rand] += 1;
    }

    if ($scope.user.pokemon.curExp>=$scope.user.pokemon.exp){
      $scope.myMonsterAni = "animated flip";
      $scope.user.pokemon.curExp -= $scope.user.pokemon.exp;
      $scope.user.pokemon.exp += Math.floor($scope.user.pokemon.exp*0.1)+1;
      //Cant gain more than one lvl, fix later
      $scope.user.pokemon.curExp = Math.min($scope.user.pokemon.exp-10,$scope.user.pokemon.curExp);
      $scope.user.pokemon.lvl += 1;
      $scope.user.pokemon.hp += Math.floor(Math.random()*10);
      $scope.user.pokemon.curHp = $scope.user.pokemon.hp;
      $scope.user.pokemon.attack += Math.floor(Math.random()*5)+1;
      $scope.user.pokemon.defense += Math.floor(Math.random()*5)+1;
      console.log("LEVELED UP!");
    }
    else{
      $scope.myMonsterAni = "animated bounce";
    }

    // Update user
    Companion.setUser($scope.user);
    getRandomPokemon();
  }

  var battleLost = function(){
    $scope.user.pokemon = {name:'egg',sprite:'images/egg_jump.gif'};
    $scope.user.losses += 1;
    $scope.user.score -= 1;
    $scope.ready = false;
    // Update user
    Companion.setUser($scope.user);
    $location.path('#/home');
  }

  $scope.attackEnemy = function() {

    if ($scope.battle == false){
      if ($scope.ready == true){
        $scope.combo = 1;
        $scope.battle = true;
        $scope.myMonsterAni = "";
        reduceTime(); //START MORTAL COMBAT
      }
      else{
        console.log('Not ready yet!');
      }
    }
    else{
      if ($scope.temp_monster.curHp === 0) {
        return
      } 
      else
      {
        var randomAtk1 = Math.floor((Math.random() * 3) + 3);
        var randomAtk2 = Math.floor((Math.random() * 3) + 3);

        //if ($scope.timer <= 90 && $scope.timer >= 70){
        if ($scope.timer == 40){ //COMBO BUILDUP
          $scope.combo += 1;
          $scope.enemyMonsterAni = "animated rubberBand";
          $scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1*0.50)/$scope.temp_monster.defense);
          } 
          else{
          if ($scope.timer == 60){ //UNLEASH THE COMBO
            var defBreaker = 2/$scope.combo;
            $scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1*$scope.combo)/($scope.temp_monster.defense*defBreaker));
            $scope.combo = 1;
            $scope.enemyMonsterAni = "animated wobble";
          }
          else{
            $scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1)/$scope.temp_monster.defense);
            $scope.combo = 1;
            $scope.enemyMonsterAni = "animated shake";
          }
        }

        $scope.showMessage = true;
        $scope.enemyDmg = Math.floor(($scope.temp_monster.attack*randomAtk2)/$scope.user.pokemon.defense);

        $timeout(function() {
            $scope.showMessage = false;
          }, 1000);

        $scope.temp_monster.curHp = Math.max(0,$scope.temp_monster.curHp-$scope.yourDmg);
        $scope.user.pokemon.curHp = Math.max(0,$scope.user.pokemon.curHp-$scope.enemyDmg);
        // Update user
        Companion.setUser($scope.user);

        if ($scope.temp_monster.curHp<=0) { //If enemy is dead
          $scope.enemyMonsterAni = "animated fadeOutUp";
          battleWon();
        }

        // If user's pokémon is dead
        if ($scope.user.pokemon.curHp<=0){
          $scope.myMonsterAni = "animated fadeOutUp";
          $scope.battle = false;
          $timeout( function(){ battleLost(); }, 2000);
        }

        rate = 550-($scope.combo*20);
        $scope.timer = 0;
      }
    }
  }

  // Get a pokémon with the specified monster_id from database
  var getSpecificPokemon = function(monster_id) {
    Companion.pokemon.get({id:monster_id}, function(data){
        $scope.temp_monster = data;
        getSprite($scope.temp_monster);
        $scope.temp_monster.curHp = $scope.temp_monster.hp;
        $scope.temp_monster.lvl = 1;
        console.log("Temp monster:",$scope.temp_monster);
        $scope.timer = 0;
      }, function(data){
        $scope.status = "Could not find a new enemy";
    });
  }

  var getRandomPokemon = function() {
    var random = Math.floor((Math.random() * 718) + 1);
    getSpecificPokemon(random);
  }

  // Get the sprite of enemy monster
  var getSprite = function(monster) {
    var parts = monster.sprites[0].resource_uri.split("/");
    var spriteUri = parts[parts.length - 2];

    Companion.sprite.get({uri:spriteUri}, function(data){
      monster.new_sprite = 'http://pokeapi.co' + data.image;
      console.log("SPRITE DATA ",monster.new_sprite);
      $scope.enemyMonsterAni = "animated lightSpeedIn"; //entering the fields
      $scope.ready = true;
    }, function(data){
      monster.new_sprite = '';
      $scope.status = "There was an error";
    });
  }

  // Get a challenger upon entering arena
  if ($routeParams.user != '0') {
    var otherUserRef = ref.child('users/'+$routeParams.user);
    console.log("USER FIENDE");
    // Fetches once, so it can't be healed by user giving candy etc.
    otherUserRef.once("value", function(snapshot) {
      $timeout(function() {
        $scope.otherUser = snapshot.val();
        console.log("otherUser:",$scope.otherUser);
        $scope.temp_monster = $scope.otherUser.pokemon;
        $scope.temp_monster.new_sprite = $scope.otherUser.pokemon.sprite;
        $scope.temp_monster.curHp = $scope.temp_monster.hp;
        $scope.ready = true;
      });
    });
  }
  else{
    getRandomPokemon();
  }

  $scope.$on('userChanged', function() {
    var url = $location.url();
    if(url === "/fields/"+$routeParams.user || url === "/fields/0"){
      $scope.user = Companion.getUser();
    }
    else{
      $scope.battle = false;
    }
  });

});
