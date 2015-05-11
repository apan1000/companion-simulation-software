// Service for the challenging user
companionApp.factory('Challenger', function (Companion,$rootScope,$routeParams,$location,$timeout) {
	var self = this;
	var challenger = null;
	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	var battleRef = {};
	
	this.startBattle = function() {
		ref.once('value', function(snapshot) {
			if (snapshot.hasChild("battles/"+$routeParams.battleID)) {
				battleRef = ref.child("battles/"+$routeParams.battleID);
				// Get challenger from Firebase
			  battleRef.once('value', function(snapshot) {
			    if (snapshot.val()) {
			      console.log(snapshot.val());
			    }
			  });
			} else {
				$timeout(function() {
	        $location.path("/home");
	      });
			}
		});
	}

	this.getChallenger = function() {
		return challenger
	}

	return this
});