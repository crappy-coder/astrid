var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	if(!window.CanvasPattern)
		throw new Error("CanvasPattern does not exist.");
		
	window.CanvasPattern.prototype.thisIsImplemented = true;

	var img = new Image();
	img.addEventListener("load", function() {
		var pattern = ctx.createPattern(img, "no-repeat");

		if(!pattern.thisIsImplemented)
			throw new Error("CanvasPattern is not implemented.");
			
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	});
	img.src = "../../../resources/color-grid.png";
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