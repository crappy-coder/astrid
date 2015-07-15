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

	var canvas = document.createElement("canvas");
	canvas.width = 0;
	canvas.height = 10;
	
	drawImage(ctx, "A", canvas);
	
	canvas.width = 10;
	canvas.height = 0;
	
	drawImage(ctx, "B", canvas);
	
	canvas.width = 0;
	canvas.height = 0;
	
	drawImage(ctx, "C", canvas);
}

function drawImage(ctx, id, img) {
	var errorThrown = false;
	
	try
	{
		ctx.drawImage(img, 0, 0);
	}
	catch(e)
	{
		if(e.code != DOMException.INVALID_STATE_ERR)
			console.log("Expected exception of type INVALID_STATE_ERR for " + id + ", got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (INVALID_STATE_ERR) to be thrown for " + id + ".");
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