var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#48a";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var imgData = ctx.getImageData(0, 0, 10, 10);
	
	isEqual(imgData, 0, 0x44);
	isEqual(imgData, 1, 0x88);
	isEqual(imgData, 2, 0xCC);
	isEqual(imgData, 3, 255);
	isEqual(imgData, 4, 0x44);
	isEqual(imgData, 5, 0x88);
	isEqual(imgData, 6, 0xCC);
	isEqual(imgData, 7, 255);
}

function isEqual(imgData, index, value) {
	if(imgData.data[index] != value)
		throw new Error("Expected value of '0x" + value.toString(16).toUpperCase() + "' at index '" + index + "'.");
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