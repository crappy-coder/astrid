MoCamera2D = Class.create({
	initialize : function(view, x, y, width, height, zoom) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.zoom = MoValueOrDefault(zoom, MoCamera2D.DefaultZoom);
		this.angle = 0;
		this.limits = MoRectangle.Empty();
		this.origin = new MoVector2D(width * 0.5, height * 0.5);
		this.target = null;
		this.mx = new MoMatrix2D();
		this.mxtmp = new MoMatrix2D();

		this.view = view;
		this.view.setRenderTransform(new MoMatrixTransform(this.mx));
	},
	
	getView : function() {
		return this.view;
	},
	
	getX : function() {
		return this.x;
	},
	
	setX : function(value) {
		this.x = value;
	},
	
	getY : function() {
		return this.y;
	},
	
	setY : function(value) {
		this.y = value;
	},
	
	getWidth : function() {
		return this.width;
	},
	
	setWidth : function(value) {
		this.width = value;
	},
	
	getHeight : function() {
		return this.height;
	},
	
	setHeight : function(value) {
		this.height = value;
	},
	
	getZoom : function() {
		return this.zoom;
	},
	
	setZoom : function(value) {
		this.zoom = value;
	},
	
	getRotation : function() {
		return this.angle;
	},
	
	setRotation : function(value) {
		this.angle = value;
	},
	
	getLimits : function() {
		return this.limits;
	},
	
	setLimits : function(left, top, right, bottom) {
		this.limits.x = left;
		this.limits.y = top;
		this.limits.width = right - left;
		this.limits.height = bottom - top;
	},
	
	getMatrix : function() {
		return this.mx;
	},

	lookAt : function(x, y) {	
		this.x = x - (this.width * 0.5);
		this.y = y - (this.height * 0.5);
	},
	
	lock : function(target) {
		this.target = target;
	},
	
	move : function(x, y, ignoreRotation) {
		if(ignoreRotation)
		{
 			this.mxtmp.setIdentity();
			this.mxtmp.rotate(-this.angle);
			
			var v = this.mxtmp.transform(new MoVector2D(x, y), true);

			x = v.x;
			y = v.y;
		}
		
		this.x += x;
		this.y += y;
	},

	update : function(t) {
		if(this.target)
			this.lookAt(this.target.getX(), this.target.getY());

		if(!this.limits.isEmpty())
		{
			this.x = Math.max(this.x, this.limits.x);
			this.y = Math.max(this.y, this.limits.y);
			this.x = Math.min(this.x, this.limits.right() - this.width);
			this.y = Math.min(this.y, this.limits.bottom() - this.height);
		}

		this.updateMatrix();
	},
	
	updateMatrix : function() {
		this.mx.setIdentity();
		this.mx.translate(-this.x, -this.y);
		this.mx.translate(-this.origin.x, -this.origin.y);
		this.mx.scale(this.zoom, this.zoom);
		this.mx.rotate(this.angle);
		this.mx.translate(this.origin.x, this.origin.y);	
	}
});

Object.extend(MoCamera2D, {
	DefaultZoom : 1
});