var CANVAS_WIDTH = 350;
var CANVAS_HEIGHT = 100;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	draw(ctx);
});

function draw(ctx) {
	ctx.strokeStyle = "#0f0";
	ctx.lineWidth = 10;
	
	// miter (default)
	ctx.lineJoin = "miter";
	ctx.beginPath();
	ctx.moveTo(100, 20);
	ctx.lineTo(20, 70);
	ctx.lineTo(100, 70);
	ctx.stroke();
	
	// round
	ctx.lineJoin = "round";
	ctx.beginPath();
	ctx.moveTo(200, 20);
	ctx.lineTo(120, 70);
	ctx.lineTo(200, 70);
	ctx.stroke();
	
	// bevel
	ctx.lineJoin = "bevel";
	ctx.beginPath();
	ctx.moveTo(300, 20);
	ctx.lineTo(220, 70);
	ctx.lineTo(300, 70);
	ctx.stroke();
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