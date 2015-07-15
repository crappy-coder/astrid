var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000000";

	draw(ctx);
});

function draw(ctx) {	
	ctx.fillRect(0, 0, 5, 5);
	
	ctx.translate(7, 0);
	ctx.fillRect(0, 0, 5, 5);
	
	ctx.translate(7, 0);
	ctx.fillRect(0, 0, 5, 5);
	
	ctx.translate(-14, 7);
	ctx.fillRect(0, 0, 5, 5);
	
	ctx.translate(7, 0);
	ctx.fillRect(0, 0, 5, 5);
	
	ctx.translate(7, 0);
	ctx.fillRect(0, 0, 5, 5);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}