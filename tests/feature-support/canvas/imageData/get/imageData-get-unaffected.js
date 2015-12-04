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
	ctx.fillRect(0, 0, 128, 256);
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(128, 0, 128, 256);
	
	ctx.save();
	ctx.translate(50, 0);
	ctx.globalAlpha = 0.1;
	ctx.globalCompositeOperation = "destination-atop";
	ctx.shadowColor = "#f00";
	ctx.rect(0, 0, 5, 5);
	ctx.clip();
	
	var imgData = ctx.getImageData(0, 0, 128, 256);
	
	ctx.restore();
	
	ctx.putImageData(imgData, 128, 0);
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