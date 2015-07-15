var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

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
	
	var imgData1 = ctx.getImageData(85, 25, -10, -10);
	var imgData2 = ctx.getImageData(0, 0, -1, -1);
	
	for(var i = 0; i < 4; i++)
	{
		if(imgData1.data[i] != 255)
			throw new Error("Expected a value of '255' at index '" + i + " for 'A'.");
	}
	
	for(var i = 0; i < 4; i++)
	{
		if(imgData2.data[i] != 0)
			throw new Error("Expected a value of '0' at index '" + i + " for 'B'.");
	}
	
	if(imgData1.data[imgData1.data.length-4+0] != 0)
		throw new Error("Expected a value of '0' at index '0' for 'C'.");
		
	if(imgData1.data[imgData1.data.length-4+1] != 0)
		throw new Error("Expected a value of '0' at index '1' for 'C'.");
		
	if(imgData1.data[imgData1.data.length-4+2] != 0)
		throw new Error("Expected a value of '0' at index '2' for 'C'.");
		
	if(imgData1.data[imgData1.data.length-4+3] != 255)
		throw new Error("Expected a value of '255' at index '3' for 'C'.");
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