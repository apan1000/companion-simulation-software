// Here we create an Angular service that we will use for our 
// model. In your controllers (or other services) you can include the
// dependency on any service you need. Angular will insure that the
// service is created first time it is needed and then just reuse it
// the next time.
dinnerPlannerApp.factory('Dinner',function ($resource, $cookieStore) {
  
  /*
  Keys:
  other: dvxveCJB1QugC806d29k1cE6x23Nt64O
  FB: dvxltQK4R4bLekoy63EflsMu6R0q44ze
  Ellinor: dvxy2iVl2OIUF0Hx3rKp1t0t3GfA6v9Q
  */

  //BigOven stuff, each key has 100 querys/h
  var keys = ['dvxveCJB1QugC806d29k1cE6x23Nt64O',
        'dvxltQK4R4bLekoy63EflsMu6R0q44ze',
        'dvxy2iVl2OIUF0Hx3rKp1t0t3GfA6v9Q'];
  this.key = keys[0];
  this.dishSearch = $resource('http://api.bigoven.com/recipes',{pg:1,rpp:30,api_key:this.key});
  this.dish = $resource('http://api.bigoven.com/recipe/:id',{api_key:this.key});

  //Get number of guests from a cookie or set an initial value and create
  //the cookie.
  this.numberOfGuests = $cookieStore.get('numberOfGuests');
  console.log('numberOfGuests: '+this.numberOfGuests);
  if (typeof this.numberOfGuests === 'undefined') {
    this.numberOfGuests = 2;
    $cookieStore.put('numberOfGuests',this.numberOfGuests);
    console.log('numberOfGuests: '+this.numberOfGuests);
    console.log('numberOfGuests-cookie: '+$cookieStore.get('numberOfGuests'));
  }

  //Get menu from cookie or create new menu and cookie.
  this.menu = [];
  var tempMenu = []; //Couldn't find how to change context (what 'this' is) for $resource, so used a temporary menu instead
  var menuIDs = $cookieStore.get('menu');
  for(key in menuIDs) {
    this.dish.get({id:menuIDs[key]},function(data){
      tempMenu.push(data);
      console.log("Adding "+data.Title+" to menu.");
    },function(data){
      console.log("Error getting/adding dish");
    });
  }
  this.menu = tempMenu;


  //Sets the number of guests to num
  this.setNumberOfGuests = function(num) {
    if(num > 0) {
      this.numberOfGuests = num;
      $cookieStore.put('numberOfGuests',this.numberOfGuests);
    }
  }

  //Returns number of guests
  this.getNumberOfGuests = function() {
    return parseInt(this.numberOfGuests);
  }

  //Returns the dish that is on the menu for selected type 
  this.getSelectedDish = function(type) {
    for(key in this.menu) {
      if(this.menu[key].Category == type) {
        return this.menu[key];
      }
    }
  }

  //Returns all the dishes on the menu.
  this.getFullMenu = function() {
    return this.menu;
  }

  //Returns all ingredients for all the dishes on the menu.
  this.getAllMenuIngredients = function() {
    var ingredients = [];
    for(key in this.menu) {
      ingredients = ingredients.concat(this.menu[key].Ingredients);
    }
    return ingredients;
  }

  //Returns the total price of the menu (all the ingredients multiplied by number of guests).
  this.getTotalMenuPrice = function() {
    var ingredients = this.getAllMenuIngredients();
    var totalPrice = 0;
    for(key in ingredients){
      totalPrice += parseFloat(ingredients[key].MetricQuantity) * this.numberOfGuests;
    }
    return +totalPrice.toFixed(2);

  }

  //Returns the price of a dish (all the ingredients multiplied by number of guests).
  this.getDishPrice = function(dish) {
    var price = 0;
    for(key in dish.Ingredients) {
      price += parseFloat(dish.Ingredients[key].MetricQuantity) * this.numberOfGuests;
    }
    return +price.toFixed(2);
  }

  //Adds the passed dish to the menu. If the dish of that type already exists on the menu
  //it is removed from the menu and the new one added.
  this.addDishToMenu = function(dish) {
    for(key in this.menu) {
      if(this.menu[key].RecipeID != dish.RecipeID) {
        if(this.menu[key].Category == dish.Category) {
          this.removeDishFromMenu(this.menu[key].RecipeID);
        }
      } else {
        return;
      }
    }
    this.menu.push(dish);
    this.setMenuCookie();
  }

  //Removes dish from menu
  this.removeDishFromMenu = function(id) {
    for(key in this.menu) {
      if(this.menu[key].RecipeID == id){
        var index = this.menu.indexOf(this.menu[key]);
        this.menu.splice(index,1);
        this.setMenuCookie();
      }
    }
  }

  //Removes all dishes from menu
  this.emptyMenu = function() {
    this.menu = [];
    this.setMenuCookie();
  }

  this.setMenuCookie = function() {
    var menuIDs = [];
    for(key in this.menu) {
      menuIDs.push(this.menu[key].RecipeID);
    }
    $cookieStore.put('menu',menuIDs);
  }

  // TODO in Lab 5: Add your model code from previous labs
  // feel free to remove above example code
  // you will need to modify the model (getDish and getAllDishes) 
  // a bit to take the advantage of Angular resource service
  // check lab 5 instructions for details

  // Angular service needs to return an object that has all the
  // methods created in it. You can consider that this is instead
  // of calling var model = new DinnerModel() we did in the previous labs
  // This is because Angular takes care of creating it when needed.
  return this;

});