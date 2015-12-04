var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {		
	// begin a path
	ctx.moveTo(0, 0);
	ctx.lineTo(CANVAS_WIDTH, 0);
	
	// draw text (should not affect the current path)
	ctx.font = "35px Arial, sans-serif";
	ctx.fillStyle = "#f00";
	ctx.fillText("FAIL", 5, 35);
	
	// finish path
	ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx.lineTo(0, CANVAS_HEIGHT);
	ctx.fillStyle = "#0f0";
	ctx.fill();
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