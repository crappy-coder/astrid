var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	var c2 = document.createElement("canvas");
	c2.width = CANVAS_WIDTH;
	c2.height = CANVAS_HEIGHT;
	
	// fill second canvas with green
	var ctx2 = c2.getContext("2d");
	ctx2.fillStyle = "#0f0";
	ctx2.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	// create a pattern from green canvas
	var pattern = ctx.createPattern(c2, "no-repeat");

	// fill first canvas with green canvas then a solid red color
	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// fill the second canvas with solid red color
	ctx2.fillStyle = "#f00";
	ctx2.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


	// fill first canvas again with green canvas... should still be the green pattern...
	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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