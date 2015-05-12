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
      
      	if ($scope.battleData.user1.uid == $scope.user.uid && $scope.notStarted == false){
      		executeMoves();
      	}
      }

      $scope.challengerRef = ref.child('users/'+$scope.challengerUid);
      fetchChallengerData();
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

  var executeMoves = function(){

  	console.log("EXECUTING MOVES")
  	var randomAtk1 = Math.round((Math.random() * 2) + 2);
    var randomAtk2 = Math.round((Math.random() * 2) + 2);

    //	MY MOVES -------------
    if ($scope.userBattleData.battleLog == "buildUp"){
  		$scope.user.combo +=1;
      $scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1*0.50)/$scope.challenger.pokemon.defense);
  	}
  	else{
  		if ($scope.userBattleData.battleLog == "unleash"){
  			var defBreaker = 2/$scope.user.combo;
        $scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1*$scope.user.combo)/($scope.challenger.pokemon.defense*defBreaker));
        $scope.user.combo =1;
  		}
  		else{
  			if ($scope.userBattleData.battleLog == "counter"){
  				$scope.yourDmg = Math.floor(($scope.user.pokemon.attack*randomAtk1*$scope.challenger.combo)/($scope.challenger.pokemon.defense));
  			}
  			else{
  				$scope.yourDmg = 0;
  				console.log("You did nothing")
  			}
  		}
  	}

    //	ENEMY MOVES ------------
  	if ($scope.challengerBattleData.battleLog == "buildUp"){
  		$scope.challenger.combo += 1;
      $scope.enemyDmg = Math.floor(($scope.challenger.pokemon.attack*randomAtk2*0.50)/$scope.user.pokemon.defense);
  	}
  	else{
  		if ($scope.challengerBattleData.battleLog == "unleash"){
  			var defBreaker = 2/$scope.challenger.combo;
        $scope.enemyDmg = Math.floor(($scope.challenger.pokemon.attack*randomAtk2*$scope.challenger.combo)/($scope.user.pokemon.defense*defBreaker));
        $scope.challenger.combo = 1;
  		}
  		else{
  			if ($scope.challengerBattleData.battleLog == "counter"){
  				$scope.enemyDmg = Math.floor(($scope.challenger.pokemon.attack*randomAtk2*$scope.user.combo)/($scope.user.pokemon.defense));
  			}
  			else{
  				$scope.enemyDmg = 0;
  				console.log("You did nothing")
  			}
  		}
  	}

  	$scope.showMessage = true;

  	$scope.user.pokemon.curHp = Math.max(0,$scope.user.pokemon.curHp-$scope.enemyDmg);
  	$scope.challenger.pokemon.curHp = Math.max(0,$scope.challenger.pokemon.curHp-$scope.yourDmg);

    $timeout(function() {
      $scope.showMessage = false;
    }, 1000);

  	if ($scope.user.pokemon.curHp<=0){
  			console.log("I DIED")
        $scope.myMonsterAni = "animated wooble";
        $scope.enemyMonsterAni  = "animated bounce";
        battleWon($scope.challenger);
        battleLost($scope.user);
        $scope.battleData.user1.here = false;
        $scope.battleData.user2.here = false;
    }

    if ($scope.challenger.pokemon.curHp<=0){
    		console.log("ENEMY DIED")
        $scope.myMonsterAni = "animated bounce";
        $scope.enemyMonsterAni  = "animated wooble";
        battleWon($scope.user);
        battleLost($scope.challenger);
        $scope.battleData.user1.here = false;
        $scope.battleData.user2.here = false;
        /*$timeout( function(){ 
        	$scope.challengerRef.set($scope.challenger);
        	Companion.setUser($scope.user); 
        }, 100);*/
    }

  	$scope.battleData.user1.battleLog = false;
  	$scope.battleData.user2.battleLog = false;
  	$scope.battleData.timer = maxTime;

  	$scope.challengerRef.set($scope.challenger);
  	Companion.setUser($scope.user);
  	battleRef.set($scope.battleData);
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

  var battleWon = function(person){

    //showOutcome();
    person.combo = 1;
    person.pokemon.curExp += Math.floor(($scope.challenger.pokemon.exp)*0.5);
    person.wins += 1;
    person.score += 5;
    person.pokemon.happiness += 5;
    person.challengers = [];

    if (Math.random()*5>1){
      console.log("ITEM DROP");

      var rand = Math.round(Math.random()*2);
      person.items[rand] += 1;
    }

    if (person.pokemon.curExp>=person.pokemon.exp){
      person.pokemon.curExp -= person.pokemon.exp;
      person.pokemon.exp += Math.floor(person.pokemon.exp*0.1)+1;
      //Cant gain more than one lvl, fix later
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

  var battleLost = function(person){
  	person.combo = 1;
    person.pokemon = {name:'egg',sprite:'images/egg_jump.gif', lvl:0, isEgg:true};
    person.losses += 1;
    person.challengers = [];
    person.score -= 2;
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
