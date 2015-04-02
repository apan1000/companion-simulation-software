//https://www.kth.se/social/files/54e66df1f2765449f03b4804/DH2641-2015-DnD.pptx.pdf
companionApp.controller('ItemsCtrl', function ($scope,$routeParams,$firebaseObject,Companion) {
	//vilka parametrar? vad använder man som source och target?
		
		/* target.addEventListener("drop", function(event) {
				text = event.dataTransfer.getData("text");
			}, false);
=======
		
	source.on("dragstart", function(event) {
		event.originalEvent.dataTransfer.setData("text", "some text");
		event.originalEvent.dataTransfer.effectAllowed = 'copy';
	}, false);

	
	/* target.addEventListener("drop", function(event) {
			text = event.dataTransfer.getData("text");
		}, false);
>>>>>>> d35f3f95c3b0ae8d244d7c2c0388641a29fd962d

	source.addEventListener("dragend", function(event) {
			if(event.dataTransfer.dropEffect != "none")
		}, false); */
	
		/* source.on("dragstart", function(event) {
			event.originalEvent.dataTransfer.setData("text", "some text");
			event.originalEvent.dataTransfer.effectAllowed = 'copy';
		}, false); */

});

