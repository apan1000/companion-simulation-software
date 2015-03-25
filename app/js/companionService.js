// Here we create an Angular service that we will use for our 
// model. In your controllers (or other services) you can include the
// dependency on any service you need. Angular will ensure that the
// service is created first time it is needed and then just reuse it
// the next time.
companionApp.factory('Companion',function ($resource, $cookieStore) {

  var POKE_API = 'http://pokeapi.co';
  this.pokemon = $resource(POKE_API + '/api/v1/pokemon/:id');
  this.sprite = $resource(POKE_API + '/api/v1/sprite/:uri');

  this.user = null;

  this.getSpriteData = function(uri) {
    return $resource(POKE_API + uri).get(function(data){
      console.log(data);
      return data;
    }, function(data){
      return data;
    });;
  }

  this.setUser = function(user) {
    this.user = user;
    console.log(this.user);
  }

  this.getUser = function() {
    return this.user;
  }

  //Get number of guests from a cookie or set an initial value and create
  //the cookie.

  // this.numberOfGuests = $cookieStore.get('numberOfGuests');
  // console.log('numberOfGuests: '+this.numberOfGuests);
  // if (typeof this.numberOfGuests === 'undefined') {
  //   this.numberOfGuests = 2;
  //   $cookieStore.put('numberOfGuests',this.numberOfGuests);
  //   console.log('numberOfGuests: '+this.numberOfGuests);
  //   console.log('numberOfGuests-cookie: '+$cookieStore.get('numberOfGuests'));
  // }

  //Get menu from cookie or create new menu and cookie.
  
  // this.menu = [];
  // var tempMenu = []; //Couldn't find how to change context (what 'this' is) for $resource, so used a temporary menu instead
  // var menuIDs = $cookieStore.get('menu');
  // for(key in menuIDs) {
  //   this.dish.get({id:menuIDs[key]},function(data){
  //     tempMenu.push(data);
  //     console.log("Adding "+data.Title+" to menu.");
  //   },function(data){
  //     console.log("Error getting/adding dish");
  //   });
  // }
  // this.menu = tempMenu;


  //Sets the number of guests to num
  // this.setNumberOfGuests = function(num) {
  //   if(num > 0) {
  //     this.numberOfGuests = num;
  //     $cookieStore.put('numberOfGuests',this.numberOfGuests);
  //   }
  // }

  //Removes all dishes from menu
  // this.emptyMenu = function() {
  //   this.menu = [];
  //   this.setMenuCookie();
  // }

  // this.setMenuCookie = function() {
  //   var menuIDs = [];
  //   for(key in this.menu) {
  //     menuIDs.push(this.menu[key].RecipeID);
  //   }
  //   $cookieStore.put('menu',menuIDs);
  // }

  // Angular service needs to return an object that has all the
  // methods created in it.
  // This is because Angular takes care of creating it when needed.
  return this;

});