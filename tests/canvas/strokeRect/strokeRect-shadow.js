var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.lineWidth = 10;	
	ctx.shadowColor = "#000";
	ctx.shadowOffsetX = 10;
	ctx.shadowOffsetY = 10;
	ctx.strokeStyle = "#0f0";
	ctx.strokeRect(5, 5, CANVAS_WIDTH-10, CANVAS_HEIGHT-10);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}