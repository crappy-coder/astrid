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
	
	ctx.beginPath();
	ctx.rect(0, 0, 16, 16);
	ctx.clip();
	
	ctx.lineWidth = 50;
	ctx.strokeStyle = "#f00";
	ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, 16, 16);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}