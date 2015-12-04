var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	var g = ctx.createLinearGradient(0, 0, 100, 50);

	setInvalidOffset(g, -1);
	setInvalidOffset(g,  2);
	setInvalidOffset(g, Infinity);
	setInvalidOffset(g, -Infinity);
	setInvalidOffset(g, NaN);
}

function setInvalidOffset(gradient, offset) {
	var errorThrown = false;
	
	try
	{
		gradient.addColorStop(offset, "#000");
	}
	catch(e)
	{	
		if(e.code != DOMException.INDEX_SIZE_ERR)
			console.log("Invalid exception thrown, expected INDEX_SIZE_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("No exception was thrown, an exception of INDEX_SIZE_ERR should have been for offset: " + offset);
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