var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	this.drawImage(ctx, undefined);
	this.drawImage(ctx, 0);
	this.drawImage(ctx, "");
	this.drawImage(ctx, document.createElement("p"));
}

function drawImage(ctx, img) {
	var errorThrown = false;
	
	try
	{
		ctx.drawImage(img, 0, 0);
	}
	catch(e)
	{
		if(e.code != DOMException.TYPE_MISMATCH_ERR)
			console.log("Expected exception of type TYPE_MISMATCH_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (TYPE_MISMATCH_ERR) to be thrown.");
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