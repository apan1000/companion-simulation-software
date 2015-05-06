var app = angular.module('companionSimulation');
app.directive("drawing", function($document, Companion, ChatService, $firebaseObject, $firebaseArray){ // ChatService,
  return {
    restrict: "A",
    link: function(scope, element, attrs){
        var playerUser = scope.user;
        console.log("user: ", playerUser);



        //var syncArray = ChatService.onlineUsers; //Får bara ut de som är online
        var refSyncObject = new Firebase("https://companion-simulation.firebaseio.com/users/"+playerUser.uid);
        var syncObject = $firebaseObject(refSyncObject); //.child("users").child(playerUser.uid));
  
        //scope.playerData = syncObject;
        syncObject.$bindTo(scope, "playerData");

        syncObject.$loaded(
          function(data) {
            console.log(data === syncObject); // true
            
            console.log("OBJECT loaded");
            console.log(scope.playerData);

            initPlayer();

          },
          function(error) {
            console.error("Error:", error);
          }
        );

        var refMess = new Firebase("https://companion-simulation.firebaseio.com");
        var messages = $firebaseArray(refMess.child("chat"));

        messages.$loaded(
          function(data) {
            console.log(data === messages); // true
            
            console.log("MESSAGES loaded");
            console.log(messages);

          },
          function(error) {
            console.error("Error:", error);
          }
        );

        var ref = new Firebase("https://companion-simulation.firebaseio.com");
        var syncArray = $firebaseArray(ref.child("users"));

        syncArray.$loaded(
          function(data) {
            console.log(data === syncArray); // true
            
            console.log("ARRAY loaded");
            console.log(syncArray);

              initOthers();

              update();
              render();
              dataUpdate();
          },
          function(error) {
            console.error("Error:", error);
          }
        );



        // var refSnapshot = [];
        // function dbSnapshot(){
        //   ref.once("value", function(dataSnapshot) {
        //     refSnapshot = dataSnapshot.child("users").val());
        //     console.log("SUCCESS SNAPSHOT");
        //    console.log(refSnapshot, dataSnapshot.child("users").val().length);

        //   });
          
        
        
        // var users = {};
        // scope.users = users;





        //Settings
        var movespeed = scope.user.pokemon.speed*3;
        var updateRate = 100;

        //Init Canvas
        var canvas = element[0];
        var ctx = canvas.getContext('2d');
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;


        //Init Player
        //var playerImage = new Image();
        var player = {x:scope.user.x_coord,y:scope.user.y_coord}; //{x:scope.playerData.x_coord,y:scope.playerData.y_coord};

        var initPlayer = function(){
          player["image"] = {};
          player.image = createImage(scope.playerData.pokemon.sprite);
          //playerImage.src = scope.playerData.pokemon.sprite;
          //playerImage.onload = function() {
          //    return;
          //}

        }

        //Init Background
        var background = new Image();
        background.src = "../images/background.png";

        //var grassTile = createImage("../images/grassTile1.png");

        var grassTile = new Image();
        grassTile.src = "../images/grassTile1.png";

        var beach = new Image();
        beach.src = "../images/beach.png"


       var createImage = function(src){
          var img = new Image();
          img.src = src;
          img.onload = function() {
              console.log(src+" loaded!");  
          }
          return img;
       };

      var otherPlayers = {};
      var otherPlayersImages = [];
      var otherPlayersUids = [];

      var initOthers = function(){
        
        var i = 0;
        var arrLength = syncArray.length;

        console.log(arrLength);
        console.log("INITOTHERS");
        var uid = "";
        var onlineUid = "";

        var onlineUsers = ChatService.getOnlineUsers();
        var onlineLength = onlineUsers.length;

        for (i = 0; i < arrLength; i++){
            uid = syncArray[i].uid;
            otherPlayers[uid] = {};
            otherPlayers[uid].x_start = syncArray[i].x_coord;
            otherPlayers[uid].y_start = syncArray[i].y_coord;
            otherPlayers[uid].x_target = syncArray[i].x_coord;
            otherPlayers[uid].y_target = syncArray[i].y_coord;
            otherPlayers[uid].image = createImage(syncArray[i].pokemon.sprite);
            otherPlayers[uid].name = syncArray[i].name;
            otherPlayersUids.push(uid);
            console.log("#players",otherPlayersUids.length, otherPlayersUids)
        }
        // for (i=0; i < onlineLength; i++){
        //   onlineUid = onlineUsers[i].uid;

        //   for(j=0; j < arrLength; j++){
        //     uid = syncArray[j].uid;

        //     if(onlineUid === uid){
        //       otherPlayers[uid] = {};

        //       otherPlayers[uid].x_coord = syncArray[j].x_coord;
        //       otherPlayers[uid].y_coord = syncArray[j].y_coord;
        //       otherPlayers[uid].image = createImage(syncArray[j].pokemon.sprite);
        //       otherPlayers[uid].name = syncArray[j].name;

        //       otherPlayersUids.push(uid);
        //     }
        //   }

        // console.log("#players",otherPlayersUids.length, otherPlayersUids);
          
        // }

        console.log("OTHERPLAYERS",otherPlayers);
        window.setTimeout(initPlayer, 3000);
          // player.x = scope.user[i].x_coord;
          // player.y = scope.user[i].y_coord;
          // var uid = scope.user[i].uid;

          // otherPlayers.push(scope.user[i]);
          // otherPlayerImages.push(createImage(scope.user[i].pokemon.sprite));
      }


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
        var data_package_time = 0;

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

          data_package_time = Date.now();

            if (scope.playerData.x_coord != player.x || scope.playerData.y_coord != player.y){
              
              scope.playerData.x_coord = player.x;
              scope.playerData.y_coord = player.y;

              syncObject.x_coord = player.x;
              syncObject.y_coord = player.y;

              syncObject.$save();

              //Companion.setUser(scope.user);

              //console.log("scope.playerData", scope.playerData);
              //console.log("syncObject",syncObject);
            }
            
            var opLength = otherPlayersUids.length;
            var curUid = "";
            for (i = 0; i < opLength; i++){

                curUid = otherPlayersUids[i];

                //Old target point is now start point
                otherPlayers[curUid].x_start = otherPlayers[curUid].x_target;
                otherPlayers[curUid].y_start = otherPlayers[curUid].y_target;

                //Get new target point
                otherPlayers[curUid].x_target = syncArray[i].x_coord;
                otherPlayers[curUid].y_target = syncArray[i].y_coord;
            }
            setTimeout(dataUpdate, updateRate);
        }
        
        function render(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);;
            drawBackground();
            drawPlayer();
            drawOthers();
            drawMessages();
            setTimeout( render, 1000 / 60 );
            //requestAnimationFrame(render);
        }

        function drawBackground(){

          
          var ptrn = ctx.createPattern(grassTile, 'repeat'); // Create a pattern with this image, and set it to "repeat".
          ctx.fillStyle = ptrn;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          //ctx.drawImage(background,0,0);
        }

        function drawMessages(){
          ctx.font = 'italic 12pt Calibri';
          ctx.fillStyle = 'blue';
          var currentUid = "";
          for (i=0;i<otherPlayersUids.length;i++){
            var ytext = 0

            for (j=0;j<messages.length;j++){
              if (messages[j].user === otherPlayersUids[j]){
                currentUid=otherPlayersUids[j];
                //console.log(messages[i].text);
                ctx.fillText(messages[j].text, otherPlayers[currentUid].x_coord, otherPlayers[currentUid].y_coord);
                ytext = ytext+14;
              }
            }
          }
        }

        lineLength = function(x, y, x0, y0){
            return Math.sqrt((x -= x0) * x + (y -= y0) * y);
        };

        function drawOthers(){
          var opLength = otherPlayersUids.length;
          var elapsedTime = Date.now() - data_package_time;

          var curUid = "";
          for (i = 0; i < opLength; i++){
            curUid = otherPlayersUids[i];

            var delta_x = (otherPlayers[curUid].x_target-otherPlayers[curUid].x_start) * (elapsedTime/updateRate);
            var delta_y = (otherPlayers[curUid].y_target-otherPlayers[curUid].y_start) * (elapsedTime/updateRate);

            var currentUidX = delta_x+otherPlayers[curUid].x_start;
            var currentUidY = delta_y+otherPlayers[curUid].y_start;

            var currentUidName = otherPlayers[curUid].name;
            var yOffset = 0;
            //DRAW SPRITE
            ctx.drawImage(otherPlayers[curUid].image, currentUidX, currentUidY, 120, 120);

            //DRAW NAMETAG
            ctx.font = 'italic 12pt Calibri';
            ctx.fillStyle = 'white';
            ctx.fillText(currentUidName, currentUidX-20, currentUidY);

            //DRAW MESSAGES
            for (j=0; j < messages.length; j++){
              if (messages[j].user === curUid){
                ctx.font = '12pt Calibri';
                ctx.fillStyle = 'white';
                ctx.fillText(messages[j].text, currentUidX+100, currentUidY+15+yOffset);
                yOffset = yOffset+14;

              }
            }
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
            ctx.drawImage(player.image, player.x,player.y, 120, 120);
            ctx.font = 'italic 12pt Calibri';
            ctx.fillStyle = 'white';
            ctx.fillText(syncObject.name, player.x-20, player.y);
            var yOffset = 0;
            for (i=0; i < messages.length; i++){
              if (messages[i].user === playerUser.uid){
                ctx.font = '12pt Calibri';
                ctx.fillStyle = 'white';
                ctx.fillText(messages[i].text, player.x+100, player.y+30+yOffset);
                yOffset = yOffset+14;

              }
            }
        }



        console.log("THIS IS MESSAGES", scope.messages);
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

            if (keyLeft === true && player.x > -60) {
                player.x = Math.round(player.x-amount);
            }
            if (keyRight === true && player.x < canvasWidth-60) {
                player.x = Math.round(player.x+amount);
            } 
            if (keyUp === true && player.y > -60) {
                player.y = Math.round(player.y-amount);
            }
            if (keyDown === true && player.y < canvasHeight-60) {
                player.y = Math.round(player.y+amount);
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