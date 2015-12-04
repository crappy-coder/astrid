var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	var g = ctx.createLinearGradient(0, 0, 100, 0);

	setInvalidColor(g, "");
	setInvalidColor(g,  "undefined");
}

function setInvalidColor(gradient, color) {
	var errorThrown = false;
	
	try
	{
		gradient.addColorStop(0, color);
	}
	catch(e)
	{	
		if(e.code != DOMException.SYNTAX_ERR)
			console.log("Invalid exception thrown, expected SYNTAX_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("No exception was thrown, an exception of SYNTAX_ERR should have been for color: " + color);
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