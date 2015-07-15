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
	ctx.shadowOffsetX = 20;
	ctx.shadowOffsetY = 20;
	
	ctx.save();
	ctx.beginPath();
	ctx.rect(110, 30, 20, 100);
	ctx.rect(30, 110, 100, 20);
	ctx.clip();
	ctx.fillRect(10, 10, 100, 100);
	ctx.restore();
	
	ctx.save();
	ctx.beginPath();
	ctx.rect(160, 10, 110, 110);	
	ctx.clip();
	ctx.fillRect(160, 10, 100, 100);
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
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}