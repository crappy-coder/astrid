var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.shadowColor = "#fff";
	ctx.shadowOffsetY = 20;
	ctx.shadowOffsetX = 20;
	
	drawPattern(ctx, 10, 10);
}

function drawPattern(ctx, x, y) {
	var img = new Image();
	img.addEventListener("load", function() {
		var pattern = ctx.createPattern(img, "repeat");
		
		ctx.fillStyle = pattern;
		ctx.fillRect(x, y, 260, 260);
	});
	img.src = "../../resources/green1x1.png";
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}