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
		ctx.drawImage(img, 32, 0, 32, 32, 0, 32, 32, -32);
		ctx.drawImage(img, 32, 0, 32, -32, 64, 32, -32, -32);
	});
	img.src = "../../resources/color-grid.png";
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