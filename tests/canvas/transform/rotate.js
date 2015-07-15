var CANVAS_WIDTH 	= 300;
var CANVAS_HEIGHT 	= 300;
var SPEED 			=  25; // ms

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000000";

	draw(ctx);
});

function draw(ctx) {
	var r = 0;
	var x = 25;
	var y = 25;
	var size = 20;
	
	setInterval(function() {
		ctx.clearRect(0, 0, 300, 300);
		
		ctx.save();
		ctx.translate(x + (size * 0.5), y + (size * 0.5));
		ctx.rotate(r % Math.PI);
		ctx.translate(-size * 0.5, -size * 0.5);
		ctx.fillRect(0, 0, size, size);
		ctx.restore();
		
		r += 0.1;
	}, SPEED);
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