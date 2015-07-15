var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "rgb(-100, -200, -300)";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.fillStyle = "rgb(256, 300, 400)";
	ctx.fillRect(20, 10, 60, 10);
	
	var imgData1 = ctx.getImageData(10, 5, 1, 1);
	var imgData2 = ctx.getImageData(30, 15, 1, 1);
	
	validate(imgData1.data, 0);
	validate(imgData2.data, 255);
}

function validate(data, value) {
	if(data[0] != value)
		throw new Error("Expected value of '" + value + "' at index '0'.");
		
	if(data[1] != value)
		throw new Error("Expected value of '" + value + "' at index '1'.");
		
	if(data[2] != value)
		throw new Error("Expected value of '" + value + "' at index '2'.");
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