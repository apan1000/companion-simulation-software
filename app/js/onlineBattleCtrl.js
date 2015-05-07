// Controller for use in online battles
companionApp.controller('OnlineBattleCtrl', function ($scope,Companion,Challenger,$routeParams,$rootScope,$timeout,$location) {
	Challenger.startBattle();
	
	$scope.combo = 1;
	$scope.maxTimer = 100;
	$scope.battle = false;
	$scope.timer = 0;
	$scope.ready = false;

	var rate = 500;

	$scope.challenger = Challenger.getChallenger();

	$scope.getHpPercentage = function() {
    return $scope.user.pokemon.curHp/$scope.user.pokemon.hp*100;
  }

  $scope.getEnemyHpPercentage = function() {
    if ($scope.challenger) {
      return $scope.challenger.pokemon.curHp/$scope.challenger.pokemon.hp*100;
    }
  }

});