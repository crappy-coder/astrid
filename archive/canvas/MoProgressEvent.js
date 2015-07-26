MoProgressEvent = Class.create(MoEvent, {
	initialize : function($super, type, current, total, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		/** Number **/
		this.current = MoValueOrDefault(current, 0);

		/** Number **/
		this.total = MoValueOrDefault(total, 0);
	},
	
	getPercentage : function() {
		if(this.getTotal() == 0)
			return 0;

		return (this.getCurrent() / this.getTotal());
	},

	getCurrent : function() {
		return this.current;
	},

	getTotal : function() {
		return this.total;
	},

	toString : function() {
		return "ProgressEvent[ current=" + this.getCurrent() + ", total=" + this.getTotal() + " ]";
	}
});

Object.extend(MoProgressEvent, {
	PROGRESS : "progress"
});
