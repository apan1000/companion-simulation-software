companionApp.controller('CanvasCtrl', function ($scope,$routeParams,$firebaseObject,Companion,$rootScope,ChatService) {

	// Kollar när folk är inne på sidan: http://www.ng-newsletter.com/advent2013/#!/day/9
	$scope.totalViewers = 0;
	$scope.onlineUsers = [];

	$scope.$on('onOnlineUser', function() {
		console.log("onlineUsers, before:",$scope.onlineUsers);
    $scope.$apply(function() {
      $scope.totalViewers = ChatService.getOnlineUserCount();
      $scope.onlineUsers = ChatService.getOnlineUsers();
      console.log("onlineUsers, after:",$scope.onlineUsers);
    });
  });

});