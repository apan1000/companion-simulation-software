// Chat controller that we use whenever we 
companionApp.controller('ChatCtrl', ["$scope", "$firebaseArray", "Companion",
	function ($scope, $firebaseArray, Companion) {

		var ref = new Firebase('https://companion-simulation.firebaseio.com/');
		var chatRef = ref.child('chat');
		var usersRef = ref.child('users');

		$scope.status = "Loading...";
		chatRef.on("value", function(snapshot) {
			$scope.status = "";
		});
		//Get messages as an array
		$scope.messages = $firebaseArray(chatRef);

		//Get users as an array
		$scope.users = $firebaseArray(usersRef);

		//Post message function
		$scope.postMessage = function(e) {
			if (e.keyCode === 13 && !e.shiftKey) {
				// Prevent new line if not holding Shift
				e.preventDefault();
				if ($scope.msg) {
					var user = $scope.getUser();
					console.log(user);

					//Add to firebase
					var newMsg = chatRef.push({
						user: user.uid,
						name: user.name,
						text: $scope.msg
					});
					newMsgID = {};
					newMsgID = newMsg.key();
					console.log('\nnewMsgID: ');console.log(newMsgID);console.log('');

					usersRef.child(user.uid+'/messages/'+newMsgID).set(true);

					//Reset message
					$scope.msg = "";
				}
			}
		}

		$scope.getUser = function() {
			return Companion.getUser();
		}


		//Searches for dishes matching the query
		// $scope.search = function(query) {
		// 	$scope.status = "Searching...";
		// 	Dinner.dishSearch.get({title_kw:query},function(data){
		// 		$scope.dishes = data.Results;
		// 		$scope.status = "Showing " + data.Results.length + " results";
		// 	},function(data){
		// 		$scope.status = "There was an error getting your dishes, please try again.";
		// 	});
		// }

		/*$scope.checkSearch = function(dishes) {
			if (typeof dishes == "undefined") {
				console.log("hej");
				$scope.status = "Getting dishes...";
				Dinner.dishSearch.get({title_kw:"starter"},function(data){
				$scope.dishes = data.Results;
				$scope.status = "Showing " + data.Results.length + " results";
				},function(data){
					$scope.status = "There was an error";
				});
			}
		}*/
	}
]);
