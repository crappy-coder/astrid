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
		ctx.drawImage(img, 10.5, 10.5, 245.5, 245.5, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		drawImage(ctx, "a", img, -0.001, 0, 256, 256, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "b", img, 0, -0.001, 256, 256, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "c", img, 0, 0, 256.001, 256, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "d", img, 0, 0, 256, 256.001, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "e", img, 128, 0, 128.001, 256, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "f", img, 0, 0, -5, 5, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "g", img, 0, 0, 5, -5, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawImage(ctx, "h", img, 266, 266, -20, -20, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	});
	img.src = "../../resources/color-grid.png";
}

function drawImage(ctx, id, img, a, b, c, d, e, f, g, h) {
	var errorThrown = false;
	
	try
	{
		ctx.drawImage(img, a, b, c, d, e, f, g, h);
	}
	catch(e)
	{
		if(e.code != DOMException.INDEX_SIZE_ERR)
			console.log("Expected exception of type INDEX_SIZE_ERR for " + id + ", got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (INDEX_SIZE_ERR) to be thrown for " + id + ".");
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