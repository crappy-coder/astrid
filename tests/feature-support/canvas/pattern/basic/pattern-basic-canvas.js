var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	var canvasX = document.createElement("canvas");
	canvasX.width = CANVAS_WIDTH;
	canvasX.height = CANVAS_HEIGHT;
	
	var ctxX = canvasX.getContext("2d");
	ctxX.fillStyle = "#0f0";
	ctxX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var pattern = ctx.createPattern(canvasX, "no-repeat");

	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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