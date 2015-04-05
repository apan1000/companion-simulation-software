// Notice the 'ngRoute' and 'ngResource' in the module declaration. Those are some of the core Angular
// modules we are going to use in this app. If you check the index.html you will
// also see that we included separate JavaScript files for these modules. Angular
// has other core modules that you might want to use and explore when you go deeper
// into developing Angular applications. For this lab, these two will suffice.

var companionApp = angular.module('companionSimulation', ['ngRoute','ngResource','ngCookies','firebase','ngAnimate','ngStorage','ngDraggable']);

// Apart from specifying the partial HTML that needs to be loaded with your app, you can also specify which
// controller should be responsible for that view. In the controller you will setup the initial data or 
// access the data from the model and create the methods that you will link to events. Remember, controllers 
// can be nested, so you can have one controller responsible for the whole view, but then another one for 
// some sub part of the view. In such way you can reuse your controller on different parts of the view that 
// might have similar logic.
//
// In some cases we want the path to be variable (e.g. contain the user id). To define the variable part of 
// the path we use the ":" sign. For instance, our '/user/:userId' will be triggered when we access 
// 'http://localhost:8000/#/user/12345'. The 12345 value will be stored in a userId parameter, which we can
// then access through $routeParams service.
companionApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    	when('/', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }).
      when('/home', {
        templateUrl: 'partials/home.html'
      }).
      when('/fields', {
        templateUrl: 'partials/fields.html'
      }).
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/user/:user', {
        templateUrl: 'partials/user.html',
        controller: 'UserCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);

// Scroll to bottom directive
companionApp.directive('scrollBottom', function () {
  return {
    scope: {
      scrollBottom: "="
    },
    link: function (scope, element) {
      scope.$watchCollection('scrollBottom', function (newValue) {
        if (newValue)
        {
        	element[0].scrollTop = element[0].scrollHeight;
        }
      });
    }
  }
});

companionApp.run(function($rootScope, $location) {
	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		if ($rootScope.user == null) {
			// User not logged in, redirect to login
			if (next.templateUrl === "partials/login.html") {
			} else {
				$location.path("/login");
			}
		} else {
			// User logged in, can't go to login
			if (next.templateUrl === "partials/login.html") {
				$location.path("/home");
			} else {
			}
		}
	});
});