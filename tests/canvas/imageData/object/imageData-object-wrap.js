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
	imgData.data[0] = 0;
	
	if(imgData.data[0] != 0)
		throw new Error("Expected a value of '0' after setting to 0, got '" + imgData.data[0] + "'.");
		
	imgData.data[0] = 300;
	
	if(imgData.data[0] != 44)
		throw new Error("Expected a value of '44' after setting to 300, got '" + imgData.data[0] + "'.");
		
	imgData.data[0] = -100;
	
	if(imgData.data[0] != 156)
		throw new Error("Expected a value of '156' after setting to -100, got '" + imgData.data[0] + "'.");
		
	imgData.data[0] = 200+Math.pow(2, 32);
	
	if(imgData.data[0] != 200)
		throw new Error("Expected a value of '200' after setting to 200+Math.pow(2, 32), got '" + imgData.data[0] + "'.");
		
	imgData.data[0] = -200+Math.pow(2, 32);
	
	if(imgData.data[0] != 56)
		throw new Error("Expected a value of '56' after setting to -200+Math.pow(2, 32), got '" + imgData.data[0] + "'.");
		
	imgData.data[0] = Infinity;
	
	if(imgData.data[0] != 0)
		throw new Error("Expected a value of '0' after setting to Infinity, got '" + imgData.data[0] + "'.");
		
	imgData.data[0] = -Infinity;
	
	if(imgData.data[0] != 0)
		throw new Error("Expected a value of '0' after setting to -Infinity, got '" + imgData.data[0] + "'.");
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