var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var gCanvas = null;
var gSuccess = true;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000000";

	draw(ctx);
});

function draw(ctx) {	
	ctx.globalAlpha = 0.5;
	
	var a = ctx.globalAlpha;
	
	// Infinity
	ctx.globalAlpha = Infinity;
	
	if(ctx.globalAlpha != a)
		fail(a, ctx.globalAlpha);
		
	// -Infinity
	ctx.globalAlpha = -Infinity;
	
	if(ctx.globalAlpha != a)
		fail(a, ctx.globalAlpha);
		
	// NaN
	ctx.globalAlpha = NaN;
	
	if(ctx.globalAlpha != a)
		fail(a, ctx.globalAlpha);
		
	if(gSuccess)
	{
		ctx.save();
		ctx.fillStyle = "#00FF00";
		ctx.fillRect(0, 0, 300, 300);
		ctx.restore();
		
		console.log("passed.");
	}
	else
	{
		ctx.save();
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(0, 0, 300, 300);
		ctx.restore();
	}
}

function fail(expected, actual) {
	console.log("failed. expected: " + expected + ", actual: " + actual);
	gSuccess = false;
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