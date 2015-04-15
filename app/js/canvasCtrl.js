companionApp.controller('CanvasCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope) {

	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	  if ($routeParams.user) {
	    var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$routeParams.user);
	  } else {
	    var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);
	  }

	
	$scope.testDraw = function($scope) {

		var canvas = document.getElementById('chatBar');
		var context = canvas.getContext('2d');

		context.fillStyle = "#FF0000";
		context.fillRect(0,0,150,75);

	}

});