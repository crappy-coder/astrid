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
	
	setInterval(function() {
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		ctx.save();
		ctx.globalAlpha = alpha.toFixed(8);
		ctx.drawImage(gImage, 0, 0);
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
	
	gImage = new Image();
	gImage.src = navigator.appName == "mo-enjin" ? "resources/color-grid.png" : "../../resources/color-grid.png";
	gImage.addEventListener("error", function() { console.log("failed: image load error."); });
	gImage.addEventListener("load", function() {
		f(ctx);
	});
}