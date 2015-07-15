var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;


window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.fillStyle = "rgba(79, 140, 203, 1)";
	ctx.fillRect(32, 32, 128, 128);
	
	ctx.globalCompositeOperation = "destination-atop";

	drawCanvas(ctx, 96, 96);
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

function drawCanvas(ctx, x, y) {
	var size = 128;
	var canvas = document.createElement("canvas");
	var ctxx = canvas.getContext("2d");
	canvas.width = size;
	canvas.height = size;
	
	ctxx.clearRect(0, 0, size, size);
	ctxx.fillStyle = "#ff8a00";
	ctxx.fillRect(0, 0, size, size);
	ctx.drawImage(canvas, x, y);
}