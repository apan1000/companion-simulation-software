// Login controller that we use whenever we want to login or logout
companionApp.controller('LoginCtrl', function ($scope,$rootScope,Companion,$timeout,$location) {

  $scope.user = Companion.getUser();
  $scope.loginMsg = "";
  $scope.loading = false;

  if ($scope.user && $scope.user.challengers) {
    $scope.numChallengers = Object.keys($scope.user.challengers).length;
    console.log('challengers: ', $scope.numChallengers);
  } else {
    $scope.numChallengers = 0;
  }

  // Logout the user
  $scope.logout = function() {
    console.log("Unauthorizing");
    Companion.logout();
  }

  // Create new account using email and password
  $scope.createAccount = function() {
    if ($scope.createAccForm.newEmail.$valid === true && $scope.createAccForm.newPassword.$valid === true) {
      $scope.loading = true;
      console.log($scope.createAccForm.newEmail);
      console.log($scope.createAccForm.newPassword);
      Companion.createAccount($scope.newEmail, $scope.newPassword);
    } else {
      $scope.loading = false;
      if ($scope.createAccForm.newEmail.$error.email || $scope.createAccForm.newEmail.$error.required) {
        console.log('\nemail error: ');
        console.log($scope.createAccForm.newEmail.$error);
      }
      else if ($scope.createAccForm.newPassword.$error.required)
        console.log('\npassword error: ');
        console.log($scope.createAccForm.newPassword.$error);
    }
  }

  // Login using email and password
  $scope.loginWithPassword = function(isNewAcc) {
    $scope.loading = true;
    if (isNewAcc) {
      var emailVal = $scope.newEmail;
      var passwordVal = $scope.newPassword;
    } else {
      var emailVal = $scope.email;
      var passwordVal = $scope.password;
    }
    Companion.loginWithPassword(emailVal, passwordVal);
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
    Companion.loginWithSocial(provider);
  }

  // Show success or error message for login
  function showLoginMsg(obj) {
    $scope.loading = false;
    var type = "";
    var msg = "";

    switch (obj) {
      case "success":
        type = "success";
        $scope.loginMsg = "Logged in!";
        console.log("Logged in!");
        break;
      case "INVALID_EMAIL":
        type = "emailError";
        $scope.loginMsg = "Invalid Email";
        console.log("The specified email is not a valid email.");
        break;
      case "INVALID_PASSWORD":
        type = "passwordError";
        $scope.loginMsg = "Wrong Password, try again.";
        break;
      case "INVALID_USER":
        type = "emailError";
        $scope.loginMsg = "The specified user does not exist.";
        break;
      default:
        console.log(obj);
    }

    if (type === 'success') {
      $timeout(function(){
        $scope.success = true;
        $scope.emailSuccess = true;
        $scope.passwordSuccess = true;
        $timeout(function() {
          // Reset email and password inputs
          $scope.email = "";
          $scope.password = "";
          // Reset success state
          $scope.success = false;
          $scope.emailSuccess = false;
          $scope.passwordSuccess = false;
          $scope.passwordError = false;
        },500);
        // $scope.loginForm.email.$setUntouched();
        // $scope.loginForm.password.$setUntouched();
      });
    }
    else {
      $timeout(function(){
        $scope.error = true;
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

  // Show success or error message for creating account
  function showNewAccMsg(obj) {
    $scope.loading = false;
    var type = "";
    var msg = "";

    switch (obj) {
      case "success": //Object(obj)
        type = "success";
        $scope.newAccMsg = "Success! Logging in...";
        console.log("Logged in!");
        break;
      case "EMAIL_TAKEN":
        type = "emailError";
        $scope.newAccMsg = "Email already taken";
        console.log("The new user account cannot be created because the email is already in use.");
        break;
      case "INVALID_EMAIL":
        type = "emailError";
        $scope.newAccMsg = "Invalid Email";
        console.log("The specified email is not a valid email.");
        break;
      case "INVALID_PASSWORD":
        type = "passwordError";
        $scope.newAccMsg = "Wrong Password, try again.";
        break;
      default:
        console.log(obj);
    }

    if (type === 'success') {
      $timeout(function(){
        $scope.newAccSuccess = true;
        $scope.newAccEmailSuccess = true;
        $scope.newAccPasswordSuccess = true;
      });
      $timeout(function() {
        // Reset success state
        $scope.newAccSuccess = false;
        $scope.newAccEmailSuccess = false;
        $scope.newAccPasswordSuccess = false;
        $scope.newAccMsg = "";
      },1000);
    }
    else {
      $timeout(function(){
        $scope.newAccError = true;
        if (type === 'emailError') {
          $scope.newAccEmailError = true;
          $scope.newAccPasswordError = false;
        }
        else if (type === 'passwordError') {
          $scope.newAccEmailError = false;
          $scope.newAccPasswordError = true;
        }
      });
    }
  }

  // $scope.$on('challengersChanged', function() {
  //   $scope.numChallengers = Companion.getNumChallengers();
  // });

  $scope.$on('loginMsgChange', function() {
    showLoginMsg(Companion.getLoginMsg());
  });

  $scope.$on('newAccMsgChange', function() {
    showNewAccMsg(Companion.getNewAccMsg());
  });

  // When changes to user has been made redirect if necessary
  $scope.$on('userChanged', function() {
    //console.log("User changed, setting scope.user!");
    $scope.user = Companion.getUser();
    if ($scope.user) {
      if ($location.path() === "/") {
        $timeout(function() {
          $location.path("/home");
        });
      }
      if ($scope.user.challengers) {
        $scope.numChallengers = Object.keys($scope.user.challengers).length;
      } else {
        $scope.numChallengers = 0;
      }
    } else {
      $timeout(function() {
        $location.path("/");
      });
    }
  });

});
