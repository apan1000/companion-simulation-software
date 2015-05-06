// Controller we use to list users
companionApp.controller('ListCtrl', function ($scope, $firebaseArray, Companion, $timeout) {

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

		$scope.otherUser = $scope.getUser();

		$scope.getOtherUser = function(uid) {
			usersRef.child(uid).on("value",function(snapshot) {
				$timeout(function() {
      				$scope.otherUser = snapshot.val();
      				console.log($scope.otherUser)
      			});
      		});
		}

	});
