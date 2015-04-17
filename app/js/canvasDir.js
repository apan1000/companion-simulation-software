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

app.directive("drawing", function($document){
  return {
    restrict: "A",
    link: function(scope, element, attrs){

        var ref = new Firebase("https://companion-simulation.firebaseio.com");
        var usersRef = ref.child("users");
        //Settings
        var movespeed = 300;

        //Init Canvas
        var canvas = element[0];
        var ctx = canvas.getContext('2d');


        //Init Player
        var playerImage = new Image();
        var player = {x:10,y:10};

        playerImage.src = scope.user.pokemon.sprite;
        playerImage.onload = function() {
            update();
            render();
        }
        //Init Background
        var background = new Image();
        background.src = "../images/background.png";

        var otherPlayers = [];
        var otherPlayersImages = [];

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
        }





      // variable that decides if something should be drawn on mousemove
        //var drawing = false;

      // the last coordinates before the current move
       // var lastX;
       // var lastY;

        getSprite = function(sprites){
        	for (i in sprites){
        		var otherImage = new Image();
            	var other = {x:10,y:10};
            	otherImage.src = scope.user.pokemon.sprite;
            	otherPlayers.push(player);
            	otherPlayersImages.push(otherImage);

        	}

       }


        var drawOthers = function(){
   //      	var i = 0;
   //      	angular.forEach(otherPlayers, function(user, key) {
			//   ctx.drawImage(otherPlayersImages[i], user.x, user.y);
			//   i++;
			// });
   //          for(i in otherPlayers){
   //              ctx.drawImage(otherPlayers[i].Image, otherPlayers[i].x, otherPlayers[i].y);
   //          }
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
        // var draw = function(){
        //     if(!redraw)
        //         return;
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        //     //What to draw
        //     drawPlayer();
        //     drawOthers();
        // }

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

      // function draw(lX, lY, cX, cY){
      //   // line from
      //   ctx.moveTo(lX,lY);
      //   // to
      //   ctx.lineTo(cX,cY);
      //   // color
      //   ctx.strokeStyle = "#4bf";
      //   // draw it
      //   ctx.stroke();
      // }
    
  }
}
});