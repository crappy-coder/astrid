var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;


window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.fillStyle = "rgba(79, 140, 203, 1)";
	ctx.fillRect(32, 32, 128, 128);
	
	ctx.globalCompositeOperation = "source-in";
	
	drawImage(ctx, 64, 64);
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

function drawImage(ctx, x, y) {
	var img = new Image();
	img.addEventListener("load", function() {
		ctx.drawImage(img, x, y);
	});
	img.src = "../../../resources/alpha-gradient.png";
}