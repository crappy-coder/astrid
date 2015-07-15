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
	
	var imgData = ctx.getImageData(0, 0, 10, 10);
	
	putImageData(ctx, imgData, Infinity, 10);
	putImageData(ctx, imgData, -Infinity, 10);
	putImageData(ctx, imgData, NaN, 10);
	putImageData(ctx, imgData, 10, Infinity);
	putImageData(ctx, imgData, 10, -Infinity);
	putImageData(ctx, imgData, 10, NaN);
	putImageData(ctx, imgData, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, 10, 10, 10, 10, 10);
	putImageData(ctx, imgData, -Infinity, 10, 10, 10, 10, 10);
	putImageData(ctx, imgData, NaN, 10, 10, 10, 10, 10);
	putImageData(ctx, imgData, 10, Infinity, 10, 10, 10, 10);
	putImageData(ctx, imgData, 10, -Infinity, 10, 10, 10, 10);
	putImageData(ctx, imgData, 10, NaN, 10, 10, 10, 10);
	putImageData(ctx, imgData, 10, 10, Infinity, 10, 10, 10);
	putImageData(ctx, imgData, 10, 10, -Infinity, 10, 10, 10);
	putImageData(ctx, imgData, 10, 10, NaN, 10, 10, 10);
	putImageData(ctx, imgData, 10, 10, 10, Infinity, 10, 10);
	putImageData(ctx, imgData, 10, 10, 10, -Infinity, 10, 10);
	putImageData(ctx, imgData, 10, 10, 10, NaN, 10, 10);
	putImageData(ctx, imgData, 10, 10, 10, 10, Infinity, 10);
	putImageData(ctx, imgData, 10, 10, 10, 10, -Infinity, 10);
	putImageData(ctx, imgData, 10, 10, 10, 10, NaN, 10);
	putImageData(ctx, imgData, 10, 10, 10, 10, 10, Infinity);
	putImageData(ctx, imgData, 10, 10, 10, 10, 10, -Infinity);
	putImageData(ctx, imgData, 10, 10, 10, 10, 10, NaN);
	putImageData(ctx, imgData, Infinity, Infinity, 10, 10, 10, 10);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, 10, 10, 10);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, Infinity, 10, 10);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, Infinity, Infinity, 10);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, Infinity, 10, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, 10, Infinity, 10);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, 10, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, Infinity, 10, 10, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, 10, Infinity, 10, 10);
	putImageData(ctx, imgData, Infinity, Infinity, 10, Infinity, Infinity, 10);
	putImageData(ctx, imgData, Infinity, Infinity, 10, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, 10, Infinity, 10, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, 10, 10, Infinity, 10);
	putImageData(ctx, imgData, Infinity, Infinity, 10, 10, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, Infinity, 10, 10, 10, Infinity);
	putImageData(ctx, imgData, Infinity, 10, Infinity, 10, 10, 10);
	putImageData(ctx, imgData, Infinity, 10, Infinity, Infinity, 10, 10);
	putImageData(ctx, imgData, Infinity, 10, Infinity, Infinity, Infinity, 10);
	putImageData(ctx, imgData, Infinity, 10, Infinity, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, 10, Infinity, Infinity, 10, Infinity);
	putImageData(ctx, imgData, Infinity, 10, Infinity, 10, Infinity, 10);
	putImageData(ctx, imgData, Infinity, 10, Infinity, 10, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, 10, Infinity, 10, 10, Infinity);
	putImageData(ctx, imgData, Infinity, 10, 10, Infinity, 10, 10);
	putImageData(ctx, imgData, Infinity, 10, 10, Infinity, Infinity, 10);
	putImageData(ctx, imgData, Infinity, 10, 10, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, 10, 10, Infinity, 10, Infinity);
	putImageData(ctx, imgData, Infinity, 10, 10, 10, Infinity, 10);
	putImageData(ctx, imgData, Infinity, 10, 10, 10, Infinity, Infinity);
	putImageData(ctx, imgData, Infinity, 10, 10, 10, 10, Infinity);
	putImageData(ctx, imgData, 10, Infinity, Infinity, 10, 10, 10);
	putImageData(ctx, imgData, 10, Infinity, Infinity, Infinity, 10, 10);
	putImageData(ctx, imgData, 10, Infinity, Infinity, Infinity, Infinity, 10);
	putImageData(ctx, imgData, 10, Infinity, Infinity, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, 10, Infinity, Infinity, Infinity, 10, Infinity);
	putImageData(ctx, imgData, 10, Infinity, Infinity, 10, Infinity, 10);
	putImageData(ctx, imgData, 10, Infinity, Infinity, 10, Infinity, Infinity);
	putImageData(ctx, imgData, 10, Infinity, Infinity, 10, 10, Infinity);
	putImageData(ctx, imgData, 10, Infinity, 10, Infinity, 10, 10);
	putImageData(ctx, imgData, 10, Infinity, 10, Infinity, Infinity, 10);
	putImageData(ctx, imgData, 10, Infinity, 10, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, 10, Infinity, 10, Infinity, 10, Infinity);
	putImageData(ctx, imgData, 10, Infinity, 10, 10, Infinity, 10);
	putImageData(ctx, imgData, 10, Infinity, 10, 10, Infinity, Infinity);
	putImageData(ctx, imgData, 10, Infinity, 10, 10, 10, Infinity);
	putImageData(ctx, imgData, 10, 10, Infinity, Infinity, 10, 10);
	putImageData(ctx, imgData, 10, 10, Infinity, Infinity, Infinity, 10);
	putImageData(ctx, imgData, 10, 10, Infinity, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, 10, 10, Infinity, Infinity, 10, Infinity);
	putImageData(ctx, imgData, 10, 10, Infinity, 10, Infinity, 10);
	putImageData(ctx, imgData, 10, 10, Infinity, 10, Infinity, Infinity);
	putImageData(ctx, imgData, 10, 10, Infinity, 10, 10, Infinity);
	putImageData(ctx, imgData, 10, 10, 10, Infinity, Infinity, 10);
	putImageData(ctx, imgData, 10, 10, 10, Infinity, Infinity, Infinity);
	putImageData(ctx, imgData, 10, 10, 10, Infinity, 10, Infinity);
	putImageData(ctx, imgData, 10, 10, 10, 10, Infinity, Infinity);
}

function putImageData(ctx, imgData, a, b, c, d, e, f) {
	var errorThrown = false;
	
	try
	{
		if(c == undefined)
			ctx.putImageData(imgData, a, b);
		else
			ctx.putImageData(imgData, a, b, c, d, e, f);
		
	}
	catch(e)
	{
		if(e.code != DOMException.NOT_SUPPORTED_ERR)
			console.log("Expected exception of type NOT_SUPPORTED_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (NOT_SUPPORTED_ERR) to be thrown.");
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