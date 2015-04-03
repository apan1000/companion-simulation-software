// Login controller that we use whenever we want to login or logout
companionApp.controller('LoginCtrl', function ($scope,Companion,$routeParams,$firebaseObject,$timeout) {

  var ref = new Firebase("https://companion-simulation.firebaseio.com");
  var usersRef = ref.child('users');

  $scope.loginMsg = "";
  $scope.auth = null;

  // Logout the user
  $scope.logout = function() {
    console.log("Unauthorizing");
    Companion.logout();
  }

  // Create new account using email and password
  $scope.createAccount = function() {
    if ($scope.loginForm.email.$valid === true && $scope.loginForm.password.$valid === true) {
      console.log($scope.loginForm.email);
      console.log($scope.loginForm.password);
      var emailVal = $scope.email;
      var passwordVal = $scope.password;
      //Companion.createAccount(emailVal, passwordVal);

      ref.createUser({
        email    : emailVal,
        password : passwordVal
      }, function(error, userData) {
        if (error) {
          showLoginMsg(error.code);
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          console.log(userData);
          ref.child("users").child(userData.uid).set({
            name: emailVal.replace(/@.*/, ''),
            pokemon: 'egg',
            lvl: 0,
            wins: 0,
            losses: 0
          });
          $scope.loginWithPassword();
        }
      });
    }
    else {
      if ($scope.loginForm.email.$error.email || $scope.loginForm.email.$error.required) {
        console.log('\nemail error: ');
        console.log($scope.loginForm.email.$error);
      }
      else if ($scope.loginForm.password.$error.required)
        console.log('\npassword error: ');
      console.log($scope.loginForm.password.$error);
    }
  }

  // Login using email and password
  $scope.loginWithPassword = function() {
    var emailVal = $scope.email;
    var passwordVal = $scope.password;
    //Companion.loginWithPassword(emailVal, passwordVal);

    ref.authWithPassword({
      email    : emailVal,
      password : passwordVal
    }, function(error, authData) {
      if (error) {
        console.log(error);
        showLoginMsg(error.code);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        // Reset email and password inputs
        $scope.email = "";
        $scope.password = "";
        $scope.loginForm.email.$setUntouched();
        $scope.loginForm.password.$setUntouched();
        // Show success toast
        showLoginMsg(authData);
      }
    });
  }

  // For use when we want to login using the enter key in a text-input field
  $scope.loginWithEnter = function() {
    if ($scope.loginForm.email.$invalid || $scope.loginForm.password.$invalid) {
      return;
    } else {
      $scope.loginWithPassword();
    }
  }

  // Login using social media account
  $scope.loginWithSocial = function(provider) {
    //Companion.loginWithSocial(provider);
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
        showLoginMsg(authData);
      }
    });
  }

  // Sets user to the authorized user
  function setUser(authData) {
    if (authData) {
      usersRef.child(authData.uid).once('value', function(dataSnapshot) {
        var user = dataSnapshot.val();
        user.uid = authData.uid;
        Companion.setUser(user);
      });
    } else {
      Companion.setUser(null);
    }
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

  // Check if /users/<authData.uid> exists.
  // If it doesn't exist, add to firebase.
  // If it exists, do nothing. 
  function addUserIfNew(authData) {
    usersRef.child(authData.uid).once('value', function(snapshot) {
      if (snapshot.val() === null) {
        usersRef.child(authData.uid).set({
          name: getName(authData),
          pokemon: 'egg'
        });
      }
    });
  }

  // Show success or error message
  function showLoginMsg(obj) {
    var type = "";
    var msg = "";

    switch (obj) {
      case Object(obj):
        type = "success";
        msg = "Logged in!";
        console.log("Logged in!");
        break;
      case "EMAIL_TAKEN":
        type = "emailError";
        msg = "Email already taken";
        console.log("The new user account cannot be created because the email is already in use.");
        break;
      case "INVALID_EMAIL":
        type = "emailError";
        msg = "Invalid Email";
        console.log("The specified email is not a valid email.");
        break;
      case "INVALID_PASSWORD":
        type = "passwordError";
        msg = "Wrong Password, try again.";
        break;
      case "INVALID_USER":
        type = "emailError";
        msg = "The specified user does not exist.";
        break;
      default:
        console.log(obj);
    }

    if (type === 'success') {
      $timeout(function(){
        $scope.success = true;
        $scope.loginMsg = msg;
        $scope.emailSuccess = true;
        $scope.passwordSuccess = true;
      });
    }
    else if (type === 'emailError' || type === 'passwordError') {
      $timeout(function(){
        $scope.error = true;
        $scope.loginMsg = msg;
        if (type === 'emailError') {
          $scope.emailError = true;
          $scope.passwordError = false;
        }
        else if (type === 'passwordError') {
          $scope.emailError = false;
          $scope.passwordError = true;
        }
      });
    }
  }

  // Check authData when authorizing
  ref.onAuth(function(authData) {
    $timeout(function() {
      $scope.auth = authData;
    });
    $scope.auth = authData;
    console.log("authData:");
    console.log(authData);
    if (authData) {
      setUser(authData);
      if (authData.provider !== 'password') {
        addUserIfNew(authData);
      }
    }
  });

});
