var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	var imgData = ctx.createImageData(100, 50);
	
	for(var i = 0; i < imgData.data.length; i += 4)
	{
		imgData.data[i] = 0;
		imgData.data[i+1] = 255;
		imgData.data[i+2] = 0;
		imgData.data[i+3] = 255;
	}
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, 100, 50);
	ctx.putImageData(imgData, 0, 0);
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