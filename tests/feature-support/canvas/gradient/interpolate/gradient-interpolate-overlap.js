var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {	
	var g = ctx.createLinearGradient(0, 0, 300, 0);
	
	g.addColorStop(0, "#f00");
	g.addColorStop(0, "#ff0");
	g.addColorStop(0.25, "#00f");
	g.addColorStop(0.25, "#0f0");
	g.addColorStop(0.25, "#0f0");
	g.addColorStop(0.25, "#0f0");
	g.addColorStop(0.25, "#ff0");
	g.addColorStop(0.5, "#00f");
	g.addColorStop(0.5, "#0f0");
	g.addColorStop(0.75, "#00f");
	g.addColorStop(0.75, "#f00");
	g.addColorStop(0.75, "#ff0");
	g.addColorStop(0.5, "#0f0");
	g.addColorStop(0.5, "#0f0");
	g.addColorStop(0.5, "#ff0");
	g.addColorStop(1, "#00f");
	
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 300, 300);
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