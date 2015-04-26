// Chat controller that we use whenever we 
companionApp.controller('ListCtrl', ["$scope", "$firebaseArray", "Companion",
	function ($scope, $firebaseArray, Companion) {

		var ref = new Firebase('https://companion-simulation.firebaseio.com/');
		var usersRef = ref.child('users');
		$scope.sortType = 'name';
		$scope.sortReverse = false;

		$scope.status = "Loading...";
		usersRef.on("value", function(snapshot) {
			$scope.status = "";
		});
		//Get messages as an array
		$scope.users = $firebaseArray(usersRef);

		$scope.getUser = function() {
			return Companion.getUser();
		}
	}
]);
