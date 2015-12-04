var CANVAS_WIDTH = 120;
var CANVAS_HEIGHT = 220;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	drawText(ctx, "A", 5, 30);
	drawText(ctx, "AA", 5, 65);
	drawText(ctx, "ABCD", 5, 100);
	drawText(ctx, "X", 5, 135);
	drawText(ctx, "XX", 5, 170);
	drawText(ctx, "XYZ", 5, 205);
}

function drawText(ctx, text, x, y) {
	ctx.font = "35px sans-serif";
	ctx.fillStyle = "#0f0";
	ctx.fillText(text, x, y);

	ctx.moveTo(x, y + 3);
	ctx.lineTo(ctx.measureText(text).width + x, y + 3);
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#f00";
	ctx.stroke();
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#fff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}