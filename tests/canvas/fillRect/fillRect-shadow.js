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
	
	
	ctx.shadowColor = "#000";
	ctx.shadowOffsetX = 10;
	ctx.shadowOffsetY = 10;
	
	ctx.fillRect(10, 10, CANVAS_WIDTH-30, CANVAS_HEIGHT-30);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}