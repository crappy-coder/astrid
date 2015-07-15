

window.addEventListener("load", function() {
	if(!document.body)
		throw new Error("document.body is null, expected a non-null value.");

	if(!(document.body instanceof HTMLElement))
		throw new Error("Expected document.body to be an instance of HTMLElement");
		
	if(!(document.body instanceof Element))
		throw new Error("Expected document.body to be an instance of Element");
		
	if(!(document.body instanceof Node))
		throw new Error("Expected document.body to be an instance of Node");
});