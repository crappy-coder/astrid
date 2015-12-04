var CANVAS_WIDTH = 150;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, 100, 2);
	
	var imgData = ctx.getImageData(0, 0, 10, 10);
	
	if(imgData.data[0] != 0)
		throw new Error("Expected value of '0' at index '0'.");
		
	if(imgData.data[Math.floor(imgData.width/2*4)] != 0)
		throw new Error("Expected value of '0' at index '" + Math.floor(imgData.width/2*4) + "'.");
		
	if(imgData.data[(imgData.height/2)*imgData.width*4] != 255)
		throw new Error("Expected value of '255' at index '" + ((imgData.height/2)*imgData.width*4) + "'.");
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