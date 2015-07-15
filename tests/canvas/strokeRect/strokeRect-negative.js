var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	var w = CANVAS_WIDTH-5;
	var h = CANVAS_HEIGHT-5;
	var hw = (CANVAS_WIDTH-10) * 0.5;
	var hh = (CANVAS_HEIGHT-10) * 0.5;

	ctx.lineWidth = 10;
	
	ctx.strokeStyle = "#0f0";
	ctx.strokeRect(5, 5, hw, hh);
	ctx.strokeRect(w, 5, -hw, hh);
	ctx.strokeRect(5, h, hw, -hh);
	ctx.strokeRect(w, h, -hw, -hh);
}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";
}