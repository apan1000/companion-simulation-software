// Arena controller for fights against other monsters
companionApp.controller('OnlineBattleCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout,$location) {

  $scope.combo = 1;
  $scope.maxTimer = 100;
  $scope.battle = false;
  $scope.timer = 10;
  var ready = false;
  $scope.choice = "";
  $scope.notStarted = true;
  $scope.enemyReady = false;
  $scope.user.animation = "";
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

  console.log("ME:",$scope.user)


  // Fetches at all the changes;
  battleRef.on("value", function(snapshot) {
    $timeout(function() {
  		$scope.battleData = snapshot.val();

  		$scope.challengerUid = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user2.uid : $scope.battleData.user1.uid;
  		$scope.challengerBattleData = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user2 : $scope.battleData.user1;
  		$scope.userBattleData = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user1 : $scope.battleData.user2;
  		$scope.timer = $scope.battleData.timer;

      console.log("battleData:",$scope.battleData);
      $scope.enemyReady = $scope.challengerBattleData.here;
      console.log("challenger is here", $scope.enemyReady)

      if ($scope.battleData.isEnded == false) {
        if($scope.notStarted == true && $scope.battleData.user1.here == true && $scope.battleData.user2.here == true){
          console.log("LET THE GAMES BEGIN");
          $scope.enemyState  = "";
          $scope.notStarted = false;
        }

        if(ready == false){
          imReady();
          ready = true;
        }

        if($scope.challengerBattleData.battleLog != false){
          $scope.enemyState = "glow";
        }

        //Both have made a descision, fight it out!
        if ($scope.battleData.user1.battleLog != false && $scope.battleData.user2.battleLog != false){
          $scope.myState = "";
          $scope.enemyState = "";
          executeMoves();
        }

        $scope.challengerRef = ref.child('users/'+$scope.challengerUid);
        fetchChallengerData();
      } else {
        console.log("battle is over");
      }
    });
 	});

 	var imReady = function(){

 		if ($scope.myState == "half_opacity"){
	 		if ($scope.battleData.user1.uid == $scope.user.uid){
	 			$scope.battleData.user1.here = true;
	 		}
	 		else{
	 			$scope.battleData.user2.here = true;
	 		}
	 		console.log("READY FOR BATTLE")
	 		$scope.myState  = "";
	 		battleRef.set($scope.battleData);
 		}
 	}

  var fetchChallengerData = function(){
  	$scope.challengerRef.once("value", function(snapshot) {
      $timeout(function() {
        $scope.challenger = snapshot.val();
        console.log("challenger:",$scope.challenger);
      });
    });
  }

  var whichMove = function(person,enemy,battleData){

    var yourDmg = 0;
    var power = 4;

    if (battleData.battleLog == "buildUp"){
      person.combo +=1;
      yourDmg = Math.floor((person.pokemon.attack*power*0.50)/enemy.pokemon.defense);
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

  var executeMoves = function(){

    $scope.yourDmg = whichMove($scope.user,$scope.challenger,$scope.userBattleData);
    $scope.enemyDmg = whichMove($scope.challenger,$scope.user,$scope.challengerBattleData);

  	$scope.showMessage = true;
    $timeout(function() {
      $scope.showMessage = false;
    }, 1000);

  	$scope.user.pokemon.curHp = Math.max(0,$scope.user.pokemon.curHp-$scope.enemyDmg);
  	$scope.challenger.pokemon.curHp = Math.max(0,$scope.challenger.pokemon.curHp-$scope.yourDmg);

  	if ($scope.user.pokemon.curHp<=0){
  			console.log("I DIED")
        $scope.myMonsterAni = "animated wooble";
        $scope.enemyMonsterAni  = "animated bounce";
        $scope.outcome = "defeat";
        $scope.showOutcome = true;
        battleWon($scope.challenger,$scope.user);
        battleLost($scope.user,$scope.challenger);
        $scope.battleData.user1.here = false;
        $scope.battleData.user2.here = false;
    }

    if ($scope.challenger.pokemon.curHp<=0){
    		console.log("ENEMY DIED")
        $scope.myMonsterAni = "animated bounce";
        $scope.enemyMonsterAni  = "animated wooble";
        $scope.outcome = "victory";
        $scope.showOutcome = true;
        battleWon($scope.user,$scope.challenger);
        battleLost($scope.challenger,$scope.user);
        $scope.battleData.user1.here = false;
        $scope.battleData.user2.here = false;
    }

  	$scope.battleData.user1.battleLog = false;
  	$scope.battleData.user2.battleLog = false;

    //Only user1 send in the data, no conflict
    if ($scope.battleData.user1.uid == $scope.user.uid && $scope.notStarted == false){
    	$scope.challengerRef.set($scope.challenger);
    	Companion.setUser($scope.user);
    	battleRef.set($scope.battleData);
    }
 	}

 	$scope.chooseMove = function(move){

 		if ($scope.battleData.user1.uid == $scope.user.uid){
 			$scope.battleData.user1.battleLog = move;
 		}
 		else{
 			$scope.battleData.user2.battleLog = move;
 		}

 		$scope.myState = "glow";
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

  function reduceTime() {
  	if ($scope.battleData.user1.uid == $scope.user.uid){
	    if ($scope.battleData.timer > 0){
	      $scope.battleData.timer -=1;
	      $timeout( function(){ reduceTime(); }, rate);
	    }
	    else
	    {
	 			battleRef.set($scope.battleData);
	    }
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

  var battleWon = function(person,enemy){
    $scope.battleData.isEnded = true;

    //showOutcome();
    person.combo = 1;
    person.pokemon.curExp += Math.floor(($scope.challenger.pokemon.exp)*0.5);
    person.wins += 1;
    person.score += 5;
    person.pokemon.happiness += 5;

    delete person.challengers[enemy.uid];

    var rand = Math.round(Math.random()*2);
    person.items[rand] += 1;
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
    
    if (person.pokemon.curExp>=person.pokemon.exp){
      person.pokemon.curExp -= person.pokemon.exp;
      person.pokemon.exp += Math.floor(person.pokemon.exp*0.1)+1;
      person.pokemon.curExp = Math.min(person.pokemon.exp-10,person.pokemon.curExp);
      person.pokemon.lvl += 1;
      person.pokemon.hp += Math.floor(Math.random()*10);
      person.pokemon.curHp = person.pokemon.hp;
      person.pokemon.attack += Math.floor(Math.random()*5)+1;
      person.pokemon.defense += Math.floor(Math.random()*5)+1;
      console.log("LEVELED UP!");
    }
    else{
     person.animation = "animated bounce";
    }
  }

  var battleLost = function(person,enemy){
    $scope.battleData.isEnded = true;

  	person.combo = 1;
    person.curExp = 0;
    person.pokemon.curHp = 1;
    person.losses += 1;
    person.score -= 2;

    delete person.challengers[enemy.uid];
  }

  /* Could fix if player leaves a challenge
  $rootScope.$on("$routeChangeStart", function(event, next, current) {
    battleRef.set($scope.battleData);
    $scope.battleData.user1.here = false;
    $scope.battleData.user2.here = false;
  });
  */

});
