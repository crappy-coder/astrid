var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var gCanvas = null;


window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	ctx.fillStyle = "#4f8ccb";
	ctx.fillRect(32, 32, 128, 128);
	
	ctx.globalCompositeOperation = "source-in";
	
	ctx.fillStyle = "#ff8a00";
	drawCircle(ctx, 128, 128, 64, true);
	ctx.fill();
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

function drawEllipse(ctx, x, y, width, height, isCenter) {
	var radiusX = width * 0.5;
	var radiusY = height * 0.5;
	var centerX = x;
	var centerY = y;
	var kappa = 0.5522847498307933;

	if(!isCenter)
	{
		centerX += radiusX;
		centerY += radiusY;
	}

	ctx.beginPath();
	ctx.moveTo(centerX + radiusX, centerY);
	ctx.bezierCurveTo(centerX + radiusX, centerY - kappa * radiusY, centerX + kappa * radiusX, centerY - radiusY, centerX, centerY - radiusY);
	ctx.bezierCurveTo(centerX - kappa * radiusX, centerY - radiusY, centerX - radiusX, centerY - kappa * radiusY, centerX - radiusX, centerY);
	ctx.bezierCurveTo(centerX - radiusX, centerY + kappa * radiusY, centerX - kappa * radiusX, centerY + radiusY, centerX, centerY + radiusY);
	ctx.bezierCurveTo(centerX + kappa * radiusX, centerY + radiusY, centerX + radiusX, centerY + kappa * radiusY, centerX + radiusX, centerY);
	ctx.closePath();
}

function drawCircle(ctx, x, y, radius, isCenter) {
	drawEllipse(ctx, x, y, radius * 2, radius * 2, isCenter);
}