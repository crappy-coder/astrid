var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.shadowColor = "#fff";
	ctx.shadowOffsetY = 20;
	ctx.shadowOffsetX = 20;
	
	var canvas = document.createElement("canvas");
	canvas.width = 100;
	canvas.height = 100;
	var ctx2 = canvas.getContext("2d");
	ctx2.globalAlpha = 0.5;
	ctx2.fillStyle = "#0f0";
	ctx2.fillRect(0, 0, 100, 100);
	
	ctx.drawImage(canvas, 10, 10);
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