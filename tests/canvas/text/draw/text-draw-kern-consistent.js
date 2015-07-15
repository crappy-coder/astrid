var CANVAS_WIDTH = 200;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.font = "20px Arial, sans-serif";
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#0f0";
	ctx.fillStyle = "#f00";
	
	ctx.fillText("VAVAVAVAVAVAVA", 10, 20);
	ctx.fillText("ToToToToToToTo", 10, 40);
	
	ctx.strokeText("VAVAVAVAVAVAVA", 10, 20);
	ctx.strokeText("ToToToToToToTo", 10, 40);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#fff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}