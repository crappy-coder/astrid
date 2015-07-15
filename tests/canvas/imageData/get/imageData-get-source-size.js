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
	
	var imgData1 = ctx.getImageData(0, 0, 10, 10);
	var imgData2 = ctx.getImageData(0, 0, 20, 20);
	
	if(!(imgData2.width > imgData1.width))
		throw new Error("Expected width to be greater.");
		
	if(!(imgData2.height > imgData1.height))
		throw new Error("Expected height to be greater.");
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