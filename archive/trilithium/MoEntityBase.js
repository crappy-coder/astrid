MoEntityBase = Class.create(MoEventDispatcher, {
	initialize : function($super, name, controller) {
		$super();
		
		this.name = name;
		this.controller = controller;
		this.drawable = null;
		this.drawableUpdateOptions = MoPropertyOptions.None;
		this.autoRemoveDrawable = true;
		this.isDestroyed = false;
		this.prevPosition = new MoVector2D(0, 0);
		this.prevCenter = new MoVector2D(0, 0);
		this.prevAngle = 0;
		
		this.controller.addEntity(this);
	},

	getName : function() {
		return this.name;
	},
	
	getController : function() {
		return this.controller;
	},

	getDrawable : function() {
		return this.drawable;
	},
	
	getIsDestroyed : function() {
		return this.isDestroyed;
	},
	
	getLocalCenter : function(asUnits) {
		return this.getLocalCenterImpl(MoValueOrDefault(asUnits, false));
	},
	
	getLocalCenterImpl : function(asUnits) {
		return null; /** override **/
	},
	
	getGlobalCenter : function(asUnits) {
		return this.getGlobalCenterImpl(MoValueOrDefault(asUnits, false));
	},
	
	getGlobalCenterImpl : function(asUnits) {
		return null; /** override **/
	},
	
	getPosition : function(asUnits) {
		return this.getPositionImpl(MoValueOrDefault(asUnits, false));
	},
	
	getPositionImpl : function(asUnits) {
		return null; /** override **/
	},
	
	setPosition : function(value, isUnits) {
		this.setPositionImpl(value, MoValueOrDefault(isUnits, false));
	},

	setPositionImpl : function(value, isUnits) {
		/** override **/
	},
	
	getAngle : function(asRadians) {
		return this.getAngleImpl(MoValueOrDefault(asRadians, false));
	},
	
	getAngleImpl : function(asRadians) {
		return 0; /** override **/
	},
	
	setAngle : function(value, isRadians) {
		this.setAngleImpl(value, MoValueOrDefault(isRadians, false));
	},
	
	setAngleImpl : function(value, isRadians) {
		/** override **/
	},
	
	getMass : function() {
		/** override **/
	},
	
	getBounds : function(asUnits, asAABB) {
		asUnits = MoValueOrDefault(asUnits, false);
		asAABB = MoValueOrDefault(asAABB, true);
		
		return this.getBoundsImpl(asUnits, asAABB);
	},
	
	getBoundsImpl : function(asUnits, asAABB) {
		/** override **/
	},

	destroy : function() {
		if(this.isDestroyed)
			return;

		this.unlink();
		this.controller.removeEntity(this, true);
		this.isDestroyed = true;
	},

	link : function(drawable, updateOptions, autoRemove) {
		this.drawable = drawable;
		this.drawableUpdateOptions = MoValueOrDefault(updateOptions, MoPropertyOptions.None);
		this.autoRemoveDrawable = MoValueOrDefault(autoRemove, true);
	},

	unlink : function(removeDrawable) {		
		if(!MoIsNull(this.drawable))
		{
			if(this.autoRemoveDrawable || MoValueOrDefault(removeDrawable, false))
				this.drawable.removeFromParent();

			this.drawable = null;
			this.drawableUpdateOptions = MoPropertyOptions.None;
			this.autoRemoveDrawable = true;
		}
	},

	reset : function() {
		/** override **/
	},
	
	update : function(ratio) {
		/** override **/
	},
	
	resetDrawable : function(unitPos, unitCenter, angle) {
		if(MoIsNull(this.drawable))
			return;

		this.prevPosition.x = unitPos.x;
		this.prevPosition.y = unitPos.y;
		this.prevCenter.x = unitCenter.x;
		this.prevCenter.y = unitCenter.y;
		this.prevAngle = angle;
		
		this.updateDrawablePosition(unitPos, unitCenter, angle);
	},
	
	updateDrawable : function(ratio, unitPos, unitCenter, angle) {
		if(MoIsNull(this.drawable))
			return;

		var oneMinusRatio = 1.0 - ratio;
		var newPos = new PXVector2D(0, 0);
		var newCenter = new PXVector2D(0, 0);
		var newAngle = 0;
		
		newPos.x = ratio * unitPos.x + (oneMinusRatio * this.prevPosition.x);
		newPos.y = ratio * unitPos.y + (oneMinusRatio * this.prevPosition.y);
		newCenter.x = ratio * unitCenter.x + (oneMinusRatio * this.prevCenter.x);
		newCenter.y = ratio * unitCenter.y + (oneMinusRatio * this.prevCenter.y);
		newAngle = angle * ratio + oneMinusRatio * this.prevAngle;

		this.updateDrawablePosition(newPos, newCenter, newAngle);
	},
	
	updateDrawablePosition : function(unitPos, unitCenter, angle) {
		var unitScale = this.controller.getScaleUnit();
		var px = unitPos.x * unitScale;
		var py = unitPos.y * unitScale;
		var cx = unitCenter.x * unitScale;
		var cy = unitCenter.y * unitScale;
		var ox = (this.drawable.getWidth() * 0.5) - cx;
		var oy = (this.drawable.getHeight() * 0.5) - cy;
		var xform = this.drawable.getRenderTransform();
		
		angle = MoMath.normalizeAngle(MoMath.radiansToDegrees(angle));
		
		// FIXME : need to allow for a user specified transform as well, if a user
		//         set's their own render transform we will end up overriding it,
		//         the only current workaround is to embed drawable within another
		//         and set their transform on the inner drawable while linking to
		//         the outer drawable.
		
		if(xform == null || !(xform instanceof MoRotateTransform))
		{
			xform = new MoRotateTransform(angle, ox, oy);
			this.drawable.setRenderTransform(xform);
		}

		xform.setCenterX(Math.round(ox));
		xform.setCenterY(Math.round(oy));
		xform.setAngle(Math.round(angle));
		
		this.drawable.setX(MoMath.toInt(px) - MoMath.toInt(ox));
		this.drawable.setY(MoMath.toInt(py) - MoMath.toInt(oy));
		
		// no update options specified so we can just finish
		if(this.drawableUpdateOptions == MoPropertyOptions.None)
			return;

			
		// apply any update options specified by the user when the
		// drawable was linked, this allows for drawables to automatically
		// update there layout's as the entity is simulated
		var parent = this.drawable.getParent();
		
		if((this.drawableUpdateOptions & MoPropertyOptions.AffectsMeasure) != MoPropertyOptions.None)
			this.drawable.requestMeasure();
			
		if((this.drawableUpdateOptions & MoPropertyOptions.AffectsLayout) != MoPropertyOptions.None)
			this.drawable.requestLayout();
		
		if(!MoIsNull(parent))
		{
			if((this.drawableUpdateOptions & MoPropertyOptions.AffectsParentMeasure) != MoPropertyOptions.None)
				parent.requestMeasure();
				
			if((this.drawableUpdateOptions & MoPropertyOptions.AffectsParentLayout) != MoPropertyOptions.None)
				parent.requestLayout();
		}
	},

	convertPoint : function(pt, isUnits, asUnits, asMoVector) {		
		return this.controller.convertPoint(pt, isUnits, asUnits, asMoVector);
	},
	
	toPixels : function(units) {
		return this.controller.toPixels(units);
	},
	
	toUnits : function(pixels) {
		return this.controller.toUnits(pixels);
	}
});