// Arena controller for fights against other monsters
companionApp.controller('ArenaCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout,$location) {

  $scope.combo = 1;
  $scope.maxTimer = 100;
  $scope.battle = false;
  $scope.timer = 0;
  $scope.turnBased = true;
  $scope.ready = false;
  $scope.newItem = '';
  $scope.outcomeImg = '';
  var rate = 500;
  var ref = new Firebase("https://companion-simulation.firebaseio.com");

  if($scope.user.beginner === "semitrue") {
    $scope.showFightTutorial = true;
  }

  // End tutorial and set user.beginner to false
  $scope.endFightTutorial = function() {
      $scope.showFightTutorial = false;
      $scope.user.beginner = false;
      Companion.setUser($scope.user);
  }

  // Get the hp percentage of user's pokémon
  $scope.getHpPercentage = function() {
    return $scope.user.pokemon.curHp/$scope.user.pokemon.hp*100;
  }

  // Get hp percentage of temp_monster
  $scope.getEnemyHpPercentage = function() {
    if ($scope.temp_monster) {
      return $scope.temp_monster.curHp/$scope.temp_monster.hp*100;
    }
  }

  // Change battle timer
  function changeTimer() {
    if ($scope.timer < $scope.maxTimer){
      $scope.timer = $scope.timer + 20;
    }
    else
    {
      rate = 500;
      var url = $location.url();
      if (url === "/fields/"+$routeParams.user || url === "/fields/0") {
        takeDmg();
      }
      else {
        $scope.battle = false;
      }
      $scope.timer = 0;
    }

    if($scope.battle){
      $timeout( function(){ changeTimer(); }, rate);
    }
  }

  // Reduce the hp of user's pokémon, how much depends on the pokémon's defense and temp_monster's attack + a random value
  // If pokémon's curHp <= 0, call battleLost()
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
        $scope.outcomeImg = "images/youdied.png";
        $scope.battleEnd = true;
        //console.log("YOU DED");
        $scope.myMonsterAni = "animated fadeOutUp";
        $scope.battle = false;
        $timeout( function(){ battleLost(); }, 2000);
      }
  }

  // Battle is ended and outcome is showed on screen
  var showOutcome = function(){
    $scope.battleEnd = true;
    $timeout(hideOutcome, 2000);
  }

  // Hides battle outcome
  var hideOutcome = function(){
      $scope.battleEnd = false;
  }

  // Increment wins, score and happiness
  // A chance for a random item drop
  // Add exp to user's pokémon
  // Prepares for the next battle
  var battleWon = function(){
    $scope.outcomeImg = "images/victory.png";
    showOutcome();
    $scope.combo = 1;
    $scope.battle = false;
    $scope.ready = false;
    $scope.user.wins += 1;
    $scope.user.score += 2;
    $scope.user.pokemon.happiness += 1;

    if (Math.random()*3>1){
      var rand = Math.round(Math.random()*2);
      $scope.user.items[rand] += 1;
      if (rand == 0) {
        $scope.newItem = "Rare Candy";
        $scope.itemImage = "images/rarecandy.png";
      } else if (rand == 1) {
        $scope.newItem = "Poke Bell";
        $scope.itemImage = "images/pokebell.png";
      } else {
        $scope.newItem = "Potion";
        $scope.itemImage = "images/potion.png";
      }  
    }

    addExp();
    // Update user
    Companion.setUser($scope.user);
    getRandomPokemon();
  }

  // Adds gained exp to user's pokémon
  var addExp = function() {
    var oldLvl = $scope.user.pokemon.lvl;
    var gainedExp = $scope.temp_monster.exp;
    Companion.addExp(gainedExp);
    if (oldLvl == $scope.user.pokemon.lvl) {
      $scope.myMonsterAni = "animated bounce";
    } else {
      $scope.myMonsterAni = "animated flip";
      console.log("LEVELED UP!",$scope.user.pokemon.lvl);
    }
  }

  // Turn user's pokémon into an egg
  // Increment losses, decrement score
  // Go back to home screen
  var battleLost = function() {
    $scope.user.pokemon = {name:'egg',sprite:'images/egg_jump.gif', lvl:0, isEgg:true};
    $scope.user.losses += 1;
    $scope.user.score -= 1;
    $scope.ready = false;
    // Update user
    Companion.setUser($scope.user);
    $location.path('#/home');
  }

  // Damage temp_monster and user.pokémon
  // Add to combo, unleash combo or attack depending on timer
  $scope.attackEnemy = function() {
    if ($scope.battle == false){
      if ($scope.ready == true){
        $scope.combo = 1;
        $scope.battle = true;
        $scope.myMonsterAni = "";
        changeTimer(); //START MORTAL COMBAT
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
          $scope.outcomeImg = "images/youdied.png";
          $scope.battleEnd = true;
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
    var num = Math.floor(Math.random()*6)+1;
    $scope.temp_monster = {new_sprite: 'images/egg_load'+num+'.gif'};
    Companion.pokemon.get({id:monster_id}, function(data) {
      $scope.temp_monster = data;
      getSprite($scope.temp_monster);
      var multiplier = 1;
      if ($scope.user.pokemon.lvl < 8) {
        multiplier = 2;
      } else if ($scope.user.pokemon.lvl < 15) {
        multiplier = 3;
      } else if ($scope.user.pokemon.lvl < 20) {
        multiplier = 4;
      } else {
        multiplier = 6;
      }
      $scope.temp_monster.lvl = Math.max(1,$scope.user.pokemon.lvl+Math.floor(Math.random()*10)-5);
      $scope.temp_monster.attack = $scope.temp_monster.attack+Math.floor($scope.temp_monster.lvl*Math.random()*multiplier);
      $scope.temp_monster.defense = $scope.temp_monster.defense+Math.floor($scope.temp_monster.lvl*Math.random()*multiplier);
      $scope.temp_monster.hp =  $scope.temp_monster.hp+Math.floor($scope.temp_monster.lvl*Math.random()*10)
      $scope.temp_monster.curHp = $scope.temp_monster.hp;
      $scope.temp_monster.exp = Math.floor(0.05*$scope.user.pokemon.exp+$scope.temp_monster.exp+Math.random()*$scope.temp_monster.exp*0.1);

      console.log("Temp monster:",$scope.temp_monster);
      $scope.timer = 0;
    }, function(data){
      $scope.status = "Could not find a new enemy";
    });
  }

  // Get one of the 718 pokémon randomly
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

  // Get an offline challenger upon entering arena
  if ($routeParams.user != '0') {
    var otherUserRef = ref.child('users/'+$routeParams.user);
    // Fetches once, so it can't accidentaly be healed by user giving candy etc.
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
    if (url === "/fields/"+$routeParams.user || url === "/fields/0") {
      $scope.user = Companion.getUser();
    }
    else {
      $scope.battle = false;
    }
  });

});
