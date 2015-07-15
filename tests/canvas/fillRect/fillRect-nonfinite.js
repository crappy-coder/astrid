var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(Infinity, 0, 100, 50);
	ctx.fillRect(-Infinity, 0, 100, 50);
	ctx.fillRect(NaN, 0, 100, 50);
	ctx.fillRect(0, Infinity, 100, 50);
	ctx.fillRect(0, -Infinity, 100, 50);
	ctx.fillRect(0, NaN, 100, 50);
	ctx.fillRect(0, 0, Infinity, 50);
	ctx.fillRect(0, 0, -Infinity, 50);
	ctx.fillRect(0, 0, NaN, 50);
	ctx.fillRect(0, 0, 100, Infinity);
	ctx.fillRect(0, 0, 100, -Infinity);
	ctx.fillRect(0, 0, 100, NaN);
	ctx.fillRect(Infinity, Infinity, 100, 50);
	ctx.fillRect(Infinity, Infinity, Infinity, 50);
	ctx.fillRect(Infinity, Infinity, Infinity, Infinity);
	ctx.fillRect(Infinity, Infinity, 100, Infinity);
	ctx.fillRect(Infinity, 0, Infinity, 50);
	ctx.fillRect(Infinity, 0, Infinity, Infinity);
	ctx.fillRect(Infinity, 0, 100, Infinity);
	ctx.fillRect(0, Infinity, Infinity, 50);
	ctx.fillRect(0, Infinity, Infinity, Infinity);
	ctx.fillRect(0, Infinity, 100, Infinity);
	ctx.fillRect(0, 0, Infinity, Infinity);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}