companionApp.controller('CanvasCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope) {

	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	var userRef = ref.child('users/'+$rootScope.user.uid);
	
	$scope.testDraw = function($scope) {

		var canvas = document.getElementById('chatBar');
		var context = canvas.getContext('2d');

		context.fillStyle = "#FF0000";
		context.fillRect(0,0,150,75);

	}

});