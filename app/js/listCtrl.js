// Controller we use to list users
companionApp.controller('ListCtrl', function ($scope,$rootScope,$routeParams,$firebaseArray,Companion,$timeout,$location) {

	var ref = new Firebase('https://companion-simulation.firebaseio.com/');
	var usersRef = ref.child('users');
	$scope.sortType = 'wins';
	$scope.sortReverse = true;

	$scope.loading = true;
	//Get users as an array
	$scope.users = $firebaseArray(usersRef);

	$scope.users.$loaded(function(data) {
		$scope.loading = false;
	}, function(error) {
		console.error("Error:", error);
	});

	$scope.getOtherUser = function(uid) {
		$location.path('rankings/'+uid, false);
		usersRef.child(uid).on("value",function(snapshot) {
			$timeout(function() {
  				$scope.otherUser = snapshot.val();
  				console.log($scope.otherUser)
  			});
  		});
  		$rootScope.$broadcast("otherUserChanged");
	}

	if ($routeParams.user != '0') {
		$scope.otherUser = null;
		usersRef.child($routeParams.user).on("value",function(snapshot) {
			$timeout(function() {
				$scope.otherUser = snapshot.val();
				console.log($scope.otherUser)
  			});
		});
	}
	else {
		$scope.otherUser = Companion.getUser();
	}

});
