var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	var canvas2 = document.createElement("canvas");
	canvas2.width = CANVAS_WIDTH;
	canvas2.height = CANVAS_HEIGHT;
	var ctx2 = canvas2.getContext("2d");
	ctx2.fillStyle = "#0f0";
	ctx2.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.drawImage(canvas2, 0, 0);
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