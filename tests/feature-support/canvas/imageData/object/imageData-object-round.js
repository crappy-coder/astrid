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

	validate(imgData, 0.499, 0);
	validate(imgData, 0.5, 0);
	validate(imgData, 0.501, 0);
	validate(imgData, 1.499, 1);
	validate(imgData, 1.5, 1);
	validate(imgData, 1.501, 1);
	validate(imgData, 2.5, 2);
	validate(imgData, 3.5, 3);
	validate(imgData, 252.5, 252);
	validate(imgData, 253.5, 253);
	validate(imgData, 254.5, 254);
	validate(imgData, 256.5, 0);
	validate(imgData, -0.5, 0);
	validate(imgData, -1.5, 255);
}

function validate(imgData, value, expected) {
	imgData.data[0] = value;
	
	if(imgData.data[0] != expected)
		throw new Error("Expected a value of '" + expected + "' after setting to " + value + ", got '" + imgData.data[0] + "'.");
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