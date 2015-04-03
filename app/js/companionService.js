// Here we create an Angular service that we will use for our 
// model. In your controllers (or other services) you can include the
// dependency on any service you need. Angular will ensure that the
// service is created first time it is needed and then just reuse it
// the next time.
companionApp.factory('Companion',function ($resource,$localStorage,$rootScope,$location,$timeout) {
	// Pokémon API
  var POKE_API = 'http://pokeapi.co';
  this.pokemon = $resource(POKE_API + '/api/v1/pokemon/:id');
  this.sprite = $resource(POKE_API + '/api/v1/sprite/:uri');
  // Firebase
  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var usersRef = ref.child('users');

  // Get user from cookies
  if ($localStorage.user != null) {
  	$rootScope.user = $localStorage.user;
  }

  // Returns sprite data from pokeapi
  this.getSpriteData = function(uri) {
    return $resource(POKE_API + uri).get(function(data){
      console.log(data);
      return data;
    }, function(data){
      return data;
    });;
  }

  // Set user, redirects to appropriate page depending on if user is null or not
  this.setUser = function(user) {
  	$rootScope.user = user;
    $localStorage.user = user;
    if (user) {
    	if ($location.path() === "/") {
    		$timeout(function() {
	    		$location.path("/home");
	    	});
    	}
    } else {
    	$timeout(function() {
    		$location.path("/");
    	});
    }
  }

  // Returns user
  this.getUser = function() {
  	// console.log("$rootScope.user: ")
  	// console.log($rootScope.user);
    return $rootScope.user;
  }

  // Logout the user
  this.logout = function() {
  	ref.unauth();
    this.setUser(null);
  }

  // Angular service needs to return an object that has all the
  // methods created in it.
  // This is because Angular takes care of creating it when needed.
  return this;

});