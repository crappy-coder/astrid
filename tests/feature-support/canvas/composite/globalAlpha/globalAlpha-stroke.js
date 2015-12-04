var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var EPSILON = Math.pow(2, -52);
var gCanvas = null;


window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.strokeStyle = "#0000ff";
	
	draw(ctx);
});

function draw(ctx) {	
	var alpha = 1;
	var alphaFactor = -0.1;
	
	setInterval(function() {
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.strokeRect(1, 1, 100, 100);
		ctx.restore();

		alpha += alphaFactor;
		
		if(alpha <= EPSILON || alpha >= 1)
			alphaFactor = -alphaFactor;
	}, 100);
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