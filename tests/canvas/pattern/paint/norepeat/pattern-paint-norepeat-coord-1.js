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
	ctx.fillRect(0, 0, 50, 50);
	
	ctx.fillStyle = "#f00";
	ctx.fillRect(50, 0, 50, 50);

	var img = new Image();
	img.addEventListener("load", function() {
		var pattern = ctx.createPattern(img, "no-repeat");
		
		ctx.fillStyle = pattern;
		ctx.translate(50, 0);
		ctx.fillRect(-50, 0, 100, 50);
	});
	img.src = "../../../../resources/color-grid.png";
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