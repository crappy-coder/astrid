var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.font = "50% serif";
	
	if(ctx.font != "72px serif")
		console.log("FAILED: Expected a value of '72px serif', got: " + ctx.font + ".");
	
	gCanvas.style = "font-size: 100px";
	
	if(ctx.font != "72px serif")
		console.log("FAILED: Expected a value of '72px serif', got: " + ctx.font + ".");	
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