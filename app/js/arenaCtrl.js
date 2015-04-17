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

  // Get pokemon data
  var getPokemon = function() {
    if($scope.user.pokemon === 'egg') {
      $scope.pokemon.sprite = 'images/egg_jump.gif';
    }
    else {
      console.log("WE GOT A MONSTER");
      $scope.pokemon = $scope.user.pokemon;
      $scope.pokemon.curHp = $scope.pokemon.hp;
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

  var battleWon = function(){
      $scope.battle = false;
      $scope.pokemon.exp += 30;
      $scope.user.wins += 1; //WINS

      if ($scope.pokemon.exp>=300){
        $scope.myMonsterAni = "animated tada";
        $scope.pokemon.exp = 0;
        $scope.pokemon.lvl += 1;
        $scope.pokemon.hp += Math.floor(Math.random()*21)-8;
        $scope.pokemon.attack += Math.floor(Math.random()*21)-8;
        $scope.pokemon.defense += Math.floor(Math.random()*21)-8;
        console.log("LEVELED UP!");
      }
      else{
        $scope.myMonsterAni = "animated bounce";
      }

       //Add or subtract hp, very exciting
      $timeout(function() {
        userRef.child("pokemon").update({
            exp: $scope.pokemon.exp,
            hp: $scope.pokemon.hp,
            lvl: $scope.pokemon.lvl,
            attack: $scope.pokemon.attack,
            defense: $scope.pokemon.defense
          });
      },500);
      /*userRef.update({ //Gör väldigt många calls i consolen
            wins: $scope.user.wins
          });
        */
      console.log($scope.pokemon);
      $scope.pokemon.curHp = $scope.pokemon.hp;
  }

  $scope.attackEnemy = function() {

    $scope.enemyMonsterAni = "animated wobble";
    var randomMonster = Math.floor((Math.random() * 718) + 1);
    var randomAtk1 = Math.floor((Math.random() * 10) + 1);
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

      $scope.temp_monster.curHp = Math.max(0,$scope.temp_monster.curHp-Math.floor(($scope.pokemon.attack*randomAtk1*$scope.combo)/$scope.temp_monster.defense));
      $scope.pokemon.curHp = Math.max(0,$scope.pokemon.curHp-Math.floor(($scope.temp_monster.attack*randomAtk2)/$scope.pokemon.defense));

      if ($scope.temp_monster.curHp<=0) { //If enemy is dead
        $scope.enemyMonsterAni = "animated fadeOutUp";
        battleWon();
      }

      if ($scope.pokemon.curHp<=0){
        $scope.battle = false;
        userRef.update({ //Gör väldigt många calls i consolen när den dör
                pokemon: 'egg',
                lvl: 0
              });
        window.location.href = '#/home';
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
      $scope.enemyMonsterAni = "animated lightSpeedIn";
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
      //Ok, den hinner hämta typ 20 pokemons om det finns en timeout här
      //$timeout(function (){$scope.enemyMonsterAni = "animated fadeInDown";},1500); //Reset animation when sprite is found
    }
    else{
      $scope.battle = false;
    }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

});
