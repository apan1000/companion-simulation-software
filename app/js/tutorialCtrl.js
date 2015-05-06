//Tutorial Ctrl for the Tutorial which is displayed when a user is new.
companionApp.controller('TutorialCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout) {
	$scope.user = Companion.getUser();

  	var ref = new Firebase("https://companion-simulation.firebaseio.com");

	if ($routeParams.user) {
		var otherUserRef = ref.child('users/'+$routeParams.user);
	} else {
		var userRef = ref.child('users/'+Companion.getUser().uid);
	}

	if($scope.user.beginner === true) {
		$scope.showTutorial = true;
		$scope.welcome = true; 
	}

	$scope.showStepOne = function() {
    	$scope.welcome = false; 
    	$scope.stepOne = true;
      $scope.stepTwo = false;
      $scope.stepThree = false;
      $scope.stepFour = false;
  	}

  	$scope.showStepTwo = function() {
  		$scope.welcome = false; 
      $scope.stepOne = false;
      $scope.stepTwo = true;
      $scope.stepThree = false;
      $scope.stepFour = false;
  	}

  	$scope.showStepThree = function() {
  		$scope.welcome = false; 
      $scope.stepOne = false;
      $scope.stepTwo = false;
      $scope.stepThree = true;
      $scope.stepFour = false;
  	}

  	$scope.showStepFour = function() {
  		$scope.welcome = false; 
      $scope.stepOne = false;
      $scope.stepTwo = false;
      $scope.stepThree = false;
      $scope.stepFour = true;
  	}
});