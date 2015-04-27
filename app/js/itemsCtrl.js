//https://www.kth.se/social/files/54e66df1f2765449f03b4804/DH2641-2015-DnD.pptx.pdf
companionApp.controller('ItemsCtrl', function ($scope,$routeParams,$firebaseObject,Companion, $rootScope) {
	
	var ref = new Firebase("https://companion-simulation.firebaseio.com");
	var userRef = new Firebase("https://companion-simulation.firebaseio.com/users/"+$rootScope.user.uid);

	$scope.items = [{name:'Rare Candy',image:'rarecandy.png',id:'rare-candy'},
		{name:'Poke bell',image:'pokebell.png',id:'poke-bell'},
		{name:'Potion',image:'potion.png',id:'potion'}];
	/*$scope.reactionImage = "";*/

	$scope.onDropComplete = function(data,evt) {
	  console.log("drop success, data:", data);

	  // Add level if dropped item is rare candy
	  	var reactionDiv = document.getElementById("reactionImg");

	  	var showReaction = function(){
      		reactionDiv.style.display = "";
      		setTimeout(hideReaction, 3000);  // 3 seconds
    	}

    	var hideReaction = function(){
      		reactionDiv.style.display = "none";
    	}

		if (data.name === "Rare Candy") {
			if ($scope.user.items.lvlup>0){
				showReaction();
				/*$scope.reactionImage = "levelup.png";*/
				$scope.user.items.lvlup -= 1;
				$scope.user.pokemon.curExp = 0;
				$scope.user.pokemon.exp += Math.floor($scope.user.pokemon.exp*0.1)+1;
		        $scope.user.pokemon.lvl += 1;
		        $scope.user.pokemon.hp += Math.floor(Math.random()*10);
		        $scope.user.pokemon.curHp = $scope.user.pokemon.hp;
		        $scope.user.pokemon.attack += Math.floor(Math.random()*5)+1;
		        $scope.user.pokemon.defense += Math.floor(Math.random()*5)+1;
		        console.log("LEVELED UP!");

		        $scope.monsterAni = "animated tada";
				Companion.setUser($scope.user);

		        var rarecandyImg = document.getElementById("rare-candy");
		        rarecandyImg.style.opacity = "0.5";
		        rarecandyImg.setAttribute('ng-drag', false);
	    	}
		}

		if (data.name === "Poke bell") {
			if ($scope.user.items.happy>0){
				showReaction();
				$scope.user.items.happy -= 1;
				$scope.reactionImage = "prettyspeech.png";
				$scope.user.pokemon.happiness += 20;
				$scope.monsterAni = "animated bounce";

				Companion.setUser($scope.user);
				
				var pokeBellImg = document.getElementById("poke-bell");
		        pokeBellImg.style.opacity = "0.5";
		        pokeBellImg.setAttribute('ng-drag', false); 
	        }	
		}

		if (data.name === "Potion") {
			if ($scope.user.items.heal>0){
				showReaction();
				$scope.user.items.heal -= 1;
				console.log("Current hp; ", $scope.user.pokemon.curHp);
				$scope.user.pokemon.curHp += 20;
				$scope.monsterAni = "animated bounce";
				if ($scope.user.pokemon.curHp > $scope.user.pokemon.hp) {
					$scope.user.pokemon.curHp = $scope.user.pokemon.hp;
				}
				Companion.setUser($scope.user);

				var potionImg = document.getElementById("potion");
		        potionImg.style.opacity = "0.5";
		        potionImg.setAttribute('ng-drag', false);
	    	}
		}
	}

	$scope.onDragSuccess = function(data,evt) {
	  	console.log("drag success, data:", data);

	  	if (data.name === "Rare Candy") {
			$scope.reactionImage = "levelup.png";
		}

		if (data.name === "Poke bell") {
			$scope.reactionImage = "prettyspeech.png";
		}
	}

	/*target.addEventListener("drop", function(event) {
			text = event.dataTransfer.getData("text");
		}, false);
		
	source.on("dragstart", function(event) {
		event.originalEvent.dataTransfer.setData("text", "some text");
		event.originalEvent.dataTransfer.effectAllowed = 'copy';
	}, false);

	
	target.addEventListener("drop", function(event) {
		text = event.dataTransfer.getData("text");
	}, false);
>>>>>>> d35f3f95c3b0ae8d244d7c2c0388641a29fd962d

	source.addEventListener("dragend", function(event) {
		if(event.dataTransfer.dropEffect != "none")
	}, false);

	source.on("dragstart", function(event) {
		event.originalEvent.dataTransfer.setData("text", "some text");
		event.originalEvent.dataTransfer.effectAllowed = 'copy';
	}, false);*/

});

