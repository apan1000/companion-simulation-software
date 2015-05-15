// Chat controller for sending and receiving messages
companionApp.controller('ChatCtrl', ["$scope", "$firebaseArray", "Companion",
	function ($scope, $firebaseArray, Companion) {

		var ref = new Firebase('https://companion-simulation.firebaseio.com/');
		var chatRef = ref.child('chat');
		var usersRef = ref.child('users');

		$scope.status = "Loading messages...";
		chatRef.on("value", function(snapshot) {
			$scope.status = "";
		});
		var latestMessages = chatRef.orderByChild("timestamp").limitToLast(30);
		//Get messages as an array
		$scope.messages = $firebaseArray(latestMessages);

		// Post a message
		$scope.postMessage = function(e) {
			if (e.keyCode === 13 && !e.shiftKey) {
				// Prevent new line if not holding Shift
				e.preventDefault();
				if ($scope.msg) {
					var user = Companion.getUser();
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

					usersRef.child(user.uid+'/messages/'+newMsgID).set(true);

					//Reset message
					$scope.msg = "";
				}
			}
		}
	}
]);
