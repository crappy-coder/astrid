var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, 100, 50);
	
	var imgData = ctx.getImageData(0, 0, 100, 50);
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, 100, 50)
	ctx.putImageData(imgData, 0, 0, 0, 0, 0, 0);
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