import System from "./System";
import Application from "./Application";

class FPSClock {
	constructor() {
		this.currentTime = 0;
		this.elapsedTime = 0;
		this.totalTime = 0;
		this.lastTime = 0;
		this.bestTime = 0;
		this.worstTime = 0;
		this.frameTime = 0;
		this.frameCount = 0;
		this.suspendStartTime = 0;
		this.suspendElapsedTime = 0;
		this.suspendCount = 0;
		this.lastFPS = 0;
		this.avgFPS = 0;
		this.bestFPS = 0;
		this.worstFPS = 0;
		
		this.reset();
	}

	getElapsedTime() {
		return this.elapsedTime;
	}
	
	getTotalTime() {
		return this.totalTime;
	}
	
	getBestTime() {
		return this.bestTime;
	}
	
	getWorstTime() {
		return this.worstTime;
	}
	
	getAverageFPS() {
		return this.avgFPS;
	}
	
	getBestFPS() {
		return this.bestFPS;
	}
	
	getWorstFPS() {
		return this.worstFPS;
	}
	
	reset() {
		this.lastTime = System.getTimer();
		this.totalTime = 0;
		this.elapsedTime = 0;
		this.currentTime = this.lastTime;
		this.frameTime = this.lastTime;
		this.frameCount = 0;
		this.avgFPS = 0;
		this.bestFPS = 0;
		this.lastFPS = 0;
		this.worstFPS = 9999.0;
		this.bestTime = 999999;
		this.worstTime = 0;
		this.suspendCount = 0;
		this.suspendElapsedTime = 0;
		this.suspendStartTime = 0;
	}
	
	resume() {
		if(--this.suspendCount <= 0)
		{
			var ts = System.getTimer();
			
			this.suspendCount = 0;
			this.suspendElapsedTime += ts - this.suspendStartTime;
			this.suspendStartTime = 0;
		}
	}
	
	suspend() {
		this.suspendCount++;
		
		if(this.suspendCount == 1)
			this.suspendStartTime = System.getTimer();
	}
	
	update() {
		var ts = System.getTimer();
		
		this.frameCount++;
		this.lastTime = this.lastTime + this.suspendElapsedTime;
		this.elapsedTime = ts - this.lastTime;
		this.lastTime = ts;
		this.suspendElapsedTime = 0;
		
		this.bestTime = Math.min(this.bestTime, this.elapsedTime);
		this.worstTime = Math.max(this.worstTime, this.elapsedTime);
		
		if((ts - this.frameTime) > 1000)
		{
			var count = this.frameCount;
			var deltaTime = (ts - this.frameTime);
			
			this.lastFPS = count / deltaTime * 1000;
			
			if(this.avgFPS == 0)
				this.avgFPS = this.lastFPS;
			else
				this.avgFPS = (this.avgFPS + this.lastFPS) * 0.5;
			
			this.bestFPS = Math.max(this.bestFPS, this.lastFPS);
			this.worstFPS = Math.min(this.worstFPS, this.lastFPS);
			
			this.frameTime = ts;
			this.frameCount = 0;
		}

		this.totalTime += this.elapsedTime;
	}
}

class FPSGraph {
	constructor() {
		this.width = 175;
		this.height = 60;
		this.averages = [];
		
		for(var i = 0; i < 100; i++)
			this.averages.push(0);
	}
	
	render(gfx, x, y) {
		var app = Application.getInstance();
		var clock = app.fpsClock;
		var graphX = 0.5;
		var graphY = 0.5;
		var graphWidth = this.width-1;
		var graphHeight = (this.height-30)-1;
		var maxBarHeight = graphHeight - 10;
		
		gfx.save();
		gfx.translate(x, y);
		gfx.beginPath();
		gfx.rect(0, 0, this.width, this.height);
		gfx.clip();
		
		// render the background and border
		gfx.fillStyle = "rgba(255,255,255,0.5)";
		gfx.strokeStyle = "white";
		gfx.beginPath();
		gfx.rect(graphX, graphY, graphWidth, graphHeight);
		gfx.stroke();
		gfx.fill();
		
		// draw graph markers
		gfx.lineWidth = 1;
		gfx.strokeStyle = "rgba(0,0,0,0.5)";
		gfx.beginPath();
		gfx.moveTo(1.5, 10.5);
		gfx.lineTo(graphWidth, 10.5);
		gfx.moveTo(1.5, (0.5 * (graphHeight+10)));
		gfx.lineTo(graphWidth, (0.5 * (graphHeight+10)));
		gfx.stroke();
		
		// remove the first element so we can
		// shift everything over by 1
		if(this.averages.length == 100)
			this.averages.shift();
		
		x = 0;
		y = 0;
		
		// draw the fps graph
		gfx.beginPath();

		for(var i = 0; i < this.averages.length; ++i)
		{
			var avg = this.averages[i];
			x = (i * (graphWidth / 100)) + 1.5;
			y = astrid.math.round(Math.min(1.0, avg / 60.0) * maxBarHeight) + 0.5;

			gfx.lineTo(x, (maxBarHeight - y) + 10);
		}
		
		
		gfx.lineTo(graphWidth, (maxBarHeight - y) + 10);
		gfx.lineTo(graphWidth, graphHeight);
		gfx.lineTo(1.5, graphHeight);
		gfx.closePath();

		// the graph should be rendered a red color if it's below
		// 30fps, otherwise render it green
		if(clock.getAverageFPS() < 30)
			gfx.fillStyle = "rgba(255, 0, 0, 0.5)";
		else
			gfx.fillStyle = "rgba(0, 255, 0, 0.5)";
			
		gfx.fill();
		
		// draw the fps labels
		gfx.font = "10px courier";
		
		var avgStr = "FPS: " + astrid.math.toPrecision(clock.getAverageFPS(), 0) + ",";
		var avgWidth = gfx.measureText(avgStr).width;
		var bestStr = "Max: " + astrid.math.toPrecision(clock.getBestFPS(), 0) + ",";
		var bestWidth = gfx.measureText(bestStr).width;
		var worstStr = "Min: " + astrid.math.toPrecision(clock.getWorstFPS(), 0);
		var textX = 0;
		var textY = graphHeight + 12;
		
		gfx.fillStyle = "white";
		gfx.fillText(avgStr, textX, textY);
		
		textX += avgWidth + 6;
		gfx.fillText(bestStr, textX, textY);
		
		textX += bestWidth + 6;
		gfx.fillText(worstStr, textX, textY);
		
		// draw the time labels
		var timeElapsedStr = "Time: " + astrid.math.toPrecision(clock.getElapsedTime(), 0) + ",";
		var timeElapsedWidth = gfx.measureText(timeElapsedStr).width;
		var timeWorstStr = "Max: " + astrid.math.toPrecision(clock.getWorstTime(), 0) + ",";
		var timeWorstWidth = gfx.measureText(timeWorstStr).width;
		var timeBestStr = "Min: " + astrid.math.toPrecision(clock.getBestTime(), 0);

		textX = 0;
		textY += 12;
		
		gfx.fillText(timeElapsedStr, textX, textY);
		
		textX += timeElapsedWidth + 6;
		gfx.fillText(timeWorstStr, textX, textY);
		
		textX += timeWorstWidth + 6;
		gfx.fillText(timeBestStr, textX, textY);
		
		gfx.restore();
		
		this.averages.push(clock.getAverageFPS());
	}
}

export { FPSClock }
export default FPSGraph;
