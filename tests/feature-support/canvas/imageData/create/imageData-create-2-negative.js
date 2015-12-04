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

	var imgData1 = ctx.createImageData(10, 20);
	var imgData2 = ctx.createImageData(-10, 20);
	var imgData3 = ctx.createImageData(10, -20);
	var imgData4 = ctx.createImageData(-10, -20);
	
	isEqual("createImageData( 10,  20).data.length  == createImageData(-10,  20).data.length", imgData1.data.length, imgData2.data.length);
	isEqual("createImageData(-10,  20).data.length  == createImageData( 10, -20).data.length", imgData2.data.length, imgData3.data.length);
	isEqual("createImageData( 10, -20).data.length  == createImageData(-10, -20).data.length", imgData3.data.length, imgData4.data.length);
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