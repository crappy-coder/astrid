var gHasEvent = false;

document.addEventListener("readystatechange", function() {
	gHasEvent = true;
});

window.addEventListener("load", function() {
	if(!gHasEvent)
		throw new Error("Expected a readystatechange event to fired at least once.");
	
	if(document.readyState != "complete")
		throw new Error("Expected document.readyState to be 'complete', got: " + document.readyState);
});