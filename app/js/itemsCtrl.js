//https://www.kth.se/social/files/54e66df1f2765449f03b4804/DH2641-2015-DnD.pptx.pdf
companionApp.controller('ItemsCtrl', function ($scope,$routeParams,$firebaseObject,Companion, $rootScope) {
	
	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);

	$scope.items = [{name:'Rare Candy',image:'rarecandy.png'},
		{name:'Poke bell',image:'pokebell.png'},
		{name:'Potion',image:'potion.png'}];
	$scope.givenItems = [];

	$scope.onDropComplete = function(data,evt) {
	  console.log("drop success, data:", data);
	  $scope.givenItems.push(data);

	  // Add level if dropped item is rare candy

		if (data.name === "Rare Candy") {

			var level = $scope.user.lvl + 1;
			console.log("level: ", level);

			ref.child("users").child($rootScope.user.uid).update({
	            lvl: level
	        });
		}
	}

	$scope.onDragSuccess = function(data,evt) {
	  console.log("drag success, data:", data);
	}

	/*target.addEventListener("drop", function(event) {
			text = event.dataTransfer.getData("text");
		}, false);
		
	source.on("dragstart", function(event) {
		event.originalEvent.dataTransfer.setData("text", "some text");
		event.originalEvent.dataTransfer.effectAllowed = 'copy';
	}, false);

	
	target.addEventListener("drop", function(event) {
		text = event.dataTransfer.getData("text");
	}, false);
>>>>>>> d35f3f95c3b0ae8d244d7c2c0388641a29fd962d

	source.addEventListener("dragend", function(event) {
		if(event.dataTransfer.dropEffect != "none")
	}, false);

	source.on("dragstart", function(event) {
		event.originalEvent.dataTransfer.setData("text", "some text");
		event.originalEvent.dataTransfer.effectAllowed = 'copy';
	}, false);*/

});

