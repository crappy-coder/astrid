var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	createImageData(ctx, "A", 10, 0);
	createImageData(ctx, "B", 0, 10);
	createImageData(ctx, "C", 0, 0);
}

function createImageData(ctx, id, w, h) {
	var errorThrown = false;
	
	try
	{
		ctx.createImageData(w, h);
	}
	catch(e)
	{
		if(e.code != DOMException.INDEX_SIZE_ERR)
			console.log("Expected exception of type INDEX_SIZE_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (INDEX_SIZE_ERR) to be thrown.");
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