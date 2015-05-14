// Service for the challenging user
/*
ANVÄNDS INTE
HUEHUEHUEHUEHUEUH
HUEHEUUHEHUE
*/
companionApp.factory('Challenger', function (Companion,$rootScope,$routeParams,$location,$timeout) {
	var self = this;
	var challenger = null;
	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);
	var battleRef = {};
	
	this.initialize = function() {
		ref.once('value', function(snapshot) {
			if (snapshot.hasChild("battles/"+$routeParams.battleID)) {
				battleRef = ref.child("battles/"+$routeParams.battleID);
				// Get challenger from Firebase
			  	battleRef.once('value', function(snapshot) {
				    if (snapshot.val()) {
				      console.log(snapshot.val());
				    }
			  	});
			}
			else
			{
				$timeout(function() {
	        		$location.path("/home");
	      		});
			}
		});
	}

	this.getChallengerCont = function() {
		otherUserRef.on("value", function(snapshot) {
	      $timeout(function() {
	        challenger = snapshot.val();
	        console.log("otherPlayer:",challenger);
	      });
	    });
		return challenger
	}

	this.getChallenger = function() {
		return challenger
	}

	this.makeMove = function() {

	}

	return this
});