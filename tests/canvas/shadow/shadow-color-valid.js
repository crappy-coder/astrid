var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.shadowColor = "lime";
	isEqual("shadowColor", ctx.shadowColor, "#00ff00");
	
	ctx.shadowColor = "RGBA(0,255, 0,0)";
	isEqual("shadowColor", ctx.shadowColor, "rgba(0, 255, 0, 0.0)");
}

function isEqual(what, actual, expected) {
	if(expected != actual)
		throw new Error("Values differ for '" + what + "', expected: " + expected + ", got: " + actual);
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