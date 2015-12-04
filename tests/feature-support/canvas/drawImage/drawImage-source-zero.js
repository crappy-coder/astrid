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
	
	var img = new Image();
	img.addEventListener("load", function() {
		drawImage(ctx, img, 32, 10, 0, 1, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, img, 32, 10, 1, 0, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, img, 32, 10, 0, 0, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	});
	img.src = "../../resources/color-grid.png";
}

function drawImage(ctx, img, a, b, c, d, e, f, g, h) {
	var errorThrown = false;
	
	try
	{
		ctx.drawImage(img, a, b, c, d, e, f, g, h);
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