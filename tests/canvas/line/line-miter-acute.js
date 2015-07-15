var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 200;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	draw(ctx);
});

function draw(ctx) {
	ctx.lineWidth = 10;
	ctx.lineJoin = "miter";

	ctx.strokeStyle = "#0f0";
	ctx.miterLimit = 2.614;
	ctx.beginPath();
	ctx.moveTo(20, 200);
	ctx.lineTo(20, 20);
	ctx.lineTo(200, 200);
	ctx.stroke();

	ctx.strokeStyle = "#f00";
	ctx.miterLimit = 2.613;
	ctx.beginPath();
	ctx.moveTo(20, 200);
	ctx.lineTo(20, 20);
	ctx.lineTo(200, 200);
	ctx.stroke();
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