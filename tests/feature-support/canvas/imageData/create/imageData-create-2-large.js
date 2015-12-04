var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	var imgData = ctx.createImageData(1920, 1080); // standard 1080 HD
	
	isEqual("length", imgData.width*imgData.height*4, imgData.data.length);
	isEqual("width greater than height", imgData.width > imgData.height, true);
	isEqual("width greater than zero", imgData.width > 0, true);
	
	var isOpaque = false;
	
	for(var i = 0; i < imgData.data.length; i+= 8100)
	{
		if(imgData.data[i] !== 0)
		{
			isOpaque = true;
			break;
		}
	}
	
	isEqual("transparent black", isOpaque, false);
}

function isEqual(what, actual, expected) {
	if(expected != actual)
		throw new Error("Values differ for '" + what + "', expected: " + expected + ", got: " + actual);
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