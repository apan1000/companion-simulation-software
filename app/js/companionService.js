// Here we create an Angular service that we will use for our 
// model. In your controllers (or other services) you can include the
// dependency on any service you need. Angular will ensure that the
// service is created first time it is needed and then just reuse it
// the next time.
companionApp.factory('Companion', function ($resource,$localStorage,$rootScope,$location) {
  var self = this;
  var loginMsg = "";
  var newAccMsg = "";

	// Pokémon API
  var POKE_API = 'http://pokeapi.co';
  this.pokemon = $resource(POKE_API + '/api/v1/pokemon/:id');
  this.sprite = $resource(POKE_API + '/api/v1/sprite/:uri');
  // Firebase
  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var usersRef = ref.child('users');

  // Get user from cookies
  $rootScope.user = $localStorage.user;
  console.log("localStorage user:",$rootScope.user);

/*
  var getMonster = function(monster_id){
    return $resource(POKE_API + '/api/v1/pokemon/'+ monster_id).then(function(result){
      return result.data;
    });
  }
*/

  // Returns sprite data from pokeapi
  this.getSpriteData = function(uri) {
    return $resource(POKE_API + uri).get(function(data){
      console.log(data);
      return data;
    }, function(data){
      return data;
    });;
  }

  this.getNewPokemon = function() {
    var pokeID = Math.floor((Math.random() * 718) + 1);
    console.log("Random id will be: "+ pokeID);
    // Get pokemon
    self.pokemon.get({id:pokeID}, function(data){
      // Get sprite uri
      var parts = data.sprites[0].resource_uri.split("/");
      var spriteUri = parts[parts.length - 2];
      // Get sprite url
      self.sprite.get({uri:spriteUri}, function(spriteData){
        var spriteUrl =  'http://pokeapi.co' + spriteData.image;
        // Get all types
        var typesArray = [];
        for (var i = 0; i < data.types.length; i++) {
          typesArray.push(data.types[i].name);
        }
        // The new companion the user is given
        companion = {
          attack:data.attack,
          defense:data.defense,
          evolutions:data.evolutions,
          exp:Math.max(data.exp,50),
          curExp:0,
          happiness:100,
          height:data.height,
          hp:data.hp,
          curHp:data.hp,
          name:data.name,
          id:pokeID,
          lvl:1,
          sp_atk:data.sp_atk,
          sp_def:data.sp_def,
          speed:data.speed,
          sprite:spriteUrl,
          types:typesArray,
          weight:data.weight
        };
        // Set user pokemon as companion
        var user = self.getUser();
        usersRef.child(user.uid).update({
          pokemon: companion
        }, function() {
          user.pokemon = companion;
          self.setUser(user);
        });
        }, function(spriteData){ // Error getting sprite url
          console.log("There was an error getting sprite url.");
        });
    }, function(data){ // Error getting pokémon
      console.log("There was an error getting the pokémon.");
    });
  }

  // Set user, updates Firebase
  this.setUser = function(newUser) {
    $rootScope.user = newUser;
    $localStorage.user = newUser;
    console.log("setUser:",$localStorage.user);
    // Update user on Firebase
    if (newUser) {
      usersRef.child(newUser.uid).set(newUser);
    }
    $rootScope.$broadcast('userChanged');
  }

  this.getUser = function() {
    return $rootScope.user;
  }

  this.getLoginMsg = function() {
    return loginMsg;
  }

  this.getNewAccMsg = function() {
    return newAccMsg;
  }

  // Login using email and password
  this.loginWithPassword = function(emailVal,passwordVal) {
    ref.authWithPassword({
      email    : emailVal,
      password : passwordVal
    }, function(error, authData) {
      if (error) {
        console.log(error);
        loginMsg = error.code;
      } else {
        console.log("Authenticated successfully with payload:", authData);
        loginMsg = "success";
      }
      // Broadcast that loginMsg has changed
      $rootScope.$broadcast('loginMsgChange');
    });
  }

  // Create new account using email and password
  this.createAccount = function(emailVal,passwordVal) {
    ref.createUser({
      email    : emailVal,
      password : passwordVal
    }, function(error, userData) {
      if (error) {
        newAccMsg = error.code;
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        console.log(userData);
        usersRef.child(userData.uid).set({
          name: emailVal.replace(/@.*/, ''),
          pokemon: {name:'egg',sprite:'images/egg_jump.gif'},
          wins: 0,
          losses: 0,
          items: {lvlup:5, happy:5, heal:5},
          x_coord: 0,
          y_coord: 0
        });
        self.loginWithPassword(emailVal,passwordVal);
        newAccMsg = "success";
      }
      // Broadcast that newAccMsg has changed
      $rootScope.$broadcast('newAccMsgChange');
    });
  }

  // Login using social media account
  this.loginWithSocial = function(provider) {
    // prefer pop-ups, so we don't navigate away from the page
    ref.authWithOAuthPopup(provider, function(error, authData) {
      if (error) {
        if (error.code === "TRANSPORT_UNAVAILABLE") {
          // fall-back to browser redirects, and pick up the session
          // automatically when we come back to the origin page
          ref.authWithOAuthRedirect(provider, function(error) {
            /* ... */
          });
        }
      }
      else if (authData) {
        // user authenticated with Firebase
        loginMsg = "success";
        $rootScope.$broadcast('loginMsgChange');
      }
    });
  }

  // Logout the user
  this.logout = function() {
  	ref.unauth();
    this.setUser(null);
  }

  // Find a suitable name based on the meta info given by each provider
  function getName(authData) {
    switch (authData.provider) {
       case 'password':
         return authData.password.email.replace(/@.*/, '');
       case 'twitter':
         return authData.twitter.username;
       case 'facebook':
         return authData.facebook.displayName;
    }
  }

  // Check if Firebase/users/<authData.uid> exists.
  // If it doesn't exist, add new user to firebase.
  // If it exists, do nothing. 
  function addUserIfNew(authData) {
    usersRef.child(authData.uid).once('value', function(snapshot) {
      if (snapshot.val() === null) {
        usersRef.child(authData.uid).set({
          name: getName(authData),
          pokemon: {name:'egg',sprite:'images/egg_jump.gif'},
          wins: 0,
          losses: 0,
          items: {lvlup:5, happy:5, heal:5}
        }, function() {
          getRefUser(authData);
        });
      } else {
        getRefUser(authData);
      }
    });
  }

  // Gets authData-user from Firebase and set that user as our user
  function getRefUser(authData) {
    usersRef.child(authData.uid).once('value', function(dataSnapshot) {
      var user = dataSnapshot.val();
      user.uid = authData.uid;
      self.setUser(user);
    });
  }

  // Check authData when authorizing
  ref.onAuth(function(authData) {
    //console.log("authData:",authData);
    if (!self.getUser() && authData) {
      if (authData.provider !== 'password') {
        addUserIfNew(authData);
      } else {
        getRefUser(authData);
      }
    }
    // else if (self.getUser()) {
    //   console.log("huehue",authData);
    //   //setUser(null);
    // }
  });

  if (self.getUser()) {
    var user = self.getUser();
    usersRef.child(user.uid).on("value",function(snapshot) {
      console.log("userRef user:",snapshot.val());
      $rootScope.user = snapshot.val();
      $localStorage.user = snapshot.val();
      $rootScope.$broadcast('userChanged');
    });
  }

  // Angular service needs to return an object that has all the
  // methods created in it.
  // This is because Angular takes care of creating it when needed.
  return this;

});