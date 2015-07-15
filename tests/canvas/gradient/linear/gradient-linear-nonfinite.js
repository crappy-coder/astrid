var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {	
	createInvalidGradient(ctx, Infinity, 0, 1, 0);
	createInvalidGradient(ctx, -Infinity, 0, 1, 0);
	createInvalidGradient(ctx, NaN, 0, 1, 0);
	createInvalidGradient(ctx, 0, Infinity, 1, 0);
	createInvalidGradient(ctx, 0, -Infinity, 1, 0);
	createInvalidGradient(ctx, 0, NaN, 1, 0);
	createInvalidGradient(ctx, 0, 0, Infinity, 0);
	createInvalidGradient(ctx, 0, 0, -Infinity, 0);
	createInvalidGradient(ctx, 0, 0, NaN, 0);
	createInvalidGradient(ctx, 0, 0, 1, Infinity);
	createInvalidGradient(ctx, 0, 0, 1, -Infinity);
	createInvalidGradient(ctx, 0, 0, 1, NaN);
	createInvalidGradient(ctx, Infinity, Infinity, 1, 0);
	createInvalidGradient(ctx, Infinity, Infinity, Infinity, 0);
	createInvalidGradient(ctx, Infinity, Infinity, Infinity, Infinity);
	createInvalidGradient(ctx, Infinity, Infinity, 1, Infinity);
	createInvalidGradient(ctx, Infinity, 0, Infinity, 0);
	createInvalidGradient(ctx, Infinity, 0, Infinity, Infinity);
	createInvalidGradient(ctx, Infinity, 0, 1, Infinity);
	createInvalidGradient(ctx, 0, Infinity, Infinity, 0);
	createInvalidGradient(ctx, 0, Infinity, Infinity, Infinity);
	createInvalidGradient(ctx, 0, Infinity, 1, Infinity);
	createInvalidGradient(ctx, 0, 0, Infinity, Infinity);
}

function createInvalidGradient(ctx, a, b, c, d) {
	var errorThrown = false;
	
	try
	{
		ctx.createLinearGradient(a, b, c, d);
	}
	catch(e)
	{	
		if(e.code != DOMException.NOT_SUPPORTED_ERR)
			console.log("Invalid exception thrown, expected NOT_SUPPORTED_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("No exception was thrown, an exception of NOT_SUPPORTED_ERR should have been for values: (" + a + ", " + b + ", " + c + ", " + d + ")");
	}
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