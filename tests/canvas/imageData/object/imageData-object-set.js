var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	var imgData = ctx.getImageData(0, 0, 10, 10);
	imgData[0] = 100;
	
	if(imgData[0] != 100)
		throw new Error("Expected a value of '100' after being set.");
		
	imgData[0] = 200;
		
	if(imgData[0] != 200)
		throw new Error("Expected a value of '200' after being set.");
}

function isEqual(what, actual, expected) {
	if(actual != expected)
		console.log("Expected '" + expected + "', actual: '" + actual + "' for '" + what + "'.");
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}