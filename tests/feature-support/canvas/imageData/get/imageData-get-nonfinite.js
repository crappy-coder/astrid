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
	
	getImageData(ctx, "getImageData()", Infinity, 10, 10, 1);
	getImageData(ctx, "getImageData()", -Infinity, 10, 10, 10);
	getImageData(ctx, "getImageData()", NaN, 10, 10, 10);
	getImageData(ctx, "getImageData()", 10, Infinity, 10, 10);
	getImageData(ctx, "getImageData()", 10, -Infinity, 10, 10);
	getImageData(ctx, "getImageData()", 10, NaN, 10, 10);
	getImageData(ctx, "getImageData()", 10, 10, Infinity, 10);
	getImageData(ctx, "getImageData()", 10, 10, -Infinity, 10);
	getImageData(ctx, "getImageData()", 10, 10, NaN, 10);
	getImageData(ctx, "getImageData()", 10, 10, 10, Infinity);
	getImageData(ctx, "getImageData()", 10, 10, 10, -Infinity);
	getImageData(ctx, "getImageData()", 10, 10, 10, NaN);
	getImageData(ctx, "getImageData()", Infinity, Infinity, 10, 10);
	getImageData(ctx, "getImageData()", Infinity, Infinity, Infinity, 10);
	getImageData(ctx, "getImageData()", Infinity, Infinity, Infinity, Infinity);
	getImageData(ctx, "getImageData()", Infinity, Infinity, 10, Infinity);
	getImageData(ctx, "getImageData()", Infinity, 10, Infinity, 10);
	getImageData(ctx, "getImageData()", Infinity, 10, Infinity, Infinity);
	getImageData(ctx, "getImageData()", Infinity, 10, 10, Infinity);
	getImageData(ctx, "getImageData()", 10, Infinity, Infinity, 10);
	getImageData(ctx, "getImageData()", 10, Infinity, Infinity, Infinity);
	getImageData(ctx, "getImageData()", 10, Infinity, 10, Infinity);
	getImageData(ctx, "getImageData()", 10, 10, Infinity, Infinity);
}

function getImageData(ctx, id, a, b, c, d) {
	var errorThrown = false;
	
	try
	{
		ctx.getImageData(a, b, c, d);
	}
	catch(e)
	{
		if(e.code != DOMException.NOT_SUPPORTED_ERR)
			console.log("Expected exception of type NOT_SUPPORTED_ERR for " + id + ", got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (NOT_SUPPORTED_ERR) to be thrown for " + id + ".");
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