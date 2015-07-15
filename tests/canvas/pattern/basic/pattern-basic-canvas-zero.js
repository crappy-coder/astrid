var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {

	// ----------------------->
	gCanvas.width = 0;
	gCanvas.height = 10;
	
	validateSize(0, 10);
	createPattern(ctx);
	
	// ----------------------->
	gCanvas.width = 10;
	gCanvas.height = 0;
	
	validateSize(10, 0);
	createPattern(ctx);
	
	// ----------------------->
	gCanvas.width = 0;
	gCanvas.height = 0;
	
	validateSize(0, 0);
	createPattern(ctx);
	
}

function validateSize(w, h) {
	if(gCanvas.width != w)
		throw new Error("Canvas width is incorrect, expected: " + w + ", got: " + gCanvas.width);
		
	if(gCanvas.height != h)
		throw new Error("Canvas height is incorrect, expected: " + h + ", got: " + gCanvas.height);
}

function createPattern(ctx) {
	var errorThrown = false;
	
	try
	{
		ctx.createPattern(gCanvas, "repeat");
	}
	catch(e) 
	{
		if(e.code != DOMException.INVALID_STATE_ERR)
			console.log("Expected exception of type INVALID_STATE_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (INVALID_STATE_ERR) to be thrown.");
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