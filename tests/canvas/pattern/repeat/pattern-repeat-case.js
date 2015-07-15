var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	var errorThrown = false;
	
	try
	{
		ctx.createPattern(gCanvas, "Repeat");
	}
	catch(e)
	{
		if(e.code != DOMException.SYNTAX_ERR)
			console.log("Expected exception of type SYNTAX_ERR, got: " + e.message);
	
		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected exception of type SYNTAX_ERR to be thrown.");
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