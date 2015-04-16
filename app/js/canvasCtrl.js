companionApp.controller('CanvasCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,ChatService) {

	// Kollar när folk är inne på sidan: http://www.ng-newsletter.com/advent2013/#!/day/9
	$scope.totalViewers = 0;
	$scope.onlineUsers = [];

	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	var userRef = ref.child('users/'+$rootScope.user.uid);
	
	$scope.testDraw = function() {
		var canvas = document.getElementById('chatBar');
		var context = canvas.getContext('2d');

		context.clearRect (0, 0, canvas.width, canvas.height);

		context.fillStyle = "#FF0000";
		context.fillRect(250,250,150,75);

		context.fillStyle = "#000";
		context.font="20px Georgia";
		context.fillText("Hello World!",10,50);

		context.font="30px Verdana";
		// Create gradient
		var gradient=context.createLinearGradient(0,0,canvas.width,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		// Fill with gradient
		context.fillStyle=gradient;
		context.fillText(canvas.height,10,90);
	}

	$scope.$on('onOnlineUser', function() {
		console.log($scope.onlineUsers);
    $scope.$apply(function() {
      $scope.totalViewers = ChatService.getOnlineUserCount();
      $scope.onlineUsers = ChatService.getOnlineUsers();
      console.log($scope.onlineUsers);
    });
  });

});