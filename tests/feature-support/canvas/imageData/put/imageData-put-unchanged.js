var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	var i = 0;
	
	for (var y = 0; y < 16; ++y) 
	{
		for (var x = 0; x < 16; ++x, ++i) 
		{
			ctx.fillStyle = "rgba(" + i + "," + (Math.floor(i*1.5) % 256) + "," + (Math.floor(i*23.3) % 256) + "," + (i/256) + ")";
			ctx.fillRect(x, y, 1, 1);
		}
	}
	
	var imgData1 = ctx.getImageData(0.1, 0.2, 15.8, 15.9);
	var oldData = [];
	
	for (var i = 0; i < imgData1.data.length; ++i)
		oldData[i] = imgData1.data[i];

	ctx.putImageData(imgData1, 0.1, 0.2);

	var imgData2 = ctx.getImageData(0.1, 0.2, 15.8, 15.9);
	
	for (var i = 0; i < imgData2.data.length; ++i) 
	{
		if(oldData[i] != imgData2.data[i])
			throw new Error("Expected equal values, actual: " + oldData[i] + " != " + imgData2.data[i] + " at index " + i + ".");
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