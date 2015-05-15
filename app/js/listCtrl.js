// Controller we use to list users
companionApp.controller('ListCtrl', function ($scope,$rootScope,$routeParams,$firebaseArray,Companion,$timeout,$location) {

	var ref = new Firebase('https://companion-simulation.firebaseio.com/');
	var usersRef = ref.child('users');
	$scope.routeUid = $location.path().substring($location.path().lastIndexOf('/')+1);
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

	// Go to the ranking page of the user with specified uid
	$scope.getOtherUser = function(uid) {
		$location.path('rankings/'+uid, false);
		$scope.routeUid = $location.path().substring($location.path().lastIndexOf('/')+1);
		//console.log($scope.routeUid);
		usersRef.child(uid).on("value",function(snapshot) {
			$timeout(function() {
  				$scope.otherUser = snapshot.val();
  				//console.log($scope.otherUser)
  			});
  		});
  		$rootScope.$broadcast("otherUserChanged");
	}

	if ($routeParams.user != '0') {
		$scope.otherUser = null; // So the logged in user won't show
		usersRef.child($routeParams.user).on("value",function(snapshot) {
			$timeout(function() {
				$scope.otherUser = snapshot.val();
				//console.log($scope.otherUser)
  			});
		});
	}
	else {
		$scope.otherUser = Companion.getUser();
	}

});
