var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	setTextBaseline(ctx, "top");
	setTextBaseline(ctx, "hanging");
	setTextBaseline(ctx, "middle");
	setTextBaseline(ctx, "alphabetic");
	setTextBaseline(ctx, "ideographic");
	setTextBaseline(ctx, "bottom");
}

function setTextBaseline(ctx, value) {
	ctx.textBaseline = value;
	
	if(ctx.textBaseline != value)
		console.log("FAILED: Expected a value of '" + value + "', got: '" + ctx.textBaseline + "'.");
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