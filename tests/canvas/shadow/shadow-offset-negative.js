var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.fillStyle = "#fff";
	ctx.shadowColor = "#0f0";
	ctx.shadowOffsetY = 0;
	ctx.shadowOffsetX = -30;
	ctx.fillRect(40, 10, 50, 50);
	
	ctx.shadowColor = "#0f0";
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = -30;
	ctx.fillRect(10, 100, 80, 50);
	
	ctx.shadowColor = "#0f0";
	ctx.shadowOffsetX = -10;
	ctx.shadowOffsetY = -10;
	ctx.fillRect(20, 170, 80, 50);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}