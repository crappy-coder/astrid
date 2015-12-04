var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	setTextAlign(ctx, "bogus");
	setTextAlign(ctx, "END");
	setTextAlign(ctx, "end ");
	setTextAlign(ctx, "end\0");
}

function setTextAlign(ctx, value) {
	ctx.textAlign = "start";
	ctx.textAlign = value;
	
	if(ctx.textAlign != "start")
		console.log("FAILED: Expected a value of 'start', got: '" + ctx.textAlign + "'.");
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