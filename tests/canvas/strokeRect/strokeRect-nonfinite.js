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
	
	ctx.lineWidth = 100;
	ctx.strokeStyle = "#f00";
	ctx.strokeRect(Infinity, 0, 100, 50);
	ctx.strokeRect(-Infinity, 0, 100, 50);
	ctx.strokeRect(NaN, 0, 100, 50);
	ctx.strokeRect(0, Infinity, 100, 50);
	ctx.strokeRect(0, -Infinity, 100, 50);
	ctx.strokeRect(0, NaN, 100, 50);
	ctx.strokeRect(0, 0, Infinity, 50);
	ctx.strokeRect(0, 0, -Infinity, 50);
	ctx.strokeRect(0, 0, NaN, 50);
	ctx.strokeRect(0, 0, 100, Infinity);
	ctx.strokeRect(0, 0, 100, -Infinity);
	ctx.strokeRect(0, 0, 100, NaN);
	ctx.strokeRect(Infinity, Infinity, 100, 50);
	ctx.strokeRect(Infinity, Infinity, Infinity, 50);
	ctx.strokeRect(Infinity, Infinity, Infinity, Infinity);
	ctx.strokeRect(Infinity, Infinity, 100, Infinity);
	ctx.strokeRect(Infinity, 0, Infinity, 50);
	ctx.strokeRect(Infinity, 0, Infinity, Infinity);
	ctx.strokeRect(Infinity, 0, 100, Infinity);
	ctx.strokeRect(0, Infinity, Infinity, 50);
	ctx.strokeRect(0, Infinity, Infinity, Infinity);
	ctx.strokeRect(0, Infinity, 100, Infinity);
	ctx.strokeRect(0, 0, Infinity, Infinity);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}