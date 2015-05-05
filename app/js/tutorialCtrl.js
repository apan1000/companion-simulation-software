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

	$scope.hideWelcome = function() {
    	$scope.welcome = false; 
    	$scope.stepOne = true;
  	}

  	$scope.hideStepOne = function() {
  		$scope.stepOne = false;
  		$scope.stepTwo = true;
  	}

  	$scope.hideStepTwo = function() {
  		$scope.stepTwo = false;
  		$scope.stepThree = true;
  	}

  	$scope.hideStepThree = function() {
  		$scope.stepThree = false;
  		$scope.stepFour = true;
  	}
});