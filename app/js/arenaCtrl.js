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
  if ($scope.battle == false){
    $scope.combo = 1;
    $scope.battle = true;
    $scope.myMonsterAni = "";
    reduceTime(); //START MORTAL COMBAT
  }
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

  var takeDmg = function() {
    $scope.combo = 1;
    var random2 = Math.floor((Math.random() * 10) + 1);
    $scope.user.pokemon.curHp = Math.max(0,$scope.user.pokemon.curHp-Math.floor(($scope.temp_monster.attack*random2)/$scope.user.pokemon.defense));
    $scope.user.pokemon.happiness = Math.max(0,$scope.user.pokemon.happiness-1);
    // Update user
    Companion.setUser($scope.user);

    // If user's pokémon is dead
    if ($scope.user.pokemon.curHp<=0){
      $scope.user.pokemon = {name:'egg',sprite:'images/egg_jump.gif'};
      // Update user
      Companion.setUser($scope.user);
      $location.path('#/home');
    }
  }

  var battleWon = function(){
      $scope.battle = false;
      $scope.user.pokemon.exp += 30;
      $scope.user.wins += 1; //WINS
      $scope.user.pokemon.happiness += 10;

      if ($scope.user.pokemon.exp>=300){
        $scope.myMonsterAni = "animated tada";
        $scope.user.pokemon.exp = 0;
        $scope.user.pokemon.lvl += 1;
        $scope.user.pokemon.hp += Math.floor(Math.random()*21)-8;
        $scope.user.pokemon.curHp = $scope.user.pokemon.hp;
        $scope.user.pokemon.attack += Math.floor(Math.random()*10)-4;
        $scope.user.pokemon.defense += Math.floor(Math.random()*10)-4;
        console.log("LEVELED UP!");
      }
      else{
        $scope.myMonsterAni = "animated bounce";
      }

      // Update user
      Companion.setUser($scope.user);
      getRandomPokemon();
  }

  $scope.attackEnemy = function() {

    $scope.enemyMonsterAni = "animated wobble";
    var randomMonster = Math.floor((Math.random() * 718) + 1);
    var randomAtk1 = Math.floor((Math.random() * 5) + 1);
    var randomAtk2 = Math.floor((Math.random() * 10) + 1);

    if ($scope.temp_monster.curHp === 0) {
      return
    } else {

      if ($scope.timer <= 90 && $scope.timer >= 70){
        $scope.combo += 1;
        $scope.enemyMonsterAni = "animated rubberBand";
        }
      else{
        $scope.combo = 1;
        $scope.enemyMonsterAni = "animated shake";
      }
      
      $scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1*$scope.combo)/$scope.temp_monster.defense);
      $scope.enemyDmg = Math.floor(($scope.temp_monster.attack*randomAtk2)/$scope.user.pokemon.defense);

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
        $scope.battle = false;
        $scope.user.pokemon = {name:'egg',sprite:'images/egg_jump.gif'};
        // Update user
        Companion.setUser($scope.user);
        $location.path('#/home');
      }
      rate = Math.floor((Math.random() * 10) + 12 - $scope.combo);
      $scope.timer = 0;
    }
  }

  var getSpecificPokemon = function(monster_id) {

     //$scope.spinner = "images/spinner2.gif";
    
    Companion.pokemon.get({id:monster_id}, function(data){
        $scope.temp_monster = data;
        getSprite($scope.temp_monster);
        $scope.temp_monster.curHp = $scope.temp_monster.hp;
        console.log("Temp monster:",$scope.temp_monster);
      }, function(data){
        $scope.status = "Could not find a new enemy";
    });
  }

  var getRandomPokemon = function() {
    var random = Math.floor((Math.random() * 718) + 1);
    getSpecificPokemon(random);
  }

  // Get the sprite of $scope.user.pokemon and set it as $scope.sprite
  var getSprite = function(monster) {

    var parts = monster.sprites[0].resource_uri.split("/");
    var spriteUri = parts[parts.length - 2];

    Companion.sprite.get({uri:spriteUri}, function(data){
      monster.new_sprite = 'http://pokeapi.co' + data.image;
      console.log("SPRITE DATA ",monster.new_sprite);
      $scope.enemyMonsterAni = "animated lightSpeedIn"; //entering the fields
    }, function(data){
      monster.new_sprite = '';
      $scope.status = "There was an error";
    });
  }

  // Attach an asynchronous callback to read the data at our posts reference
  // userRef.on("value", function(snapshot) {
  //   console.log('omg');
  //   var url = $location.url();
  //   if(url === "/fields"){
  //     console.log(url);
  //     $scope.user = snapshot.val();
  //     console.log($scope.user);
  //     $scope.user.pokemon.curHp = $scope.user.pokemon.hp;
  //     var random = Math.floor((Math.random() * 718) + 1);
  //     getSpecificPokemon(random);
  //     //Ok, den hinner hämta typ 20 pokemons om det finns en timeout här
  //     //$timeout(function (){$scope.enemyMonsterAni = "animated fadeInDown";},1500); //Reset animation when sprite is found
  //   }
  //   else{
  //     $scope.battle = false;
  //   }
  //   }, function (errorObject) {
  //     console.log("The read failed: " + errorObject.code);
  // });
  
  // Get pokémon challanger upon entering arena
  getRandomPokemon();

  $scope.$on('userChanged', function() {
    var url = $location.url();
    if(url === "/fields"){
      $scope.user = Companion.getUser();
    }
    else{
      $scope.battle = false;
    }
  });

});
