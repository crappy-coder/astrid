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
	imgData.data[0] = 100;
	imgData.data[0] = NaN;
	
	if(imgData.data[0] != 0)
		throw new Error("Expected a value of '0' after setting to NaN.");
		
	imgData.data[0] = 100;
	imgData.data[0] = "dummy";
	
	if(imgData.data[0] != 0)
		throw new Error("Expected a value of '0' after setting to dummy.");
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