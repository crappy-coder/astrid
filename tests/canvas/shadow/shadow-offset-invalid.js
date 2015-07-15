var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 2;
	ctx.shadowOffsetX = Infinity;
	ctx.shadowOffsetY = Infinity;
	isEqual("shadowOffsetX", ctx.shadowOffsetX, 1);
	isEqual("shadowOffsetY", ctx.shadowOffsetY, 2);
	
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 2;
	ctx.shadowOffsetX = -Infinity;
	ctx.shadowOffsetY = -Infinity;
	isEqual("shadowOffsetX", ctx.shadowOffsetX, 1);
	isEqual("shadowOffsetY", ctx.shadowOffsetY, 2);
	
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 2;
	ctx.shadowOffsetX = NaN;
	ctx.shadowOffsetY = NaN;
	isEqual("shadowOffsetX", ctx.shadowOffsetX, 1);
	isEqual("shadowOffsetY", ctx.shadowOffsetY, 2);
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