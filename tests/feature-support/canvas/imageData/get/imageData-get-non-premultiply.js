var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var imgData = ctx.getImageData(10, 10, 10, 10);
	
	validate(0, imgData.data[0] > 200);
	validate(1, imgData.data[1] > 200);
	validate(2, imgData.data[2] > 200);
	validate(3, imgData.data[3] > 100);
	validate(3, imgData.data[3] < 200);
}

function validate(idx, result) {
	if(!result)
		throw new Error("Unexpected value found at: " + idx + ".");
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