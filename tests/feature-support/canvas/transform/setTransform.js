var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000000";

	draw(ctx);
});

function draw(ctx) {	

	// scale
	var scale = 1;
	var scaleFactor = -0.1;
	
	// translate
	var x = 25;
	var xFactor = 1;
	
	setInterval(function() {	
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// scale
		ctx.save();
		ctx.setTransform(scale, 0, 0, scale, 0, 0);
		ctx.fillRect(0, 0, 25, 25);
		
		scale += scaleFactor;

		if(scale <= 0 || scale >= 1)
			scaleFactor = -scaleFactor;
			
		// translate
		ctx.setTransform(1, 0, 0, 1, x, 0);
		ctx.fillRect(0, 0, 25, 25);
		ctx.restore();
		
		x += xFactor;

		if(x <= 25 || x >= 100)
			xFactor = -xFactor;
	}, 50);
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