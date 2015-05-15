// Multiplayer controller for fights against other players
companionApp.controller('OnlineBattleCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout,$location) {

  $scope.maxTimer = 100;
  $scope.battle = false;
  $scope.timer = 10;
  var ready = false;
  $scope.choice = "";
  $scope.enemyReady = false;
  $scope.myMonsterAni  = "";
  $scope.enemyMonsterAni  = "";
  $scope.myState  = "half_opacity";
  $scope.enemyState  = "half_opacity";
  var maxTime = 10;

  $scope.challengerUid = "";
  $scope.user.combo = 1; //Reset if you reload

  var rate = 500;
  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var battleRef = ref.child('battles/'+$routeParams.battleID);

  // When something within the battle has been changed, check for updates
  battleRef.on("value", function(snapshot) {
    $timeout(function() {
  		$scope.battleData = snapshot.val();

  		$scope.challengerUid = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user2.uid : $scope.battleData.user1.uid;
  		$scope.challengerBattleData = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user2 : $scope.battleData.user1;
  		$scope.userBattleData = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user1 : $scope.battleData.user2;
      $scope.enemyReady = $scope.challengerBattleData.here;


      if ($scope.battleData.isEnded == false) {

        if($scope.battleData.user1.here == true && $scope.battleData.user2.here == true){
          $scope.enemyState  = "";
        }
        
        //If the player has connected to the battle
        if(ready == false){
          imReady();
          ready = true;
        }
        //Has a move been made? In that case show the other player
        if($scope.challengerBattleData.battleLog != false){
          $scope.enemyState = "glow";
        }

        if($scope.userBattleData.battleLog != false){
          $scope.myState = "glow";
        }

        //Both have made a descision, fight it out!
        if ($scope.battleData.user1.battleLog != false && $scope.battleData.user2.battleLog != false){
          $scope.myState = "";
          $scope.enemyState = "";
          executeMoves();
        }

        $scope.challengerRef = ref.child('users/'+$scope.challengerUid);
        fetchChallengerData();
      }
    });
 	});

  //Set status to ready and show ourselves with full opacity
 	var imReady = function(){
 		if ($scope.myState == "half_opacity"){
	 		if ($scope.battleData.user1.uid == $scope.user.uid){
	 			$scope.battleData.user1.here = true;
	 		}
	 		else{
	 			$scope.battleData.user2.here = true;
	 		}
	 		$scope.myState  = "";
	 		battleRef.set($scope.battleData);
 		}
 	}

  //Get the challenger data, becomes a scope variable
  var fetchChallengerData = function(){
  	$scope.challengerRef.once("value", function(snapshot) {
      $timeout(function() {
        $scope.challenger = snapshot.val();
      });
    });
  }

  //When we choose a move, we tell the battle about it
  $scope.chooseMove = function(move){
    if ($scope.battleData.user1.uid == $scope.user.uid){
      $scope.battleData.user1.battleLog = move;
    }
    else{
      $scope.battleData.user2.battleLog = move;
    }
    battleRef.set($scope.battleData);
  }

  $scope.getHpPercentage = function() {
    return $scope.user.pokemon.curHp/$scope.user.pokemon.hp*100;
  }

  $scope.getEnemyHpPercentage = function() {
    if ($scope.challenger) {
      return $scope.challenger.pokemon.curHp/$scope.challenger.pokemon.hp*100;
    }
  }

  //Calculates the amount of damage that is dealt depending on the move that was chosen
  var whichMove = function(person,enemy,battleData){
    var yourDmg = 0;
    var power = 4;

    if (battleData.battleLog == "buildUp"){
      person.combo +=1;
      yourDmg = Math.floor((person.pokemon.attack*power*0.5)/enemy.pokemon.defense);
    }
    else{
      if (battleData.battleLog == "unleash"){
        var defBreaker = 2/person.combo;
        yourDmg = Math.floor((person.pokemon.attack*power*person.combo)/(enemy.pokemon.defense*defBreaker));
        person.combo = 1;
      }
      else{
        if (battleData.battleLog == "counter"){
          yourDmg = Math.floor((person.pokemon.attack*power*enemy.combo)/(enemy.pokemon.defense));
        }
      }
    }
    return yourDmg
  }

  //When both have made a choice, we calculate damage and dish it out, also check for deaths
  var executeMoves = function(){

    //Order is important depending on who is who, so the numbers are displayed the same.
    if ($scope.battleData.user1.uid == $scope.user.uid){
      $scope.yourDmg = whichMove($scope.user,$scope.challenger,$scope.userBattleData);
      $scope.enemyDmg = whichMove($scope.challenger,$scope.user,$scope.challengerBattleData);
    }
    else{
      $scope.enemyDmg = whichMove($scope.challenger,$scope.user,$scope.challengerBattleData);
      $scope.yourDmg = whichMove($scope.user,$scope.challenger,$scope.userBattleData);
    }

    //Show combat message for damage dealt
  	$scope.showMessage = true;
    $timeout(function() {
      $scope.showMessage = false;
    }, 1000);

  	$scope.user.pokemon.curHp = Math.max(0,$scope.user.pokemon.curHp-$scope.enemyDmg);
  	$scope.challenger.pokemon.curHp = Math.max(0,$scope.challenger.pokemon.curHp-$scope.yourDmg);

  	if ($scope.user.pokemon.curHp<=1){
        $scope.outcome = "defeat";
        $scope.showOutcome = true;
        battleWon($scope.challenger,$scope.user);
        battleLost($scope.user,$scope.challenger);
    }

    if ($scope.challenger.pokemon.curHp<=1){
        $scope.outcome = "victory";
        $scope.showOutcome = true;
        battleWon($scope.user,$scope.challenger);
        battleLost($scope.challenger,$scope.user);
    }

    //Reset the move choice
  	$scope.battleData.user1.battleLog = false;
  	$scope.battleData.user2.battleLog = false;

    //Only user1 send in the data, no conflict
    if ($scope.battleData.user1.uid == $scope.user.uid){
    	$scope.challengerRef.set($scope.challenger);
    	Companion.setUser($scope.user);
    	battleRef.set($scope.battleData);
    }
 	}

  var showOutcome = function(){
    $scope.outcomeImg = "images/victory.png";
    $scope.battleEnd = true;
    $timeout(hideOutcome, 2000);
  }

  var hideOutcome = function(){
      $scope.battleEnd = false;
  }

  //Increment score etc. Give a random item, check if a new lvl has been reached
  //Remove the challenger
  var battleWon = function(person,enemy){
    $scope.battleData.isEnded = true;

    person.combo = 1;
    person.pokemon.curExp += Math.floor(($scope.challenger.pokemon.exp)*0.5);
    person.wins += 1;
    person.score += 5;
    person.pokemon.happiness += 5;
    person.pokemon.curExp += Math.max(enemy.pokemon.curExp,Math.floor(enemy.pokemon.exp*0.5));

    delete person.challengers[enemy.uid];

    var rand = Math.round(Math.random()*2);
    person.items[rand] += 1;
    if (rand == 0) {
      $scope.newItem = "Rare Candy";
      $scope.itemImage = "images/rarecandy.png";
    } else if (rand == 1) {
      $scope.newItem = "Happy Bell";
      $scope.itemImage = "images/pokebell.png";
    } else {
      $scope.newItem = "Potion";
      $scope.itemImage = "images/potion.png";
    }  
    
    if (person.pokemon.curExp>=person.pokemon.exp){
      person.pokemon.curExp -= person.pokemon.exp;
      person.pokemon.exp += Math.floor(person.pokemon.exp*0.1)+1;
      person.pokemon.curExp = Math.min(person.pokemon.exp-10,person.pokemon.curExp);
      person.pokemon.lvl += 1;
      person.pokemon.hp += Math.floor(Math.random()*10);
      person.pokemon.curHp = person.pokemon.hp;
      person.pokemon.attack += Math.floor(Math.random()*5)+1;
      person.pokemon.defense += Math.floor(Math.random()*5)+1;
      // console.log("LEVELED UP!");
    }
    else{
     person.animation = "animated bounce";
    }
  }

  //Decrement score etc. Set health to 1. Remove the challenger
  var battleLost = function(person,enemy){
    $scope.battleData.isEnded = true;

  	person.combo = 1;
    person.pokemon.curExp = 0;
    person.pokemon.curHp = 1;
    person.losses += 1;
    person.score -= 2;

    delete person.challengers[enemy.uid];
  }
});
