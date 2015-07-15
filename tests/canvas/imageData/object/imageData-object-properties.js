var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var imgData = ctx.getImageData(0, 0, 10, 10);
	
	isEqual("width is number", typeof(imgData.width), "number");
	isEqual("height is number", typeof(imgData.height), "number");
	isEqual("data is object", typeof(imgData.data), "object");
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