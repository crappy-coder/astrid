var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var imgData = { width: 1, height: 1, data: [255, 0, 0, 255] };
	
	putImageData(ctx, imgData);
	putImageData(ctx, "dummy");
	putImageData(ctx, 123);
}

function putImageData(ctx, imgData) {
	var errorThrown = false;
	
	try
	{
		ctx.putImageData(imgData, 0, 0);
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