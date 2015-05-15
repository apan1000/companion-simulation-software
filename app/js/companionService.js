// Main service for user
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
  // Reference with connection status
  var presenceRef = new Firebase('https://companion-simulation.firebaseio.com/.info/connected');

  // Get user from local storage
  $rootScope.user = $localStorage.user;
  //console.log("localStorage user:",$rootScope.user);

  // Returns sprite data from pokeapi
  this.getSpriteData = function(uri) {
    return $resource(POKE_API + uri).get(function(data){
      console.log(data);
      return data;
    }, function(data){
      return data;
    });;
  }

  // Give user a new pokémon
  this.getNewPokemon = function() {
    var pokeID = Math.floor((Math.random() * 718) + 1);
    //console.log("Random id will be: "+ pokeID);
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
          isEgg:false,
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
    //console.log("setUser:",$localStorage.user);
    // Update user on Firebase
    if (newUser) {
      newUser.online = true;
      usersRef.child(newUser.uid).set(newUser);
    }
    $rootScope.$broadcast('userChanged');
  }

  // Returns current user
  this.getUser = function() {
    return $rootScope.user;
  }

  // Add exp to pokémon, call levelup() if curExp>=exp
  this.addExp = function(gainedExp) {
    while (gainedExp > 0) {
      if ($rootScope.user.pokemon.curExp < $rootScope.user.pokemon.exp) {
        $rootScope.user.pokemon.curExp += Math.min(gainedExp, 99);
        if (gainedExp < 99) {
          gainedExp = 0;
        } else {
          gainedExp -= 99;
        }
      }
      if ($rootScope.user.pokemon.curExp >= $rootScope.user.pokemon.exp) {
        this.levelUp();
      }
    }
  }

  // Adds a level to pokémon, stats changes as well
  this.levelUp = function() {
    var user = this.getUser();
    user.pokemon.curExp -= user.pokemon.exp;
    user.pokemon.exp += Math.floor(user.pokemon.exp*0.1)+1;
    user.pokemon.lvl += 1;
    user.pokemon.hp += Math.floor(Math.random()*10);
    user.pokemon.curHp = user.pokemon.hp;
    user.pokemon.attack += Math.floor(Math.random()*5)+1;
    user.pokemon.defense += Math.floor(Math.random()*5)+1;
    this.setUser(user);
  }

  // Returns a string to show on login screen
  this.getLoginMsg = function() {
    return loginMsg;
  }

  // Returns a string to show on login screen when creating new account
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
        //console.log("Authenticated successfully with payload:", authData);
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
        //console.log("Successfully created user account with uid:", userData.uid);
        //console.log(userData);
        usersRef.child(userData.uid).set({
          name: emailVal.replace(/@.*/, ''),
          pokemon: {name:'Egg',sprite:'images/egg_jump.gif',lvl:0, isEgg: true},
          wins: 0,
          combo: 0,
          losses: 0,
          items: [2,5,5],
          x_coord: 340,
          y_coord: 280,
          score: 0,
          online: false,
          beginner: true
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
    usersRef.child(self.getUser().uid+'/online').set(false);
    usersRef.child(self.getUser().uid).off("value");
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
      case 'google':
        return authData.google.displayName;
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
          pokemon: {name:'egg',sprite:'images/egg_jump.gif',lvl:0, isEgg: true},
          wins: 0,
          losses: 0,
          items: [2,5,5],
          x_coord: 340,
          combo: 0,
          y_coord: 280,
          score: 0,
          online: false,
          beginner: true
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

  // Set online status
  presenceRef.on('value', function(snapshot) {
    if (snapshot.val()) {
      if (self.getUser()) {
        onlineRef = usersRef.child(self.getUser().uid+'/online');
        onlineRef.onDisconnect().set(false);
        onlineRef.set(true);
      }
    }
  });

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
  });

  // Check for changes to user
  if (self.getUser()) {
    var user = self.getUser();
    usersRef.child(user.uid).on("value",function(snapshot) {
      var newUserVal = snapshot.val();
      if (newUserVal.online == true && self.getUser()) {
        $rootScope.user = newUserVal;
        $localStorage.user = newUserVal;
      }
      else if (newUserVal.online == false && $localStorage.user == null) {
        self.logout();
      }
      $rootScope.$broadcast('userChanged');
    });
  }

  // Angular service needs to return an object that has all the
  // methods created in it.
  // This is because Angular takes care of creating it when needed.
  return this;

});