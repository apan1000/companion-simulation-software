// Controller we use when we want to do something with the user's items
companionApp.controller('ItemsCtrl', function ($scope,Companion,$timeout) {

	$scope.items = [{name:'Rare candy',image:'rarecandy.png',id:'rare-candy'},
		{name:'Happy bell',image:'pokebell.png',id:'poke-bell'},
		{name:'Potion',image:'potion.png',id:'potion'}];
	/*$scope.reactionImage = "";*/

	var showReaction = function(){
  		$scope.reaction = true;
  		$scope.status = false;
  		$timeout(hideReaction, 3000);
	}

	var hideReaction = function(){
  		$scope.reaction = false;
	}

	$scope.onDropComplete = function(data,evt) {
		// console.log("drop success, data:", data);

		if ($scope.user.pokemon.isEgg === false) {
			// Add level if dropped item is Rare candy
			if (data.name === "Rare candy") {
				if ($scope.user.items[0]>0){
					$scope.reactionImage = "star.gif";
					showReaction();

					$scope.user.items[0] -= 1;
					$scope.user.pokemon.curExp = 0;
					$scope.user.pokemon.exp += Math.floor($scope.user.pokemon.exp*0.1)+1;
			        $scope.user.pokemon.lvl += 1;
			        $scope.user.pokemon.hp += Math.floor(Math.random()*10);
			        $scope.user.pokemon.curHp = $scope.user.pokemon.hp;
			        $scope.user.pokemon.attack += Math.floor(Math.random()*5)+1;
			        $scope.user.pokemon.defense += Math.floor(Math.random()*5)+1;

			        setMonsterAni("animated tada");
					Companion.setUser($scope.user);
		    	} 
			}

			// Add happiness if dropped items is Happy bell
			if (data.name === "Happy bell") {
				if ($scope.user.items[1]>0){
					$scope.reactionImage = "whistle.gif";
					showReaction();
					$scope.user.items[1] -= 1;
					$scope.user.pokemon.happiness += 20;
					$scope.user.pokemon.curHp += 10
					if ($scope.user.pokemon.curHp > $scope.user.pokemon.hp) {
						$scope.user.pokemon.curHp = $scope.user.pokemon.hp;
					}

					setMonsterAni("animated bounce");
					Companion.setUser($scope.user);
		        }	
			}

			// Add health if dropped item is Potion
			if (data.name === "Potion") {
				if ($scope.user.items[2]>0){
					$scope.reactionImage = "heartbubble.png";
					showReaction();
					$scope.user.items[2] -= 1;
					$scope.user.pokemon.curHp += 25+Math.floor($scope.user.pokemon.hp*0.10);
					if ($scope.user.pokemon.curHp > $scope.user.pokemon.hp) {
						$scope.user.pokemon.curHp = $scope.user.pokemon.hp;
					}

					setMonsterAni("animated bounce");
					Companion.setUser($scope.user);
		    	}
			}
		}
	}

	// Set $scope.monsterAni to specified animation string
	var setMonsterAni = function(animation) {
		$scope.monsterAni = animation;
		$timeout(function() {
			$scope.monsterAni = "";
		},1000);
	}

	$scope.$on('draggable:start', function() {
		setMonsterAni("animated shake");
	});

});

