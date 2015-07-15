var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#08f";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var imgData1 = ctx.getImageData(-10, 5, 1, 1);
	var imgData2 = ctx.getImageData(10, -5, 1, 1);
	var imgData3 = ctx.getImageData(257, 5, 1, 1);
	var imgData4 = ctx.getImageData(10, 257, 1, 1);
	
	validate(imgData1, "A");
	validate(imgData2, "B");
	validate(imgData3, "C");
	validate(imgData4, "D");
}

function validate(imgData, id) {
	for(var i = 0; i < 4; i++)
	{
		if(imgData.data[i] != 0)
			throw new Error("Expected value of '0' at index '" + i + "' for '" + id + "'.");
	}
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