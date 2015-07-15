var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	var n = 0;
	var img = new Image();
	var pattern = null;
	
	img.addEventListener("load", function() {
		if(n == 0)
		{
			pattern = ctx.createPattern(img, "no-repeat");
			
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			ctx.fillStyle = "#00f";
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			
			img.src = "../../../resources/bwgrid.png";
			n++;
			return;
		}

		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	});
	img.src = "../../../resources/color-grid.png";
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