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
	
	if(window.ImageData == undefined)
		throw new Error("Expected to find an ImageData type.");
		
	if(window.Uint8ClampedArray == undefined)
		throw new Error("Expected to find an Uint8ClampedArray type.");
		
	window.ImageData.prototype.isImplemented = true;
	window.Uint8ClampedArray.prototype.isImplemented = true;
	
	var imgData = ctx.getImageData(0, 0, 1, 1);
	
	if(!imgData.isImplemented)
		throw new Error("ImageData not implemented.");
		
	if(!imgData.data.isImplemented)
		throw new Error("Uint8ClampedArray not implemented.");
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