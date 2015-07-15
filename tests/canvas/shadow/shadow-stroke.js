var CANVAS_WIDTH = 310;
var CANVAS_HEIGHT = 310;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.shadowColor = "#0f0";
	ctx.shadowOffsetY = 10;
	ctx.shadowOffsetX = 10;
	
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 10;
	
	// line caps
	ctx.lineCap = "butt";
	ctx.strokeStyle = "#fff";
	ctx.beginPath();
	ctx.moveTo(10, 10);
	ctx.lineTo(280, 10);
	ctx.stroke();
	
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(10, 40);
	ctx.lineTo(280, 40);
	ctx.stroke();
	
	ctx.lineCap = "square";
	ctx.beginPath();
	ctx.moveTo(10, 70);
	ctx.lineTo(280, 70);
	ctx.stroke();
	
	
	// line joins
	drawJoins(ctx, 80, 100, "miter");
	drawJoins(ctx, 80, 170, "round");
	drawJoins(ctx, 80, 240, "bevel");
}

function drawJoins(ctx, startX, startY, joinType) {
	var caps = ["butt", "round", "square"];
	var x = startX;
	var y = startY;
	
	ctx.lineJoin = joinType;
	
	for(var i = 0; i < caps.length; i++)
	{
		ctx.lineCap = caps[i];
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x - 60, y + 40);
		ctx.lineTo(x, y + 40);
		ctx.stroke();
		
		x += 100;
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
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}