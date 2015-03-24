//https://www.kth.se/social/files/54e66df1f2765449f03b4804/DH2641-2015-DnD.pptx.pdf

companionApp.controller('ItemsCtrl', function ($scope,$routeParams,$firebaseObject,Companion) {
	//vilka parametrar? vad använder man som source och target?
		
		source.on("dragstart", function(event) {
			event.originalEvent.dataTransfer.setData("text", "some text");
			event.originalEvent.dataTransfer.effectAllowed = 'copy';
		}, false);

		
		/* target.addEventListener("drop", function(event) {
				text = event.dataTransfer.getData("text");
			}, false);

		source.addEventListener("dragend", function(event) {
				if(event.dataTransfer.dropEffect != "none")
			}, false); */
	
}