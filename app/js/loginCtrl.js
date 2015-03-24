// Login controller that we use whenever we want to login
companionApp.controller('LoginCtrl', function ($scope,$routeParams,$firebaseObject,Companion) {

  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var usersRef = ref.child('users');

  $scope.auth = null;

  $scope.logout = function() {
    console.log("Unauthorizing");
    ref.unauth();
  }

  $scope.createAccount = function() {
    if($scope.loginForm.email.$valid === true && $scope.loginForm.password.$valid === true) {
      console.log($scope.loginForm.email);
      console.log($scope.loginForm.password);
      var emailVal = $scope.loginForm.email.$modelValue;
      var passwordVal = $scope.loginForm.password.$modelValue;

      ref.createUser({
        email    : emailVal,
        password : passwordVal
      }, function(error, userData) {
        if (error) {
          switch (error.code) {
            case "EMAIL_TAKEN":
              console.log("The new user account cannot be created because the email is already in use.");
              break;
            case "INVALID_EMAIL":
              console.log("The specified email is not a valid email.");
              break;
            default:
              console.log("Error creating user:", error);
          }
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          console.log(userData);
          ref.child("users").child(userData.uid).set({
            name: emailVal.replace(/@.*/, ''),
            pokemon: 'egg'
          });
          $scope.loginWithPassword();
        }
      });
    }
    else {
      if($scope.loginForm.email.$error.email || $scope.loginForm.email.$error.required) {
        console.log('\nemail error: ');
        console.log($scope.loginForm.email.$error);
      }
      else if($scope.loginForm.password.$error.required)
        console.log('\npassword error: ');
      console.log($scope.loginForm.password.$error);
    }
  }

  $scope.loginWithPassword = function() {
    var emailVal = $scope.loginForm.email.$modelValue;
    var passwordVal = $scope.loginForm.password.$modelValue;

    ref.authWithPassword({
      email    : emailVal,
      password : passwordVal
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
      }
    });
  }

  $scope.loginWithSocial = function(provider) {
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
      }
    });
  }
  


  // we would probably save a profile when we register new users on our site
  // we could also read the profile to see if it's null

  ref.onAuth(function(authData) {
    $scope.$apply(function(){
        $scope.auth = authData;
    });
    $scope.auth = authData;
    console.log("\nauthData:");
    console.log(authData);
    console.log("$scope.auth:");
    console.log($scope.auth);
    if (authData && authData.provider !== 'password') {
      addUserIfNew(authData);
    }
  });

  // find a suitable name based on the meta info given by each provider
  function getName(authData) {
    switch(authData.provider) {
       case 'password':
         return authData.password.email.replace(/@.*/, '');
       case 'twitter':
         return authData.twitter.username;
       case 'facebook':
         return authData.facebook.displayName;
    }
  }

// Check if /users/<authData.uid> exists.
// If it doesn't exist, add to firebase.
// If it exists, do nothing. 
function addUserIfNew(authData) {
  usersRef.child(authData.uid).once('value', function(snapshot) {
    if(snapshot.val() === null) {
      usersRef.child(authData.uid).set({
        name: getName(authData),
        pokemon: 'egg'
      });
    }
  });
}

});