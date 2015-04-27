var app = angular.module('companionSimulation');

// Canvas directive
// app.direcive("bar", function(){
//     return{
//         restrict: "A",
//         link: function(scope,element,attrs){
//             //console.log
//     var ctx = elemeny[0].getContext('2d');
//     }
// });

// app.directive("canvas", function(){
//   return {
//     restrict: "A",
//     link: function(scope, elem, attrs){

//         elem.bind('click', function() {
//             console.log(scope.totalViewers);
//         scope.$apply(function() {
//           scope.context = elem[0].getContext('2d');
//         });
//       });
        
//       // canvas reset
//       function reset(){
//        scope.context.clearRect (0, 0, canvas.width, canvas.height);
//       }
//     }
//   };
// });

app.directive("drawing", function($document, Companion, $firebaseObject, $firebaseArray){
  return {
    restrict: "A",
    link: function(scope, element, attrs){

        var ref = new Firebase("https://companion-simulation.firebaseio.com");
        // var syncObject = firebaseObject(ref);
        // syncObject.$bindTo(scope, "users");

        // var usersRef = ref.child("users");
        // var users = $firebaseObject(usersRef);
        var users = {};
        scope.users = users;
        scope.users = $firebaseArray(ref.child("users"));

        //syncObject.$bindTo(scope, "users");
        scope.users.$loaded(
          function(data) {
            console.log(data === scope.users); // true
            console.log(data);
              initOthers();
              //initPlayer();

              update();
              render();
              dataUpdate();
              console.log("GO");
          },
          function(error) {
            console.error("Error:", error);
        }
      );
        //Settings
        var movespeed = 200;

        //Init Canvas
        var canvas = element[0];
        var ctx = canvas.getContext('2d');


        //Init Player
        var playerImage = new Image();
        var player = {x:10,y:10};
        var initPlayer = function(){

          playerImage.src = scope.user.pokemon.sprite;
          playerImage.onload = function() {
              return;
          }

        }

        //Init Background
        var background = new Image();
        background.src = "../images/background.png";


        window.requestAnimationFrame = function(){
            return(
                window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                }
            );
        };


        // function animloop( ){

        //     update();
        //     render();
        //     console.log("hello world");
        //     requestAnimationFrame(animloop);
        // }

        var now = 0;
        var delta= 0;
        var then= 0;

        function setDelta(){
            now = Date.now();
            delta = (now - then);
            then = now;
        }

        
        function update(){
            setDelta();
            movePlayer();
            setTimeout( update, 1000 / 60 );//multifaster
        }

        function dataUpdate(){
            if (scope.user.x_coord != player.x || scope.user.y_coord != player.y){
              scope.user.x_coord = player.x;
              scope.user.y_coord = player.y;
              Companion.setUser(scope.user);
              console.log("updated XY");

              var opLength = otherPlayersUids.length;
              var currentUid = "";

              for (i = 0; i < opLength; i++){

                currentUid = otherPlayersUids[i];

                otherPlayers[currentUid].x_coord = scope.users[i].x_coord;
                otherPlayers[currentUid].y_coord = scope.users[i].y_coord;
              }

            }
            setTimeout(dataUpdate, 1000/10);
        }
        
        function render(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);;
            drawBackground();
            drawPlayer();
            drawOthers();
            setTimeout( render, 1000 / 60 );
            //requestAnimationFrame(render);
        }

        function drawBackground(){
          ctx.drawImage(background,0,0);
        }
        function drawOthers(){
          var opLength = otherPlayersUids.length;

          var currentUid = "";
          for (i = 0; i < opLength; i++){
            currentUid = otherPlayersUids[i];

            ctx.drawImage(otherPlayers[currentUid].image, otherPlayers[currentUid].x_coord, otherPlayers[currentUid].y_coord);
          }
        //  var i = 0;
        //  angular.forEach(otherPlayers, function(user, key) {
           //  ctx.drawImage(otherPlayersImages[i], user.x_coord, user.y_coord);
           //  i++;
           // });
        //     for(i in otherPlayers){
        //         ctx.drawImage(otherPlayers[i].Image, otherPlayers[i].x_coord, otherPlayers[i].y_coord);
        //     }
        }
        function drawPlayer(){
            ctx.drawImage(playerImage, player.x,player.y);

        }

        var amount = 0;
        var keyLeft = false;
        var keyUp = false;
        var keyRight = false;
        var keyDown = false;

        $document.keydown(function(key){
            switch(key.which) {
                case 37: { // Left Arrow
                    keyLeft = true;
                    break;
                }
                case 38: { // Up Arrow
                    keyUp = true;
                    break;
                }
                case 39: { // Right Arrow
                    keyRight = true;
                    break;
                }  
                case 40: { // Down Arrow
                    keyDown = true;
                    break;
                }
            }
        });

        $document.keyup(function(key){
            switch(key.which) {
                case 37: { // Left Arrow
                    keyLeft = false;
                    break;
                }
                case 38: { // Up Arrow
                    keyUp = false;
                    break;
                }
                case 39: { // Right Arrow
                    keyRight = false;
                    break;
                }  
                case 40: { // Down Arrow
                    keyDown = false;
                    break;
                }
            }
        });

        function movePlayer(){
            amount = movespeed*delta/1000;
            //console.log(amount);

            if (keyLeft === true) {
                player.x = player.x-amount;
            }
            if (keyRight === true) {
                player.x = player.x+amount;
            } 
            if (keyUp === true) {
                player.y = player.y-amount;
            }
            if (keyDown === true) {
                player.y = player.y+amount;
            }

            

            // usersRef.child(scope.user.uid).child("x_coord").update(player.x);
            // usersRef.child(scope.user.uid).child("y_coord").update(player.y);



        }





      // variable that decides if something should be drawn on mousemove
        //var drawing = false;

      // the last coordinates before the current move
       // var lastX;
       // var lastY;

       //  getSprite = function(sprites){
       //    var other
       //  	for (i in sprites){
       //      	var other = {x:10,y:10};
       //        createImage(scope.user.pokemon.sprite)
       //      	otherPlayers.push(player);
       //      	otherPlayersImages.push(createImage(scope.user.pokemon.sprite));
       //  	}
       // }

       var createImage = function(src){
          var img = new Image();
          img.src = src;
          img.onload = function() {
              console.log(src+" loaded!");  
          }
          return img;
       };

       var otherPlayers = { };
       var otherPlayersImages = [];
       var otherPlayersUids = [];

       var initOthers = function(){
        
        var i = 0;
        var arrLength = scope.users.length;
        //console.log(scope.users);
        console.log("INITOTHERS");
        var uid = "";
        for (i=0; i < arrLength; i++){
          //scope.users[i];

          uid = scope.users[i].uid;
          console.log("UserFound"+uid)
          otherPlayers[uid] = {};
          otherPlayers[uid].x_coord = scope.users[i].x_coord;
          otherPlayers[uid].y_coord = scope.users[i].y_coord;
          otherPlayers[uid].image = {};
          otherPlayers[uid].image = createImage(scope.users[i].pokemon.sprite);
          console.log("IMAGES:");
          console.log(createImage(scope.users[i].pokemon.sprite));
          otherPlayersUids.push(uid);

        }
        console.log(otherPlayers);
        window.setTimeout(initPlayer, 3000);
          // player.x = scope.user[i].x_coord;
          // player.y = scope.user[i].y_coord;
          // var uid = scope.user[i].uid;

          // otherPlayers.push(scope.user[i]);
          // otherPlayerImages.push(createImage(scope.user[i].pokemon.sprite));
      }

        

   //      var sprites = [];

   //      usersRef.once("value", function(snapshot) {
   //          var array = snapshot.val();
   //        	angular.forEach(array, function(user, key) {
			//   this.push(user.pokemon.sprite);
			// }, sprites);
			// getSprite(sprites);
   //          }, function (errorObject) {
   //          console.log("The read failed: " + errorObject.code);
   //      });



        //player.x * wallDim + wallDim ,player.y * wallDim + wallDim ,50,50);

      // element.bind('mousedown', function(event){
      //   if(event.offsetX!==undefined){
      //     lastX = event.offsetX;
      //     lastY = event.offsetY;
      //   } else { // Firefox compatibility
      //     lastX = event.layerX - event.currentTarget.offsetLeft;
      //     lastY = event.layerY - event.currentTarget.offsetTop;
      //   }

      //   // begins new line
      //   ctx.beginPath();

      //   drawing = true;
      // });
      // element.bind('mousemove', function(event){
      //   if(drawing){
      //     // get current mouse position
      //     if(event.offsetX!==undefined){
      //       currentX = event.offsetX;
      //       currentY = event.offsetY;
      //     } else {
      //       currentX = event.layerX - event.currentTarget.offsetLeft;
      //       currentY = event.layerY - event.currentTarget.offsetTop;
      //     }

      //     draw(lastX, lastY, currentX, currentY);

      //     // set current coordinates to last one
      //     lastX = currentX;
      //     lastY = currentY;
      //   }

      // });
      // element.bind('mouseup', function(event){
      //   // stop drawing
      //   drawing = false;
      // });

      // // canvas reset
      // function reset(){
      //  element[0].width = element[0].width; 
      // }


    
  }
}
});