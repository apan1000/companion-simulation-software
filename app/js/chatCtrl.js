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
		var latestMessages = chatRef.orderByChild("timestamp").limitToLast(30);
		//Get messages as an array
		$scope.messages = $firebaseArray(latestMessages);

		//Post message function
		$scope.postMessage = function(e) {
			if (e.keyCode === 13 && !e.shiftKey) {
				// Prevent new line if not holding Shift
				e.preventDefault();
				if ($scope.msg) {
					var user = $scope.getUser();
					console.log(user);
					var time = Date.now();
					//Add to firebase
					var newMsg = chatRef.push({
						user: user.uid,
						name: user.name,
						text: $scope.msg,
						timestamp: time
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
	}
]);
