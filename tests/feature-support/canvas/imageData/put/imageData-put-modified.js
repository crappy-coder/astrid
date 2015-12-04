var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, 100, 50);
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(45, 20, 10, 10);
	
	var imgData = ctx.getImageData(45, 20, 10, 10);
	
	for(var i = 0, len = imgData.width*imgData.height*4; i < len; i += 4)
	{
		imgData.data[i] = 0;
		imgData.data[i+1] = 255;
	}
	
	ctx.putImageData(imgData, 45, 20);
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