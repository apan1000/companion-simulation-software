//Tutorial Ctrl for the Tutorial which is displayed when a user is new.
companionApp.controller('TutorialCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,$timeout) {

  // Showing tutorial the first time the user logs in after having created an account.
	if($scope.user.beginner === true) {
		$scope.showTutorial = true;
		$scope.welcome = true; 
	}

  $scope.endTutorial = function() {
    $timeout(function() {
      $scope.showTutorial = false;
      $scope.user.beginner = "semitrue";
      Companion.setUser($scope.user);
    });
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