var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	var hw = CANVAS_WIDTH * 0.5;
	var hh = CANVAS_HEIGHT * 0.5;

	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, hw, hh);
	ctx.fillRect(CANVAS_WIDTH, 0, -hw, hh);
	ctx.fillRect(0, CANVAS_HEIGHT, hw, -hh);
	ctx.fillRect(CANVAS_WIDTH, CANVAS_HEIGHT, -hw, -hh);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}