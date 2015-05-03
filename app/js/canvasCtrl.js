companionApp.controller('CanvasCtrl', function ($scope,Companion,ChatService,$timeout) {

	// Kollar när folk är inne på sidan: http://www.ng-newsletter.com/advent2013/#!/day/9
	$scope.totalViewers = 0;
	$scope.onlineUsers = [];

	$scope.$on('onOnlineUser', function() {
		console.log("onlineUsers, before:",$scope.onlineUsers);
    $timeout(function() {
      $scope.totalViewers = ChatService.getOnlineUserCount();
      $scope.onlineUsers = ChatService.getOnlineUsers();
      console.log("onlineUsers, after:",$scope.onlineUsers);
    });
  });

});