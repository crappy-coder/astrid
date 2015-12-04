var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	ctx.fillStyle = "#fff";
	ctx.fillRect(20, 10, 60, 10);
	
	var imgData1 = ctx.getImageData(10, 5, 1, 1);
	
	if(imgData1.data[0] != 0)
		throw new Error("Expected to find value 0 at index 0.");
		
	var imgData2 = ctx.getImageData(30, 15, 1, 1);
	
	if(imgData2.data[0] != 255)
		throw new Error("Expected to find value 255 at index 0.");
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