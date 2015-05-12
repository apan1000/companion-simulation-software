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
      when('/fields/:user', {
        templateUrl: 'partials/fields.html'
      }).
      when('/valley',{
        templateUrl: 'partials/bar.html'
      }).
      when('/rankings/:user', {
        templateUrl: 'partials/rankings.html',
        controller: 'UserCtrl'
      }).
      when('/user/:user', {
        templateUrl: 'partials/user.html',
        controller: 'UserCtrl'
      }).
      when('/dungeon/:battleID', {
        templateUrl: 'partials/dungeon.html',
        controller: 'OnlineBattleCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);

// Scroll to bottom directive, http://stackoverflow.com/questions/26343832/scroll-to-bottom-in-chat-box-in-angularjs
companionApp.directive('scrollBottom', function ($timeout) {
  return {
    scope: {
      scrollBottom: "="
    },
    link: function (scope, element) {
      scope.$watchCollection('scrollBottom', function (newValue) {
        if (newValue)
        {
        	$timeout(function(){
        		element[0].scrollTop = element[0].scrollHeight;
        	});
        }
      });
    }
  }
});

// Directive for focusing on an element
companionApp.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
          console.log('trigger',value);
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});

companionApp.run(['$route','$rootScope','$location', function($route,$rootScope,$location) {
	// http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
	var original = $location.path;
	$location.path = function (path, reload) {
		if (reload === false) {
			var lastRoute = $route.current;
			var un = $rootScope.$on('$locationChangeSuccess', function () {
				$route.current = lastRoute;
				un();
			});
		}
		return original.apply($location, [path]);
	};
	//

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

	$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
		// Set current screen as selected in navbar
	  var path = $location.path().substring(1);
	  if (path.indexOf("/") > -1) {
	  	path = path.substring(0,path.indexOf('/'));
	  }
	  $rootScope.navSelected = path;
	});
}]);