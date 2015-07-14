MoTimer = Class.create(MoEventDispatcher, {
	initialize : function($super, interval, repeatCount) {
		$super();

		/** Integer **/
		this.repeatCount = MoValueOrDefault(repeatCount, 0);
		
		/** Number **/
		this.interval = MoValueOrDefault(interval, 100);
		
		/** Integer **/
		this.iterations = 0;

		/** Boolean **/
		this.isRunning = false;
		
		/** Date **/
		this.lastTickTimestamp = 0;
        
		this.req = null;
		this.evt = new MoTimerEvent(MoTimerEvent.TICK, 0, 0);
        this.cb = this.onTimerCallback.asDelegate(this);
	},
	
	getRepeatCount : function() {
		return this.repeatCount;
	},
	
	setRepeatCount : function(value) {
		if(this.repeatCount != value)
		{
			this.repeatCount = value;
			
			if(this.isRunning && this.repeatCount <= this.iterations)
				this.stop();
		}
	},
	
	getInterval : function() {
		return this.interval;
	},
	
	setInterval : function(value) {
		if(this.interval != value)
		{
			this.interval = value;

			if(this.isRunning)
			{
				this.reset();
				this.start();
			}
		}
	},
	
	getIterations : function() {
		return this.iterations;
	},
	
	getIsRunning : function() {
		return this.isRunning;
	},

	reset : function() {
		if(this.isRunning)
			this.stop();

		this.iterations = 0;
		this.lastTickTimestamp = 0;
	},

	start : function() {
		this.lastTickTimestamp = new Date();
		this.isRunning = true;
		this.requestNextSample();
	},
	
	stop : function() {
		if(!this.isRunning)
			return;

		this.isRunning = false;

		if(this.repeatCount == 0 || this.iterations == this.repeatCount)
			this.dispatchEvent(new MoTimerEvent(MoTimerEvent.COMPLETE, Date.now(), this.lastTickTimestamp));
	},

	onTimerCallback : function(t) {
		if(!this.isRunning)
			return;
		
		if((t - this.lastTickTimestamp) >= this.interval)
		{
			this.iterations++;
			
			this.evt.currentTickTime = t;
			this.evt.lastTickTime = this.lastTickTimestamp;
			this.dispatchEvent(this.evt);
			
			this.lastTickTimestamp = t;
		}

		if(this.isRunning && (this.repeatCount == 0 || this.iterations < this.repeatCount))
			this.requestNextSample();
		else
			this.stop();
	},
	
	requestNextSample : function() {
		this.req = MoRequestAnimationFrame(this.cb, null);
	}
});
