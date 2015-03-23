// Chat controller that we use whenever we 
companionApp.controller('ChatCtrl', ["$scope", "$firebaseArray",
	function ($scope, $firebaseArray, Companion) {

		var fbRef = new Firebase('https://companion-simulation.firebaseio.com/');
		var chatRef = fbRef.child('chat');
		var usersRef = fbRef.child('users');

		//Get messages as an array
		$scope.messages = $firebaseArray(chatRef);

		//Get users as an array
		$scope.users = $firebaseArray(usersRef);

		//Post message function
		$scope.postMessage = function(e) {
			if (e.keyCode === 13 && $scope.msg) {
				//Testing as user2
				var name = "user2";

				//Add to firebase
				var newMsg = chatRef.push({
					user: name,
					text: $scope.msg
				});
				newMsgID = {};
				newMsgID = newMsg.key();
				console.log('\nnewMsgID: ');console.log(newMsgID);console.log('');

				usersRef.child(name+'/messages/'+newMsgID).set(true);

				//Reset message
				$scope.msg = "";
			}
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
