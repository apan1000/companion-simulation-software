companionApp.factory('ChatService', function ($rootScope, Companion) {
  var numOnlineUsers = 0;
  var onlineUsers = [];

  // Create our references
  var listRef = new Firebase('https://companion-simulation.firebaseio.com/presence/');
  var userRef = listRef.push(); // This creates a unique reference for each user
  var presenceRef = new Firebase('https://companion-simulation.firebaseio.com/.info/connected');

  // Add ourselves to presence list when online.
  presenceRef.on('value', function(snap) {
    if (snap.val()) {
      userRef.set(Companion.getUser());
      // Remove ourselves when we disconnect.
      userRef.onDisconnect().remove();
    }
  });

  // Get the user count and notify the application
  listRef.on('value', function(snap) {
    numOnlineUsers = snap.numChildren();
    onlineUsers = [];
    angular.forEach(snap.val(), function(value, key) {
      this.push(value);
    }, onlineUsers);
    console.log('onlineUsers: ',onlineUsers);
    $rootScope.$broadcast('onOnlineUser');
  });

  this.getOnlineUserCount = function() {
    return numOnlineUsers;
  }

  this.getOnlineUsers = function() {
    return onlineUsers;
    console.log('onlineUsers: ',onlineUsers);
  }

  return this;/*{
    getOnlineUserCount: getOnlineUserCount
  }*/
});
