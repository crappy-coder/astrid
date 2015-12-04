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
	var w = imgData.width;
	var h = imgData.height;
	var d = imgData.data;
	
	imgData.width = 123;
	imgData.height = 123;
	imgData.data = [100,100,100,100];
	
	isEqual("width", imgData.width, w);
	isEqual("height", imgData.height, h);
	isEqual("data", imgData.data, d);
	isEqual("data[0]", imgData.data[0], 0);
	isEqual("data[1]", imgData.data[1], 0);
	isEqual("data[2]", imgData.data[2], 0);
	isEqual("data[3]", imgData.data[3], 0);
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