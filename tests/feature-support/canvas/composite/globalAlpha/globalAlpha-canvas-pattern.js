var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var EPSILON = Math.pow(2, -52);
var gCanvas = null;
var gImage = null;

window.addEventListener("load", function() {
	setup(draw);
});

function draw(ctx) {	
	var alpha = 1;
	var alphaFactor = -0.01;
	
	ctx.fillStyle = ctx.createPattern(gImage, "no-repeat");
	
	setInterval(function() {
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		ctx.save();
		ctx.globalAlpha = alpha.toFixed(8);
		ctx.fillRect(0, 0, gImage.width, gImage.height);
		ctx.restore();

		alpha += alphaFactor;
		
		if(alpha <= EPSILON || alpha >= 1)
			alphaFactor = -alphaFactor;
	}, 10);
}

function setup(f) {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	gImage = document.createElement("canvas");
	gImage.width = 100;
	gImage.height = 100;
	gImage.getContext("2d").fillRect(0, 0, 100, 100);
	
	f(ctx);
}