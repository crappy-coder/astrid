

window.addEventListener("load", function() {
	if(!document.documentElement)
		throw new Error("document.documentElement is null, expected a non-null value.");

	if(!(document.documentElement instanceof HTMLElement))
		throw new Error("Expected document.documentElement to be an instance of HTMLElement");
		
	if(!(document.documentElement instanceof Element))
		throw new Error("Expected document.documentElement to be an instance of Element");
		
	if(!(document.documentElement instanceof Node))
		throw new Error("Expected document.documentElement to be an instance of Node");
});