var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000000";

	draw(ctx);
});

function draw(ctx) {
	// fill a 2x2 rect and scale up 20 times, result: 40x40
	ctx.save();
	ctx.scale(20, 20);
	ctx.fillRect(0, 0, 2, 2);
	ctx.restore();
	
	// fill a 40x40 rect, no scale
	ctx.fillRect(0, 42, 40, 40);
	
	// fill a 40x40 rect, flipped in the Y direction
	ctx.save();
	ctx.fillStyle = "#ff0000";
	ctx.scale(1, -1);
	ctx.fillRect(0, -124, 40, 40);
	ctx.restore();
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