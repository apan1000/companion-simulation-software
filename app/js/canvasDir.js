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
        var movespeed = 200;
        //var updateRate = 100;

        //Init Canvas
        var canvas = element[0];
        var ctx = canvas.getContext('2d');
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;


        //Init Player
        //var playerImage = new Image();
        var player = {x:scope.user.x_coord,y:scope.user.y_coord}; //

        var initPlayer = function(){
          player["image"] = {};
          player.image = createImage(scope.playerData.pokemon.sprite);
          //player.x = scope.playerData.x_coord;
          //player.y = scope.playerData.x_coord;
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

            otherPlayers[uid].x_coord = syncArray[i].x_coord;
            otherPlayers[uid].y_coord = syncArray[i].y_coord;
  
            otherPlayers[uid].x_target = syncArray[i].x_coord;
            otherPlayers[uid].y_target = syncArray[i].y_coord;

            otherPlayers[uid].image = createImage(syncArray[i].pokemon.sprite);
            otherPlayers[uid].name = syncArray[i].name;

            otherPlayersUids.push(uid);

            
        }
        console.log(otherPlayers);
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
            moveOthers();
            setTimeout( update, 1000 / 60 );//multifaster
        }

        function dataUpdate(){

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
            var currentUid = "";
            for (i = 0; i < opLength; i++){
                currentUid = otherPlayersUids[i];
                otherPlayers[currentUid].x_target = syncArray[i].x_coord;
                otherPlayers[currentUid].y_target = syncArray[i].y_coord;
            }
            setTimeout(dataUpdate, 1000 / 5);
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
          //ctx.drawImage(beach,640,0)
        }

        function roundRect(x, y, width, height, radius) {
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        function wrapText(text, maxWidth, lineHeight) { //...text, x, y,...
        var words = text.split(' ');
        var line = '';
        var completed = [];
        //var part = [];
        //var lineNumber = 0;

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth && n > 0) {

            //part = line;
            //part[1] = lineHeight*lineNumber;
            completed.push(line);
            part = [];
            line = words[n] + ' ';   
            //lineNumber++;
          }
          else {
            line = testLine;
          }
        }
        //part[0] = line;
        //part[1] = lineHeight*lineNumber;

        completed.push(line);
        //part = [];
        return completed
      }
      
        function drawMessages(){
          ctx.font = 'italic 12pt Calibri';
          ctx.fillStyle = 'white';
          var currentUid = "";
          var minTime = Date.now()-100000; //10 seconds back in time
          var opLength = otherPlayersUids.length;
          //For every user
          for (i = 0; i < opLength; i++){
            var yOffset = 0;
            currentUid=otherPlayersUids[i];
            var messageList = [];
            var messageExists = false;
            var totalHeight = 0;
            //For every users message
            for (j=0; j<messages.length; j++){
              var x_temp = otherPlayers[currentUid].x_coord;
              var y_temp = otherPlayers[currentUid].y_coord;
              var partialMessage = [];
              
              if (messages[j].user === currentUid && messages[j].timestamp > minTime){
                messageExists = true;
                partialMessage = wrapText(messages[j].text, 150, 14);//(text, width, lineHeight)// x_temp+100, y_temp+15, 150, 14); //Maybe unneccessary to send x and y
                totalHeight += partialMessage.length;
                //console.log(partialMessage.length);
                messageList.push(partialMessage);//var wrappedText = wrapText(messages[j].text, x_temp+100, y_temp+15, 150, 14);

                //roundRect(x_temp+90, y_temp+3, 160, (wrappedText.length*14), 5);
                //ctx.fillText(messages[j].text, otherPlayers[currentUid].x_coord+100, otherPlayers[currentUid].y_coord+15+yOffset);
                //yOffset = yOffset+14;

              }
            }

            if (messageExists){
              //Draw messagebox:
              
              roundRect(x_temp+90, y_temp, 160, (totalHeight*14)+6, 5); //Draw messagebox-bg (x, y, width, hight, corner radius)
              ctx.fillStyle = '#000000';
              //Draw messages:
              var currentHeight = 0;
              //For every message
              for (k = 0; k < messageList.length; k++){ //length = #messages
                //For every row in message
                for (l = 0; l < messageList[k].length; l++){ //length = #rows
                  ctx.fillText(messageList[k][l],x_temp+100,y_temp+15+currentHeight);
                  currentHeight += 14;
                }
              }
            }
          }
        }

        function drawOthers(){
          var opLength = otherPlayersUids.length;
          var currentUid = "";

          for (i = 0; i < opLength; i++){
            currentUid = otherPlayersUids[i];

            var currentUidName = otherPlayers[currentUid].name;
            var yOffset = 0;
            //DRAW SPRITE
            ctx.drawImage(otherPlayers[currentUid].image, otherPlayers[currentUid].x_coord, otherPlayers[currentUid].y_coord, 120, 120);

            //DRAW NAMETAG
            ctx.font = 'italic 12pt Calibri';
            ctx.fillStyle = 'white';
            ctx.fillText(currentUidName, currentUid.x_coord-20,currentUid.y_coord);

            //DRAW MESSAGES
            // for (j=0; j < messages.length; j++){
            //   if (messages[j].user === currentUid){
            //     ctx.font = '12pt Calibri';
            //     ctx.fillStyle = 'white';
            //     
            //     yOffset = yOffset+14;

            //  }
            //}
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
            // var yOffset = 0;
            // for (i=0; i < messages.length; i++){
            //   if (messages[i].user === playerUser.uid){
            //     ctx.font = '12pt Calibri';
            //     ctx.fillStyle = 'white';
            //     ctx.fillText(messages[i].text, player.x+100, player.y+30+yOffset);
            //     yOffset = yOffset+14;

            //   }
            // }
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

        function moveOthers(){

            var amount = movespeed*delta/1000;
            var opLength = otherPlayersUids.length;
            var currentUid = "";
            var delta_x;
            var delta_y;
            var sum;

            for (i = 0; i < opLength; i++){

                currentUid = otherPlayersUids[i];

                delta_x = otherPlayers[currentUid].x_target-otherPlayers[currentUid].x_coord;
                delta_y = otherPlayers[currentUid].y_target-otherPlayers[currentUid].y_coord;

                if (Math.abs(delta_x)+Math.abs(delta_y)>3){

                  sum = Math.sqrt(Math.abs(Math.pow(delta_x,2)+Math.pow(delta_y,2)));
                  otherPlayers[currentUid].x_coord = otherPlayers[currentUid].x_coord+(amount*delta_x/sum);
                  otherPlayers[currentUid].y_coord = otherPlayers[currentUid].y_coord+(amount*delta_y/sum);

                }
            }
        }

        function movePlayer(){
            var amount = movespeed*delta/1000;
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