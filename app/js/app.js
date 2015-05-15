// Our angular app
var companionApp = angular.module('companionSimulation', ['ngRoute','ngResource','ngCookies','firebase','ngAnimate','ngStorage','ngDraggable']);

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
        templateUrl: 'partials/fields.html',
        controller: 'ArenaCtrl'
      }).
      when('/valley',{
        templateUrl: 'partials/valley.html'
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

// Scroll to bottom directive
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