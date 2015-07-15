var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.shadowColor = "#0f0";
	ctx.shadowOffsetY = 20;
	ctx.shadowOffsetX = 20;
	
	
	ctx.fillStyle = "#fff";
	ctx.globalAlpha = 0.5;
	ctx.fillRect(10, 10, 260, 260);
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