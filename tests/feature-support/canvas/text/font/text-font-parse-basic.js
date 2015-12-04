var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.font = "20px serif";
	
	if(ctx.font != "20px serif")
		throw new Error("Expected a valud of '20px serif', got: " + ctx.font + ".");
		
	ctx.font = "20PX   SERIF";
	
	if(ctx.font != "20px serif")
		throw new Error("Expected a valud of '20px serif', got: " + ctx.font + ".");
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