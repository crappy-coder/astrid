

window.addEventListener("load", function() {
	HTMLCanvasElement.prototype.isImplemented = true;
	HTMLImageElement.prototype.isImplemented = true;
	HTMLAudioElement.prototype.isImplemented = true;
	HTMLVideoElement.prototype.isImplemented = true;
	
	createEl("canvas");
	createEl("img");
	createEl("audio");
	createEl("video");
});

function createEl(name) {
	var e = document.createElement(name);
	
	if(e == null)
		throw new Error("Expected a non-null value for '" + name + "'");
		
	if(!e.isImplemented)
		throw new Error("Element is not implemented.");
		
	if(e.tagName.toLowerCase() != name.toLowerCase())
		throw new Error("Expected tagName to match, got: '" + e.tagName + "' != '" + name + "'");
		
}