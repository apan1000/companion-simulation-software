// Controller we use to list users
companionApp.controller('ListCtrl', ["$scope", "$firebaseArray", "Companion",
	function ($scope, $firebaseArray, Companion) {

		var ref = new Firebase('https://companion-simulation.firebaseio.com/');
		var usersRef = ref.child('users');
		$scope.sortType = 'wins';
		$scope.sortReverse = true;

		$scope.status = "Loading...";
		usersRef.on("value", function(snapshot) {
			$scope.status = "";
		});
		//Get users as an array
		$scope.users = $firebaseArray(usersRef);

		$scope.getUser = function() {
			return Companion.getUser();
		}
	}
]);
