// Arena controller for fights against other monsters
companionApp.controller('OnlineBattleCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout,$location) {

  $scope.combo = 1;
  $scope.maxTimer = 100;
  $scope.battle = false;
  $scope.timer = 0;
  $scope.ready = false;
  $scope.choice = "";

  $scope.challengerUid = "";

  var rate = 500;
  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var battleRef = ref.child('battles/'+$routeParams.battleID);

  console.log("ME:",$scope.user)

  // Fetches all the time;
  battleRef.on("value", function(snapshot) {
    $timeout(function() {
  		$scope.battleData = snapshot.val();
  		$scope.challengerUid = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user2.uid : $scope.battleData.user1.uid;
  		$scope.challengerBattleData = ($scope.battleData.user1.uid == $scope.user.uid) ? $scope.battleData.user2 : $scope.battleData.user1;
  		console.log("challenger",$scope.challengerUid);
      console.log("battleData:",$scope.battleData);

      //Both have made a descision, fight it out!
      if ($scope.battleData.user1.battleLog != false && $scope.battleData.user2.battleLog != false){
      	executeMoves();
      }

      $scope.challengerRef = ref.child('users/'+$scope.challengerUid);
      fetchChallengerData();
    });
 	});

 	var fetchBattleData = function(){
 		battleRef.once("value", function(snapshot) {
    	$timeout(function(){
    		$scope.battleData = snapshot.val();
    	});
 		});
 	}

  var fetchChallengerData = function(){
  	$scope.challengerRef.once("value", function(snapshot) {
      $timeout(function() {
        $scope.challenger = snapshot.val();
        console.log("challenger:",$scope.challenger);
        $scope.temp_monster = $scope.challenger.pokemon;
        $scope.temp_monster.new_sprite = $scope.challenger.pokemon.sprite;
        $scope.temp_monster.curHp = $scope.temp_monster.hp;
      });
    });
  }

  var executeMoves = function(){

  	console.log($scope.challengerBattleData);

  	if($scope.challengerBattleData.battleLog == "buildUp"){
  		console.log("ENEMY BUILD UP")
  	}

  	$scope.battleData.user1.battleLog = false;
  	$scope.battleData.user2.battleLog = false;

  	battleRef.set($scope.battleData);
 	}

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

  var showOutcome = function(){
    $scope.outcomeImg = "images/victory.png";
    $scope.battleEnd = true;
    $timeout(hideOutcome, 2000);
  }

  var hideOutcome = function(){
      $scope.battleEnd = false;
  }

  var battleWon = function(){

    showOutcome();
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
  }

  var battleLost = function(){
    $scope.user.pokemon = {name:'egg',sprite:'images/egg_jump.gif', lvl:0, isEgg:true};
    $scope.user.losses += 1;
    $scope.user.score -= 1;
    $scope.ready = false;
    // Update user
    Companion.setUser($scope.user);
    $location.path('#/home');
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
