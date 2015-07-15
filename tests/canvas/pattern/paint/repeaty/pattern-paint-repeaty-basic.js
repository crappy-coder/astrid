var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 50;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, 100, 50);
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(0, 0, 1, 50);

	var img = new Image();
	img.addEventListener("load", function() {
		var pattern = ctx.createPattern(img, "repeat-y");

		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	});
	img.src = "../../../../resources/green1x1.png";
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